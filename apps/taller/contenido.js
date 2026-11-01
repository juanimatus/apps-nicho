window.LANDING = {
  id: "taller",
  icono: "🔧",
  color: "#334155",
  nicho: "talleres mecánicos y de chapa y pintura",
  titulo: "Basta de “¿ya está mi auto?”.",
  bajada:
    "Cada cliente recibe un link para seguir su vehículo en tiempo real, aprueba el presupuesto con un toque y recibe el recordatorio del próximo service. Tú trabajas sin el teléfono en la mano.",
  dolores: [
    "Te llaman 15 veces por día para preguntar cómo va el auto.",
    "El presupuesto se aprueba por teléfono y después nadie se acuerda de qué se acordó.",
    "El auto queda parado esperando que el cliente conteste.",
    "Tus clientes hacen el próximo service en otro lado porque nadie se lo recordó.",
  ],
  calculadora: {
    titulo: "¿Cuánto tiempo pierdes en el teléfono?",
    campos: [
      { id: "llamadas", label: "Llamadas o mensajes de consulta por día", valor: 15 },
      { id: "minutos", label: "Minutos por consulta", valor: 4 },
      { id: "hora", label: "Valor de tu hora de taller", valor: 25000, paso: 1000 },
    ],
    calcular: (v) => {
      const horas = (v.llamadas * v.minutos * 22) / 60;
      return {
        pre: "Tiempo que se va por mes",
        cifra: `${Math.round(horas)} horas`,
        texto: `Equivale a <b>${Core.money(horas * v.hora)}</b> de horas de taller que podrías facturar.`,
      };
    },
  },
  funciones: [
    ["📍", "Seguimiento en vivo", "Link único por vehículo: recibido, diagnóstico, reparación, listo."],
    ["✅", "Presupuesto online", "El cliente ve el detalle y lo aprueba con un toque. Queda registrado."],
    ["💬", "Avisos automáticos", "Cada cambio de estado le llega por WhatsApp. Sin llamadas."],
    ["🗓️", "Recordatorio de service", "Una semana antes del próximo service, le escribimos para que vuelva."],
    ["🧰", "Panel del taller", "Todos los vehículos, en qué etapa están y qué presupuestos esperan respuesta."],
    ["⭐", "Reseña al entregar", "Al retirar el vehículo pedimos una reseña en Google."],
  ],
  demos: [
    { quien: "Tú", titulo: "Panel del taller", texto: "Órdenes, estados y presupuestos.", href: "panel.html" },
    { quien: "Tu cliente", titulo: "Seguimiento del vehículo", texto: "Lo que ve tu cliente, con el presupuesto para aprobar.", href: "seguimiento.html?c=K7P2QX" },
  ],
  planes: [
    { nombre: "Seguimiento", setup: 350, mensual: 45, incluye: ["Panel de órdenes", "Link de seguimiento por vehículo", "Avisos de estado por WhatsApp", "Presupuesto online"] },
    {
      nombre: "Taller Pro",
      setup: 590,
      mensual: 75,
      destacado: true,
      incluye: ["Todo lo del plan Seguimiento", "Recordatorio de próximo service", "Pedido de reseñas en Google", "Historial por patente", "Reporte mensual"],
    },
  ],
  faq: [
    ["¿Mis mecánicos tienen que cargar algo?", "Solo tocar “pasar a la siguiente etapa” desde el celular. Lo demás es automático."],
    ["¿Puedo usarlo con mi sistema de facturación?", "Sí, el presupuesto aprobado puede viajar a tu sistema o a una planilla desde Make."],
  ],
};
