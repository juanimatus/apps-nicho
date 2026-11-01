// Datos del local. Para un cliente nuevo: copia la carpeta y cambia solo este archivo.
window.NEGOCIO = {
  app: "menu",
  id: "don-burger",
  nombre: "Don Burger",
  logo: "🍔",
  color: "#ea580c",
  whatsapp: "1100000000",
  direccion: "Delivery en Palermo y Villa Crespo · Retiro en Gorriti 4800",
  webhook: "",
  envio: 1500,
  minimoDelivery: 8000,
  comisionApps: 0.25, // comisión promedio de las apps de delivery, para el KPI de ahorro
  mediosPago: ["Efectivo", "Transferencia", "Mercado Pago"],
  aliasPago: "donburger.mp",

  categorias: [
    {
      id: "burgers",
      nombre: "Hamburguesas",
      items: [
        { id: "clasica", nombre: "Clásica", desc: "Doble carne, cheddar, lechuga, tomate y salsa de la casa.", precio: 9500, emoji: "🍔" },
        { id: "bacon", nombre: "Bacon BBQ", desc: "Doble carne, panceta crocante, cheddar y barbacoa.", precio: 11200, emoji: "🥓" },
        { id: "veggie", nombre: "Veggie", desc: "Medallón de garbanzos, queso tybo, rúcula y mayo de palta.", precio: 9800, emoji: "🥬" },
        { id: "triple", nombre: "Triple Don", desc: "Triple carne, triple cheddar, cebolla caramelizada.", precio: 13500, emoji: "🔥" },
      ],
    },
    {
      id: "papas",
      nombre: "Papas y extras",
      items: [
        { id: "papas", nombre: "Papas fritas", desc: "Porción grande con sal de la casa.", precio: 4200, emoji: "🍟" },
        { id: "papas-cheddar", nombre: "Papas con cheddar y bacon", desc: "Para compartir.", precio: 6500, emoji: "🧀" },
        { id: "nuggets", nombre: "Nuggets x8", desc: "Con dip a elección.", precio: 5200, emoji: "🍗" },
      ],
    },
    {
      id: "bebidas",
      nombre: "Bebidas",
      items: [
        { id: "gaseosa", nombre: "Gaseosa 500 ml", desc: "Línea Coca-Cola.", precio: 2200, emoji: "🥤" },
        { id: "cerveza", nombre: "Cerveza artesanal 473 ml", desc: "IPA, Golden o Stout.", precio: 3800, emoji: "🍺" },
        { id: "agua", nombre: "Agua 500 ml", desc: "Con o sin gas.", precio: 1600, emoji: "💧" },
      ],
    },
    {
      id: "postres",
      nombre: "Postres",
      items: [
        { id: "brownie", nombre: "Brownie con helado", desc: "Tibio, con helado de americana.", precio: 4800, emoji: "🍫" },
        { id: "cookie", nombre: "Cookie gigante", desc: "Con chips de chocolate.", precio: 2600, emoji: "🍪" },
      ],
    },
  ],
};
