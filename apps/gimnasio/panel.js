// Panel del gimnasio: cuotas, cobros y socios en riesgo de baja.
(async function () {
  "use strict";
  const { $, esc, money, wa, toast, fecha, iso, addMonths, primerNombre } = Core;
  const N = Core.negocio;
  const root = $("#app");
  Core.pedirClave();
  let socios = await Datos.socios.list();
  let filtro = "todos";
  let busqueda = "";

  const FILTROS = [
    ["todos", "Todos"],
    ["al_dia", "Al día"],
    ["por_vencer", "Por vencer"],
    ["vencida", "Vencidas"],
    ["riesgo", "En riesgo de baja"],
  ];

  root.innerHTML = `${Core.topbar([
    ["Alta de socios", "alta.html"],
    ["Check-in", "checkin.html"],
  ])}
  <main class="wrap page">
    <div class="page-head"><h1>Socios y cuotas</h1><p class="muted">Quién debe, quién está por vencer y quién dejó de venir.</p></div>
    <div class="kpis" id="kpis"></div>
    <div class="card mt">
      <div class="spread"><div class="chips" id="filtros">${FILTROS.map(([v, t]) => `<button class="chip" data-filtro="${v}">${t}</button>`).join("")}</div>
        <input id="buscar" type="search" placeholder="Buscar por nombre o DNI" class="w-auto" aria-label="Buscar socio"></div>
      <div class="table-wrap mt"><table><thead><tr><th>Socio</th><th>Plan</th><th>Cuota</th><th>Última visita</th><th></th></tr></thead><tbody id="tabla"></tbody></table></div>
    </div>
  </main>`;

  function mensaje(s, est) {
    if (est.riesgo) return `¡Hola, ${primerNombre(s.nombre)}! Te extrañamos en ${N.nombre} 💪 Hace ${est.sinVenir} días que no te vemos. ¿Todo bien? Esta semana tienes una clase de regalo para volver con todo.`;
    if (est.clave === "vencida") return `¡Hola, ${primerNombre(s.nombre)}! Tu cuota de ${N.nombre} venció el ${fecha(s.vence)}. Puedes renovarla en recepción o con este link y seguir entrenando sin cortes.`;
    return `¡Hola, ${primerNombre(s.nombre)}! Tu cuota de ${N.nombre} vence el ${fecha(s.vence)}. Renuévala antes y no pierdes ni un día.`;
  }

  function fila(s) {
    const est = Datos.estado(s);
    const evento = est.riesgo ? "reactivacion" : "recordatorio_cuota";
    return `<tr>
      <td><b>${esc(s.nombre)}</b><br><span class="muted small">DNI ${esc(s.dni)}</span></td>
      <td>${esc(s.plan)}<br><span class="muted small">${money(s.precio)}</span></td>
      <td><span class="badge ${est.cls}">${est.txt}</span><br><span class="muted small">${fecha(s.vence)}</span></td>
      <td>${s.ultimaAsistencia ? (est.sinVenir === 0 ? "Hoy" : `Hace ${est.sinVenir} d`) : "Nunca"} ${est.riesgo ? `<span class="badge bad">Riesgo</span>` : ""}</td>
      <td><div class="row nowrap"><button class="btn sm primary" data-cobrar="${s.id}">Cobrar</button>
        <a class="btn sm wa" target="_blank" rel="noopener" href="${wa(s.telefono, mensaje(s, est))}" data-avisar="${s.id}" data-evento="${evento}">Avisar</a></div></td>
    </tr>`;
  }

  function render() {
    root.querySelectorAll("#filtros .chip").forEach((c) => c.classList.toggle("on", c.dataset.filtro === filtro));
    const con = socios.map((s) => ({ s, est: Datos.estado(s) }));
    const vencidas = con.filter((x) => x.est.clave === "vencida");
    const mes = iso().slice(0, 7);
    const cobradoMes = Datos.pagos
      .all()
      .filter((p) => p.fecha.startsWith(mes))
      .reduce((t, p) => t + p.monto, 0);
    $("#kpis").innerHTML = [
      [con.filter((x) => x.est.clave !== "vencida").length, "Socios activos"],
      [con.filter((x) => x.est.clave === "por_vencer").length, `Vencen en ${N.diasAviso} días o menos`],
      [money(vencidas.reduce((t, x) => t + x.s.precio, 0)), `${vencidas.length} cuotas vencidas sin cobrar`, "alerta"],
      [con.filter((x) => x.est.riesgo).length, `Sin venir hace ${N.diasRiesgo}+ días`],
      [money(cobradoMes), "Cobrado este mes (desde el panel)"],
    ]
      .map(([v, l, c = ""]) => `<div class="kpi ${c}"><b>${v}</b><span>${l}</span></div>`)
      .join("");
    const q = busqueda.toLowerCase();
    const lista = con
      .filter(({ est }) => filtro === "todos" || (filtro === "riesgo" ? est.riesgo : est.clave === filtro))
      .filter(({ s }) => !q || s.nombre.toLowerCase().includes(q) || s.dni.includes(q))
      .sort((a, b) => a.est.dias - b.est.dias);
    $("#tabla").innerHTML = lista.length ? lista.map(({ s }) => fila(s)).join("") : `<tr><td colspan="5"><div class="empty">Sin socios en esta vista.</div></td></tr>`;
  }

  function cobrar(s) {
    const m = Core.modal(`<h2>Registrar pago</h2><p class="muted">${esc(s.nombre)} · ${esc(s.plan)}</p><form class="stack">
      <label class="field"><span>Monto</span><input name="monto" type="number" value="${s.precio}" required></label>
      <label class="field"><span>Medio de pago</span><select name="medio">${N.mediosPago.map((x) => `<option>${esc(x)}</option>`).join("")}</select></label>
      <label class="field"><span>Meses</span><select name="meses"><option>1</option><option>2</option><option>3</option><option>6</option></select></label>
      <div class="row end"><button type="button" class="btn ghost" data-cerrar>Cancelar</button><button class="btn primary">Registrar</button></div></form>`);
    m.box.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      // Si estaba vencida, el nuevo período arranca hoy; si no, se suma al vencimiento actual.
      const base = s.vence < iso() ? iso() : s.vence;
      s.vence = addMonths(base, Number(d.meses));
      const pago = { id: Core.uid("PG"), socioId: s.id, monto: Number(d.monto), medio: d.medio, meses: Number(d.meses), fecha: iso() };
      Datos.pagos.save(pago, null);
      Datos.socios.save(s, null);
      Core.send("pago_registrado", { socio: s, pago });
      socios = Datos.socios.all();
      m.close();
      render();
      toast(`Pago registrado. Nuevo vencimiento: ${fecha(s.vence)}`, "ok");
    });
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-filtro],[data-cobrar],[data-avisar]");
    if (!b) return;
    if (b.dataset.filtro) {
      filtro = b.dataset.filtro;
      render();
    } else if (b.dataset.cobrar) cobrar(socios.find((s) => s.id === b.dataset.cobrar));
    else {
      const s = socios.find((x) => x.id === b.dataset.avisar);
      Core.send(b.dataset.evento, { socio: s, estado: Datos.estado(s) });
    }
  });
  $("#buscar").addEventListener("input", (e) => {
    busqueda = e.target.value;
    render();
  });
  Core.onCambio(async () => {
    socios = await Datos.socios.list();
    render();
  });
  render();
})();
