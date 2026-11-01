// Panel de recuperación de carritos: resultados y editor de la secuencia de WhatsApp.
(async function () {
  "use strict";
  const { $, esc, money, wa, toast, hace } = Core;
  const N = Core.negocio;
  const root = $("#app");
  Core.pedirClave();
  let carritos = await Datos.carritos.list();
  let tab = "carritos";
  const ESTADOS = { activo: ["En secuencia", "warn"], recuperado: ["Recuperado", "ok"], perdido: ["Perdido", ""] };

  root.innerHTML = `${Core.topbar([["Página de reseña", "resena.html?n=Carla"]])}
  <main class="wrap page">
    <div class="page-head spread"><div><h1>Recuperación de carritos</h1><p class="muted">Conectado a ${esc(N.plataforma)}: cada carrito abandonado recibe la secuencia por WhatsApp.</p></div>
      <button class="btn ghost" id="simular">Simular carrito abandonado</button></div>
    <div class="kpis" id="kpis"></div>
    <div class="card mt"><div class="tabs"><button class="tab" data-tab="carritos">Carritos</button><button class="tab" data-tab="mensajes">Mensajes</button></div><div id="contenido"></div></div>
  </main>`;

  function kpis() {
    const desde = Date.now() - 30 * 86400000;
    const mes = carritos.filter((c) => Date.parse(c.creado) >= desde);
    const rec = mes.filter((c) => c.estado === "recuperado");
    const cerrados = mes.filter((c) => c.estado !== "activo").length;
    $("#kpis").innerHTML = [
      [mes.length, "Carritos abandonados (30 días)"],
      [rec.length, "Recuperados"],
      [money(rec.reduce((s, c) => s + c.total, 0)), "Facturación recuperada"],
      [`${cerrados ? Math.round((rec.length / cerrados) * 100) : 0}%`, "Tasa de recuperación"],
    ]
      .map(([v, l]) => `<div class="kpi"><b>${v}</b><span>${l}</span></div>`)
      .join("");
  }

  function vistaCarritos() {
    const sec = Datos.secuencia();
    const lista = [...carritos].sort((a, b) => Date.parse(b.creado) - Date.parse(a.creado));
    return `<div class="list">${lista
      .map((c) => {
        const [txt, cls] = ESTADOS[c.estado] || ESTADOS.activo;
        const n = Datos.enviados(c);
        const proximo = sec[n];
        return `<div class="item"><div class="grow">
          <div class="row"><b>${esc(c.cliente)}</b><span class="badge ${cls}">${txt}</span><span class="muted small">${hace(c.creado)}</span></div>
          <div class="small">${c.items.map((i) => esc(i.nombre)).join(", ")} · <b>${money(c.total)}</b></div>
          <div class="chips" style="margin-top:6px">${sec
            .map((p, i) => `<span class="badge ${i < n ? "ok" : ""}">${i < n ? "✓" : "○"} ${p.horas} h</span>`)
            .join("")}</div></div>
          <div class="row">${
            c.estado === "activo"
              ? `${proximo ? `<a class="btn sm wa" target="_blank" rel="noopener" href="${wa(c.telefono, Datos.completar(proximo.texto, c))}">Enviar ahora</a>` : ""}
                 <button class="btn sm primary" data-recuperado="${c.id}">Marcar recuperado</button>`
              : ""
          }</div></div>`;
      })
      .join("")}</div>`;
  }

  function vistaMensajes() {
    const sec = Datos.secuencia();
    const ejemplo = carritos[0] || Datos.simular();
    return `<p class="muted small">Variables: <code>{{nombre}}</code> <code>{{productos}}</code> <code>{{total}}</code> <code>{{link}}</code> <code>{{cupon}}</code>.
      En WhatsApp oficial cada mensaje se aprueba como plantilla de Meta.</p>
      <form id="sec" class="stack">${sec
        .map(
          (p, i) => `<div class="grid c2" style="align-items:start">
          <div class="stack"><label class="field"><span>Mensaje ${i + 1} · enviar a las</span><select name="horas${i}">${[1, 2, 4, 12, 24, 48, 72]
            .map((h) => `<option value="${h}" ${h === p.horas ? "selected" : ""}>${h} h del abandono</option>`)
            .join("")}</select></label>
            <textarea name="texto${i}" rows="4">${esc(p.texto)}</textarea></div>
          <div class="wa-bg"><div class="bubble" id="prev${i}">${esc(Datos.completar(p.texto, ejemplo))}</div></div></div>`,
        )
        .join("")}
      <div class="row end"><button class="btn primary">Guardar secuencia</button></div></form>`;
  }

  function render() {
    kpis();
    root.querySelectorAll(".tab").forEach((t) => t.classList.toggle("on", t.dataset.tab === tab));
    $("#contenido").innerHTML = tab === "carritos" ? vistaCarritos() : vistaMensajes();
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab],[data-recuperado],#simular");
    if (!b) return;
    if (b.dataset.tab) tab = b.dataset.tab;
    else if (b.id === "simular") {
      const c = Datos.simular();
      Datos.carritos.save(c, "carrito_abandonado");
      carritos = Datos.carritos.all();
      tab = "carritos";
      toast(`Carrito de ${c.cliente} detectado: el primer WhatsApp sale en ${Datos.secuencia()[0].horas} h`, "ok");
    } else {
      const c = carritos.find((x) => x.id === b.dataset.recuperado);
      c.estado = "recuperado";
      c.recuperadoEn = new Date().toISOString();
      Datos.carritos.save(c, "carrito_recuperado");
      carritos = Datos.carritos.all();
      toast(`¡${money(c.total)} recuperados!`, "ok");
    }
    render();
  });

  root.addEventListener("input", (e) => {
    const m = e.target.name && e.target.name.match(/^texto(\d+)$/);
    if (m) $(`#prev${m[1]}`).textContent = Datos.completar(e.target.value, carritos[0] || Datos.simular());
  });
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(e.target);
    const sec = Datos.secuencia().map((_, i) => ({ horas: Number(d.get(`horas${i}`)), texto: String(d.get(`texto${i}`)).trim() }));
    sec.sort((a, b) => a.horas - b.horas);
    Datos.guardarSecuencia(sec);
    Core.send("secuencia_actualizada", { secuencia: sec, cupon: N.cupon });
    toast("Secuencia guardada", "ok");
    render();
  });

  Core.onCambio(async () => {
    carritos = await Datos.carritos.list();
    if (tab === "carritos") render();
  });
  render();
})();
