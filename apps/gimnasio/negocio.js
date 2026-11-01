// Datos del gimnasio. Para un cliente nuevo: copia la carpeta y cambia solo este archivo.
window.NEGOCIO = {
  app: "gimnasio",
  id: "gym-fuerza",
  nombre: "Fuerza Gym",
  logo: "🏋️",
  color: "#dc2626",
  whatsapp: "1100000000",
  direccion: "Av. Rivadavia 5600, Caballito",
  webhook: "",
  diasAviso: 5, // avisar cuando faltan estos días para el vencimiento
  diasRiesgo: 10, // socio al día que no viene hace estos días = riesgo de baja

  planes: [
    { id: "libre", nombre: "Pase libre", detalle: "Musculación + todas las clases", precio: 38000, linkPago: "" },
    { id: "3x", nombre: "3 veces por semana", detalle: "Musculación o clases", precio: 30000, linkPago: "" },
    { id: "clases", nombre: "Solo clases", detalle: "Funcional, spinning y yoga", precio: 26000, linkPago: "" },
  ],
  mediosPago: ["Mercado Pago", "Efectivo", "Transferencia", "Débito automático"],
};
