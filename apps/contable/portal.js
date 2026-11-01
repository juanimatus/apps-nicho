// Portal del cliente: sube la documentación del mes y ve sus próximos vencimientos.
(async function () {
  "use strict";
  const { $, esc, fecha, nombreMes, cap, wa, toast } = Core;
  const N = Core.negocio;
  const root = $("#app");
  const cliente = await cargarCliente();
  if (!cliente) {
    root.innerHTML = `${Core.cover(N.direccion)}<main class="wrap narrow lift"><div class="card empty">No encontramos tu portal. Revisa el link que te enviamos por WhatsApp.</div></main>`;
    return;
  }
  let periodo = Datos.periodoAnterior();

  root.innerHTML = `${Core.cover(N.direccion)}<main class="wrap narrow lift"><div class="card stack" id="caja"></div>
    <div class="card mt"><h3>Tus próximos vencimientos</h3><div class="list" id="venc"></div></div></main>`;

  // Con Make, el portal pide solo los datos de este cliente (nunca la lista completa).
  async function cargarCliente() {
    const id = Core.qs("c");
    if (Core.remoto()) {
      try {
        const r = await Core.call("portal_obtener", { cliente: id });
        if (r && Array.isArray(r.entregas)) Core.local.set("entregas", r.entregas);
        return r && r.cliente;
      } catch (e) {
        console.warn(e);
        return null;
      }
    }
    const lista = Datos.clientes.all();
    return lista.find((c) => c.id === id) || lista[0];
  }

  function render() {
    const p = Datos.progreso(cliente, periodo);
    const entregas = Datos.entregas.all();
    $("#caja").innerHTML = `
      <div><p class="muted small">${esc(cliente.nombre)}</p><h2>¡Hola, ${esc(cliente.contacto)}!</h2></div>
      <div class="chips">${Datos.periodos()
        .map((x) => `<button class="chip ${x === periodo ? "on" : ""}" data-periodo="${x}">${cap(nombreMes(x))}</button>`)
        .join("")}</div>
      <div><div class="spread small"><b>Documentación de ${nombreMes(periodo)}</b><span>${p.hechos.length} de ${p.req.length}</span></div>
        <div class="progress mt" style="margin-top:6px"><i style="width:${p.pct}%"></i></div></div>
      ${p.pct === 100 ? `<p class="badge ok">¡Completo! Gracias, ya podemos trabajar con este mes.</p>` : ""}
      <div class="list">${p.req
        .map((d) => {
          const e = entregas.find((x) => x.cliente === cliente.id && x.periodo === periodo && x.doc === d.id);
          return `<div class="item"><div class="grow"><b>${esc(d.nombre)}</b> ${e ? `<span class="badge ok">Recibido</span>` : `<span class="badge warn">Pendiente</span>`}
            <br><span class="muted small">${e ? `${esc(e.archivo)} · ${fecha(e.subido.slice(0, 10))}` : esc(d.ayuda)}</span></div>
            <label class="btn sm ${e ? "ghost" : "primary"}">${e ? "Reemplazar" : "Subir archivo"}
              <input type="file" data-doc="${d.id}" accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.csv,.zip" hidden></label></div>`;
        })
        .join("")}</div>
      <a class="btn wa block" target="_blank" rel="noopener" href="${wa(N.whatsapp, `Hola, soy ${cliente.contacto} de ${cliente.nombre}. Tengo una consulta.`)}">Consultar al estudio</a>`;

    const venc = Datos.proximos(45, cliente.tipo);
    $("#venc").innerHTML = venc.length
      ? venc
          .map(
            (v) => `<div class="item"><div class="grow"><b>${esc(v.concepto)}</b><br><span class="muted small">${cap(Core.fechaLarga(v.fecha))}</span></div>
            <span class="badge ${v.falta <= 3 ? "bad" : v.falta <= 7 ? "warn" : ""}">${v.falta === 0 ? "Hoy" : `En ${v.falta} d`}</span></div>`,
          )
          .join("")
      : `<div class="empty">Sin vencimientos en los próximos días.</div>`;
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-periodo]");
    if (!b) return;
    periodo = b.dataset.periodo;
    render();
  });

  root.addEventListener("change", async (e) => {
    const input = e.target.closest("input[type=file]");
    if (!input || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 20 * 1024 * 1024) return toast("El archivo supera los 20 MB", "bad");
    const label = input.parentElement;
    label.firstChild.textContent = "Subiendo… ";
    label.classList.add("dim");
    const entrega = {
      id: `${cliente.id}-${periodo}-${input.dataset.doc}`,
      cliente: cliente.id,
      periodo,
      doc: input.dataset.doc,
      archivo: file.name,
      tamano: file.size,
      subido: new Date().toISOString(),
    };
    try {
      await Core.sendFile("documento_subido", entrega, file);
      Datos.entregas.save(entrega, null);
      toast("Archivo recibido. ¡Gracias!", "ok");
    } catch (err) {
      console.warn(err);
      toast("No se pudo subir. Intenta de nuevo.", "bad");
    }
    render();
  });

  render();
})();
