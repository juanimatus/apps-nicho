// Configuración global del sitio de ventas y valores por defecto de las apps.
// Para entregar una app a un cliente se edita el negocio.js de su carpeta.
window.APP_CONFIG = {
  marca: "Apps de Nicho",
  // Tu WhatsApp de ventas (código de país + número, sin + ni espacios).
  whatsappVentas: "5491100000000",
  // Se antepone a los teléfonos locales al armar links de WhatsApp (549 = Argentina, celulares).
  prefijoPais: "549",
  moneda: { codigo: "ARS", locale: "es-AR" },
  // URL del webhook de Make (o n8n) por app. Vacío = modo demo: los datos quedan en el navegador.
  // Un negocio.js con "webhook" tiene prioridad sobre este valor.
  webhooks: {
    ventas: "",
    turnos: "",
    consultorio: "",
    inmobiliaria: "",
    gimnasio: "",
    menu: "",
    ecommerce: "",
    taller: "",
    contable: "",
  },
};
