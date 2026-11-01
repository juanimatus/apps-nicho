// Menú QR / link de Instagram: arma el pedido y lo manda al panel (y por WhatsApp si el local quiere).
(function () {
  "use strict";
  const { $, esc, money, wa, toast } = Core;
  const N = Core.negocio;
  const root = $("#app");
  const mesa = Core.qs("mesa") || "";
  const carrito = new Map(); // id -> cantidad
  const datos = { entrega: mesa ? "mesa" : "delivery", pago: N.mediosPago[0] };

  root.innerHTML = `${Core.cover(mesa ? `Mesa ${mesa}` : N.direccion)}
  <main class="wrap narrow lift">
    <div class="card"><div class="chips"><span class="badge accent">${mesa ? `Pedido a la mesa ${esc(mesa)}` : `Envío ${money(N.envio)}`}</span>
      ${mesa ? "" : `<span class="badge">Retiro sin cargo</span><span class="badge">Mínimo delivery ${money(N.minimoDelivery)}</span>`}</div></div>
    <div class="sticky-tabs"><div class="chips" style="flex-wrap:nowrap;overflow-x:auto">${N.categorias
      .map((c) => `<a class="chip" href="#cat-${c.id}" style="text-decoration:none">${esc(c.nombre)}</a>`)
      .join("")}</div></div>
    <div id="carta"></div>
    <div style="height:80px"></div>
  </main>
  <button class="btn primary cart-bar" id="ver" hidden></button>`;

  const total = () => [...carrito].reduce((s, [id, c]) => s + Datos.item(id).precio * c, 0);
  const unidades = () => [...carrito.values()].reduce((s, c) => s + c, 0);
  const qty = (id) =>
    carrito.get(id)
      ? `<span class="qty"><button type="button" data-menos="${id}" aria-label="Quitar uno">−</button><b>${carrito.get(id)}</b><button type="button" data-mas="${id}" aria-label="Agregar uno">+</button></span>`
      : `<button type="button" class="btn sm primary" data-mas="${id}">Agregar</button>`;

  function pintaCarta() {
    $("#carta").innerHTML = N.categorias
      .map(
        (c) => `<section id="cat-${c.id}" style="scroll-margin-top:60px"><h2 class="mt">${esc(c.nombre)}</h2><div class="list">${c.items
          .map(
            (i) => `<div class="item"><span style="font-size:2rem">${i.emoji || "🍽️"}</span>
            <div class="grow"><b>${esc(i.nombre)}</b><br><span class="muted small">${esc(i.desc)}</span><br><b>${money(i.precio)}</b></div>
            <div data-qty="${i.id}">${qty(i.id)}</div></div>`,
          )
          .join("")}</div></section>`,
      )
      .join("");
  }
  function pintaBarra() {
    const b = $("#ver");
    b.hidden = !carrito.size;
    b.innerHTML = `<span>Ver pedido (${unidades()})</span><span>${money(total())}</span>`;
  }
  function cambiar(id, delta) {
    const c = (carrito.get(id) || 0) + delta;
    if (c <= 0) carrito.delete(id);
    else carrito.set(id, c);
    root.querySelectorAll(`[data-qty="${id}"]`).forEach((el) => (el.innerHTML = qty(id)));
    pintaBarra();
  }

  function resumenTexto(p) {
    const lineas = p.items.map((i) => `• ${i.cant} x ${i.nombre} — ${money(i.precio * i.cant)}`).join("\n");
    const entrega = p.entrega === "mesa" ? `Mesa ${p.mesa}` : p.entrega === "retiro" ? "Retiro en el local" : `Delivery a ${p.direccion}`;
    return `Pedido #${p.numero} — ${N.nombre}\n${lineas}\n${p.envio ? `Envío: ${money(p.envio)}\n` : ""}Total: ${money(p.total)}\n${entrega}\nPago: ${p.pago}\n${
      p.notas ? `Notas: ${p.notas}\n` : ""
    }A nombre de ${p.cliente.nombre}`;
  }

  function checkout() {
    const m = Core.modal("");
    const pinta = () => {
      const envio = datos.entrega === "delivery" ? N.envio : 0;
      m.box.innerHTML = `<form class="stack" id="pedido">
        <div class="spread"><h2>Tu pedido</h2><button type="button" class="btn sm ghost" data-cerrar>Seguir pidiendo</button></div>
        <div class="list">${[...carrito]
          .map(([id, c]) => {
            const i = Datos.item(id);
            return `<div class="item"><div class="grow"><b>${esc(i.nombre)}</b><br><span class="muted small">${money(i.precio * c)}</span></div>
              <span class="qty"><button type="button" data-menos="${id}" aria-label="Quitar uno">−</button><b>${c}</b><button type="button" data-mas="${id}" aria-label="Agregar uno">+</button></span></div>`;
          })
          .join("")}</div>
        ${
          mesa
            ? ""
            : `<div class="chips">${[
                ["delivery", "Delivery"],
                ["retiro", "Retiro en el local"],
              ]
                .map(([v, t]) => `<button type="button" class="chip ${datos.entrega === v ? "on" : ""}" data-entrega="${v}">${t}</button>`)
                .join("")}</div>`
        }
        <label class="field"><span>Nombre</span><input name="nombre" required autocomplete="name" value="${esc(datos.nombre || "")}"></label>
        ${mesa ? "" : `<label class="field"><span>WhatsApp</span><input name="telefono" required type="tel" inputmode="tel" autocomplete="tel" value="${esc(datos.telefono || "")}"></label>`}
        ${
          datos.entrega === "delivery"
            ? `<label class="field"><span>Dirección</span><input name="direccion" required autocomplete="street-address" placeholder="Calle, número, piso" value="${esc(
                datos.direccion || "",
              )}"></label>`
            : ""
        }
        <div class="field"><span>Pago</span><div class="chips">${N.mediosPago
          .map((x) => `<button type="button" class="chip ${datos.pago === x ? "on" : ""}" data-pago="${esc(x)}">${esc(x)}</button>`)
          .join("")}</div></div>
        <label class="field"><span>Notas (opcional)</span><input name="notas" placeholder="Sin cebolla, timbre roto…" value="${esc(datos.notas || "")}"></label>
        <div class="resumen spread"><span>Subtotal ${money(total())}${envio ? ` + envío ${money(envio)}` : ""}</span><b>${money(total() + envio)}</b></div>
        <button class="btn primary block">Confirmar pedido</button>
      </form>`;
    };
    m.box.addEventListener("input", (e) => e.target.name && (datos[e.target.name] = e.target.value));
    m.box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-entrega],[data-pago],[data-mas],[data-menos]");
      if (!b) return;
      const d = b.dataset;
      if (d.entrega) datos.entrega = d.entrega;
      else if (d.pago) datos.pago = d.pago;
      else cambiar(d.mas || d.menos, d.mas ? 1 : -1);
      if (!carrito.size) return m.close();
      pinta();
    });
    m.box.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      if (!mesa && Core.telefono(f.telefono).length < 8) return toast("Revisa el número de WhatsApp", "bad");
      if (datos.entrega === "delivery" && total() < N.minimoDelivery) return toast(`El mínimo para delivery es ${money(N.minimoDelivery)}`, "warn");
      e.target.querySelector("button.primary").disabled = true;
      const items = [...carrito].map(([id, cant]) => ({ id, nombre: Datos.item(id).nombre, precio: Datos.item(id).precio, cant }));
      const subtotal = total();
      const envio = datos.entrega === "delivery" ? N.envio : 0;
      const p = {
        id: Core.uid("PD"),
        numero: Datos.siguienteNumero(),
        items,
        subtotal,
        envio,
        total: subtotal + envio,
        cliente: { nombre: f.nombre.trim(), telefono: f.telefono || "" },
        entrega: datos.entrega,
        mesa,
        direccion: f.direccion || "",
        pago: datos.pago,
        notas: (f.notas || "").trim(),
        estado: "nuevo",
        creado: new Date().toISOString(),
      };
      const r = await Datos.pedidos.save(p, "pedido_nuevo");
      if (r && r.numero) p.numero = r.numero; // Make puede devolver su propio número de pedido
      carrito.clear();
      pintaCarta();
      pintaBarra();
      m.box.innerHTML = `<div class="success stack"><div class="check">✓</div><h2>¡Pedido #${p.numero} recibido!</h2>
        <p class="muted">${mesa ? "Lo llevamos a tu mesa en unos minutos." : "Te avisamos por WhatsApp cuando esté listo."}</p>
        ${p.pago === "Transferencia" && N.aliasPago ? `<p class="resumen">Alias para transferir: <b>${esc(N.aliasPago)}</b> · ${money(p.total)}</p>` : ""}
        ${mesa ? "" : `<a class="btn wa block" target="_blank" rel="noopener" href="${wa(N.whatsapp, resumenTexto(p))}">Enviar también por WhatsApp</a>`}
        <button class="btn ghost block" data-cerrar>Volver al menú</button></div>`;
    });
    pinta();
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-mas],[data-menos],#ver");
    if (!b) return;
    if (b.id === "ver") return checkout();
    cambiar(b.dataset.mas || b.dataset.menos, b.dataset.mas ? 1 : -1);
  });

  pintaCarta();
  pintaBarra();
})();
