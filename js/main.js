/* =================================================================
   Lucy Groenen — interactie
   - Mobiele navigatie (hamburger)
   - Schaduw onder header bij scrollen
   - Subtiele reveal-animatie
   - Contactformulier (client-side validatie + mailto-fallback)
   ================================================================= */
(function () {
  "use strict";

  /* ---------- Mobiele navigatie ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("primary-nav");

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Sluit menu na klik op een link
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Sluit met Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    // Sluit bij klik buiten het menu
    document.addEventListener("click", function (e) {
      if (!menu.classList.contains("is-open")) return;
      if (menu.contains(e.target) || toggle.contains(e.target)) return;
      closeMenu();
    });

    // Reset bij verbreden naar desktop
    var mq = window.matchMedia("(min-width: 821px)");
    mq.addEventListener("change", function (e) {
      if (e.matches) closeMenu();
    });
  }

  /* ---------- Header-schaduw bij scrollen ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Reveal bij scrollen ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if ("IntersectionObserver" in window &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("is-in"); });
    }
  }

  /* ---------- Voettekst: huidig jaar ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Contactformulier ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var note = form.querySelector(".form-note");

    var showNote = function (msg, ok) {
      if (!note) return;
      note.textContent = msg;
      note.classList.remove("form-note--ok", "form-note--err");
      note.classList.add(ok ? "form-note--ok" : "form-note--err", "is-visible");
    };

    // Verstuurt rechtstreeks via Formsubmit; bericht komt binnen op info@lgsporthorses.nl
    var endpoint = "https://formsubmit.co/ajax/info@lgsporthorses.nl";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = (form.elements["name"] || {}).value || "";
      var email = (form.elements["email"] || {}).value || "";
      var message = (form.elements["message"] || {}).value || "";
      var consent = form.elements["consent"];

      name = name.trim();
      email = email.trim();
      message = message.trim();

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !emailOk || !message) {
        showNote("Vul je naam, een geldig e-mailadres en een bericht in.", false);
        return;
      }
      if (consent && !consent.checked) {
        showNote("Geef even toestemming voor het verwerken van je gegevens.", false);
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var btnText = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Versturen…"; }

      var data = new FormData(form);
      data.append("_subject", "Nieuw bericht via website — " + name);
      data.append("_template", "table");
      data.append("_captcha", "false");

      fetch(endpoint, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: data
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && (res.success === "true" || res.success === true)) {
            showNote("Bedankt, " + name.split(" ")[0] +
              "! Je bericht is verstuurd. Lucy neemt zo snel mogelijk contact op.", true);
            form.reset();
          } else {
            throw new Error("submit failed");
          }
        })
        .catch(function () {
          showNote("Er ging iets mis bij het versturen. Probeer het later opnieuw, " +
            "of mail rechtstreeks naar info@lgsporthorses.nl.", false);
        })
        .then(function () {
          if (btn) { btn.disabled = false; btn.textContent = btnText; }
        });
    });
  }
})();
