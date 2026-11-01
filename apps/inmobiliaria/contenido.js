window.LANDING = {
  id: "inmobiliaria",
  icono: "🏠",
  color: "#0f766e",
  nicho: "inmobiliarias",
  titulo: "Cada consulta respondida en minutos y calificada.",
  bajada:
    "Tus interesados completan un formulario corto que mide urgencia y capacidad de pago, reciben respuesta por WhatsApp al instante y tú ves primero a los que están listos para comprar o alquilar.",
  dolores: [
    "Llegan 50 consultas por un aviso y no sabes cuáles valen la pena.",
    "Respondes a las 3 horas y el interesado ya visitó con otra inmobiliaria.",
    "Pierdes la tarde en visitas con gente que no tiene cómo pagar.",
    "Los leads quedan repartidos entre WhatsApp, mails y portales.",
  ],
  calculadora: {
    titulo: "¿Cuántas operaciones se te enfrían?",
    campos: [
      { id: "consultas", label: "Consultas por mes", valor: 200 },
      { id: "frias", label: "% que se enfrían por respuesta lenta", valor: 25 },
      { id: "cierre", label: "% de consultas que terminan en operación", valor: 2, paso: 0.5 },
      { id: "comision", label: "Comisión promedio por operación (USD)", valor: 3000, paso: 100 },
    ],
    calcular: (v) => {
      const ops = v.consultas * (v.frias / 100) * (v.cierre / 100);
      return {
        pre: "Comisiones que se escapan por mes",
        cifra: Core.money(ops * v.comision, "USD"),
        texto: `Equivale a <b>${ops.toFixed(1)} operaciones</b> por mes que se pierden solo por responder tarde.`,
      };
    },
  },
  funciones: [
    ["⚡", "Respuesta inmediata", "Cada consulta recibe un WhatsApp en segundos, a cualquier hora."],
    ["🌡️", "Calificación automática", "Urgencia, forma de pago y presupuesto se convierten en un puntaje: caliente, tibio o frío."],
    ["📆", "Visitas pre-agendadas", "El interesado propone día y horario; tú solo confirmas."],
    ["🤖", "Agente IA en WhatsApp", "Responde preguntas sobre la propiedad, envía fotos y agenda la visita (plan Pro)."],
    ["🔔", "Alertas de leads sin responder", "Si un lead caliente espera más de 15 minutos, te avisamos."],
    ["🏘️", "Web de propiedades", "Catálogo con filtros que puedes compartir en Instagram y en tus estados de WhatsApp."],
  ],
  demos: [
    { quien: "Tu interesado", titulo: "Web de propiedades", texto: "Filtra, mira la ficha y pide la visita.", href: "propiedades.html" },
    { quien: "Tú", titulo: "Panel de leads", texto: "Leads ordenados por temperatura y tiempo sin respuesta.", href: "panel.html" },
  ],
  planes: [
    {
      nombre: "Leads",
      setup: 790,
      mensual: 99,
      incluye: ["Web de propiedades con tu marca", "Formulario de calificación", "Respuesta automática por WhatsApp", "Panel de leads y alertas"],
    },
    {
      nombre: "Leads + IA",
      setup: 1690,
      mensual: 219,
      destacado: true,
      incluye: [
        "Todo lo del plan Leads",
        "Agente IA en WhatsApp entrenado con tus propiedades",
        "Captura de leads de portales por mail",
        "Agenda de visitas sincronizada con Google Calendar",
        "Reporte semanal por agente",
      ],
    },
  ],
  faq: [
    ["¿Funciona con los leads de los portales?", "Sí. Los portales avisan por mail; Make lee esos mails y los suma al panel con la misma calificación."],
    ["¿El agente IA puede inventar datos?", "Responde solo con la información de tus fichas. Si no sabe algo, deriva a un agente humano."],
  ],
};
