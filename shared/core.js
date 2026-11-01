/* Núcleo compartido de las mini apps.
   - Utilidades de formato: fechas, moneda, links de WhatsApp.
   - Datos: localStorage en modo demo, o Make/n8n como backend cuando hay webhook.
   - Contrato con Make: POST JSON { app, evento, negocio, clave, data, enviado_en, origen }.
     Ver docs/escenarios-make.md. */
(function () {
  "use strict";
  const CFG = window.APP_CONFIG || {};
  const N = window.NEGOCIO || {};
  const APP = N.app || document.documentElement.dataset.app || "general";
  const MONEDA = Object.assign({ codigo: "ARS", locale: "es-AR" }, CFG.moneda, N.moneda);

  if (N.color) document.documentElement.style.setProperty("--accent", N.color);

  // ---------- utilidades ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const uid = (p = "") =>
    p + Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");
  const qs = (k) => new URLSearchParams(location.search).get(k);

  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseISO = (s) => {
    const [y, m, d] = String(s).slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const addDays = (s, n) => {
    const d = parseISO(s);
    d.setDate(d.getDate() + n);
    return iso(d);
  };
  const addMonths = (s, n) => {
    const d = parseISO(s);
    const dia = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + n);
    d.setDate(Math.min(dia, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
    return iso(d);
  };
  const diffDays = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
  const fecha = (s, opts = { weekday: "short", day: "numeric", month: "short" }) =>
    parseISO(s).toLocaleDateString("es", opts);
  const fechaLarga = (s) => fecha(s, { weekday: "long", day: "numeric", month: "long" });
  const nombreMes = (periodo) =>
    parseISO(periodo + "-01").toLocaleDateString("es", { month: "long", year: "numeric" });
  const hace = (ts) => {
    const m = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
    if (m < 1) return "recién";
    if (m < 60) return `hace ${m} min`;
    const h = Math.round(m / 60);
    if (h < 24) return `hace ${h} h`;
    return `hace ${Math.round(h / 24)} d`;
  };
  const money = (n, codigo) =>
    new Intl.NumberFormat(MONEDA.locale, {
      style: "currency",
      currency: codigo || MONEDA.codigo,
      maximumFractionDigits: 0,
    }).format(Number(n) || 0);
  const telefono = (s) => String(s || "").replace(/\D/g, "");
  // Número listo para wa.me: si es local (10 dígitos o menos) le agrega el prefijo del país.
  const telWa = (s) => {
    const t = telefono(s);
    const prefijo = N.prefijoPais || CFG.prefijoPais || "";
    return t.length <= 10 && prefijo && !t.startsWith(prefijo) ? prefijo + t : t;
  };
  const wa = (num, txt) => `https://wa.me/${telWa(num)}?text=${encodeURIComponent(txt || "")}`;
  const primerNombre = (s) => String(s || "").trim().split(/\s+/)[0];

  function toast(msg, tipo = "") {
    let box = $(".toasts");
    if (!box) {
      box = document.createElement("div");
      box.className = "toasts";
      box.setAttribute("role", "status");
      document.body.append(box);
    }
    const t = document.createElement("div");
    t.className = `toast ${tipo}`;
    t.textContent = msg;
    box.append(t);
    setTimeout(() => t.remove(), 3400);
  }

  function modal(html) {
    const el = document.createElement("div");
    el.className = "modal";
    el.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true">${html}</div>`;
    const onKey = (e) => e.key === "Escape" && close();
    const close = () => {
      el.remove();
      document.removeEventListener("keydown", onKey);
    };
    el.addEventListener("click", (e) => {
      if (e.target === el || e.target.closest("[data-cerrar]")) close();
    });
    document.addEventListener("keydown", onKey);
    document.body.append(el);
    return { el, box: el.firstElementChild, close };
  }

  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o.start();
      o.stop(ctx.currentTime + 0.4);
    } catch {
      /* sin audio */
    }
  }

  // ---------- conexión con Make / n8n ----------
  const webhook = () => N.webhook || (CFG.webhooks || {})[APP] || "";
  const remoto = () => !!webhook();
  const CLAVE_KEY = `${APP}:clave`;
  const clave = () => sessionStorage.getItem(CLAVE_KEY) || undefined;

  const payload = (evento, data) => ({
    app: APP,
    evento,
    negocio: N.id || N.nombre || "",
    clave: clave(),
    data,
    enviado_en: new Date().toISOString(),
    origen: location.href,
  });

  async function leer(res) {
    const t = await res.text();
    try {
      return t ? JSON.parse(t) : null;
    } catch {
      return t;
    }
  }

  // Envía un evento. En modo demo solo lo registra en la consola.
  async function send(evento, data) {
    console.info(`[${APP}] → ${evento}`, data);
    const url = webhook();
    if (!url) return { demo: true };
    const body = JSON.stringify(payload(evento, data));
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await leer(res);
    } catch (err) {
      if (!(err instanceof TypeError)) throw err;
      // Bloqueo CORS o de red: reintento como petición simple (Make la recibe como texto).
      await fetch(url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body });
      return { enviado: true };
    }
  }

  // Consulta que necesita respuesta JSON (módulo "Webhook response" en Make).
  async function call(evento, data) {
    const res = await fetch(webhook(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload(evento, data)),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return leer(res);
  }

  // Sube un archivo: multipart con "payload" (JSON) y "archivo".
  async function sendFile(evento, data, file) {
    console.info(`[${APP}] → ${evento}`, data, file && file.name);
    const url = webhook();
    if (!url) return { demo: true };
    const fd = new FormData();
    fd.append("payload", JSON.stringify(payload(evento, data)));
    if (file) fd.append("archivo", file, file.name);
    try {
      return await leer(await fetch(url, { method: "POST", body: fd }));
    } catch (err) {
      if (err instanceof TypeError) return { enviado: true }; // llegó, pero sin CORS no se lee la respuesta
      throw err;
    }
  }

  async function notificar(evento, data) {
    try {
      return await send(evento, data);
    } catch (e) {
      console.warn(e);
      toast("No se pudo avisar a Make. Revisa el webhook.", "bad");
      return null;
    }
  }

  // ---------- datos ----------
  const key = (col) => `${APP}:${col}`;
  const local = {
    get(col, def = null) {
      try {
        const v = localStorage.getItem(key(col));
        return v === null ? def : JSON.parse(v);
      } catch {
        return def;
      }
    },
    set(col, v) {
      try {
        localStorage.setItem(key(col), JSON.stringify(v));
      } catch (e) {
        console.warn(e);
      }
    },
  };

  // Colección: lee de Make (evento "listar") si hay webhook; si no, del navegador con datos de ejemplo.
  // save() guarda en el navegador al instante y después avisa a Make con el evento indicado.
  function repo(col, seed) {
    const r = {
      all() {
        let v = local.get(col);
        if (!Array.isArray(v)) {
          v = seed && !remoto() ? seed() : []; // los datos de ejemplo son solo para el modo demo
          local.set(col, v);
        }
        return v;
      },
      find(id) {
        return r.all().find((x) => x.id === id);
      },
      async list() {
        if (remoto()) {
          try {
            const v = await call("listar", { coleccion: col });
            if (Array.isArray(v)) {
              local.set(col, v);
              return v;
            }
          } catch (e) {
            console.warn(e);
            toast("No se pudo leer desde Make: muestro los últimos datos guardados.", "warn");
          }
        }
        return r.all();
      },
      save(item, evento) {
        const items = r.all();
        const i = items.findIndex((x) => x.id === item.id);
        if (i >= 0) items[i] = item;
        else items.push(item);
        local.set(col, items);
        return evento ? notificar(evento, item) : Promise.resolve(null);
      },
      remove(id, evento) {
        local.set(col, r.all().filter((x) => x.id !== id));
        return evento ? notificar(evento, { id }) : Promise.resolve(null);
      },
    };
    return r;
  }

  // Refresca cuando otra pestaña cambia datos (demo) o cada X segundos (con Make).
  function onCambio(cb, cadaSeg = 20) {
    window.addEventListener("storage", (e) => {
      if (!e.key || e.key.startsWith(APP + ":")) cb();
    });
    if (remoto()) setInterval(cb, cadaSeg * 1000);
  }

  // Los paneles mandan una clave que Make valida antes de devolver datos.
  function pedirClave() {
    if (remoto() && !clave()) {
      const c = prompt("Clave del panel");
      if (c) sessionStorage.setItem(CLAVE_KEY, c.trim());
    }
  }

  // ---------- piezas de interfaz ----------
  const logo = () => esc(N.logo || "★");
  function topbar(links = []) {
    return `<header class="topbar"><div class="wrap"><span class="brand"><span class="logo">${logo()}</span><span>${esc(N.nombre || CFG.marca || "")}</span></span><nav>${links
      .map(([txt, href, cls = "ghost"]) => `<a class="btn sm ${cls}" href="${esc(href)}" target="_blank" rel="noopener">${esc(txt)}</a>`)
      .join("")}</nav></div></header>`;
  }
  function cover(subtitulo = "") {
    return `<header class="cover"><div class="wrap narrow"><div class="row nowrap"><span class="logo big">${logo()}</span><div><h1>${esc(N.nombre)}</h1>${
      subtitulo ? `<p>${esc(subtitulo)}</p>` : ""
    }</div></div></div></header>`;
  }

  function demoBar() {
    if (!window.NEGOCIO || remoto()) return;
    const bar = document.createElement("div");
    bar.className = "demo-bar";
    bar.innerHTML = `<span>Modo demo · los datos quedan en este navegador</span><button type="button">Reiniciar demo</button>`;
    bar.querySelector("button").addEventListener("click", () => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(APP + ":"))
        .forEach((k) => localStorage.removeItem(k));
      location.reload();
    });
    document.body.prepend(bar);
  }

  document.addEventListener("DOMContentLoaded", () => {
    demoBar();
    $$("[data-marca]").forEach((e) => (e.textContent = CFG.marca || ""));
    $$("[data-anio]").forEach((e) => (e.textContent = new Date().getFullYear()));
    $$("[data-wa-ventas]").forEach((a) => {
      a.href = wa(CFG.whatsappVentas, "¡Hola! Quiero información sobre las apps a medida.");
      a.target = "_blank";
      a.rel = "noopener";
    });
  });

  window.Core = {
    cfg: CFG,
    negocio: N,
    app: APP,
    $,
    $$,
    esc,
    uid,
    cap,
    qs,
    iso,
    parseISO,
    addDays,
    addMonths,
    diffDays,
    fecha,
    fechaLarga,
    nombreMes,
    hace,
    money,
    telefono,
    telWa,
    wa,
    primerNombre,
    toast,
    modal,
    beep,
    remoto,
    send,
    call,
    sendFile,
    repo,
    local,
    onCambio,
    pedirClave,
    topbar,
    cover,
  };
})();
