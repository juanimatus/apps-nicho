# Escenarios de Make para las mini apps

Cada app es un sitio estático que habla con **un webhook de Make por app (y por cliente)**.
El mismo contrato sirve para n8n: un nodo Webhook con un Switch por `evento`.

## Arquitectura

```
Web / panel (Vercel)  ──POST JSON──▶  Webhook de Make  ──▶  Router por "evento"
                                                          ├─ escribe en Data Store / Sheets / Supabase
                                                          ├─ envía WhatsApp (Cloud API)
                                                          └─ responde JSON (solo en consultas)
Escenarios programados (sin webhook): recordatorios, secuencias, vencimientos.
```

- **Modo demo:** sin webhook configurado, todo queda en el `localStorage` del navegador.
- **Modo real:** se pega la URL del webhook en `apps/<app>/negocio.js` → `webhook: "https://hook.us2.make.com/..."`.

## Payload común

Todas las llamadas envían:

```json
{
  "app": "turnos",
  "evento": "turno_creado",
  "negocio": "barberia-don-corte",
  "clave": "1234",
  "data": { "...": "depende del evento" },
  "enviado_en": "2026-11-01T14:03:00.000Z",
  "origen": "https://.../apps/turnos/reservar.html"
}
```

- `clave` solo viaja desde los paneles (se pide una vez por sesión). **Filtra en Make**: si el evento es de panel (`listar`, cambios de estado) y `clave` no coincide, responde 401.
- **Consultas con respuesta** (`listar`, `turnos_ocupados`, `socio_buscar`, `orden_obtener`, `portal_obtener`): terminan en un módulo **Webhook response** con status 200, body JSON y el header `Access-Control-Allow-Origin: *`.
- **Eventos sin respuesta:** si el navegador bloquea por CORS, `core.js` reintenta como `text/plain`. En ese caso agrega un **JSON › Parse JSON** sobre el cuerpo crudo antes del router.
- `contable/documento_subido` llega como **multipart**: campo `payload` (JSON en texto) + campo `archivo` (binario).

### Patrón del evento `listar` (todos los paneles)

`data.coleccion` indica qué devolver → **Data store › Search records** → **Array aggregator** → **Webhook response** con el array.
Colecciones: `turnos`, `espera`, `resenas`, `propiedades`, `leads`, `socios`, `pagos`, `pedidos`, `carritos`, `ordenes`, `clientes`, `entregas`.

> El `id` de cada registro lo genera la web. Úsalo como *key* del Data Store para hacer upsert con **Add/replace a record**.

## WhatsApp

Usa el módulo **WhatsApp Business Cloud** con el número del cliente. Los mensajes que inicia el negocio
(fuera de la ventana de 24 h) necesitan **plantillas aprobadas por Meta**. Las plantillas sugeridas por app están en cada sección.

---

## 1. Turnos (barberías, estéticas) y 2. Consultorio

Mismo motor, mismos eventos.

| Evento | Viene de | `data` | Qué hace el escenario |
|---|---|---|---|
| `turno_creado` | reservar / panel | turno completo (`id, fecha, hora, duracion, servicio, profesional, cliente, telefono, precio, estado, origen`) | Guarda el turno. Envía la plantilla `confirmacion_turno`. Opcional: crea un evento en Google Calendar del profesional. |
| `turno_estado` | panel | turno con el `estado` nuevo | Actualiza. Si `cancelado` → busca en `espera` para esa fecha y avisa al primero. Si `asistio` → programa la encuesta (+2 h). |
| `lista_espera_alta` / `lista_espera_baja` | reservar / panel | registro de espera / `{id}` | Guarda o borra. |
| `resena_nueva` | encuesta | `ref, nombre, puntaje, comentario` | Guarda. Si `puntaje <= 3`, avisa al dueño por WhatsApp o mail para recuperar al cliente. |
| `turnos_ocupados` ↩ | reservar | `desde, hasta` | Responde `[{fecha, hora, duracion, profesionalId}]` de los turnos no cancelados (**sin datos personales**). |
| `listar` ↩ | panel | `coleccion` | Ver el patrón. |

