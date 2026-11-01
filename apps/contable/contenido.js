window.LANDING = {
  id: "contable",
  icono: "📊",
  color: "#15803d",
  nicho: "estudios contables",
  titulo: "Tus clientes mandan los papeles a tiempo. Sin que los persigas.",
  bajada:
    "Un portal donde cada cliente sube la documentación del mes, recordatorios automáticos por WhatsApp hasta que la completa y avisos de vencimientos según su categoría.",
  dolores: [
    "El día 20 todavía estás pidiendo facturas por WhatsApp.",
    "Los archivos llegan por mail, WhatsApp, Drive y en papel.",
    "No sabes de un vistazo qué cliente está completo y cuál no.",
    "Avisar cada vencimiento a cada cliente te lleva horas.",
  ],
  calculadora: {
    titulo: "¿Cuántas horas se van persiguiendo papeles?",
    campos: [
      { id: "clientes", label: "Clientes activos", valor: 60 },
      { id: "minutos", label: "Minutos por mes persiguiendo a cada uno", valor: 45, paso: 5 },
      { id: "hora", label: "Valor de tu hora profesional", valor: 20000, paso: 1000 },
    ],
    calcular: (v) => {
      const horas = (v.clientes * v.minutos) / 60;
      return {
        pre: "Horas por mes",
        cifra: `${Math.round(horas)} h`,
        texto: `Son <b>${Core.money(horas * v.hora)}</b> por mes en horas que no facturas. Con recordatorios automáticos se reducen a casi cero.`,
      };
    },
  },
  funciones: [
    ["📤", "Portal de carga", "Link personal por cliente: ve qué le falta y lo sube desde el celular."],
    ["🔁", "Recordatorios automáticos", "WhatsApp el día 1, 3 y 5 hasta que complete el mes. Se cortan solos."],
    ["🗂️", "Todo ordenado en Drive", "Cada archivo se guarda en la carpeta del cliente y del mes, con nombre prolijo."],
    ["📅", "Avisos de vencimientos", "Monotributo, IVA, cargas sociales: cada cliente recibe solo lo que le corresponde."],
    ["📋", "Panel del estudio", "Quién completó, quién no y qué falta, de un vistazo."],
    ["🔒", "Privado", "Cada cliente solo ve su portal. Los archivos quedan en tu cuenta."],
  ],
  demos: [
    { quien: "Tú", titulo: "Panel del estudio", texto: "Progreso de cada cliente y vencimientos.", href: "panel.html" },
    { quien: "Tu cliente", titulo: "Portal de documentación", texto: "Lo que ve tu cliente para subir sus archivos.", href: "portal.html?c=c1" },
  ],
  planes: [
    { nombre: "Portal", setup: 590, mensual: 79, incluye: ["Portal de carga por cliente", "Archivos ordenados en Google Drive", "Recordatorios por WhatsApp", "Hasta 80 clientes"] },
    {
      nombre: "Estudio Pro",
      setup: 1190,
      mensual: 159,
      destacado: true,
      incluye: ["Todo lo del plan Portal", "Avisos de vencimientos por categoría", "Clientes ilimitados", "Lectura automática de facturas con IA", "Reporte mensual por cliente"],
    },
  ],
  faq: [
    ["¿Los clientes necesitan usuario y contraseña?", "No. Cada uno recibe un link personal por WhatsApp. Si quieres más seguridad, sumamos un código."],
    ["¿Dónde quedan los archivos?", "En tu Google Drive (o OneDrive), en una carpeta por cliente y por mes."],
  ],
};
