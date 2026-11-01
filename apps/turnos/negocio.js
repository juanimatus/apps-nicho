// Datos del negocio. Para un cliente nuevo: copia la carpeta y cambia solo este archivo.
window.NEGOCIO = {
  app: "turnos",
  id: "barberia-don-corte",
  nombre: "Barbería Don Corte",
  logo: "💈",
  color: "#b45309",
  whatsapp: "1100000000",
  direccion: "Av. Corrientes 1234, CABA",
  webhook: "", // URL del webhook de Make. Vacío = modo demo.
  linkResena: "https://g.page/r/TU-NEGOCIO/review",
  sena: { link: "", porcentaje: 30 }, // link de pago de Mercado Pago para cobrar seña (opcional)

  intervalo: 15, // minutos entre horarios posibles
  diasAnticipacion: 14,
  anticipacionMinima: 60, // minutos mínimos para reservar en el día
  // Franjas por día de la semana (0 = domingo … 6 = sábado). Vacío = cerrado.
  horario: {
    0: [],
    1: [],
    2: [["10:00", "14:00"], ["16:00", "20:30"]],
    3: [["10:00", "14:00"], ["16:00", "20:30"]],
    4: [["10:00", "14:00"], ["16:00", "20:30"]],
    5: [["10:00", "21:00"]],
    6: [["09:00", "18:00"]],
  },
  servicios: [
    { id: "corte", nombre: "Corte", duracion: 30, precio: 9000 },
    { id: "corte-barba", nombre: "Corte + barba", duracion: 45, precio: 13000 },
    { id: "barba", nombre: "Perfilado de barba", duracion: 20, precio: 6000 },
    { id: "color", nombre: "Color / decoloración", duracion: 90, precio: 25000 },
  ],
  profesionales: [
    { id: "nico", nombre: "Nico" },
    { id: "fede", nombre: "Fede" },
    { id: "lu", nombre: "Lu" },
  ],
  clientesDemo: ["Lucas Pérez", "Martín Gómez", "Joaquín Díaz", "Tomás Romero", "Mateo Álvarez", "Bruno Sosa", "Facundo Ruiz", "Agustín Torres", "Nicolás Herrera", "Julián Castro"],
};
