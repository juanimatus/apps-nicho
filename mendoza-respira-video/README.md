# Mendoza Respira en video

Video interactivo de 48 segundos sobre [Mendoza Respira](https://github.com/juanimatus/MendozaRespiraApp), en formato 4:5 (1080×1350).

| Archivo | Qué es |
|---|---|
| `interactivo.html` | El video interactivo. Se abre con doble clic en cualquier navegador (necesita internet para las tipografías y GSAP). |
| `mendoza-respira.mp4` | El mismo video renderizado, sin interacción, listo para feed de Instagram, Facebook o LinkedIn. No tiene música. |
| `src/video.html` | La fuente: escenas, estilos, línea de tiempo y reproductor. Es el único archivo que se edita. |
| `src/mapa.html` | Mapa de los 18 departamentos, generado desde el GeoJSON de la app con `src/generar_mapa.py`. |
| `hyperframes/` | Proyecto HyperFrames que renderiza el MP4. |

## Qué tiene de interactivo

- Capítulos, barra de tiempo, pausa con la barra espaciadora y saltos de 5 s con las flechas.
- En **Reportar** el video frena y deja elegir el tipo de reporte. Lo elegido aparece después en el mapa, en la revisión técnica y en la ficha del municipio.
- En **El mapa** se puede tocar cualquier departamento (o la lista) para ver su detalle.
- Debajo del video va apareciendo un dato extra por escena.
- La opción "Frenar en las partes interactivas" se puede apagar para verlo de corrido.

## Datos

Los números del mapa son **datos de ejemplo** y el video lo indica en pantalla. No salen de la base real. Las pantallas de la app están recreadas a partir del código (textos, colores y tipos de reporte reales), no son capturas.

## Cambiar algo y volver a generar

```bash
node build.js                      # regenera interactivo.html y hyperframes/index.html
cd hyperframes
npm i hyperframes@0.8.221 gsap@3.14.2
npx hyperframes lint               # 0 errores
npx hyperframes snapshot --at 4,16,28,36,42,47
npx hyperframes render -o ../mendoza-respira.mp4
```

Para regenerar el mapa: `python3 src/generar_mapa.py ruta/a/mendoza-departamentos.geojson`.
