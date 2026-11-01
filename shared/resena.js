/* Encuesta de satisfacción post-servicio. El enlace a Google se ofrece a todos por igual
   (Google no permite pedir reseñas solo a quienes puntúan alto). */
(function () {
  "use strict";
  const { $, esc, qs } = Core;
  const N = Core.negocio;

  function render(root, { pregunta = "¿Cómo fue tu experiencia?" } = {}) {
    const ref = qs("ref") || "";
    const nombre = qs("n") || "";
    const resenas = Core.repo("resenas", () => []);
    let puntaje = 0;

    root.innerHTML = `${Core.cover()}<main class="wrap narrow lift"><div class="card" id="caja">
      <form class="stack center" id="f">
        <h2>${nombre ? `${esc(nombre)}, ` : ""}${esc(pregunta)}</h2>
        <div class="stars" role="radiogroup" aria-label="Puntaje">${[1, 2, 3, 4, 5]
          .map((n) => `<button type="button" class="star" data-n="${n}" role="radio" aria-checked="false" aria-label="${n} de 5">★</button>`)
          .join("")}</div>
        <textarea name="comentario" rows="3" placeholder="Cuéntanos qué te gustó o qué mejorarías (opcional)"></textarea>
        <button class="btn primary block" disabled>Enviar</button>
      </form></div></main>`;

    const caja = $("#caja", root);
    const form = $("#f", root);
    form.addEventListener("click", (e) => {
      const b = e.target.closest(".star");
      if (!b) return;
      puntaje = Number(b.dataset.n);
      form.querySelectorAll(".star").forEach((s) => {
        const on = Number(s.dataset.n) <= puntaje;
        s.classList.toggle("on", on);
        s.setAttribute("aria-checked", String(Number(s.dataset.n) === puntaje));
      });
      form.querySelector("button.primary").disabled = false;
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      form.querySelector("button.primary").disabled = true;
      await resenas.save(
        { id: Core.uid("R"), ref, nombre, puntaje, comentario: form.comentario.value.trim(), creado: new Date().toISOString() },
        "resena_nueva",
      );
      caja.innerHTML = `<div class="success stack"><div class="check">♥</div>
        <h2>¡Gracias${nombre ? `, ${esc(nombre)}` : ""}!</h2>
        <p class="muted">Tu opinión nos ayuda a mejorar.</p>
        ${
          N.linkResena
            ? `<p>¿Nos dejarías también una reseña en Google? Son 30 segundos y nos ayuda muchísimo.</p>
               <a class="btn primary block" href="${esc(N.linkResena)}" target="_blank" rel="noopener">Dejar reseña en Google</a>`
            : ""
        }</div>`;
    });
  }

  window.Resena = { render };
})();
