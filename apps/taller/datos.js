// Órdenes de trabajo compartidas entre el panel del taller y la página de seguimiento del cliente.
window.Datos = (function () {
  "use strict";
  const ESTADOS = [
    ["recibido", "Recibido", "Tu vehículo ya está en el taller."],
    ["diagnostico", "En diagnóstico", "Estamos revisando el vehículo para encontrar la falla."],
    ["presupuesto", "Presupuesto enviado", "Te enviamos el presupuesto. Apruébalo para que empecemos."],
    ["aprobado", "Presupuesto aprobado", "¡Gracias! Ya pedimos los repuestos necesarios."],
    ["reparacion", "En reparación", "Estamos trabajando en tu vehículo."],
    ["listo", "Listo para retirar", "Tu vehículo está listo. Puedes pasar a buscarlo."],
    ["entregado", "Entregado", "¡Gracias por confiar en nosotros!"],
  ];
  const indice = (estado) => ESTADOS.findIndex((e) => e[0] === estado);
  const codigo = () => Math.random().toString(36).slice(2, 8).toUpperCase();

  function nueva(d) {
    const ahora = new Date().toISOString();
    return {
      id: Core.uid("O"),
      codigo: codigo(),
      cliente: d.cliente,
      telefono: d.telefono,
      vehiculo: d.vehiculo,
      patente: String(d.patente || "").toUpperCase(),
      km: Number(d.km) || 0,
      problema: d.problema,
      estado: "recibido",
      historial: [{ estado: "recibido", ts: ahora }],
      presupuesto: { items: [], estado: "borrador" },
      proximoService: { fecha: "", km: "" },
      creado: ahora,
    };
  }

  function seed() {
    const ejemplos = [
      ["Ricardo Méndez", "Volkswagen Gol Trend 2016", "AB123CD", 98000, "Ruido en el tren delantero al frenar.", "presupuesto",
        [["Pastillas de freno delanteras", 48000], ["Rectificado de discos", 35000], ["Mano de obra", 30000]], "enviado"],
      ["Silvina Torres", "Toyota Etios 2019", "AC456EF", 61000, "Service de 60.000 km.", "reparacion",
        [["Kit de service (aceite y filtros)", 72000], ["Mano de obra", 25000]], "aprobado"],
      ["Gabriel Ruiz", "Ford Ka 2018", "AD789GH", 75000, "Pierde agua, temperatura alta.", "diagnostico", [], "borrador"],
      ["Natalia Ferreyra", "Chevrolet Onix 2021", "AE012IJ", 40000, "Cambio de correa de distribución.", "listo",
        [["Kit de distribución", 140000], ["Bomba de agua", 52000], ["Mano de obra", 60000]], "aprobado"],
      ["Oscar Villalba", "Renault Kangoo 2015", "AA345KL", 160000, "No arranca en frío.", "recibido", [], "borrador"],
    ];
    return ejemplos.map(([cliente, vehiculo, patente, km, problema, estado, items, pres], i) => {
      const o = nueva({ cliente, telefono: `11${30000000 + i * 5113}`, vehiculo, patente, km, problema });
      o.codigo = ["K7P2QX", "M4T9WB", "R2D8LC", "Z5H1NV", "B3J6YF"][i];
      const hasta = indice(estado);
      o.historial = ESTADOS.slice(0, hasta + 1).map(([e], j) => ({ estado: e, ts: new Date(Date.now() - (hasta - j + 1) * 5 * 3600000).toISOString() }));
      o.creado = o.historial[0].ts;
      o.estado = estado;
      o.presupuesto = { items: items.map(([desc, monto]) => ({ desc, monto })), estado: pres };
      return o;
    });
  }

  const ordenes = Core.repo("ordenes", seed);
  const total = (o) => o.presupuesto.items.reduce((s, i) => s + (Number(i.monto) || 0), 0);
  const linkSeguimiento = (o) => new URL(`seguimiento.html?c=${o.codigo}`, location.href).href;

  function cambiarEstado(o, estado) {
    o.estado = estado;
    o.historial.push({ estado, ts: new Date().toISOString() });
  }

  return { ESTADOS, indice, nueva, ordenes, total, linkSeguimiento, cambiarEstado };
})();