**Programados**
- *Recordatorio 24 h* (cada hora): turnos de mañana en estado `pendiente`/`confirmado` y sin `recordado` → plantilla `recordatorio_turno` con botones rápidos **Confirmar / Cancelar**. Un segundo escenario con el **webhook de mensajes entrantes de WhatsApp** recibe la respuesta del botón y actualiza el estado.
- *Encuesta post-visita*: turnos `asistio` de hace 2 h → plantilla con el link `encuesta.html?ref=<id>&n=<nombre>`.

**Plantillas:** `confirmacion_turno`, `recordatorio_turno` (con botones), `lugar_liberado`, `encuesta_visita`.

## 3. Inmobiliaria

| Evento | Viene de | `data` | Qué hace |
|---|---|---|---|
| `lead_nuevo` | propiedades | `nombre, telefono, propiedad, operacion, plazo, pago, presupuesto, moneda, visita{dia,franja}, score, temperatura` | Guarda. Envía la plantilla `respuesta_lead` al instante. Si `temperatura = caliente`, avisa al agente por WhatsApp. |
| `lead_estado` | panel | lead con `estado` y `contactadoEn` | Actualiza. Si `visita` → crea el evento en Google Calendar. |
| `listar` ↩ | web / panel | `coleccion: propiedades / leads` | Las propiedades pueden salir de Sheets. |

**Programados**
- *Alerta de lead frío*: cada 5 min, leads `nuevo` con más de 15 min → WhatsApp al agente de guardia.
- *Leads de portales*: **Email › Watch emails** (Zonaprop, Argenprop, MercadoLibre) → parsear con IA → mismo flujo que `lead_nuevo`.
- *Plan IA*: webhook de mensajes entrantes → **OpenAI/Claude** con las fichas como contexto → responde y agenda la visita.

## 4. Gimnasio

| Evento | Viene de | `data` | Qué hace |
|---|---|---|---|
| `socio_alta` | alta | socio (`vence = fecha de inicio`, pendiente de pago) | Guarda. Envía bienvenida + link de pago del plan. |
| `pago_registrado` | panel | `{ socio, pago }` | Actualiza `vence` y guarda el pago. Envía el comprobante por WhatsApp. |
| `asistencia` | check-in | `socioId, dni, fecha, hora, cuota` | Actualiza `ultimaAsistencia`. Si `cuota = vencida`, avisa a recepción. |
| `recordatorio_cuota` / `reactivacion` | panel (botón Avisar) | `{ socio, estado }` | Registra el contacto manual (evita duplicar el automático). |
| `socio_buscar` ↩ | check-in | `dni` | Responde el socio (o `null`). |
| `listar` ↩ | panel | `socios`, `pagos` | |

**Programados (diario, 9:00)**
- Vence en 5 días / hoy / venció hace 3 días → plantilla `vencimiento_cuota` con el link de pago.
- Al día y sin venir hace 10 días → plantilla `te_extranamos`.
- **Mercado Pago › Watch payments** (o webhook de MP) → identifica al socio por referencia externa → suma un mes a `vence`.

## 5. Menú y comandas

| Evento | Viene de | `data` | Qué hace |
|---|---|---|---|
| `pedido_nuevo` | menú | pedido (`numero, items[], total, cliente, entrega, mesa, direccion, pago, notas`) | Guarda. Envía la confirmación al cliente. Opcional: responde `{ "numero": 123 }` para usar tu propia numeración. Opcional: imprime la comanda (PrintNode). |
| `pedido_estado` | comandas | pedido con `estado` | Si `listo` → plantilla `pedido_listo` (delivery: “sale para tu casa”; retiro: “pasa a buscarlo”). |
| `listar` ↩ | comandas | `pedidos` | Solo los de hoy. |

**Programado:** campaña semanal a clientes que no piden hace 30 días (desde el Data Store de pedidos).

## 6. E-commerce (carritos)

