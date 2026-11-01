// Datos del consultorio. Para un cliente nuevo: copia la carpeta y cambia solo este archivo.
window.NEGOCIO = {
  app: "consultorio",
  id: "consultorio-sonrisas",
  nombre: "Consultorio Sonrisas",
  logo: "🦷",
  color: "#0369a1",
  whatsapp: "1100000000",
  direccion: "Av. Santa Fe 2450, 3° B, CABA",
  webhook: "",
  linkResena: "https://g.page/r/TU-CONSULTORIO/review",
  textos: {
    turno: "turno",
    turnos: "turnos",
    servicio: "Motivo de la consulta",
    profesional: "Profesional",
    profesionalLabel: "Profesional",
    clienteLabel: "Paciente",
  },

  intervalo: 30,
  diasAnticipacion: 21,
  anticipacionMinima: 120,
  horario: {
    0: [],
    1: [["09:00", "13:00"], ["15:00", "19:00"]],
    2: [["09:00", "13:00"], ["15:00", "19:00"]],
    3: [["09:00", "13:00"], ["15:00", "19:00"]],
    4: [["09:00", "13:00"], ["15:00", "19:00"]],
    5: [["09:00", "14:00"]],
    6: [],
  },
  servicios: [
    { id: "consulta", nombre: "Consulta / control", duracion: 30, precio: 20000 },
    { id: "limpieza", nombre: "Limpieza dental", duracion: 45, precio: 32000 },
    { id: "blanqueamiento", nombre: "Blanqueamiento", duracion: 60, precio: 90000 },
    { id: "urgencia", nombre: "Urgencia / dolor", duracion: 30, precio: 25000 },
  ],
  profesionales: [
    { id: "lopez", nombre: "Dra. Laura López" },
    { id: "martinez", nombre: "Dr. Pablo Martínez" },
  ],
  clientesDemo: ["Ana Fernández", "Carlos Medina", "Lucía Benítez", "Jorge Acosta", "Paula Ríos", "Diego Molina", "Carla Suárez", "Andrés Vega", "María Ibarra", "Federico Paz"],
};
