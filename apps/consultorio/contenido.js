window.LANDING = {
  id: "consultorio",
  icono: "🦷",
  color: "#0369a1",
  nicho: "consultorios y centros de salud",
  titulo: "Menos huecos en la agenda. Más reseñas de pacientes.",
  bajada:
    "Turnos online, recordatorios por WhatsApp con confirmación y una encuesta después de cada consulta que lleva a tus pacientes a dejar reseña en Google.",
  dolores: [
    "La secretaria pasa la mañana confirmando turnos por teléfono.",
    "Pacientes que no avisan que no vienen y te dejan la agenda con huecos.",
    "Tienes cientos de pacientes contentos y apenas un puñado de reseñas en Google.",
    "Los turnos solo se piden en horario de atención.",
  ],
  calculadora: {
    titulo: "¿Cuánto te cuestan las ausencias?",
    campos: [
      { id: "turnos", label: "Turnos por semana", valor: 80 },
      { id: "ausencias", label: "% de pacientes que no vienen", valor: 12 },
      { id: "precio", label: "Valor promedio de la consulta", valor: 20000, paso: 1000 },
    ],
    calcular: (v) => {
      const vacios = v.turnos * 4.3 * (v.ausencias / 100);
      return {
        pre: "Se pierden por mes, aproximadamente",
        cifra: Core.money(vacios * v.precio),
        texto: `Son <b>${Math.round(vacios)} turnos</b> sin cubrir. Con confirmación por WhatsApp y lista de espera, la mayoría se puede reasignar.`,
      };
    },
  },
  funciones: [
    ["📅", "Turnos online", "El paciente elige profesional, motivo y horario sin llamar."],
    ["💬", "Recordatorio con confirmación", "24 h antes por WhatsApp: confirma o cancela con un toque."],
    ["🔁", "Reasignación de huecos", "Si alguien cancela, avisamos a la lista de espera."],
    ["⭐", "Encuesta + reseña en Google", "Después de la consulta medimos la satisfacción y ofrecemos dejar reseña."],
    ["📊", "Panel por profesional", "Agenda diaria, asistencia y ausencias del mes."],
    ["🔒", "Datos cuidados", "Solo se guarda lo necesario para el turno, en tu propia cuenta."],
  ],
  demos: [
    { quien: "Tu paciente", titulo: "Pedir turno", texto: "La página de turnos que compartes en Instagram y Google.", href: "reservar.html" },
    { quien: "Tú", titulo: "Agenda del consultorio", texto: "Turnos por profesional, confirmaciones y ausencias.", href: "panel.html" },
    { quien: "Tu paciente", titulo: "Encuesta post-consulta", texto: "Satisfacción del paciente y enlace a Google.", href: "encuesta.html?n=Ana" },
  ],
  planes: [
    { nombre: "Agenda", setup: 390, mensual: 49, incluye: ["Turnos online con tu marca", "Hasta 2 profesionales", "Confirmación por WhatsApp", "Panel de agenda"] },
    {
      nombre: "Consultorio Pro",
      setup: 690,
      mensual: 89,
      destacado: true,
      incluye: ["Profesionales ilimitados", "Recordatorio 24 h con confirmación", "Lista de espera", "Encuesta + reseñas en Google", "Reporte mensual de ausencias"],
    },
  ],
  faq: [
    ["¿Se integra con mi sistema de historias clínicas?", "Si tu sistema tiene API o exporta datos, lo conectamos desde Make. Si no, la agenda funciona sola."],
    ["¿Sirve para varios consultorios?", "Sí, cada sede o profesional puede tener su agenda y sus horarios."],
  ],
};
