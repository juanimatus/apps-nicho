// Clientes, documentación entregada y vencimientos del estudio.
window.Datos = (function () {
  "use strict";
  const N = Core.negocio;
  const { iso, addMonths, diffDays } = Core;

  const periodoAnterior = () => addMonths(iso().slice(0, 7) + "-01", -1).slice(0, 7);
  const periodos = () => [0, 1, 2].map((i) => addMonths(iso().slice(0, 7) + "-01", -1 - i).slice(0, 7));
  const requeridos = (c) => N.documentos.filter((d) => d.para.includes(c.tipo));

  const clientes = Core.repo("clientes", () => N.clientes);

  function seed() {
    const out = [];
    periodos().forEach((periodo, p) => {
      N.clientes.forEach((c, i) =>
        requeridos(c).forEach((d, j) => {
          // El mes pasado queda incompleto para que el panel muestre faltantes; los anteriores, casi completos.
          const entregado = p === 0 ? (i + j) % 3 !== 0 && i !== 3 : (i + j + p) % 7 !== 0;
          if (entregado)
            out.push({
              id: `${c.id}-${periodo}-${d.id}`,
              cliente: c.id,
              periodo,
              doc: d.id,
              archivo: `${d.id}-${periodo}.pdf`,
              subido: new Date(Date.now() - (p * 30 + j + 2) * 86400000).toISOString(),
            });
        }),
      );
    });
    return out;
  }
  const entregas = Core.repo("entregas", seed);

  function progreso(c, periodo, lista = entregas.all()) {
    const req = requeridos(c);
    const hechos = req.filter((d) => lista.some((e) => e.cliente === c.id && e.periodo === periodo && e.doc === d.id));
    return { req, hechos, faltan: req.filter((d) => !hechos.includes(d)), pct: req.length ? Math.round((hechos.length / req.length) * 100) : 100 };
  }

  // Próximos vencimientos (este mes y el siguiente) dentro de los próximos `dias`.
  function proximos(dias = 30, tipo) {
    const hoy = iso();
    const out = [];
    [0, 1].forEach((m) => {
      const base = addMonths(hoy.slice(0, 7) + "-01", m);
      N.vencimientos.forEach((v) => {
        const fecha = base.slice(0, 8) + String(v.dia).padStart(2, "0");
        const falta = diffDays(hoy, fecha);
        if (falta >= 0 && falta <= dias && (!tipo || v.para.includes(tipo))) out.push({ ...v, fecha, falta });
      });
    });
    return out.sort((a, b) => a.falta - b.falta);
  }

  const linkPortal = (c) => new URL(`portal.html?c=${c.id}`, location.href).href;
  return { clientes, entregas, requeridos, progreso, proximos, periodos, periodoAnterior, linkPortal };
})();
