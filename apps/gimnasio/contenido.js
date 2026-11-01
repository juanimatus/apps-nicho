window.LANDING = {
  id: "gimnasio",
  icono: "🏋️",
  color: "#dc2626",
  nicho: "gimnasios, estudios de pilates y boxes de crossfit",
  titulo: "Cuotas al día y socios que no se van sin avisar.",
  bajada:
    "Alta online con pago, check-in por DNI en la entrada, aviso automático de vencimiento por WhatsApp y alertas de socios que dejaron de venir antes de que se den de baja.",
  dolores: [
    "Persigues cuotas vencidas por WhatsApp, uno por uno.",
    "Te enteras de que alguien se fue cuando ya hace dos meses que no paga.",
    "La planilla de Excel nunca está actualizada.",
    "Gente que entrena con la cuota vencida y nadie se da cuenta.",
  ],
  calculadora: {
    titulo: "¿Cuánto se te escapa por mes?",
    campos: [
      { id: "socios", label: "Socios activos", valor: 250 },
      { id: "atraso", label: "% que paga tarde o no paga", valor: 12 },
      { id: "bajas", label: "Bajas por mes", valor: 10 },
      { id: "cuota", label: "Cuota promedio", valor: 32000, paso: 1000 },
    ],
    calcular: (v) => {
      const atrasado = v.socios * (v.atraso / 100) * v.cuota;
      const bajas = v.bajas * v.cuota * 6;
      return {
        pre: "Plata en riesgo cada mes",
        cifra: Core.money(atrasado + bajas / 6),
        texto: `<b>${Core.money(atrasado)}</b> en cuotas atrasadas y <b>${Core.money(
          bajas,
        )}</b> que dejan de entrar en 6 meses por las bajas de un solo mes. Retener a 3 de cada 10 ya paga la app.`,
      };
    },
  },
  funciones: [
    ["📝", "Alta online con pago", "El nuevo socio elige plan, completa sus datos y paga con Mercado Pago desde Instagram."],
    ["🚪", "Check-in por DNI", "Una tablet en la entrada: muestra si la cuota está al día y registra la asistencia."],
    ["💸", "Aviso de vencimiento", "WhatsApp automático 5 días antes, el día del vencimiento y 3 días después, con link de pago."],
    ["🚨", "Alerta de bajas", "Detecta a quien no viene hace 10 días y le manda un mensaje para que vuelva."],
    ["📊", "Panel de cuotas", "Quién debe, cuánto, y lo cobrado en el mes."],
    ["🔁", "Débito automático", "Suscripción mensual con Mercado Pago para que nadie se olvide (plan Pro)."],
  ],
  demos: [
    { quien: "Tú", titulo: "Panel de socios", texto: "Cuotas vencidas, cobros y riesgo de baja.", href: "panel.html" },
    { quien: "Tu socio", titulo: "Check-in en la entrada", texto: "La pantalla de la tablet de recepción.", href: "checkin.html" },
    { quien: "Nuevo socio", titulo: "Alta online", texto: "El link de la bio para sumar socios.", href: "alta.html" },
  ],
  planes: [
    { nombre: "Cuotas", setup: 450, mensual: 55, incluye: ["Panel de socios y cuotas", "Alta online con tu marca", "Avisos de vencimiento por WhatsApp", "Hasta 300 socios"] },
    {
      nombre: "Gym Pro",
      setup: 850,
      mensual: 110,
      destacado: true,
      incluye: ["Todo lo del plan Cuotas", "Check-in por DNI", "Alertas y campañas de reactivación", "Débito automático con Mercado Pago", "Socios ilimitados"],
    },
  ],
  faq: [
    ["¿Puedo importar mis socios actuales?", "Sí. Nos pasas tu Excel o planilla y lo cargamos antes de arrancar."],
    ["¿Sirve para un estudio chico de pilates?", "Sí. Puedes sumar cupos por clase y reservas (consúltanos)."],
  ],
};
