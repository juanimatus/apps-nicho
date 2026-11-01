// Carritos abandonados y secuencia de mensajes de recuperación.
window.Datos = (function () {
  "use strict";
  const N = Core.negocio;
  const PRODUCTOS = [
    ["Remera oversize negra", 18900],
    ["Jean mom celeste", 42500],
    ["Buzo canguro gris", 36000],
    ["Vestido lino natural", 51000],
    ["Campera de jean", 64900],
    ["Top básico blanco", 12500],
  ];
  const NOMBRES = ["Carla", "Micaela", "Juliana", "Brenda", "Ailén", "Rocío", "Victoria", "Daiana", "Melina", "Abril"];

  function carrito(i, horasAtras, estado) {
    const items = [PRODUCTOS[i % PRODUCTOS.length], PRODUCTOS[(i * 2 + 1) % PRODUCTOS.length]]
      .slice(0, (i % 2) + 1)
      .map(([nombre, precio]) => ({ nombre, precio, cant: 1 }));
    const creado = new Date(Date.now() - horasAtras * 3600000).toISOString();
    return {
      id: Core.uid("C"),
      cliente: NOMBRES[i % NOMBRES.length],
      telefono: `11${80000000 + i * 2711}`,
      items,
      total: items.reduce((s, x) => s + x.precio * x.cant, 0),
      link: `https://tutienda.com/checkout/${1000 + i}`,
      creado,
      estado,
      recuperadoEn: estado === "recuperado" ? new Date(Date.parse(creado) + (2 + i) * 3600000).toISOString() : null,
    };
  }

  const carritos = Core.repo("carritos", () =>
    [
      [0.3, "activo"],
      [3, "activo"],
      [20, "activo"],
      [30, "recuperado"],
      [50, "activo"],
      [80, "recuperado"],
      [100, "perdido"],
      [150, "recuperado"],
      [200, "perdido"],
      [260, "recuperado"],
      [300, "perdido"],
      [400, "perdido"],
    ].map(([h, e], i) => carrito(i, h, e)),
  );

  const secuencia = () => Core.local.get("secuencia", N.secuencia);
  const guardarSecuencia = (s) => Core.local.set("secuencia", s);

  // Mensajes ya enviados según el tiempo transcurrido (con Make, el escenario puede mandar "enviados").
  function enviados(c) {
    if (Array.isArray(c.enviados)) return c.enviados.length;
    const fin = c.recuperadoEn ? Date.parse(c.recuperadoEn) : Date.now();
    const horas = (fin - Date.parse(c.creado)) / 3600000;
    return secuencia().filter((p) => p.horas <= horas).length;
  }

  function completar(texto, c) {
    const vars = {
      nombre: c.cliente,
      productos: c.items.map((i) => i.nombre).join(" y "),
      total: Core.money(c.total),
      link: c.link,
      cupon: N.cupon,
    };
    return texto.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) => (k in vars ? vars[k] : m));
  }

  const simular = () => carrito(Math.floor(Math.random() * 50), 0, "activo");
  return { carritos, secuencia, guardarSecuencia, enviados, completar, simular };
})();
