// Panel del taller: órdenes, estados, presupuestos y link de seguimiento para el cliente.
(async function () {
  "use strict";
  const { $, esc, money, wa, toast, hace, iso } = Core;
  const N = Core.negocio;
  const { ESTADOS, indice } = Datos;
  const root = $("#app");
  Core.pedirClave();
  let ordenes = await Datos.ordenes.list();
  let verEntregadas = false;
  const nombreEstado = (e) => (ESTADOS[indice(e)] || [, e])[1];

  root.innerHTML = `${Core.topbar([["Seguimiento (cliente)", "seguimiento.html?c=K7P2QX"]])}
  <main class="wrap page">
    <div class="page-head spread"><div><h1>Órdenes de trabajo</h1><p class="muted">Cada cambio de estado le llega al cliente por WhatsApp, con su link de seguimiento.</p></div>
      <button class="btn primary" id="nueva">+ Nueva orden</button></div>
    <div class="kpis" id="kpis"></div>
    <div class="card mt"><div class="spread"><h2>En el taller</h2><label class="row small"><input type="checkbox" id="entregadas" style="width:auto"> Mostrar entregadas</label></div>
      <div class="list mt" id="lista"></div></div>
  </main>`;

  function guardar(o, evento, extra = {}) {
    o.actualizado = new Date().toISOString();
    Datos.ordenes.save(o, null);
    Core.send(evento, { ...extra, orden: o, link: Datos.linkSeguimiento(o) });
    ordenes = Datos.ordenes.all();
  }

  function render() {
    const abiertas = ordenes.filter((o) => o.estado !== "entregado");
    const mes = iso().slice(0, 7);
    $("#kpis").innerHTML = [
      [abiertas.length, "Vehículos en el taller"],
      [ordenes.filter((o) => o.presupuesto.estado === "enviado").length, "Presupuestos esperando respuesta"],
      [ordenes.filter((o) => o.estado === "listo").length, "Listos para retirar"],
      [
        money(
          ordenes
            .filter((o) => o.presupuesto.estado === "aprobado" && (o.historial.find((h) => h.estado === "aprobado")?.ts || "").startsWith(mes))
            .reduce((s, o) => s + Datos.total(o), 0),
        ),
        "Presupuestos aprobados este mes",
      ],
    ]
      .map(([v, l]) => `<div class="kpi"><b>${v}</b><span>${l}</span></div>`)
      .join("");
    const lista = (verEntregadas ? ordenes : abiertas).slice().sort((a, b) => indice(a.estado) - indice(b.estado));
    $("#lista").innerHTML = lista.length
      ? lista
          .map((o) => {
            const i = indice(o.estado);
            return `<div class="item"><span class="badge mono" style="font-size:.9rem">${esc(o.patente)}</span>
            <div class="grow"><b>${esc(o.vehiculo)}</b> · ${esc(o.cliente)}<br><span class="muted small">${esc(o.problema)}</span>
              <div class="progress" style="margin-top:8px"><i style="width:${((i + 1) / ESTADOS.length) * 100}%"></i></div></div>
            <div class="stack" style="text-align:right"><span class="badge ${o.estado === "listo" ? "ok" : o.estado === "presupuesto" ? "warn" : "info"}">${nombreEstado(o.estado)}</span>
              <span class="muted tiny">${hace(o.historial.at(-1).ts)}</span></div>
            <button class="btn sm ghost" data-abrir="${o.id}">Abrir</button></div>`;
          })
          .join("")
      : `<div class="empty">No hay vehículos en el taller.</div>`;
  }

  function detalle(o) {
    const m = Core.modal("");
    const pinta = () => {
      const i = indice(o.estado);
      const sig = ESTADOS[i + 1];
      const editable = o.presupuesto.estado === "borrador" || o.presupuesto.estado === "rechazado";
      m.box.innerHTML = `<div class="stack">
        <div class="spread"><div><span class="badge mono">${esc(o.patente)}</span> <b>${esc(o.vehiculo)}</b></div><button class="btn sm ghost" data-cerrar>Cerrar</button></div>
        <p class="muted small">${esc(o.cliente)} · ${o.km.toLocaleString("es")} km · Código <b class="mono">${o.codigo}</b></p>
        <p>${esc(o.problema)}</p>
        <div class="resumen"><div class="spread"><span>Estado: <b>${nombreEstado(o.estado)}</b></span>
          ${sig && sig[0] !== "presupuesto" && sig[0] !== "aprobado" ? `<button class="btn sm primary" data-estado="${sig[0]}">Pasar a: ${sig[1]}</button>` : ""}</div></div>

        <h3 class="mt">Presupuesto <span class="badge ${o.presupuesto.estado === "aprobado" ? "ok" : o.presupuesto.estado === "enviado" ? "warn" : o.presupuesto.estado === "rechazado" ? "bad" : ""}">${
          { borrador: "Borrador", enviado: "Esperando respuesta", aprobado: "Aprobado", rechazado: "Rechazado" }[o.presupuesto.estado]
        }</span></h3>
        <form id="pres" class="stack">${o.presupuesto.items
          .map(
            (it, k) => `<div class="row nowrap"><input name="desc${k}" value="${esc(it.desc)}" ${editable ? "" : "disabled"} aria-label="Descripción">
              <input name="monto${k}" type="number" value="${it.monto}" style="max-width:130px" ${editable ? "" : "disabled"} aria-label="Monto">
              ${editable ? `<button type="button" class="btn sm ghost" data-quitar="${k}" aria-label="Quitar">✕</button>` : ""}</div>`,
          )
          .join("")}
          ${editable ? `<button type="button" class="btn sm ghost" data-agregar>+ Agregar ítem</button>` : ""}
          <div class="spread"><b>Total ${money(Datos.total(o))}</b>${
            editable && o.presupuesto.items.length ? `<button class="btn sm primary">Enviar presupuesto al cliente</button>` : ""
          }</div>
        </form>

        ${
          ["listo", "entregado"].includes(o.estado)
            ? `<h3 class="mt">Próximo service</h3><div class="grid c2"><label class="field"><span>Fecha</span><input type="date" data-ps="fecha" value="${esc(
                o.proximoService.fecha,
              )}"></label><label class="field"><span>Kilometraje</span><input type="number" data-ps="km" value="${esc(o.proximoService.km)}"></label></div>
              <p class="muted tiny">Make le recuerda el service al cliente por WhatsApp una semana antes.</p>`
            : ""
        }
        <div class="row mt"><a class="btn sm wa" target="_blank" rel="noopener" href="${wa(
          o.telefono,
          `¡Hola, ${Core.primerNombre(o.cliente)}! Soy de ${N.nombre}. Puedes seguir el estado de tu ${o.vehiculo} acá: ${Datos.linkSeguimiento(o)}`,
        )}">Enviar link por WhatsApp</a><button class="btn sm ghost" data-copiar>Copiar link</button></div>
      </div>`;
    };

    const leerItems = () => {
      const f = $("#pres", m.box);
      o.presupuesto.items = o.presupuesto.items.map((it, k) => ({
        desc: f[`desc${k}`] ? f[`desc${k}`].value : it.desc,
        monto: f[`monto${k}`] ? Number(f[`monto${k}`].value) || 0 : it.monto,
      }));
    };

    m.box.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-estado],[data-agregar],[data-quitar],[data-copiar]");
      if (!b) return;
      const d = b.dataset;
      if (d.estado) {
        Datos.cambiarEstado(o, d.estado);
        guardar(o, "orden_estado");
        toast(`${o.patente}: ${nombreEstado(d.estado)}. El cliente recibe el aviso.`, "ok");
      } else if ("agregar" in d) {
        leerItems();
        o.presupuesto.items.push({ desc: "", monto: 0 });
      } else if (d.quitar) {
        leerItems();
        o.presupuesto.items.splice(Number(d.quitar), 1);
      } else {
        try {
          await navigator.clipboard.writeText(Datos.linkSeguimiento(o));
          toast("Link copiado", "ok");
        } catch {
          prompt("Copia el link:", Datos.linkSeguimiento(o));
        }
        return;
      }
      pinta();
      render();
    });
    m.box.addEventListener("input", (e) => {
      if (e.target.closest("#pres")) {
        leerItems();
        m.box.querySelector("#pres .spread b").textContent = `Total ${money(Datos.total(o))}`;
      }
    });
    m.box.addEventListener("change", (e) => {
      const k = e.target.dataset.ps;
      if (!k) return;
      o.proximoService[k] = e.target.value;
      guardar(o, "proximo_service");
    });
    m.box.addEventListener("submit", (e) => {
      e.preventDefault();
      leerItems();
      o.presupuesto.items = o.presupuesto.items.filter((it) => it.desc.trim());
      if (!o.presupuesto.items.length) return toast("Agrega al menos un ítem", "warn");
      o.presupuesto.estado = "enviado";
      if (o.estado !== "presupuesto") Datos.cambiarEstado(o, "presupuesto");
      guardar(o, "presupuesto_enviado", { total: Datos.total(o) });
      toast("Presupuesto enviado. El cliente lo aprueba desde su link.", "ok");
      pinta();
      render();
    });
    pinta();
  }

  function nueva() {
    const m = Core.modal(`<h2>Nueva orden</h2><form class="stack">
      <div class="grid c2"><label class="field"><span>Cliente</span><input name="cliente" required></label>
        <label class="field"><span>WhatsApp</span><input name="telefono" type="tel" required></label></div>
      <div class="grid c2"><label class="field"><span>Vehículo</span><input name="vehiculo" required placeholder="Marca, modelo y año"></label>
        <label class="field"><span>Patente</span><input name="patente" required style="text-transform:uppercase"></label></div>
      <label class="field"><span>Kilometraje</span><input name="km" type="number" inputmode="numeric"></label>
      <label class="field"><span>Motivo / problema</span><textarea name="problema" rows="2" required></textarea></label>
      <div class="row end"><button type="button" class="btn ghost" data-cerrar>Cancelar</button><button class="btn primary">Crear orden</button></div></form>`);
    m.box.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const o = Datos.nueva(Object.fromEntries(new FormData(e.target)));
      guardar(o, "orden_creada");
      m.close();
      render();
      toast("Orden creada. El cliente recibe su link de seguimiento.", "ok");
      detalle(o);
    });
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-abrir],#nueva");
    if (!b) return;
    if (b.id === "nueva") nueva();
    else detalle(ordenes.find((o) => o.id === b.dataset.abrir));
  });
  $("#entregadas").addEventListener("change", (e) => {
    verEntregadas = e.target.checked;
    render();
  });
  Core.onCambio(async () => {
    ordenes = await Datos.ordenes.list();
    render();
  });
  render();
})();
