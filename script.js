/* ============================================================
   CÉU TUR – script.js
   ============================================================ */
(function () {
  "use strict";

  /* ── Referências ─────────────────────────────── */
  const planeHero    = document.getElementById("planeHero");
  const navbar       = document.getElementById("navbar");
  const hamburger    = document.getElementById("hamburger");
  const mobileMenu   = document.getElementById("mobileMenu");
  const hero         = document.getElementById("hero");
  const heroBrand    = document.getElementById("heroBrand");
  const contactForm  = document.getElementById("contactForm");

  /* ── Estado ──────────────────────────────────── */
  let navVisible    = false;
  let planeTarget   = 0;
  let planeProgress = 0;
  let planeRaf      = null;

  /* ================================================================
     SCROLL PRINCIPAL
     ================================================================ */
  function onScroll() {
    const scrollY = window.scrollY;

    updatePlaneTarget(scrollY);

    /* 2 – navbar */
    const heroBottom = hero.getBoundingClientRect().bottom;
    if (heroBottom < 60 && !navVisible) {
      navVisible = true;
      navbar.classList.add("visible");
    } else if (heroBottom >= 60 && navVisible) {
      navVisible = false;
      navbar.classList.remove("visible");
      mobileMenu.classList.remove("open");
    }

    /* 3 – scroll reveal */
    revealElements();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => updatePlaneTarget(window.scrollY));

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function smoothstep(t) {
    return t * t * (3 - 2 * t);
  }

  function updatePlaneTarget(scrollY) {
    const distance = Math.max(520, window.innerHeight * 0.86);
    planeTarget = clamp((scrollY - 18) / distance, 0, 1);

    if (!planeRaf) {
      planeRaf = requestAnimationFrame(animatePlane);
    }
  }

  function animatePlane() {
    planeProgress += (planeTarget - planeProgress) * 0.11;

    if (Math.abs(planeTarget - planeProgress) < 0.001) {
      planeProgress = planeTarget;
    }

    renderPlane(planeProgress);

    if (planeProgress !== planeTarget) {
      planeRaf = requestAnimationFrame(animatePlane);
    } else {
      planeRaf = null;
    }
  }

  function renderPlane(progress) {
    if (!planeHero) return;

    const t = smoothstep(progress);
    const wave = Math.sin(t * Math.PI);
    const x = (72 * t) - (10 * wave);
    const y = (-7 * wave) + (84 * t * t);
    const rotate = -4 + (50 * t) + (5 * wave);
    const scale = 1 - (0.48 * t);
    const opacity = clamp(1 - Math.max(0, t - 0.78) * 4.5, 0, 1);

    if (progress > 0.002) {
      planeHero.classList.add("plane-in-flight");
      planeHero.style.visibility = "visible";
      planeHero.style.transform =
        `translate(calc(-50% + ${x}vw), ${y}vh) rotate(${rotate}deg) scale(${scale})`;
      planeHero.style.opacity = opacity;
    } else {
      planeHero.classList.remove("plane-in-flight");
      planeHero.style.transform = "";
      planeHero.style.opacity = "";
      planeHero.style.visibility = "";
    }

    if (heroBrand) {
      heroBrand.style.transition = "opacity .18s linear";
      heroBrand.style.opacity = String(clamp(1 - t * 1.35, 0, 1));
    }
  }

  /* ================================================================
     SCROLL REVEAL
     ================================================================ */
  const revealEls = document.querySelectorAll(
    ".dest-card, .service-item, .contato-info, .contato-form, .sobre-text, .sobre-badge"
  );

  revealEls.forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 90 + "ms";
  });

  function revealElements() {
    const trigger = window.innerHeight * 0.88;
    revealEls.forEach(el => {
      if (el.getBoundingClientRect().top < trigger) {
        el.classList.add("visible");
      }
    });
  }
  onScroll();

  /* ================================================================
     MENU MOBILE
     ================================================================ */
  hamburger.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
    const [s0, s1, s2] = hamburger.querySelectorAll("span");
    if (mobileMenu.classList.contains("open")) {
      s0.style.transform = "rotate(45deg) translate(5px,5px)";
      s1.style.opacity   = "0";
      s2.style.transform = "rotate(-45deg) translate(5px,-5px)";
    } else {
      s0.style.transform = s2.style.transform = "";
      s1.style.opacity   = "";
    }
  });

  mobileMenu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      hamburger.querySelectorAll("span").forEach(s => {
        s.style.transform = s.style.opacity = "";
      });
    });
  });

  /* ================================================================
     PARALLAX SUAVE NAS NUVENS
     ================================================================ */
  const clouds = document.querySelectorAll(".cloud-svg");
  function parallaxClouds() {
    const sy = window.scrollY;
    if (sy < window.innerHeight) {
      clouds.forEach((c, i) => {
        c.style.transform = `translateY(${sy * (0.1 + i * 0.05)}px)`;
      });
    }
  }
  window.addEventListener("scroll", parallaxClouds, { passive: true });

  /* ================================================================
     FORMULÁRIO → WHATSAPP
     Número: 55 69 98410-7044
     ================================================================ */
  const WHATSAPP_NUMBER = "5569984107044";

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      /* coleta campos */
      const fields   = contactForm.querySelectorAll("input, select, textarea");
      const nome     = fields[0].value.trim();
      const email    = fields[1].value.trim();
      const tipo     = fields[2].value.trim() || "não informado";
      const descricao = fields[3].value.trim();

      /* artigo de acordo com o tipo de viagem */
      const artigos = {
        "Praia":         "um pacote de praia",
        "Internacional": "uma viagem internacional",
        "Cruzeiro":      "um cruzeiro",
        "Lua de Mel":    "um pacote de lua de mel",
        "Família":       "um pacote para família",
      };
      const tipoTexto = artigos[tipo] || `uma viagem do tipo "${tipo}"`;

      /* monta mensagem humanizada */
      let msg = `Olá Céu Tur, eu me chamo *${nome}* e vim pelo site de vocês, poderia me ajudar a encontrar ${tipoTexto}?`;

      if (descricao) {
        msg += `\n\nVou explicar melhor... ${descricao}`;
      }

      if (email) {
        msg += `\n\n📧 Meu e-mail para contato: ${email}`;
      }

      /* abre WhatsApp */
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");

      /* feedback visual no botão */
      const btn  = contactForm.querySelector(".btn-primary");
      const orig = btn.innerHTML;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" style="vertical-align:middle;margin-right:6px" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="20 6 9 17 4 12" stroke="#071e52" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Abrindo WhatsApp...`;
      btn.style.background = "#25d366";
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = "";
        btn.disabled = false;
        contactForm.reset();
      }, 3500);
    });
  }

})();
