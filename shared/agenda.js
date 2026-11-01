/* Motor de agenda compartido: página pública de reservas y panel del negocio.
   Lo usan apps/turnos (barberías, estéticas) y apps/consultorio. */
(function () {
  "use strict";
  const { $, esc, iso, addDays, parseISO, money, wa, toast, fechaLarga, cap, primerNombre } = Core;
  const N = Core.negocio;

  const ESTADOS = {
    pendiente: { txt: "Sin confirmar", cls: "warn" },
    confirmado: { txt: "Confirmado", cls: "ok" },
    asistio: { txt: "Asistió", cls: "info" },
    ausente: { txt: "No vino", cls: "bad" },
    cancelado: { txt: "Cancelado", cls: "" },
  };
  const ocupa = (t) => t.estado !== "cancelado";
  const aMin = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const aHora = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const franjas = (dia) => (N.horario && N.horario[parseISO(dia).getDay()]) || [];
  const abierto = (dia) => franjas(dia).length > 0;
  const servicio = (id) => N.servicios.find((s) => s.id === id);
  const profesional = (id) => N.profesionales.find((p) => p.id === id);

  // Horarios de inicio posibles en un día, según las franjas de atención.
  function grilla(dia, dur) {
    const paso = N.intervalo || 30;
    const out = [];
    for (const [a, b] of franjas(dia)) for (let m = aMin(a); m + dur <= aMin(b); m += paso) out.push(m);
    return out;
  }

  function nuevoTurno({ fecha, hora, servicio: s, profesional: p, cliente, telefono }, estado = "pendiente") {
    return {
      id: Core.uid("T"),
      fecha,
      hora,
      duracion: s.duracion,
      servicioId: s.id,
      servicio: s.nombre,
      precio: s.precio,
      profesionalId: p.id,
      profesional: p.nombre,
      cliente,
      telefono,
      estado,
      creado: new Date().toISOString(),
    };
  }

  function seed() {
    const hoy = iso();
    const out = [];
    let k = 0;
    for (let d = -20; d <= 3; d++) {
      const dia = addDays(hoy, d);
      const slots = grilla(dia, 60);
      if (!slots.length) continue;
      const cantidad = d < 0 ? 3 : 5;
      for (let i = 0; i < cantidad; i++) {
        const s = N.servicios[k % N.servicios.length];
        const p = N.profesionales[(k + d + 40) % N.profesionales.length];
        const hora = aHora(slots[Math.floor(((i + 0.5) * slots.length) / cantidad)]);
        let estado;
        if (d < 0) estado = k % 7 === 3 ? "ausente" : k % 11 === 5 ? "cancelado" : "asistio";
        else estado = k % 3 === 0 ? "pendiente" : "confirmado";
        const nombre = N.clientesDemo[k % N.clientesDemo.length];
        out.push(nuevoTurno({ fecha: dia, hora, servicio: s, profesional: p, cliente: nombre, telefono: `11${45000000 + k * 7919}` }, estado));
        k++;
      }
    }
    return out;
  }

  const turnos = Core.repo("turnos", seed);
  const espera = Core.repo("espera", () => []);

  function libre(ocupados, dia, proId, inicio, dur) {
    return !ocupados.some(
      (t) =>
        ocupa(t) &&
        t.fecha === dia &&
        t.profesionalId === proId &&
        aMin(t.hora) < inicio + dur &&
        inicio < aMin(t.hora) + (t.duracion || 30),
    );
  }

  function horariosLibres(ocupados, dia, s, proId) {
    const pros = proId ? [proId] : N.profesionales.map((p) => p.id);
    const ahora = new Date();
    const minimo = dia === iso() ? ahora.getHours() * 60 + ahora.getMinutes() + (N.anticipacionMinima ?? 60) : 0;
    return grilla(dia, s.duracion)
      .filter((m) => m >= minimo)
      .map((m) => ({ hora: aHora(m), pro: pros.find((p) => libre(ocupados, dia, p, m, s.duracion)) }))
      .filter((x) => x.pro);
  }

  // Con Make, pide solo fecha/hora/profesional/duración de los turnos tomados (sin datos de clientes).
  async function ocupadosEntre(desde, hasta) {
    if (Core.remoto()) {
      try {
        const r = await Core.call("turnos_ocupados", { desde, hasta });
        if (Array.isArray(r)) return r;
      } catch (e) {
        console.warn(e);
      }
    }
    return turnos.all().filter((t) => ocupa(t) && t.fecha >= desde && t.fecha <= hasta);
  }

  function gcal(t) {
    const fin = aHora(aMin(t.hora) + t.duracion);
    const f = t.fecha.replaceAll("-", "");
    const dates = `${f}T${t.hora.replace(":", "")}00/${f}T${fin.replace(":", "")}00`;
    const p = new URLSearchParams({
      action: "TEMPLATE",
      text: `${t.servicio} · ${N.nombre}`,
      dates,
      details: `Con ${t.profesional}`,
      location: N.direccion || "",
    });
    return `https://calendar.google.com/calendar/render?${p}`;
  }
  const urlPagina = (pagina) => new URL(pagina, location.href).href;
  const urlEncuesta = (t) => urlPagina(`encuesta.html?ref=${t.id}&n=${encodeURIComponent(primerNombre(t.cliente))}`);
  const textoRecordatorio = (t) =>
    `¡Hola, ${primerNombre(t.cliente)}! Te recordamos tu ${N.textos?.turno || "turno"} de ${t.servicio} el ${fechaLarga(t.fecha)} a las ${t.hora} en ${N.nombre}. ¿Confirmas? Responde SÍ o NO 🙌`;

  // ---------------- página pública ----------------
  async function reservar(root) {
    const dias = Array.from({ length: N.diasAnticipacion || 14 }, (_, i) => addDays(iso(), i));
    const st = {
      servicioId: null,
      proId: "",
      dia: dias.find(abierto) || dias[0],
      hora: null,
      pro: null,
      nombre: "",
      telefono: "",
      espera: false,
      listo: null,
    };
    let ocupados = await ocupadosEntre(dias[0], dias.at(-1));

    root.innerHTML = `${Core.cover(N.direccion)}<main class="wrap narrow lift"><div class="card" id="flujo"></div>
      <p class="tiny muted center mt">Reserva en un minuto · Te recordamos el ${N.textos?.turno || "turno"} por WhatsApp</p></main>`;
    const flujo = $("#flujo", root);
    const pinta = () => (flujo.innerHTML = st.listo ? exito(st.listo) : pasos());

    function pasos() {
      let n = 0;
      const titulo = (txt) => `<h2 class="section-title"><span class="num">${++n}</span>${txt}</h2>`;
      const s = servicio(st.servicioId);
      let h = `<section class="step">${titulo(N.textos?.servicio || "Elige el servicio")}<div class="list">${N.servicios
        .map(
          (x) =>
            `<button type="button" class="option ${x.id === st.servicioId ? "on" : ""}" data-servicio="${x.id}"><span class="grow"><b>${esc(
              x.nombre,
            )}</b><br><span class="muted small">${x.duracion} min</span></span><b>${money(x.precio)}</b></button>`,
        )
        .join("")}</div></section>`;
      if (!s) return h;

      if (N.profesionales.length > 1)
        h += `<section class="step">${titulo(N.textos?.profesional || "¿Con quién?")}<div class="chips">
          <button type="button" class="chip ${!st.proId ? "on" : ""}" data-pro="">Me da igual</button>${N.profesionales
            .map((p) => `<button type="button" class="chip ${p.id === st.proId ? "on" : ""}" data-pro="${p.id}">${esc(p.nombre)}</button>`)
            .join("")}</div></section>`;

      h += `<section class="step">${titulo("Elige el día")}<div class="days">${dias
        .map((d) => {
          const f = parseISO(d);
          return `<button type="button" class="day ${d === st.dia ? "on" : ""}" data-dia="${d}" ${abierto(d) ? "" : "disabled"}>
            <small>${f.toLocaleDateString("es", { weekday: "short" })}</small><b>${f.getDate()}</b><small>${f.toLocaleDateString("es", {
              month: "short",
            })}</small></button>`;
        })
        .join("")}</div></section>`;

      const libres = horariosLibres(ocupados, st.dia, s, st.proId);
      h += `<section class="step">${titulo("Elige el horario")}`;
      h += libres.length
        ? `<div class="slots">${libres
            .map(
              (x) =>
                `<button type="button" class="chip slot ${x.hora === st.hora ? "on" : ""}" data-hora="${x.hora}" data-asignado="${x.pro}">${x.hora}</button>`,
            )
            .join("")}</div>`
        : `<div class="empty">No quedan horarios para este día.${
            st.espera
              ? `<form id="espera" class="stack mt" style="text-align:left"><input name="nombre" required placeholder="Tu nombre" autocomplete="name">
                 <input name="telefono" required type="tel" inputmode="tel" placeholder="Tu WhatsApp" autocomplete="tel">
                 <button class="btn primary block">Anotarme en la lista de espera</button></form>`
              : `<br><button type="button" class="btn sm ghost mt" data-abrir-espera>Avísame si se libera un lugar</button>`
          }</div>`;
      h += `</section>`;
      if (!st.hora) return h;

      const pro = profesional(st.pro);
      h += `<section class="step" id="paso-datos">${titulo("Tus datos")}<form id="datos" class="stack">
        <label class="field"><span>Nombre y apellido</span><input name="nombre" required autocomplete="name" value="${esc(st.nombre)}"></label>
        <label class="field"><span>WhatsApp</span><input name="telefono" required type="tel" inputmode="tel" autocomplete="tel" placeholder="Ej: 11 2345 6789" value="${esc(
          st.telefono,
        )}"></label>
        <div class="resumen"><b>${esc(s.nombre)}</b> · ${cap(fechaLarga(st.dia))} · ${st.hora} h${pro ? ` · con ${esc(pro.nombre)}` : ""}
          <br><span class="muted small">${money(s.precio)} · ${s.duracion} min</span></div>
        <button class="btn primary block" type="submit">Confirmar ${N.textos?.turno || "turno"}</button>
      </form></section>`;
      return h;
    }

    function exito(t) {
      return `<div class="success stack"><div class="check">✓</div>
        <h2>¡Listo, ${esc(primerNombre(t.cliente))}! Tu ${N.textos?.turno || "turno"} está reservado</h2>
        <p class="resumen"><b>${esc(t.servicio)}</b><br>${cap(fechaLarga(t.fecha))} · ${t.hora} h · ${esc(t.profesional)}</p>
        <p class="muted">Te enviamos la confirmación por WhatsApp y te lo recordamos el día anterior.</p>
        ${
          N.sena && N.sena.link
            ? `<a class="btn primary block" href="${esc(N.sena.link)}" target="_blank" rel="noopener">Pagar seña de ${money(
                (t.precio * (N.sena.porcentaje || 30)) / 100,
              )}</a>`
            : ""
        }
        <a class="btn ghost block" href="${gcal(t)}" target="_blank" rel="noopener">📅 Agregar a mi calendario</a>
        <a class="btn wa block" href="${wa(N.whatsapp, `¡Hola! Reservé ${t.servicio} el ${fechaLarga(t.fecha)} a las ${t.hora}. Soy ${t.cliente}.`)}" target="_blank" rel="noopener">Escribir a ${esc(N.nombre)}</a>
        <button type="button" class="btn ghost block" data-otro>Reservar otro</button></div>`;
    }

    flujo.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b || b.type === "submit" || b.closest("form")) return;
      const d = b.dataset;
      if ("servicio" in d) {
        st.servicioId = d.servicio;
        st.hora = null;
      } else if ("pro" in d) {
        st.proId = d.pro;
        st.hora = null;
      } else if ("dia" in d) {
        st.dia = d.dia;
        st.hora = null;
        st.espera = false;
      } else if ("hora" in d) {
        st.hora = d.hora;
        st.pro = d.asignado;
      } else if ("abrirEspera" in d) st.espera = true;
      else if ("otro" in d) Object.assign(st, { listo: null, hora: null, servicioId: null });
      else return;
      pinta();
      if ("hora" in d) $("#paso-datos", root)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    flujo.addEventListener("input", (e) => {
      if (e.target.form && e.target.form.id === "datos") st[e.target.name] = e.target.value;
    });

    flujo.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target;
      const datos = Object.fromEntries(new FormData(f));
      if (Core.telefono(datos.telefono).length < 8) return toast("Revisa el número de WhatsApp", "bad");
      f.querySelector("button").disabled = true;

      if (f.id === "espera") {
        await espera.save(
          {
            id: Core.uid("E"),
            fecha: st.dia,
            servicio: servicio(st.servicioId).nombre,
            profesionalId: st.proId,
            nombre: datos.nombre.trim(),
            telefono: datos.telefono,
            creado: new Date().toISOString(),
          },
          "lista_espera_alta",
        );
        st.espera = false;
        toast("¡Listo! Si se libera un lugar te avisamos por WhatsApp.", "ok");
        return pinta();
      }

      ocupados = await ocupadosEntre(dias[0], dias.at(-1));
      const s = servicio(st.servicioId);
      if (!libre(ocupados, st.dia, st.pro, aMin(st.hora), s.duracion)) {
        toast("Ese horario se acaba de ocupar. Elige otro.", "bad");
        st.hora = null;
        return pinta();
      }
      const t = nuevoTurno(
        { fecha: st.dia, hora: st.hora, servicio: s, profesional: profesional(st.pro), cliente: datos.nombre.trim(), telefono: datos.telefono },
        "pendiente",
      );
      t.origen = "web";
      await turnos.save(t, "turno_creado");
      ocupados.push(t);
      st.listo = t;
      pinta();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    pinta();
  }

  // ---------------- panel del negocio ----------------
  async function panel(root) {
    Core.pedirClave();
    let dia = iso();
    let filtroPro = "";
    let lista = await turnos.list();
    let enEspera = await espera.list();
    const links = [["Página de reservas", "reservar.html"]];
    if (N.linkResena) links.push(["Encuesta", "encuesta.html"]);

    root.innerHTML = `${Core.topbar(links)}
    <main class="wrap page">
      <div class="page-head spread"><div><h1>Agenda</h1><p class="muted">Turnos, confirmaciones y ausencias en un solo lugar.</p></div>
        <button class="btn primary" id="nuevo">+ Nuevo ${N.textos?.turno || "turno"}</button></div>
      <div class="kpis" id="kpis"></div>
      <div class="card mt">
        <div class="spread">
          <div class="row"><button class="btn sm ghost" data-mover="-1" aria-label="Día anterior">‹</button>
            <button class="btn sm ghost" data-mover="0">Hoy</button>
            <button class="btn sm ghost" data-mover="1" aria-label="Día siguiente">›</button>
            <input type="date" id="fecha" class="w-auto" aria-label="Ir a fecha"></div>
          ${
            N.profesionales.length > 1
              ? `<div class="chips" id="pros"><button class="chip" data-pro="">Todos</button>${N.profesionales
                  .map((p) => `<button class="chip" data-pro="${p.id}">${esc(p.nombre)}</button>`)
                  .join("")}</div>`
              : ""
          }
        </div>
        <h2 id="titulo-dia" class="mt"></h2>
        <div class="list" id="lista"></div>
      </div>
      <div class="card mt"><h2>Lista de espera</h2><p class="muted small">Cuando alguien cancela, avísales primero a ellos.</p><div class="list" id="espera"></div></div>
    </main>`;

    function fila(t) {
      const e = ESTADOS[t.estado] || ESTADOS.pendiente;
      const vigente = t.estado === "pendiente" || t.estado === "confirmado";
      const acciones = [];
      if (t.estado === "pendiente") acciones.push(["confirmado", "Confirmar"]);
      if (vigente) acciones.push(["asistio", "Asistió"], ["ausente", "No vino"], ["cancelado", "Cancelar"]);
      const tel = t.telefono;
      return `<div class="item ${t.estado === "cancelado" ? "dim" : ""}">
        <div class="hora">${t.hora}</div>
        <div class="grow"><b>${esc(t.cliente)}</b> <span class="badge ${e.cls}">${e.txt}</span><br>
          <span class="muted small">${esc(t.servicio)} · ${esc(t.profesional)} · ${money(t.precio)}</span></div>
        <div class="row">
          ${acciones
            .map(([est, txt]) => `<button class="btn sm ${est === "confirmado" ? "primary" : "ghost"}" data-id="${t.id}" data-estado="${est}">${txt}</button>`)
            .join("")}
          ${vigente ? `<a class="btn sm wa" target="_blank" rel="noopener" href="${wa(tel, textoRecordatorio(t))}">Recordar</a>` : ""}
          ${
            t.estado === "asistio" && N.linkResena
              ? `<a class="btn sm ghost" target="_blank" rel="noopener" href="${wa(
                  tel,
                  `¡Gracias por venir, ${primerNombre(t.cliente)}! ¿Nos cuentas cómo te fue? ${urlEncuesta(t)}`,
                )}">Pedir reseña</a>`
              : ""
          }
        </div></div>`;
    }

    function filaEspera(x) {
      const msg = `¡Hola, ${primerNombre(x.nombre)}! Se liberó un lugar para ${x.servicio} el ${fechaLarga(x.fecha)} en ${N.nombre}. Resérvalo acá: ${urlPagina(
        "reservar.html",
      )}`;
      return `<div class="item"><div class="grow"><b>${esc(x.nombre)}</b><br><span class="muted small">${esc(x.servicio)} · quiere el ${fechaLarga(
        x.fecha,
      )}</span></div>
        <a class="btn sm wa" target="_blank" rel="noopener" href="${wa(x.telefono, msg)}">Avisar</a>
        <button class="btn sm ghost" data-quitar="${x.id}">Quitar</button></div>`;
    }

    function render() {
      $("#fecha", root).value = dia;
      $("#titulo-dia", root).textContent = cap(fechaLarga(dia));
      root.querySelectorAll("#pros .chip").forEach((c) => c.classList.toggle("on", c.dataset.pro === filtroPro));
      const delDia = lista
        .filter((t) => t.fecha === dia && (!filtroPro || t.profesionalId === filtroPro))
        .sort((a, b) => a.hora.localeCompare(b.hora));
      const activos = delDia.filter(ocupa);
      const ausentes = lista.filter((t) => t.fecha.startsWith(dia.slice(0, 7)) && t.estado === "ausente");
      const facturado = activos.filter((t) => t.estado !== "ausente").reduce((s, t) => s + (t.precio || 0), 0);
      $("#kpis", root).innerHTML = [
        [activos.length, `${cap(N.textos?.turnos || "turnos")} del día`],
        [activos.filter((t) => t.estado === "pendiente").length, "Sin confirmar"],
        [money(facturado), "Facturación estimada del día"],
        [ausentes.length, `No vinieron este mes · ${money(ausentes.reduce((s, t) => s + (t.precio || 0), 0))} perdidos`, "alerta"],
      ]
        .map(([v, l, c = ""]) => `<div class="kpi ${c}"><b>${v}</b><span>${l}</span></div>`)
        .join("");
      $("#lista", root).innerHTML = delDia.length
        ? delDia.map(fila).join("")
        : `<div class="empty">${abierto(dia) ? `No hay ${N.textos?.turnos || "turnos"} para este día.` : "Cerrado."}</div>`;
      $("#espera", root).innerHTML = enEspera.length ? enEspera.map(filaEspera).join("") : `<div class="empty">Nadie en espera.</div>`;
    }

    function nuevo() {
      const m = Core.modal(`<h2>Nuevo ${N.textos?.turno || "turno"}</h2><form class="stack">
        <div class="grid c2"><label class="field"><span>Fecha</span><input type="date" name="fecha" value="${dia}" required></label>
          <label class="field"><span>Hora</span><input type="time" name="hora" step="300" required></label></div>
        <label class="field"><span>Servicio</span><select name="servicio">${N.servicios
          .map((s) => `<option value="${s.id}">${esc(s.nombre)} · ${s.duracion} min</option>`)
          .join("")}</select></label>
        <label class="field"><span>${N.textos?.profesionalLabel || "Profesional"}</span><select name="profesional">${N.profesionales
          .map((p) => `<option value="${p.id}">${esc(p.nombre)}</option>`)
          .join("")}</select></label>
        <label class="field"><span>${N.textos?.clienteLabel || "Cliente"}</span><input name="cliente" required></label>
        <label class="field"><span>WhatsApp</span><input name="telefono" type="tel" required></label>
        <div class="row end"><button type="button" class="btn ghost" data-cerrar>Cancelar</button><button class="btn primary">Guardar</button></div>
      </form>`);
      m.box.querySelector("form").addEventListener("submit", (e) => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.target));
        const s = servicio(d.servicio);
        if (!libre(lista, d.fecha, d.profesional, aMin(d.hora), s.duracion) && !confirm("Ese horario se superpone con otro. ¿Guardar igual?")) return;
        const t = nuevoTurno({ ...d, servicio: s, profesional: profesional(d.profesional) }, "confirmado");
        t.origen = "panel";
        turnos.save(t, "turno_creado");
        lista = turnos.all();
        dia = d.fecha;
        m.close();
        render();
        toast("Guardado. Le llega la confirmación por WhatsApp.", "ok");
      });
    }

    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-mover],[data-estado],[data-quitar],[data-pro],#nuevo");
      if (!b) return;
      const d = b.dataset;
      if (b.id === "nuevo") return nuevo();
      if ("mover" in d) dia = d.mover === "0" ? iso() : addDays(dia, Number(d.mover));
      else if ("pro" in d) filtroPro = d.pro;
      else if ("quitar" in d) {
        espera.remove(d.quitar, "lista_espera_baja");
        enEspera = espera.all();
      } else if ("estado" in d) {
        const t = lista.find((x) => x.id === d.id);
        t.estado = d.estado;
        t.actualizado = new Date().toISOString();
        turnos.save(t, "turno_estado");
        lista = turnos.all();
        toast(`Marcado: ${ESTADOS[d.estado].txt}`, "ok");
        if (d.estado === "cancelado" && enEspera.some((x) => x.fecha === t.fecha))
          toast("Hay gente en lista de espera para ese día.", "warn");
      }
      render();
    });
    $("#fecha", root).addEventListener("change", (e) => {
      if (e.target.value) {
        dia = e.target.value;
        render();
      }
    });
    Core.onCambio(async () => {
      lista = await turnos.list();
      enEspera = await espera.list();
      render();
    });
    render();
  }

  window.Agenda = { reservar, panel };
})();
