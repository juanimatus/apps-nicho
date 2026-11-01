window.LANDING = {
  id: "menu",
  icono: "🍔",
  color: "#ea580c",
  nicho: "restaurantes, hamburgueserías y dark kitchens",
  titulo: "Tus propios pedidos online, sin pagar comisión.",
  bajada:
    "Un menú digital para el link de Instagram y el QR de las mesas. El cliente arma el pedido, lo recibes ordenado en la pantalla de la cocina y le avisamos por WhatsApp cuando está listo.",
  dolores: [
    "Las apps de delivery se quedan con el 25 o 30 % de cada pedido.",
    "Los pedidos por WhatsApp llegan desordenados y alguien los copia a mano.",
    "No tienes los datos de tus clientes para volver a venderles.",
    "Imprimir la carta cada vez que cambias un precio.",
  ],
  calculadora: {
    titulo: "¿Cuánto pagas en comisiones?",
    campos: [
      { id: "pedidos", label: "Pedidos por mes en apps", valor: 600 },
      { id: "ticket", label: "Ticket promedio", valor: 15000, paso: 500 },
      { id: "comision", label: "Comisión de la app (%)", valor: 25 },
      { id: "pasan", label: "% que podrías pasar a canal propio", valor: 40 },
    ],
    calcular: (v) => {
      const comision = v.pedidos * v.ticket * (v.comision / 100);
      return {
        pre: "Pagas en comisiones por mes",
        cifra: Core.money(comision),
        texto: `Si pasas el ${v.pasan}% de esos pedidos a tu propio menú, te ahorras <b>${Core.money(comision * (v.pasan / 100))}</b> por mes.`,
      };
    },
  },
  funciones: [
    ["📱", "Menú digital", "Para la bio de Instagram, Google Maps y el QR de cada mesa. Cambias precios en segundos."],
    ["🧾", "Comandas en pantalla", "Los pedidos entran ordenados en la tablet de la cocina, con aviso sonoro."],
    ["💬", "Aviso por WhatsApp", "El cliente recibe la confirmación y el aviso de “tu pedido está listo”."],
    ["💳", "Cobro online", "Mercado Pago o transferencia con alias, en el mismo pedido."],
    ["📇", "Base de clientes", "Cada pedido suma un contacto para tus promociones de los días flojos."],
    ["📊", "Ventas del día", "Ticket promedio y cuánto te ahorraste en comisiones."],
  ],
  demos: [
    { quien: "Tu cliente", titulo: "Menú y pedido", texto: "Arma un pedido como lo haría tu cliente.", href: "menu.html" },
    { quien: "Tu cocina", titulo: "Panel de comandas", texto: "Ábrelo en otra pestaña y mira cómo entra el pedido.", href: "panel.html" },
    { quien: "En el local", titulo: "Pedido desde la mesa", texto: "El QR de la mesa 4: pide sin esperar al mozo.", href: "menu.html?mesa=4" },
  ],
  planes: [
    { nombre: "Menú", setup: 290, mensual: 39, incluye: ["Menú digital con tu marca", "Pedidos por WhatsApp ordenados", "QR para mesas", "Cambios de carta ilimitados"] },
    {
      nombre: "Menú + Comandas",
      setup: 590,
      mensual: 79,
      destacado: true,
      incluye: ["Todo lo del plan Menú", "Panel de comandas para cocina", "Avisos automáticos por WhatsApp", "Cobro con Mercado Pago", "Base de clientes para promociones"],
    },
  ],
  faq: [
    ["¿Tengo que dejar las apps de delivery?", "No. La idea es que tus clientes frecuentes te pidan directo y dejar las apps para captar clientes nuevos."],
    ["¿Puedo imprimir las comandas?", "Sí, con una impresora térmica conectada a la tablet o desde Make."],
  ],
};
