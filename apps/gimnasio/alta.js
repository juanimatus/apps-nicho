// Alta online de socios: elige plan, deja sus datos y paga.
(function () {
  "use strict";
  const { $, esc, money, toast, iso } = Core;
  const N = Core.negocio;
  const root = $("#app");
  let planId = Core.qs("plan") || N.planes[0].id;

  root.innerHTML = `${Core.cover(N.direccion)}<main class="wrap narrow lift"><div class="card" id="caja"><form class="stack" id="f">
    <h2 class="section-title"><span class="num">1</span>Elige tu plan</h2>
    <div class="list" id="planes"></div>
    <h2 class="section-title mt"><span class="num">2</span>Tus datos</h2>
    <label class="field"><span>Nombre y apellido</span><input name="nombre" required autocomplete="name"></label>
    <div class="grid c2"><label class="field"><span>DNI</span><input name="dni" required inputmode="numeric" pattern="[0-9]{6,9}" title="Solo números"></label>
      <label class="field"><span>WhatsApp</span><input name="telefono" required type="tel" inputmode="tel" autocomplete="tel"></label></div>
    <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email"></label>
    <label class="field"><span>¿Cuándo empiezas?</span><input name="inicio" type="date" value="${iso()}" min="${iso()}" required></label>
    <label class="row small"><input type="checkbox" name="apto" required style="width:auto"> Declaro estar en condiciones físicas de entrenar y presentaré el apto médico.</label>
    <button class="btn primary block">Continuar al pago</button>
  </form></div></main>`;

  const pintaPlanes = () =>
    ($("#planes").innerHTML = N.planes
      .map(
        (p) => `<button type="button" class="option ${p.id === planId ? "on" : ""}" data-plan="${p.id}">
        <span class="grow"><b>${esc(p.nombre)}</b><br><span class="muted small">${esc(p.detalle)}</span></span><b>${money(p.precio)}<span class="muted small">/mes</span></b></button>`,
      )
      .join(""));

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-plan]");
    if (!b) return;
    planId = b.dataset.plan;
    pintaPlanes();
  });

  $("#f").addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    if (Core.telefono(d.telefono).length < 8) return toast("Revisa el número de WhatsApp", "bad");
    if (Datos.socios.all().some((s) => s.dni === d.dni)) return toast("Ese DNI ya está registrado. Escríbenos y lo resolvemos.", "warn");
    e.target.querySelector("button.primary").disabled = true;
    const p = Datos.plan(planId);
    const socio = {
      id: Core.uid("S"),
      nombre: d.nombre.trim(),
      dni: d.dni,
      telefono: d.telefono,
      email: d.email,
      planId: p.id,
      plan: p.nombre,
      precio: p.precio,
      alta: d.inicio,
      vence: d.inicio, // queda pendiente hasta que se acredita el primer pago
      ultimaAsistencia: null,
    };
    await Datos.socios.save(socio, "socio_alta");
    $("#caja").innerHTML = `<div class="success stack"><div class="check">💪</div>
      <h2>¡Bienvenido/a, ${esc(Core.primerNombre(socio.nombre))}!</h2>
      <p class="muted">Plan ${esc(p.nombre)} · ${money(p.precio)}/mes. Te enviamos los datos por WhatsApp.</p>
      ${
        p.linkPago
          ? `<a class="btn primary block" href="${esc(p.linkPago)}" target="_blank" rel="noopener">Pagar con Mercado Pago</a>`
          : `<p class="resumen small">Puedes pagar en recepción el primer día o con el link de pago que te llega por WhatsApp.</p>`
      }
      <p class="small muted">Para entrar, di tu DNI en el check-in de la entrada.</p></div>`;
  });

  pintaPlanes();
})();
