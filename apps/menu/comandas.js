// Panel de comandas para la cocina: los pedidos entran solos y avanzan por columnas.
(async function () {
  "use strict";
  const { $, esc, money, wa, toast, hace, iso } = Core;
  const N = Core.negocio;
  const root = $("#app");
  Core.pedirClave();
  let pedidos = await Datos.pedidos.list();
  let vistos = new Set(pedidos.map((p) => p.id));
  const SIGUIENTE = { nuevo: ["preparando", "Preparar"], preparando: ["listo", "Listo"], listo: ["entregado", "Entregado"] };

  root.innerHTML = `${Core.topbar([
    ["Ver menú", "menu.html"],
    ["Menú de mesa 4", "menu.html?mesa=4"],
  ])}
  <main class="wrap page">
    <div class="page-head"><h1>Comandas</h1><p class="muted">Los pedidos del menú entran acá al instante. Ábrelo en la tablet de la cocina.</p></div>
    <div class="kpis" id="kpis"></div>
    <div class="columns mt" id="columnas"></div>
  </main>`;

  const ENTREGA = { delivery: ["🛵 Delivery", "accent"], retiro: ["🛍️ Retiro", "info"], mesa: ["🍽️ Mesa", "ok"] };

  function tarjeta(p) {
    const [txt, cls] = ENTREGA[p.entrega] || ENTREGA.retiro;
    const sig = SIGUIENTE[p.estado];
    const avisoListo = `¡Hola, ${Core.primerNombre(p.cliente.nombre)}! Tu pedido #${p.numero} de ${N.nombre} está listo ${
      p.entrega === "delivery" ? "y sale para tu casa 🛵" : "para retirar 🙌"
    }`;
    return `<div class="card ${vistos.has(p.id) ? "" : "nuevo"}" style="padding:14px">
      <div class="spread"><b>#${p.numero} · ${esc(p.cliente.nombre)}</b><span class="muted small">${hace(p.creado)}</span></div>
      <div class="row mt" style="margin-top:6px"><span class="badge ${cls}">${txt}${p.mesa ? ` ${esc(p.mesa)}` : ""}</span><span class="badge">${esc(p.pago)}</span></div>
      <ul class="small" style="padding-left:18px;margin:10px 0">${p.items.map((i) => `<li><b>${i.cant}×</b> ${esc(i.nombre)}</li>`).join("")}</ul>
      ${p.notas ? `<p class="small"><b>Nota:</b> ${esc(p.notas)}</p>` : ""}
      ${p.direccion ? `<p class="small muted">${esc(p.direccion)}</p>` : ""}
      <div class="spread"><b>${money(p.total)}</b><div class="row">
        ${p.estado === "listo" && p.cliente.telefono ? `<a class="btn sm wa" target="_blank" rel="noopener" href="${wa(p.cliente.telefono, avisoListo)}">Avisar</a>` : ""}
        ${sig ? `<button class="btn sm primary" data-id="${p.id}" data-estado="${sig[0]}">${sig[1]}</button>` : ""}
      </div></div>
    </div>`;
  }

  function render() {
    const hoy = pedidos.filter((p) => iso(new Date(p.creado)) === iso() && p.estado !== "cancelado");
    const ventas = hoy.reduce((s, p) => s + p.total, 0);
    $("#kpis").innerHTML = [
      [hoy.length, "Pedidos de hoy"],
      [money(ventas), "Ventas de hoy"],
      [money(hoy.length ? ventas / hoy.length : 0), "Ticket promedio"],
      [money(ventas * (N.comisionApps || 0)), "Comisión que no pagaste a las apps"],
    ]
      .map(([v, l]) => `<div class="kpi"><b>${v}</b><span>${l}</span></div>`)
      .join("");
    $("#columnas").innerHTML = Datos.ESTADOS.map(([estado, titulo]) => {
      let lista = pedidos.filter((p) => p.estado === estado).sort((a, b) => Date.parse(a.creado) - Date.parse(b.creado));
      if (estado === "entregado") lista = lista.filter((p) => iso(new Date(p.creado)) === iso()).reverse().slice(0, 5);
      return `<div class="column"><h3><span>${titulo}</span><span class="badge">${lista.length}</span></h3><div class="list">${
        lista.length ? lista.map(tarjeta).join("") : `<div class="empty small">Sin pedidos</div>`
      }</div></div>`;
    }).join("");
    vistos = new Set(pedidos.map((p) => p.id));
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-estado]");
    if (!b) return;
    const p = pedidos.find((x) => x.id === b.dataset.id);
    p.estado = b.dataset.estado;
    p.actualizado = new Date().toISOString();
    Datos.pedidos.save(p, "pedido_estado");
    pedidos = Datos.pedidos.all();
    render();
  });

  Core.onCambio(async () => {
    pedidos = await Datos.pedidos.list();
    if (pedidos.some((p) => !vistos.has(p.id))) {
      Core.beep();
      toast("¡Nuevo pedido!", "ok");
    }
    render();
  }, 10);
  setInterval(render, 60000);
  render();
})();
