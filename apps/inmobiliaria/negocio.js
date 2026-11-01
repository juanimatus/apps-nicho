// Datos de la inmobiliaria. Con Make conectado, las propiedades también pueden venir de un Data Store o de Sheets.
window.NEGOCIO = {
  app: "inmobiliaria",
  id: "inmobiliaria-horizonte",
  nombre: "Horizonte Propiedades",
  logo: "🏠",
  color: "#0f766e",
  whatsapp: "1100000000",
  direccion: "Palermo, CABA",
  webhook: "",
  minutosAlerta: 15, // un lead nuevo sin respuesta pasado este tiempo se marca en rojo

  propiedades: [
    { id: "P1", titulo: "2 ambientes luminoso con balcón", operacion: "venta", tipo: "Departamento", barrio: "Palermo", precio: 135000, moneda: "USD", ambientes: 2, m2: 48, banos: 1, cochera: false, foto: "", descripcion: "Contrafrente, muy luminoso, a 3 cuadras del subte. Apto crédito." },
    { id: "P2", titulo: "3 ambientes con cochera", operacion: "venta", tipo: "Departamento", barrio: "Belgrano", precio: 210000, moneda: "USD", ambientes: 3, m2: 75, banos: 2, cochera: true, foto: "", descripcion: "Edificio con amenities, pileta y laundry. Cochera fija cubierta." },
    { id: "P3", titulo: "PH reciclado con terraza", operacion: "venta", tipo: "PH", barrio: "Villa Crespo", precio: 168000, moneda: "USD", ambientes: 3, m2: 90, banos: 1, cochera: false, foto: "", descripcion: "Sin expensas, terraza propia con parrilla. Reciclado a nuevo." },
    { id: "P4", titulo: "Casa con jardín y pileta", operacion: "venta", tipo: "Casa", barrio: "Vicente López", precio: 340000, moneda: "USD", ambientes: 5, m2: 220, banos: 3, cochera: true, foto: "", descripcion: "Lote propio, jardín con pileta, quincho y cochera para 2 autos." },
    { id: "P5", titulo: "Monoambiente a estrenar", operacion: "alquiler", tipo: "Departamento", barrio: "Palermo", precio: 480000, moneda: "ARS", ambientes: 1, m2: 32, banos: 1, cochera: false, foto: "", descripcion: "A estrenar, amoblado, con amenities. Contrato por 2 años." },
    { id: "P6", titulo: "2 ambientes cerca del subte", operacion: "alquiler", tipo: "Departamento", barrio: "Almagro", precio: 560000, moneda: "ARS", ambientes: 2, m2: 45, banos: 1, cochera: false, foto: "", descripcion: "Al frente con balcón. Expensas bajas." },
    { id: "P7", titulo: "3 ambientes familiar", operacion: "alquiler", tipo: "Departamento", barrio: "Caballito", precio: 780000, moneda: "ARS", ambientes: 3, m2: 70, banos: 2, cochera: true, foto: "", descripcion: "Muy cerca de Parque Centenario. Cochera opcional." },
    { id: "P8", titulo: "Local a la calle", operacion: "alquiler", tipo: "Local", barrio: "Colegiales", precio: 1100000, moneda: "ARS", ambientes: 1, m2: 60, banos: 1, cochera: false, foto: "", descripcion: "Vidriera de 6 metros sobre avenida, con depósito." },
  ],
};
