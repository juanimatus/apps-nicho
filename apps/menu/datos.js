// Pedidos compartidos entre el menú y el panel de comandas.
window.Datos = (function () {
  "use strict";
  const N = Core.negocio;
  const items = N.categorias.flatMap((c) => c.items);
  const item = (id) => items.find((i) => i.id === id);

  const ESTADOS = [
    ["nuevo", "Nuevos"],
    ["preparando", "En preparación"],
    ["listo", "Listos"],
    ["entregado", "Entregados"],
  ];

  function armar(lineas) {
    return lineas.map(([id, cant]) => {
      const i = item(id);
      return { id, nombre: i.nombre, precio: i.precio, cant };
    });
  }

  function seed() {
    const ejemplos = [
      [[["clasica", 2], ["papas", 1], ["gaseosa", 2]], "delivery", "entregado", 140, "Lucía"],
      [[["bacon", 1], ["cerveza", 1]], "retiro", "entregado", 95, "Marcos"],
      [[["triple", 1], ["papas-cheddar", 1]], "delivery", "listo", 22, "Sofía"],
      [[["veggie", 2], ["agua", 2], ["brownie", 1]], "mesa", "preparando", 12, "Mesa 4"],
      [[["clasica", 1], ["nuggets", 1], ["gaseosa", 1]], "delivery", "nuevo", 3, "Andrés"],
    ];
    return ejemplos.map(([lineas, entrega, estado, minutos, nombre], i) => {
      const its = armar(lineas);
      const subtotal = its.reduce((s, x) => s + x.precio * x.cant, 0);
      const envio = entrega === "delivery" ? N.envio : 0;
      return {
        id: `PD${200 + i}`,
        numero: 101 + i,
        items: its,
        subtotal,
        envio,
        total: subtotal + envio,
        cliente: { nombre, telefono: `11${70000000 + i * 1111}` },
        entrega,
        mesa: entrega === "mesa" ? "4" : "",
        direccion: entrega === "delivery" ? "Thames 1500, 3° A" : "",
        pago: N.mediosPago[i % N.mediosPago.length],
        notas: i === 0 ? "Sin cebolla" : "",
        estado,
        creado: new Date(Date.now() - minutos * 60000).toISOString(),
      };
    });
  }

  const pedidos = Core.repo("pedidos", seed);
  const siguienteNumero = () => Math.max(100, ...pedidos.all().map((p) => p.numero || 0)) + 1;
  return { pedidos, item, ESTADOS, siguienteNumero };
})();
