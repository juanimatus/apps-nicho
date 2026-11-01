window.LANDING = {
  id: "ecommerce",
  icono: "🛍️",
  color: "#7c3aed",
  nicho: "tiendas online en Tiendanube y Shopify",
  titulo: "Recupera las ventas que se quedan en el carrito.",
  bajada:
    "Cuando alguien abandona el checkout, le llega una secuencia de WhatsApp con su carrito, un cupón a tiempo y tu atención personalizada. Después de la compra, pedimos la reseña.",
  dolores: [
    "7 de cada 10 personas que agregan al carrito no terminan la compra.",
    "El mail de carrito abandonado lo abre casi nadie.",
    "No sabes cuánto de lo vendido vino de recuperar carritos.",
    "Tienes pocas reseñas y eso frena a los compradores nuevos.",
  ],
  calculadora: {
    titulo: "¿Cuánto podrías recuperar?",
    campos: [
      { id: "carritos", label: "Carritos abandonados por mes", valor: 300 },
      { id: "ticket", label: "Ticket promedio", valor: 40000, paso: 1000 },
      { id: "tasa", label: "% recuperado con WhatsApp", valor: 10, paso: 1 },
    ],
    calcular: (v) => ({
      pre: "Facturación extra por mes",
      cifra: Core.money(v.carritos * v.ticket * (v.tasa / 100)),
      texto: `Son <b>${Math.round(v.carritos * (v.tasa / 100))} ventas</b> más por mes, sin gastar más en publicidad.`,
    }),
  },
  funciones: [
    ["🛒", "Detección automática", "Se conecta a Tiendanube o Shopify y detecta cada checkout abandonado."],
    ["💬", "Secuencia por WhatsApp", "3 mensajes a la 1 h, 24 h y 72 h, con el link directo al carrito."],
    ["🏷️", "Cupón inteligente", "El descuento aparece recién en el segundo mensaje, para no regalar margen."],
    ["✋", "Se corta solo", "Si compra o responde, la secuencia se detiene y te avisa."],
    ["⭐", "Reseñas post-compra", "Pedimos su opinión cuando el pedido llega."],
    ["📊", "Resultados en pesos", "Cuántos carritos se recuperaron y cuánto facturaste gracias a eso."],
  ],
  demos: [
    { quien: "Tú", titulo: "Panel de recuperación", texto: "Carritos, mensajes enviados y facturación recuperada.", href: "panel.html" },
    { quien: "Tu cliente", titulo: "Reseña post-compra", texto: "Lo que recibe cuando le llega el pedido.", href: "resena.html?n=Carla" },
  ],
  planes: [
    { nombre: "Recupero", setup: 390, mensual: 59, incluye: ["Conexión con tu tienda", "Secuencia de 3 mensajes por WhatsApp", "Panel de resultados", "Hasta 1.000 carritos/mes"] },
    {
      nombre: "Recupero + Postventa",
      setup: 690,
      mensual: 119,
      destacado: true,
      incluye: ["Todo lo del plan Recupero", "Aviso de envío y entrega", "Pedido de reseñas", "Recompra a los 30 días", "Carritos ilimitados"],
    },
  ],
  faq: [
    ["¿Necesito que me den el WhatsApp?", "Sí: el checkout de Tiendanube y Shopify pide teléfono. Solo escribimos a quien lo dejó."],
    ["¿Y si ya tengo una app de carritos por mail?", "Puede convivir. WhatsApp suele tener mucha más apertura que el mail."],
  ],
};
