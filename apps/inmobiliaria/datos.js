// Colecciones y reglas de calificación de leads, compartidas por la web y el panel.
window.Datos = (function () {
  "use strict";
  const N = Core.negocio;

  const PLAZOS = [
    ["ya", "Lo antes posible", 40],
    ["1-3", "En 1 a 3 meses", 25],
    ["3+", "En más de 3 meses", 5],
  ];
  const PAGOS = {
    venta: [
      ["contado", "Contado", 35],
      ["credito_aprobado", "Crédito aprobado", 30],
      ["credito", "Voy a pedir un crédito", 12],
      ["vender", "Tengo que vender antes", 8],
    ],
    alquiler: [
      ["garantia", "Garantía propietaria", 35],
      ["caucion", "Seguro de caución", 30],
      ["sin_garantia", "Todavía no tengo garantía", 8],
    ],
  };
  const TEMPERATURAS = {
    caliente: { txt: "🔥 Caliente", cls: "bad" },
    tibio: { txt: "Tibio", cls: "warn" },
    frio: { txt: "Frío", cls: "info" },
  };
  const ESTADOS = [
    ["nuevo", "Nuevo"],
    ["contactado", "Contactado"],
    ["visita", "Visita agendada"],
    ["cerrado", "Cerrado"],
    ["perdido", "Perdido"],
  ];

  const puntos = (lista, clave) => (lista.find((x) => x[0] === clave) || [0, 0, 0])[2];

  // Puntaje 0-100: urgencia + capacidad de pago + presupuesto vs. precio.
  function calificar(lead, prop) {
    let score = puntos(PLAZOS, lead.plazo) + puntos(PAGOS[lead.operacion] || PAGOS.venta, lead.pago);
    if (prop && prop.precio) {
      const ratio = (Number(lead.presupuesto) || 0) / prop.precio;
      score += ratio >= 0.95 ? 25 : ratio >= 0.8 ? 12 : 0;
    } else if (Number(lead.presupuesto) > 0) score += 15;
    return { score, temperatura: score >= 70 ? "caliente" : score >= 40 ? "tibio" : "frio" };
  }

  const propiedades = Core.repo("propiedades", () => N.propiedades);

  function seed() {
    const ejemplos = [
      ["Romina Paz", "P1", "ya", "credito_aprobado", 130000, 6, "nuevo"],
      ["Esteban Quiroga", "P6", "ya", "caucion", 560000, 25, "nuevo"],
      ["Marina Luna", "P3", "1-3", "contado", 165000, 80, "contactado"],
      ["Gustavo Ferrer", "P4", "3+", "vender", 250000, 190, "contactado"],
      ["Daniela Ortiz", "P5", "ya", "garantia", 480000, 420, "visita"],
      ["Hernán Rojas", "P2", "1-3", "credito", 180000, 1300, "visita"],
      ["Sabrina Gil", "P7", "1-3", "sin_garantia", 700000, 2600, "perdido"],
      ["Pablo Núñez", "P1", "ya", "contado", 135000, 4100, "cerrado"],
    ];
    return ejemplos.map(([nombre, pid, plazo, pago, presupuesto, minutos, estado], i) => {
      const p = N.propiedades.find((x) => x.id === pid);
      const creado = new Date(Date.now() - minutos * 60000).toISOString();
      const lead = {
        id: `L${100 + i}`,
        propiedadId: p.id,
        propiedad: p.titulo,
        operacion: p.operacion,
        moneda: p.moneda,
        nombre,
        telefono: `11${50000000 + i * 4231}`,
        email: "",
        plazo,
        pago,
        presupuesto,
        visita: { dia: Core.addDays(Core.iso(), (i % 4) + 1), franja: i % 2 ? "tarde" : "mañana" },
        mensaje: "",
        estado,
        creado,
        contactadoEn: estado === "nuevo" ? null : new Date(Date.parse(creado) + (5 + i * 3) * 60000).toISOString(),
      };
      return Object.assign(lead, calificar(lead, p));
    });
  }
  const leads = Core.repo("leads", seed);

  return { propiedades, leads, calificar, PLAZOS, PAGOS, TEMPERATURAS, ESTADOS };
})();
