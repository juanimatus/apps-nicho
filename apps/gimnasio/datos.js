// Socios, pagos y reglas de estado de cuota, compartidos por alta, check-in y panel.
window.Datos = (function () {
  "use strict";
  const N = Core.negocio;
  const { iso, addDays, diffDays } = Core;

  const plan = (id) => N.planes.find((p) => p.id === id) || N.planes[0];

  // Estado de la cuota y del hábito de asistencia.
  function estado(s) {
    const dias = diffDays(iso(), s.vence);
    const sinVenir = s.ultimaAsistencia ? diffDays(s.ultimaAsistencia, iso()) : 999;
    const cuota =
      dias < 0
        ? { clave: "vencida", txt: `Vencida hace ${-dias} d`, cls: "bad" }
        : dias <= (N.diasAviso || 5)
          ? { clave: "por_vencer", txt: dias === 0 ? "Vence hoy" : `Vence en ${dias} d`, cls: "warn" }
          : { clave: "al_dia", txt: "Al día", cls: "ok" };
    return { ...cuota, dias, sinVenir, riesgo: cuota.clave !== "vencida" && sinVenir >= (N.diasRiesgo || 10) };
  }

  function seed() {
    const nombres = [
      "Lucía Fernández", "Martín Sosa", "Camila Ruiz", "Diego Benítez", "Valentina Paz", "Franco Medina",
      "Sofía Acosta", "Ignacio Vega", "Florencia Gil", "Santiago Rey", "Milagros Ponce", "Ezequiel Luna",
      "Agustina Ríos", "Gonzalo Ortiz", "Rocío Cabrera", "Matías Godoy", "Julieta Navarro", "Leandro Cruz",
    ];
    const vence = [12, 25, -3, 2, 18, -12, 4, 28, 9, -1, 15, 0, 22, -7, 6, 30, 1, 14];
    const asistio = [0, 1, 6, 2, 13, 20, 0, 3, 16, 9, 1, 4, 11, 25, 2, 0, 5, 18];
    return nombres.map((nombre, i) => {
      const p = N.planes[i % N.planes.length];
      return {
        id: `S${100 + i}`,
        nombre,
        dni: String(30100200 + i * 13579),
        telefono: `11${60000000 + i * 3571}`,
        email: "",
        planId: p.id,
        plan: p.nombre,
        precio: p.precio,
        alta: addDays(iso(), -40 - i * 9),
        vence: addDays(iso(), vence[i]),
        ultimaAsistencia: addDays(iso(), -asistio[i]),
      };
    });
  }

  const socios = Core.repo("socios", seed);
  const pagos = Core.repo("pagos", () => []);
  return { socios, pagos, estado, plan };
})();
