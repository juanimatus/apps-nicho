/* Arma la landing de venta de cada nicho a partir de window.LANDING (apps/<nicho>/contenido.js). */
(function () {
  "use strict";
  const L = window.LANDING;
  const CFG = Core.cfg;
  const { esc, wa } = Core;

  document.documentElement.style.setProperty("--accent", L.color);
  const origen = Core.qs("utm_source") || Core.qs("src") || "";
  const waHref = wa(
    CFG.whatsappVentas,
    `¡Hola! Vi la app para ${L.nicho}${origen ? ` (te encontré en ${origen})` : ""} y quiero más información.`,
  );
  const cta = (txt = "La quiero para mi negocio", cls = "wa") =>
    `<a class="btn ${cls}" href="${waHref}" target="_blank" rel="noopener" data-cta>${txt}</a>`;

  const PASOS = L.pasos || [
    ["Demo de 15 minutos", "Te muestro la app funcionando con datos de tu rubro y vemos qué necesita tu negocio."],
    ["La adaptamos a tu negocio", `Tu marca, tus servicios y tus mensajes. Lista en ${L.diasEntrega || "5 a 10"} días.`],
    ["Funciona sola", "Las automatizaciones corren en Make. Tú solo miras el panel. Soporte incluido."],
  ];
  const FAQ = [
    ...(L.faq || []),
    ["¿Necesito saber de tecnología?", "No. Te la entregamos funcionando y te enseñamos a usar el panel en una videollamada."],
    [
      "¿Qué pasa con mi WhatsApp?",
      "Usamos la API oficial de WhatsApp Business con tu número. Nada de herramientas no oficiales que terminan en bloqueos.",
    ],
    ["¿Hay permanencia?", "No. El abono mensual cubre servidores, automatizaciones y soporte. Puedes darte de baja cuando quieras."],
  ];
  const calc = L.calculadora;

  document.getElementById("landing").innerHTML = `
  <header class="topbar"><div class="wrap">
    <a class="brand" href="../../index.html"><span class="logo">${L.icono}</span><span>${esc(CFG.marca)}</span></a>
    <nav><a class="btn sm ghost" href="#demo">Ver demo</a>${cta("WhatsApp", "sm wa")}</nav>
  </div></header>
  <main>
    <section class="l-hero"><div class="wrap">
      <span class="eyebrow">${L.icono} App para ${esc(L.nicho)}</span>
      <h1>${L.titulo}</h1>
      <p class="lead">${L.bajada}</p>
      <div class="row"><a class="btn primary" href="${L.demos[0].href}">Probar la demo</a>${cta()}</div>
    </div></section>

    <section class="l-section alt"><div class="wrap">
      <h2>¿Te suena familiar?</h2>
      <ul class="pains">${L.dolores.map((d) => `<li>${d}</li>`).join("")}</ul>
    </div></section>

    ${
      calc
        ? `<section class="l-section" id="calc"><div class="wrap"><div class="card calc">
      <div><h2>${calc.titulo}</h2><p class="muted">${calc.bajada || "Pon tus números y mira cuánto se te escapa por mes."}</p>
        <form class="stack" id="calc-form">${calc.campos
          .map(
            (c) =>
              `<label class="field"><span>${c.label}</span><input type="number" inputmode="decimal" min="0" step="${c.paso || 1}" name="${c.id}" value="${c.valor}"></label>`,
          )
          .join("")}</form></div>
      <div class="calc-out"><span class="muted" id="calc-pre"></span><b id="calc-cifra"></b><p id="calc-texto"></p>${cta(
        calc.cta || "Quiero recuperarlo",
        "wa block",
      )}</div>
    </div></div></section>`
        : ""
    }

    <section class="l-section alt"><div class="wrap">
      <h2>Qué hace la app</h2>
      <div class="grid c3 mt">${L.funciones
        .map(([ic, t, x]) => `<div class="feature"><span class="feature-ic">${ic}</span><h3>${t}</h3><p class="muted">${x}</p></div>`)
        .join("")}</div>
    </div></section>

    <section class="l-section" id="demo"><div class="wrap">
      <h2>Pruébala ahora</h2>
      <p class="muted">Es la app real con datos de ejemplo. Ábrela en el celular.</p>
      <div class="grid c3 mt">${L.demos
        .map(
          (d) =>
            `<a class="card demo-card" href="${d.href}"><span class="badge accent">${d.quien}</span><h3>${d.titulo}</h3><p class="muted">${d.texto}</p><span class="link">Abrir demo →</span></a>`,
        )
        .join("")}</div>
    </div></section>

    <section class="l-section alt"><div class="wrap">
      <h2>Cómo trabajamos</h2>
      <div class="grid c3 mt">${PASOS.map(
        ([t, x], i) => `<div class="feature"><span class="num">${i + 1}</span><h3>${t}</h3><p class="muted">${x}</p></div>`,
      ).join("")}</div>
    </div></section>

    <section class="l-section"><div class="wrap">
      <h2>Planes</h2>
      <div class="grid c2 mt">${L.planes
        .map(
          (p) => `<div class="card plan ${p.destacado ? "featured" : ""}">
          ${p.destacado ? `<span class="badge accent">Más elegido</span>` : ""}
          <h3 style="margin-top:8px">${p.nombre}</h3>
          <div class="price"><b>USD ${p.setup}</b> <span class="muted">implementación</span></div>
          <div class="price-sub">+ USD ${p.mensual}/mes de mantenimiento</div>
          <ul class="checks">${p.incluye.map((i) => `<li>${i}</li>`).join("")}</ul>
          ${cta("Quiero este plan", p.destacado ? "primary block" : "ghost block")}
        </div>`,
        )
        .join("")}</div>
      <p class="muted small mt">Precios orientativos. Después de la demo te paso un presupuesto cerrado.</p>
    </div></section>

    <section class="l-section alt"><div class="wrap narrow">
      <h2>Preguntas frecuentes</h2>
      ${FAQ.map(([p, r]) => `<details class="faq"><summary>${p}</summary><p>${r}</p></details>`).join("")}
    </div></section>

    <section class="l-section final"><div class="wrap center">
      <h2>${L.cierre || "¿La vemos funcionando con tu negocio?"}</h2>
      <p class="lead">Te muestro la demo en 15 minutos, sin compromiso.</p>
      ${cta("Agendar demo por WhatsApp")}
    </div></section>
  </main>
  <footer class="foot"><div class="wrap small muted spread"><span>© ${new Date().getFullYear()} ${esc(CFG.marca)}</span><a href="../../index.html">Apps para otros rubros</a></div></footer>
  <a class="float-wa" href="${waHref}" target="_blank" rel="noopener" data-cta aria-label="Escribir por WhatsApp">💬</a>`;

  if (calc) {
    const f = document.getElementById("calc-form");
    const actualizar = () => {
      const v = Object.fromEntries([...new FormData(f)].map(([k, x]) => [k, Number(x) || 0]));
      const r = calc.calcular(v);
      document.getElementById("calc-pre").textContent = r.pre || "";
      document.getElementById("calc-cifra").textContent = r.cifra;
      document.getElementById("calc-texto").innerHTML = r.texto;
    };
    f.addEventListener("input", actualizar);
    actualizar();
  }

  // Registra en Make cada clic a WhatsApp, con el nicho y la red de origen (?utm_source=instagram).
  const hook = (CFG.webhooks || {}).ventas;
  document.addEventListener("click", (e) => {
    if (!hook || !e.target.closest("[data-cta]")) return;
    const body = JSON.stringify({
      app: "ventas",
      evento: "click_whatsapp",
      data: { nicho: L.id, origen, pagina: location.pathname },
      enviado_en: new Date().toISOString(),
    });
    navigator.sendBeacon && navigator.sendBeacon(hook, new Blob([body], { type: "text/plain" }));
  });
})();
