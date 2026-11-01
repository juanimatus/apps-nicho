// Catálogo público de propiedades + formulario que califica al interesado.
(async function () {
  "use strict";
  const { $, esc, money, wa, toast, fecha } = Core;
  const N = Core.negocio;
  const { PLAZOS, PAGOS } = Datos;
  const root = $("#app");
  const props = await Datos.propiedades.list();
  const filtro = { operacion: "", tipo: "", ambientes: 0, max: 0 };
  const ICONOS = { Departamento: "🏢", Casa: "🏡", PH: "🏘️", Local: "🏬" };

  const tipos = [...new Set(props.map((p) => p.tipo))];
  root.innerHTML = `${Core.cover(N.direccion)}<main class="wrap lift">
    <div class="card stack">
      <div class="chips" id="op"><button class="chip on" data-op="">Todas</button><button class="chip" data-op="venta">Venta</button><button class="chip" data-op="alquiler">Alquiler</button></div>
      <div class="grid c3">
        <label class="field"><span>Tipo</span><select id="tipo"><option value="">Todos</option>${tipos.map((t) => `<option>${esc(t)}</option>`).join("")}</select></label>
        <label class="field"><span>Ambientes (mínimo)</span><select id="amb"><option value="0">Cualquiera</option><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
        <label class="field"><span>Precio máximo</span><input id="max" type="number" inputmode="numeric" placeholder="Sin límite"></label>
      </div>
    </div>
    <div class="spread mt"><p class="muted" id="cuenta"></p><button class="btn sm ghost" data-buscar>¿No encuentras lo que buscas?</button></div>
    <div class="grid c3" id="grilla"></div>
  </main>`;

  const foto = (p) => `<div class="foto">${p.foto ? `<img src="${esc(p.foto)}" alt="" loading="lazy">` : ICONOS[p.tipo] || "🏠"}</div>`;
  const precio = (p) => `${money(p.precio, p.moneda)}${p.operacion === "alquiler" ? " /mes" : ""}`;

  function render() {
    const lista = props.filter(
      (p) =>
        (!filtro.operacion || p.operacion === filtro.operacion) &&
        (!filtro.tipo || p.tipo === filtro.tipo) &&
        p.ambientes >= filtro.ambientes &&
        (!filtro.max || p.precio <= filtro.max),
    );
    $("#cuenta").textContent = `${lista.length} propiedad${lista.length === 1 ? "" : "es"}`;
    $("#grilla").innerHTML = lista.length
      ? lista
          .map(
            (p) => `<button class="card option" style="display:block;padding:12px" data-ver="${p.id}">
          ${foto(p)}
          <div style="padding:10px 4px 2px"><span class="badge ${p.operacion === "venta" ? "accent" : "info"}">${p.operacion === "venta" ? "Venta" : "Alquiler"}</span>
          <h3 style="margin:8px 0 2px">${precio(p)}</h3><b>${esc(p.titulo)}</b>
          <p class="muted small">${esc(p.barrio)} · ${p.ambientes} amb. · ${p.m2} m²</p></div></button>`,
          )
          .join("")
      : `<div class="empty">No hay propiedades con esos filtros.</div>`;
  }

  function ficha(p) {
    const m = Core.modal(`${foto(p)}<div class="stack mt">
      <div class="spread"><span class="badge ${p.operacion === "venta" ? "accent" : "info"}">${p.operacion === "venta" ? "Venta" : "Alquiler"}</span><button class="btn sm ghost" data-cerrar>Cerrar</button></div>
      <h2>${precio(p)}</h2><b>${esc(p.titulo)}</b>
      <p class="muted">${esc(p.barrio)} · ${esc(p.tipo)}</p>
      <div class="chips"><span class="badge">${p.ambientes} ambientes</span><span class="badge">${p.m2} m²</span><span class="badge">${p.banos} baño${p.banos > 1 ? "s" : ""}</span>${p.cochera ? `<span class="badge">Cochera</span>` : ""}</div>
      <p>${esc(p.descripcion)}</p>
      <button class="btn primary block" data-quiero>Quiero visitarla</button>
    </div>`);
    m.box.querySelector("[data-quiero]").addEventListener("click", () => {
      m.close();
      formulario(p);
    });
  }

  function formulario(p) {
    const operacion = p ? p.operacion : "venta";
    const moneda = p ? p.moneda : "USD";
    const dias = Array.from({ length: 7 }, (_, i) => Core.addDays(Core.iso(), i + 1));
    const radios = (name, opciones) =>
      `<div class="chips">${opciones
        .map(([v, t], i) => `<label class="chip"><input type="radio" name="${name}" value="${v}" ${i === 0 ? "required" : ""}> ${t}</label>`)
        .join("")}</div>`;
    const m = Core.modal(`<form class="stack" id="lead">
      <div class="spread"><h2>${p ? "Coordinemos la visita" : "Te buscamos la propiedad"}</h2><button type="button" class="btn sm ghost" data-cerrar>Cerrar</button></div>
      ${p ? `<p class="muted">${esc(p.titulo)} · ${esc(p.barrio)}</p>` : `<div class="field"><span>¿Qué buscas?</span>${radios("operacion", [["venta", "Comprar"], ["alquiler", "Alquilar"]])}</div>`}
      <label class="field"><span>Nombre y apellido</span><input name="nombre" required autocomplete="name"></label>
      <label class="field"><span>WhatsApp</span><input name="telefono" required type="tel" inputmode="tel" autocomplete="tel" placeholder="Ej: 11 2345 6789"></label>
      <div class="field"><span>¿Para cuándo la necesitas?</span>${radios("plazo", PLAZOS)}</div>
      <div class="field" id="pagos"><span>${operacion === "venta" ? "¿Cómo la pagarías?" : "¿Qué garantía tienes?"}</span>${radios("pago", PAGOS[operacion])}</div>
      <label class="field"><span>Presupuesto (${moneda}${operacion === "alquiler" ? " por mes" : ""})</span><input name="presupuesto" type="number" inputmode="numeric" min="0" required></label>
      <div class="grid c2"><label class="field"><span>Día para visitar</span><select name="dia">${dias
        .map((d) => `<option value="${d}">${fecha(d)}</option>`)
        .join("")}</select></label>
        <label class="field"><span>Horario</span><select name="franja"><option value="mañana">Mañana</option><option value="tarde">Tarde</option></select></label></div>
      <label class="field"><span>¿Algo más que debamos saber? (opcional)</span><textarea name="mensaje" rows="2"></textarea></label>
      <button class="btn primary block">Enviar</button>
    </form>`);
    const form = m.box.querySelector("form");
    form.addEventListener("change", (e) => {
      if (e.target.type === "radio") {
        form.querySelectorAll(`input[name="${e.target.name}"]`).forEach((r) => r.parentElement.classList.toggle("on", r.checked));
        if (e.target.name === "operacion") {
          $("#pagos", form).innerHTML = `<span>${e.target.value === "venta" ? "¿Cómo la pagarías?" : "¿Qué garantía tienes?"}</span>${radios("pago", PAGOS[e.target.value])}`;
        }
      }
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      if (Core.telefono(d.telefono).length < 8) return toast("Revisa el número de WhatsApp", "bad");
      form.querySelector("button.primary").disabled = true;
      const lead = {
        id: Core.uid("L"),
        propiedadId: p ? p.id : null,
        propiedad: p ? p.titulo : "Búsqueda personalizada",
        operacion: p ? p.operacion : d.operacion,
        moneda,
        nombre: d.nombre.trim(),
        telefono: d.telefono,
        email: "",
        plazo: d.plazo,
        pago: d.pago,
        presupuesto: Number(d.presupuesto) || 0,
        visita: { dia: d.dia, franja: d.franja },
        mensaje: d.mensaje.trim(),
        estado: "nuevo",
        creado: new Date().toISOString(),
        contactadoEn: null,
      };
      Object.assign(lead, Datos.calificar(lead, p));
      await Datos.leads.save(lead, "lead_nuevo");
      m.box.innerHTML = `<div class="success stack"><div class="check">✓</div><h2>¡Gracias, ${esc(Core.primerNombre(lead.nombre))}!</h2>
        <p class="muted">Te escribimos por WhatsApp en unos minutos para confirmar la visita del ${fecha(lead.visita.dia)} por la ${lead.visita.franja}.</p>
        <a class="btn wa block" target="_blank" rel="noopener" href="${wa(N.whatsapp, `¡Hola! Soy ${lead.nombre}, me interesa: ${lead.propiedad}.`)}">Escribir ahora</a>
        <button class="btn ghost block" data-cerrar>Seguir viendo propiedades</button></div>`;
    });
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-op],[data-ver],[data-buscar]");
    if (!b) return;
    if ("op" in b.dataset) {
      filtro.operacion = b.dataset.op;
      root.querySelectorAll("#op .chip").forEach((c) => c.classList.toggle("on", c === b));
      render();
    } else if (b.dataset.ver) ficha(props.find((p) => p.id === b.dataset.ver));
    else formulario(null);
  });
  $("#tipo").addEventListener("change", (e) => ((filtro.tipo = e.target.value), render()));
  $("#amb").addEventListener("change", (e) => ((filtro.ambientes = Number(e.target.value)), render()));
  $("#max").addEventListener("input", (e) => ((filtro.max = Number(e.target.value) || 0), render()));
  render();
})();
