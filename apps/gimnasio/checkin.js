// Check-in en la entrada (tablet en recepción): DNI → estado de cuota → registra la asistencia.
(function () {
  "use strict";
  const { $, esc, money, fecha, iso } = Core;
  const N = Core.negocio;
  const root = $("#app");
  let reinicio;

  root.innerHTML = `${Core.cover("Check-in")}<main class="wrap narrow lift"><div class="card stack">
    <form id="f" class="stack"><label class="field"><span>Ingresa tu DNI</span>
      <input name="dni" required inputmode="numeric" autocomplete="off" style="font-size:1.6rem;text-align:center;letter-spacing:.08em" placeholder="30100200"></label>
      <button class="btn primary block">Entrar</button></form>
    <div id="resultado"></div>
    <p class="tiny muted center">Demo: prueba con 30100200 (al día), 30127358 (vencida) o 30140937 (por vencer).</p>
  </div></main>`;

  async function buscar(dni) {
    if (Core.remoto()) {
      try {
        return await Core.call("socio_buscar", { dni });
      } catch (e) {
        console.warn(e);
      }
    }
    return Datos.socios.all().find((s) => s.dni === dni) || null;
  }

  $("#f").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearTimeout(reinicio);
    const input = e.target.dni;
    const s = await buscar(input.value.replace(/\D/g, ""));
    const out = $("#resultado");
    if (!s) {
      out.innerHTML = `<div class="semaforo warn"><b>No te encontramos</b>Revisa el DNI o acércate a recepción.</div>`;
    } else {
      const est = Datos.estado(s);
      const p = Datos.plan(s.planId);
      const nombre = esc(Core.primerNombre(s.nombre));
      out.innerHTML =
        est.clave === "vencida"
          ? `<div class="semaforo bad"><b>Hola, ${nombre}</b>Tu cuota venció hace ${-est.dias} días.<br>Regularízala en recepción${
              p.linkPago ? ` o <a href="${esc(p.linkPago)}" target="_blank" rel="noopener">paga acá (${money(s.precio)})</a>` : ""
            }.</div>`
          : est.clave === "por_vencer"
            ? `<div class="semaforo warn"><b>¡Buen entreno, ${nombre}!</b>${est.dias === 0 ? "Tu cuota vence hoy" : `Tu cuota vence en ${est.dias} días`}. Te mandamos el link de pago por WhatsApp.</div>`
            : `<div class="semaforo ok"><b>¡Buen entreno, ${nombre}! 💪</b>Cuota al día hasta el ${fecha(s.vence)}.</div>`;
      s.ultimaAsistencia = iso();
      Datos.socios.save(s, null);
      Core.send("asistencia", { socioId: s.id, dni: s.dni, fecha: iso(), hora: new Date().toTimeString().slice(0, 5), cuota: est.clave });
    }
    input.value = "";
    reinicio = setTimeout(() => (out.innerHTML = ""), 6000);
  });
})();
