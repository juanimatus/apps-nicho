// Panel de leads: temperatura, tiempo sin respuesta y seguimiento hasta la visita.
(async function () {
  "use strict";
  const { $, esc, money, wa, toast, hace, fecha } = Core;
  const N = Core.negocio;
  const { TEMPERATURAS, ESTADOS, PLAZOS, PAGOS } = Datos;
  const root = $("#app");
  Core.pedirClave();
  let leads = await Datos.leads.list();
  const filtro = { estado: "activos", temp: "" };
  const etiqueta = (lista, v) => (lista.find((x) => x[0] === v) || [, v])[1];
  const minutos = (a, b) => (Date.parse(b) - Date.parse(a)) / 60000;

  root.innerHTML = `${Core.topbar([["Ver web de propiedades", "propiedades.html"]])}
  <main class="wrap page">
    <div class="page-head"><h1>Leads</h1><p class="muted">Cada consulta llega calificada. Responde primero a los calientes.</p></div>
    <div class="kpis" id="kpis"></div>
    <div class="card mt">
      <div class="spread">
        <div class="chips" id="estados"><button class="chip" data-estado="activos">Activos</button>${ESTADOS.map(
          ([v, t]) => `<button class="chip" data-estado="${v}">${t}</button>`,
        ).join("")}</div>
        <div class="chips" id="temps"><button class="chip" data-temp="">Todos</button>${Object.entries(TEMPERATURAS)
          .map(([v, t]) => `<button class="chip" data-temp="${v}">${t.txt}</button>`)
          .join("")}</div>
      </div>
      <div class="list mt" id="lista"></div>
    </div>
  </main>`;

  function textoWa(l) {
    return `¡Hola, ${Core.primerNombre(l.nombre)}! Soy de ${N.nombre}. Recibimos tu consulta por "${l.propiedad}". ¿Te viene bien visitarla el ${fecha(
      l.visita.dia,
    )} por la ${l.visita.franja}?`;
  }

  function tarjeta(l) {
    const t = TEMPERATURAS[l.temperatura] || TEMPERATURAS.frio;
    const espera = l.estado === "nuevo" ? minutos(l.creado, new Date().toISOString()) : 0;
    const demorado = espera > (N.minutosAlerta || 15);
    return `<div class="item">
      <div class="grow">
        <div class="row"><b>${esc(l.nombre)}</b><span class="badge ${t.cls}">${t.txt} · ${l.score}</span>
          ${demorado ? `<span class="badge bad">Sin responder ${hace(l.creado).replace("hace ", "")}</span>` : `<span class="muted small">${hace(l.creado)}</span>`}</div>
        <div class="small">${esc(l.propiedad)}</div>
        <div class="muted small">${etiqueta(PLAZOS, l.plazo)} · ${etiqueta(PAGOS[l.operacion] || [], l.pago)} · Presupuesto ${money(l.presupuesto, l.moneda)}</div>
        <div class="muted small">Quiere visitar: ${fecha(l.visita.dia)} por la ${l.visita.franja}${l.mensaje ? ` · “${esc(l.mensaje)}”` : ""}</div>
      </div>
      <div class="row">
        <a class="btn sm wa" target="_blank" rel="noopener" href="${wa(l.telefono, textoWa(l))}" data-contactar="${l.id}">WhatsApp</a>
        <select data-id="${l.id}" aria-label="Estado del lead" class="w-auto">${ESTADOS.map(
          ([v, txt]) => `<option value="${v}" ${v === l.estado ? "selected" : ""}>${txt}</option>`,
        ).join("")}</select>
      </div>
    </div>`;
  }

  function render() {
    root.querySelectorAll("#estados .chip").forEach((c) => c.classList.toggle("on", c.dataset.estado === filtro.estado));
    root.querySelectorAll("#temps .chip").forEach((c) => c.classList.toggle("on", c.dataset.temp === filtro.temp));
    const hoy = Core.iso();
    const contactados = leads.filter((l) => l.contactadoEn);
    const promedio = contactados.length ? contactados.reduce((s, l) => s + minutos(l.creado, l.contactadoEn), 0) / contactados.length : 0;
    const calientesSinContacto = leads.filter((l) => l.estado === "nuevo" && l.temperatura === "caliente").length;
    $("#kpis").innerHTML = [
      [leads.filter((l) => Core.iso(new Date(l.creado)) === hoy).length, "Leads de hoy"],
      [calientesSinContacto, "Calientes sin contactar", calientesSinContacto ? "alerta" : ""],
      [`${Math.round(promedio)} min`, "Tiempo de respuesta promedio"],
      [leads.filter((l) => l.estado === "visita").length, "Visitas agendadas"],
    ]
      .map(([v, l, c = ""]) => `<div class="kpi ${c}"><b>${v}</b><span>${l}</span></div>`)
      .join("");
    const lista = leads
      .filter((l) =>
        filtro.estado === "activos" ? !["cerrado", "perdido"].includes(l.estado) : l.estado === filtro.estado,
      )
      .filter((l) => !filtro.temp || l.temperatura === filtro.temp)
      // Primero los nuevos; dentro de cada grupo, el mayor puntaje.
      .sort((a, b) => (b.estado === "nuevo") - (a.estado === "nuevo") || b.score - a.score);
    $("#lista").innerHTML = lista.length ? lista.map(tarjeta).join("") : `<div class="empty">No hay leads en esta vista.</div>`;
  }

  function guardar(l, evento) {
    l.actualizado = new Date().toISOString();
    Datos.leads.save(l, evento);
    leads = Datos.leads.all();
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-estado],[data-temp],[data-contactar]");
    if (!b) return;
    if ("estado" in b.dataset) filtro.estado = b.dataset.estado;
    else if ("temp" in b.dataset) filtro.temp = b.dataset.temp;
    else {
      const l = leads.find((x) => x.id === b.dataset.contactar);
      if (l.estado === "nuevo") {
        l.estado = "contactado";
        l.contactadoEn = new Date().toISOString();
        guardar(l, "lead_estado");
      }
    }
    render();
  });
  root.addEventListener("change", (e) => {
    const sel = e.target.closest("select[data-id]");
    if (!sel) return;
    const l = leads.find((x) => x.id === sel.dataset.id);
    l.estado = sel.value;
    if (!l.contactadoEn && l.estado !== "nuevo") l.contactadoEn = new Date().toISOString();
    guardar(l, "lead_estado");
    toast(`${l.nombre}: ${etiqueta(ESTADOS, l.estado)}`, "ok");
    render();
  });
  Core.onCambio(async () => {
    const antes = leads.length;
    leads = await Datos.leads.list();
    if (leads.length > antes) {
      Core.beep();
      toast("Nuevo lead", "ok");
    }
    render();
  });
  setInterval(render, 60000);
  render();
})();
