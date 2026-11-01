// Datos de la tienda. Los carritos llegan desde Tiendanube/Shopify a Make; este panel los muestra.
window.NEGOCIO = {
  app: "ecommerce",
  id: "mistica-indumentaria",
  nombre: "Mística Indumentaria",
  logo: "🛍️",
  color: "#7c3aed",
  whatsapp: "1100000000",
  plataforma: "Tiendanube",
  webhook: "",
  linkResena: "https://g.page/r/TU-TIENDA/review",
  cupon: "VOLVE10",

  // Secuencia por defecto. Se edita desde el panel (pestaña Mensajes).
  secuencia: [
    { horas: 1, texto: "¡Hola, {{nombre}}! Vimos que dejaste {{productos}} en el carrito 🛒 Te lo guardamos: {{link}}" },
    { horas: 24, texto: "{{nombre}}, tu carrito sigue esperándote. Con el cupón {{cupon}} tienes 10% OFF por 24 h 👉 {{link}}" },
    { horas: 72, texto: "Último aviso, {{nombre}}: tu carrito de {{total}} se vacía hoy. ¿Te ayudamos con algo? Responde este mensaje." },
  ],
};
