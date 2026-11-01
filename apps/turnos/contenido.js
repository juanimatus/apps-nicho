window.LANDING = {
  id: "turnos",
  icono: "💈",
  color: "#b45309",
  nicho: "barberías, estéticas y centros de uñas",
  titulo: "Tu agenda se llena sola. Y los clientes sí vienen.",
  bajada:
    "Reservas online las 24 horas desde tu Instagram, confirmación y recordatorio automático por WhatsApp y lista de espera para cubrir cada cancelación.",
  dolores: [
    "Te escriben a las 11 de la noche para pedir turno y respondes al día siguiente (o nunca).",
    "Gente que reserva y no aparece: ese hueco ya no lo vendes.",
    "Pasas el día contestando “¿tienes lugar el sábado?” entre cliente y cliente.",
    "Cuando alguien cancela, no tienes a quién avisarle.",
  ],
  calculadora: {
    titulo: "¿Cuánto te cuestan los turnos que no vienen?",
    campos: [
      { id: "turnos", label: "Turnos por semana", valor: 120 },
      { id: "ausencias", label: "% de clientes que no vienen", valor: 10 },
      { id: "precio", label: "Precio promedio del servicio", valor: 9000, paso: 500 },
    ],
    calcular: (v) => {
      const vacios = v.turnos * 4.3 * (v.ausencias / 100);
      const perdida = vacios * v.precio;
      return {
        pre: "Pierdes por mes, aproximadamente",
        cifra: Core.money(perdida),
        texto: `Son <b>${Math.round(vacios)} turnos vacíos</b> al mes. Si los recordatorios recuperan solo la mitad, sumas <b>${Core.money(
          perdida / 2,
        )}</b> por mes.`,
      };
    },
  },
  funciones: [
    ["📅", "Reservas 24/7", "Un link en la bio de Instagram: el cliente elige servicio, profesional, día y horario en un minuto."],
    ["💬", "Confirmación por WhatsApp", "Apenas reserva le llega un mensaje con los datos del turno."],
    ["⏰", "Recordatorio 24 h antes", "Con botones para confirmar o cancelar. Si cancela, el lugar se libera solo."],
    ["📋", "Lista de espera", "Cuando se libera un turno, avisamos a quien estaba esperando ese día."],
    ["📊", "Panel del negocio", "Agenda del día, quién confirmó, quién faltó y cuánto facturaste."],
    ["⭐", "Reseñas en Google", "Después de la visita pedimos su opinión y lo llevamos a tu perfil de Google."],
  ],
  demos: [
    { quien: "Tu cliente", titulo: "Reservar un turno", texto: "Lo que ve tu cliente al tocar el link de tu bio.", href: "reservar.html" },
    { quien: "Tú", titulo: "Panel de agenda", texto: "Turnos del día, confirmaciones, ausencias y lista de espera.", href: "panel.html" },
    { quien: "Tu cliente", titulo: "Encuesta post-visita", texto: "Pide su opinión y lo lleva a tu perfil de Google.", href: "encuesta.html?n=Lucas" },
  ],
  planes: [
    {
      nombre: "Agenda",
      setup: 290,
      mensual: 35,
      incluye: ["Página de reservas con tu marca", "Panel de agenda", "Confirmación automática por WhatsApp", "Hasta 3 profesionales"],
    },
    {
      nombre: "Agenda Pro",
      setup: 490,
      mensual: 59,
      destacado: true,
      incluye: [
        "Todo lo del plan Agenda",
        "Recordatorio 24 h con confirmar/cancelar",
        "Lista de espera automática",
        "Pedido de reseñas en Google",
        "Cobro de seña con Mercado Pago",
      ],
    },
  ],
  faq: [
    ["¿Sirve si trabajo sin empleados?", "Sí. Funciona con una persona o con varias, cada una con su propia agenda."],
    ["¿Puedo cobrar seña?", "Sí, con un link de Mercado Pago al reservar. El turno queda confirmado cuando se acredita el pago."],
  ],
};
