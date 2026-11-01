# Apps de nicho

Ocho mini apps a medida para vender a negocios por Instagram y TikTok, más el sitio de ventas.
HTML, CSS y JavaScript puro, sin build ni dependencias: se publica tal cual en Vercel (o cualquier hosting estático).
Make (o n8n) hace de backend.

| Nicho | Carpeta | Páginas |
|---|---|---|
| Barberías, estéticas, uñas | `apps/turnos` | reservar · panel · encuesta |
| Consultorios | `apps/consultorio` | reservar · panel · encuesta |
| Inmobiliarias | `apps/inmobiliaria` | propiedades · panel de leads |
| Gimnasios / pilates / crossfit | `apps/gimnasio` | alta · check-in · panel de cuotas |
| Restaurantes / dark kitchens | `apps/menu` | menú (`?mesa=4` para QR) · comandas |
| Tiendas online | `apps/ecommerce` | panel de carritos · reseña |
| Talleres mecánicos | `apps/taller` | panel de órdenes · seguimiento (`?c=CODIGO`) |
| Estudios contables | `apps/contable` | portal del cliente (`?c=ID`) · panel |

Cada carpeta tiene además un `index.html`: la **landing de venta** del nicho (dolor, calculadora de pérdida, demo, planes, preguntas frecuentes y botón a WhatsApp).
La portada (`/index.html`) es el catálogo con todos los nichos.

## Probarlo en local

```bash
python3 -m http.server 8000
# http://localhost:8000
```

Sin webhook configurado, las apps funcionan en **modo demo**: datos de ejemplo guardados en el navegador, y la barra negra superior permite reiniciarlos.
Para grabar reels: abre el menú en una pestaña y las comandas en otra; el pedido aparece en vivo (lo mismo con reservas → agenda y propiedades → leads).

## Adaptarla a un cliente

1. Copia la carpeta de la app (o haz un deploy aparte por cliente).
2. Edita **solo `negocio.js`**: nombre, logo, color, WhatsApp, servicios, precios, horarios, planes…
3. Arma el escenario de Make (ver [`docs/escenarios-make.md`](docs/escenarios-make.md)) y pega la URL del webhook en `negocio.js → webhook`.
4. Comparte el link de la página pública en la bio de Instagram y el panel con el dueño (en modo real pide una clave que valida Make).

## Configuración del sitio de ventas

`config.js`: marca, tu WhatsApp de ventas, prefijo telefónico, moneda y webhook de `ventas` (registra los clics a WhatsApp con su `utm_source`).
Usa links como `.../apps/turnos/?utm_source=instagram` en cada red para saber de dónde viene cada consulta.

## Estructura

```
config.js              configuración global
index.html             catálogo / sitio de ventas
shared/
  core.js              utilidades, datos (demo o Make) y conexión con webhooks
  styles.css           sistema visual (cada app cambia --accent)
  landing.js           arma la landing de cada nicho desde contenido.js
  agenda.js            motor de turnos (turnos + consultorio)
  resena.js            encuesta post-servicio
  catalogo.js          nichos de la portada
apps/<nicho>/
  index.html + contenido.js   landing de venta
  negocio.js                  datos del negocio (lo único que se edita por cliente)
  datos.js                    colecciones y reglas del nicho
  *.html + *.js               páginas de la app
docs/escenarios-make.md       contrato de eventos y escenarios a construir
```
