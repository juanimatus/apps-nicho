// Página que recibe el cliente: estado del vehículo y aprobación del presupuesto.
(function () {
  "use strict";
  const { $, esc, money, wa, toast } = Core;
  const N = Core.negocio;
  const { ESTADOS, indice } = Datos;
  const root = $("#app");
  let codigo = (Core.qs("c") || "").toUpperCase();

  root.innerHTML = `${Core.cover(N.direccion)}<main class="wrap narrow lift"><div class="card" id="caja"></div></main>`;
  const caja = $("#caja");

  async function buscar() {
    if (Core.remoto()) {
      try {
        return await Core.call("orden_obtener", { codigo });
      } catch (e) {
        console.warn(e);
      }
    }
    return Datos.ordenes.all().find((o) => o.codigo === codigo) || null;
  }

  function pedirCodigo(error) {
    caja.innerHTML = `<form class="stack" id="f"><h2>Seguimiento de tu vehículo</h2>
      <p class="muted">Ingresa el código que te enviamos por WhatsApp.</p>
      ${error ? `<p class="badge bad">No encontramos ese código</p>` : ""}
      <input name="c" required class="mono" style="font-size:1.4rem;text-align:center;text-transform:uppercase" placeholder="K7P2QX" value="${esc(codigo)}">
      <button class="btn primary block">Ver estado</button></form>`;
  }

  function fechaHora(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString("es", { day: "numeric", month: "short" }) + " " + d.toTimeString().slice(0, 5);
  }

  function mostrar(o) {
    const actual = indice(o.estado);
    const cuando = Object.fromEntries(o.historial.map((h) => [h.estado, h.ts]));
    const [, titulo, texto] = ESTADOS[actual];
    const p = o.presupuesto;
    caja.innerHTML = `<div class="stack">
      <div class="spread"><span class="badge mono">${esc(o.patente)}</span><span class="muted small">Código ${esc(o.codigo)}</span></div>
      <h2>${esc(o.vehiculo)}</h2>
      <div class="semaforo ${o.estado === "listo" ? "ok" : o.estado === "presupuesto" ? "warn" : "info"}"><b>${titulo}</b>${texto}</div>

      ${
        p.items.length && p.estado !== "borrador"
          ? `<div class="resumen"><h3>Presupuesto</h3><table><tbody>${p.items
              .map((i) => `<tr><td>${esc(i.desc)}</td><td style="text-align:right">${money(i.monto)}</td></tr>`)
              .join("")}<tr><td><b>Total</b></td><td style="text-align:right"><b>${money(Datos.total(o))}</b></td></tr></tbody></table>
            ${
              p.estado === "enviado"
                ? `<div class="grid c2 mt"><button class="btn primary" data-respuesta="aprobado">Aprobar presupuesto</button>
                   <a class="btn wa" target="_blank" rel="noopener" href="${wa(N.whatsapp, `Hola, tengo una consulta sobre el presupuesto de ${o.vehiculo} (${o.patente}).`)}">Tengo una consulta</a></div>
                   <button class="btn ghost block mt" data-respuesta="rechazado">No por ahora</button>`
                : `<p class="mt"><span class="badge ${p.estado === "aprobado" ? "ok" : "bad"}">${p.estado === "aprobado" ? "Aprobado" : "No aprobado"}</span></p>`
            }</div>`
          : ""
      }

      <ol class="timeline mt">${ESTADOS.map(([e, t], i) => {
        const cls = i < actual ? "hecho" : i === actual ? "hecho actual" : "";
        return `<li class="${cls}"><b>${t}</b>${cuando[e] ? `<br><span class="small">${fechaHora(cuando[e])}</span>` : ""}</li>`;
      }).join("")}</ol>

      ${
        o.proximoService && (o.proximoService.fecha || o.proximoService.km)
          ? `<p class="resumen small">Próximo service: ${o.proximoService.fecha ? Core.fecha(o.proximoService.fecha) : ""} ${
              o.proximoService.km ? `· ${Number(o.proximoService.km).toLocaleString("es")} km` : ""
            }. Te lo recordamos por WhatsApp.</p>`
          : ""
      }
      <a class="btn ghost block" target="_blank" rel="noopener" href="${wa(N.whatsapp, `Hola, consulto por mi ${o.vehiculo} (${o.patente}).`)}">Escribir al taller</a>
    </div>`;
  }

  async function cargar() {
    if (!codigo) return pedirCodigo();
    const o = await buscar();
    o ? mostrar(o) : pedirCodigo(true);
  }

  root.addEventListener("submit", (e) => {
    e.preventDefault();
    codigo = e.target.c.value.trim().toUpperCase();
    history.replaceState(null, "", `?c=${codigo}`);
    cargar();
  });
  root.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-respuesta]");
    if (!b) return;
    const respuesta = b.dataset.respuesta;
    b.disabled = true;
    const o = Datos.ordenes.all().find((x) => x.codigo === codigo);
    if (o) {
      // Modo demo: actualiza la orden en este navegador. Con Make, el escenario la actualiza en el Data Store.
      o.presupuesto.estado = respuesta;
      o.presupuesto.respondidoEn = new Date().toISOString();
      if (respuesta === "aprobado") Datos.cambiarEstado(o, "aprobado");
      Datos.ordenes.save(o, null);
    }
    await Core.send("presupuesto_respuesta", { codigo, respuesta });
    toast(respuesta === "aprobado" ? "¡Gracias! Ya empezamos a trabajar." : "Recibido. Te contactamos para ver alternativas.", "ok");
    cargar();
  });
  Core.onCambio(cargar);
  cargar();
})();