| Evento | Viene de | `data` | Qué hace |
|---|---|---|---|
| `carrito_abandonado` | **Tiendanube/Shopify** (y botón “Simular”) | `cliente, telefono, items[], total, link` | Guarda con `enviados: []`. |
| `carrito_recuperado` | panel / **webhook de orden pagada** | carrito | Marca recuperado y corta la secuencia. |
| `secuencia_actualizada` | panel | `{ secuencia: [{horas, texto}], cupon }` | Guarda la configuración que lee el escenario programado. |
| `resena_nueva` | resena.html | `ref, nombre, puntaje, comentario` | Guarda. Opcional: la publica en la tienda (Judge.me, etc.). |
| `listar` ↩ | panel | `carritos` | Incluye `enviados` para el panel. |

**Programado (cada 15 min):** carritos `activo` → si pasaron `secuencia[n].horas` y no se envió el paso `n` → plantilla correspondiente → push a `enviados`. Si la tienda informa la compra, se corta.

**Conexión con la tienda:** Tiendanube → webhooks `order/created` + checkout abandonado (API `checkouts`); Shopify → módulo **Watch abandoned checkouts**.

## 7. Taller mecánico

| Evento | Viene de | `data` | Qué hace |
|---|---|---|---|
| `orden_creada` | panel | `{ orden, link }` | Guarda. Envía la plantilla `vehiculo_recibido` con el link de seguimiento. |
| `orden_estado` | panel | `{ orden, link }` | Actualiza. Plantilla según `orden.estado` (`en_reparacion`, `listo_para_retirar`…). |
| `presupuesto_enviado` | panel | `{ orden, link, total }` | Plantilla `presupuesto_listo` con el total y el link para aprobar. |
| `presupuesto_respuesta` | seguimiento (cliente) | `codigo, respuesta: aprobado / rechazado` | Actualiza la orden (si se aprueba, `estado = aprobado`) y avisa al taller. |
| `proximo_service` | panel | `{ orden }` | Guarda la fecha/km del próximo service. |
| `orden_obtener` ↩ | seguimiento | `codigo` | Responde la orden (solo esa). |
| `listar` ↩ | panel | `ordenes` | |

**Programado (diario):** `proximoService.fecha` dentro de 7 días → plantilla `recordatorio_service`.

## 8. Estudio contable

| Evento | Viene de | `data` | Qué hace |
|---|---|---|---|
| `documento_subido` | portal (**multipart**) | `payload`: `cliente, periodo, doc, archivo, tamano` + `archivo` binario | **Google Drive › Upload** en `/Clientes/<cliente>/<periodo>/<doc>-<archivo>`. Guarda la entrega. Si el mes quedó completo, avisa al contador. |
| `recordatorio_documentacion` | panel | `cliente, periodo, faltan[], link` | Plantilla `faltan_documentos`. |
| `recordatorio_documentacion_masivo` | panel | `periodo, clientes[]` | Iterator → misma plantilla para cada uno. |
| `vencimiento_aviso` | panel | `vencimiento, clientes[]` | Iterator → plantilla `aviso_vencimiento`. |
| `portal_obtener` ↩ | portal | `cliente` | Responde `{ cliente, entregas }` **solo de ese cliente**. |
| `listar` ↩ | panel | `clientes`, `entregas` | |

**Programados**
- Días 1, 3 y 5 de cada mes: clientes incompletos del mes anterior → `faltan_documentos`.
- Diario: vencimientos a 3 días → `aviso_vencimiento` según el tipo de cliente.
- Opcional (plan Pro): OCR/IA sobre las facturas subidas → fila en Sheets.

## Ventas (sitio propio)

Las landings mandan `click_whatsapp` a `APP_CONFIG.webhooks.ventas` con `{ nicho, origen, pagina }`
(`origen` sale de `?utm_source=instagram` o `?utm_source=tiktok`). Guárdalo en Sheets para medir qué red y qué nicho traen más consultas.

## Orden sugerido para armarlos

1. **Turnos**: alta + confirmación + recordatorio con botones (el que más se ve en los reels).
2. **Menú**: `pedido_nuevo` + `pedido_listo`.
3. **Inmobiliaria**: `lead_nuevo` + alerta de lead frío.
4. El resto, reutilizando el mismo esqueleto: *Webhook → Parse → Router → Data Store → WhatsApp → Response*.
