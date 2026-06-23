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

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = (form.elements["name"] || {}).value || "";
      var email = (form.elements["email"] || {}).value || "";
      var message = (form.elements["message"] || {}).value || "";
      var phone = (form.elements["phone"] || {}).value || "";
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

      // Statische site: open de mailclient met een ingevuld bericht.
      var body =
        "Naam: " + name + "\n" +
        "E-mail: " + email + "\n" +
        (phone ? "Telefoon: " + phone.trim() + "\n" : "") +
        "\n" + message + "\n";

      var mailto =
        "mailto:info@lgsporthorses.nl" +
        "?subject=" + encodeURIComponent("Bericht via website — " + name) +
        "&body=" + encodeURIComponent(body);

      showNote("Bedankt, " + name.split(" ")[0] +
        "! Je mailprogramma wordt geopend om het bericht te versturen.", true);

      window.setTimeout(function () { window.location.href = mailto; }, 600);
      form.reset();
    });
  }
})();
