// Datos del estudio. Los clientes reales vienen de Make (Data Store o Sheets); acá van los de ejemplo.
window.NEGOCIO = {
  app: "contable",
  id: "estudio-rios",
  nombre: "Estudio Ríos & Asoc.",
  logo: "📊",
  color: "#15803d",
  whatsapp: "1100000000",
  direccion: "Contadores públicos · Atención online",
  webhook: "",

  tipos: { mono: "Monotributo", ri: "Responsable inscripto", soc: "Sociedad" },
  // Documentación mensual que pide el estudio, según el tipo de cliente.
  documentos: [
    { id: "ventas", nombre: "Facturas emitidas", ayuda: "PDF o el resumen de ventas del mes.", para: ["mono", "ri", "soc"] },
    { id: "compras", nombre: "Facturas de compras y gastos", ayuda: "Todas las facturas a tu nombre o CUIT.", para: ["ri", "soc"] },
    { id: "banco", nombre: "Resumen bancario", ayuda: "Extracto de todas las cuentas del mes.", para: ["ri", "soc"] },
    { id: "sueldos", nombre: "Novedades de sueldos", ayuda: "Altas, bajas, horas extra y licencias.", para: ["soc"] },
    { id: "mp", nombre: "Resumen de Mercado Pago", ayuda: "Si cobras con Mercado Pago.", para: ["mono", "ri"] },
  ],
  // Vencimientos por día del mes (ajústalos al calendario fiscal vigente).
  vencimientos: [
    { dia: 7, concepto: "Pago de sueldos y cargas sociales", para: ["soc"] },
    { dia: 13, concepto: "Cargas sociales (F.931)", para: ["soc"] },
    { dia: 20, concepto: "Cuota del monotributo", para: ["mono"] },
    { dia: 22, concepto: "IVA - declaración jurada", para: ["ri", "soc"] },
    { dia: 5, concepto: "Entrega de documentación al estudio", para: ["mono", "ri", "soc"] },
  ],
  clientes: [
    { id: "c1", nombre: "Panadería La Espiga", contacto: "Marta", telefono: "1140001001", tipo: "ri" },
    { id: "c2", nombre: "Lucía Benítez (diseño)", contacto: "Lucía", telefono: "1140001002", tipo: "mono" },
    { id: "c3", nombre: "Constructora Andes SRL", contacto: "Raúl", telefono: "1140001003", tipo: "soc" },
    { id: "c4", nombre: "Kiosco El Sol", contacto: "Jorge", telefono: "1140001004", tipo: "mono" },
    { id: "c5", nombre: "Ferretería Centro", contacto: "Silvia", telefono: "1140001005", tipo: "ri" },
    { id: "c6", nombre: "Estudio Pilates Uno", contacto: "Carla", telefono: "1140001006", tipo: "mono" },
    { id: "c7", nombre: "Logística Sur SA", contacto: "Andrés", telefono: "1140001007", tipo: "soc" },
  ],
};
