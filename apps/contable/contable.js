// Panel del estudio: quién mandó la documentación, quién no, y los vencimientos que vienen.
(async function () {
  "use strict";
  const { $, esc, wa, toast, nombreMes, cap } = Core;
  const N = Core.negocio;
  const root = $("#app");
  Core.pedirClave();
  const clientes = await Datos.clientes.list();
  let entregas = await Datos.entregas.list();
  let periodo = Datos.periodoAnterior();

  root.innerHTML = `${Core.topbar([["Portal del cliente", "portal.html?c=c1"]])}
  <main class="wrap page">
    <div class="page-head spread"><div><h1>Documentación de clientes</h1><p class="muted">Recordatorios automáticos hasta que cada cliente complete su mes.</p></div>
      <button class="btn primary" id="todos">Recordar a todos los incompletos</button></div>
    <div class="chips" id="periodos"></div>
    <div class="kpis mt" id="kpis"></div>
    <div class="grid mt split">
      <div class="card" style="min-width:0"><h2>Clientes</h2><div class="table-wrap"><table>
        <thead><tr><th>Cliente</th><th>Progreso</th><th>Falta</th><th></th></tr></thead><tbody id="tabla"></tbody></table></div></div>
      <div class="card"><h2>Próximos vencimientos</h2><div class="list" id="venc"></div></div>
    </div>
  </main>`;

  const mensaje = (c, faltan) =>
    `¡Hola, ${c.contacto}! Te escribimos de ${N.nombre}. Para cerrar ${nombreMes(periodo)} nos falta: ${faltan
      .map((d) => d.nombre)
      .join(", ")}. Puedes subirlo acá en un minuto: ${Datos.linkPortal(c)}`;

  function render() {
    root.querySelector("#periodos").innerHTML = Datos.periodos()
      .map((x) => `<button class="chip ${x === periodo ? "on" : ""}" data-periodo="${x}">${cap(nombreMes(x))}</button>`)
      .join("");
    const filas = clientes.map((c) => ({ c, p: Datos.progreso(c, periodo, entregas) }));
    const venc = Datos.proximos(30);
    $("#kpis").innerHTML = [
      [`${filas.filter((f) => f.p.pct === 100).length} / ${filas.length}`, "Clientes con el mes completo"],
      [filas.reduce((s, f) => s + f.p.faltan.length, 0), "Documentos pendientes", "alerta"],
      [venc.length ? `${venc[0].falta === 0 ? "Hoy" : `En ${venc[0].falta} d`}` : "—", venc.length ? venc[0].concepto : "Próximo vencimiento"],
    ]
      .map(([v, l, c = ""]) => `<div class="kpi ${c}"><b>${v}</b><span>${esc(l)}</span></div>`)
      .join("");
    $("#tabla").innerHTML = filas
      .sort((a, b) => a.p.pct - b.p.pct)
      .map(
        ({ c, p }) => `<tr><td><b>${esc(c.nombre)}</b><br><span class="badge">${esc(N.tipos[c.tipo])}</span></td>
        <td style="min-width:120px"><div class="progress"><i style="width:${p.pct}%"></i></div><span class="muted small">${p.hechos.length}/${p.req.length}</span></td>
        <td>${p.faltan.length ? p.faltan.map((d) => `<span class="badge warn">${esc(d.nombre)}</span>`).join(" ") : `<span class="badge ok">Completo</span>`}</td>
        <td><div class="row nowrap">${
          p.faltan.length
            ? `<a class="btn sm wa" target="_blank" rel="noopener" href="${wa(c.telefono, mensaje(c, p.faltan))}" data-recordar="${c.id}">Recordar</a>`
            : ""
        }<a class="btn sm ghost" href="portal.html?c=${c.id}" target="_blank" rel="noopener">Portal</a></div></td></tr>`,
      )
      .join("");
    $("#venc").innerHTML = venc.length
      ? venc
          .map(
            (v, i) => `<div class="item"><div class="grow"><b>${esc(v.concepto)}</b><br><span class="muted small">${cap(Core.fechaLarga(v.fecha))} · ${v.para
              .map((t) => N.tipos[t])
              .join(", ")}</span></div>
            <span class="badge ${v.falta <= 3 ? "bad" : v.falta <= 7 ? "warn" : ""}">${v.falta === 0 ? "Hoy" : `${v.falta} d`}</span>
            <button class="btn sm ghost" data-avisar="${i}">Avisar</button></div>`,
          )
          .join("")
      : `<div class="empty">Sin vencimientos en 30 días.</div>`;
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-periodo],[data-recordar],[data-avisar],#todos");
    if (!b) return;
    const d = b.dataset;
    if (d.periodo) {
      periodo = d.periodo;
      return render();
    }
    if (d.recordar) {
      const c = clientes.find((x) => x.id === d.recordar);
      const { faltan } = Datos.progreso(c, periodo, entregas);
      Core.send("recordatorio_documentacion", { cliente: c, periodo, faltan: faltan.map((x) => x.nombre), link: Datos.linkPortal(c) });
    } else if (d.avisar) {
      const v = Datos.proximos(30)[Number(d.avisar)];
      const destinatarios = clientes.filter((c) => v.para.includes(c.tipo));
      Core.send("vencimiento_aviso", { vencimiento: v, clientes: destinatarios.map((c) => ({ id: c.id, nombre: c.nombre, contacto: c.contacto, telefono: c.telefono })) });
      toast(`Aviso de “${v.concepto}” enviado a ${destinatarios.length} clientes`, "ok");
    } else {
      const incompletos = clientes
        .map((c) => ({ c, p: Datos.progreso(c, periodo, entregas) }))
        .filter((x) => x.p.faltan.length)
        .map(({ c, p }) => ({ id: c.id, nombre: c.nombre, contacto: c.contacto, telefono: c.telefono, faltan: p.faltan.map((x) => x.nombre), link: Datos.linkPortal(c) }));
      Core.send("recordatorio_documentacion_masivo", { periodo, clientes: incompletos });
      toast(`Recordatorio enviado a ${incompletos.length} clientes por WhatsApp`, "ok");
    }
  });
  Core.onCambio(async () => {
    entregas = await Datos.entregas.list();
    render();
  });
  render();
})();
