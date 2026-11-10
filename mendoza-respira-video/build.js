// Arma las tres salidas desde src/video.html + src/mapa.html.
//   node build.js            → interactivo.html (para abrir en el navegador) y hyperframes/index.html (para renderizar el MP4)
//   node build.js ruta.html  → además escribe un fragmento sin <html>/<head> en esa ruta (para publicar como artefacto)
const fs = require("fs");
const path = require("path");
const dir = __dirname;
const leer = (f) => fs.readFileSync(path.join(dir, f), "utf8");

const mapa = leer("src/mapa.html");
// silueta de la portada: los mismos departamentos, solo el contorno
const silueta = mapa.replace(/<g class="pts">[\s\S]*?<\/g>/, "").replace(/class="depto"[^>]*? d=/g, "d=").replace('class="mapa"', "");
let src = leer("src/video.html").replace("<!--MAPA-->", mapa).replace("<!--SILUETA-->", silueta);

const FUENTES = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Instrument+Sans:wght@400..700&family=JetBrains+Mono:wght@500;700&display=swap">';
const GSAP_CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>';
const GSAP_LOCAL = '<script src="assets/gsap.min.js"></script>';
const TITULO = "<title>Mendoza Respira en video</title>";

// 1) Interactivo, documento completo
const interactivo = (gsap) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${TITULO}
${FUENTES}
</head>
<body>
${src.replace("<!--GSAP-->", gsap)}
</body>
</html>
`;
fs.writeFileSync(path.join(dir, "interactivo.html"), interactivo(GSAP_CDN));
// copia de prueba con GSAP local (para abrir sin internet o probar con Playwright)
fs.writeFileSync(path.join(dir, "interactivo-local.html"), interactivo(GSAP_LOCAL.replace("assets/", "hyperframes/assets/")));

// 2) Composición HyperFrames: sin reproductor, 1080×1350 fijo
const render = src
  .replace(/<!--PLAYER-->[\s\S]*?<!--\/PLAYER-->/g, "")
  .replace(/\/\*PLAYER-CSS\*\/[\s\S]*?\/\*\/PLAYER-CSS\*\//, "")
  .replace("<!--GSAP-->", "");
fs.writeFileSync(path.join(dir, "hyperframes/index.html"), `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1080, height=1350">
${FUENTES}
${GSAP_LOCAL}
<script>window.__RENDER__ = true;</script>
<style>html, body { margin: 0; width: 1080px; height: 1350px; overflow: hidden; }</style>
</head>
<body>
${render}
</body>
</html>
`);

// 3) Fragmento para artefacto (sin doctype/html/head/body)
if (process.argv[2]) {
  fs.writeFileSync(process.argv[2], `${TITULO}\n<meta name="claude:viewport-fit-sides" content="cover">\n${FUENTES}\n${src.replace("<!--GSAP-->", GSAP_CDN)}`);
}
console.log("listo");
