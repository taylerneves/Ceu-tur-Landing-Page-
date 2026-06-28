/* ============================================================
   CÉU TUR – script.js
   ============================================================ */
(function () {
    "use strict";

    /* ── Referências ─────────────────────────────── */
    const planeHero = document.getElementById("planeHero");
    const navbar = document.getElementById("navbar");
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobileMenu");
    const hero = document.getElementById("hero");
    const heroBrand = document.getElementById("heroBrand");
    const contactForm = document.getElementById("contactForm");
    const destinationInput = document.getElementById("destinationInput");
    const travelTypeSelect = document.getElementById("typeSelect");
    const serviceSelect = document.getElementById("serviceSelect");
    const requestTypeInput = document.getElementById("requestTypeInput");
    const messageTextarea = document.getElementById("messageInput");

    const toggleButtons = document.querySelectorAll(".toggle-btn");
    const viagemGroup = document.querySelector(".viagem-group");
    const servicoGroup = document.querySelector(".servico-group");
    const servicesGrid = document.querySelector(".services-grid");

    /* ── Estado ──────────────────────────────────── */
    let navVisible = false;
    let planeTarget = 0;
    let planeProgress = 0;
    let planeRaf = null;
    let servicesScrollRaf = null;
    let servicesScrollPaused = false;
    let servicesScrollPosition = 0;

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
        // Removendo o "- 18", o cálculo começa em 0 no topo da página
        planeTarget = clamp(scrollY / distance, 0, 1);

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

        // SE O PROGRESSO FOR MUITO BAIXO (TOPO DA PÁGINA)
        // Usamos "none" para que o CSS (posicionamento original) prevaleça
        if (progress < 0.001) {
            planeHero.classList.remove("plane-in-flight");
            planeHero.style.transform = "none"; 
            planeHero.style.opacity = "1";
            planeHero.style.visibility = "visible";
            
            if (heroBrand) {
                heroBrand.style.opacity = "1";
            }
            return;
        }

        // SE TIVER SCROLL, SEGUE A LÓGICA DE ANIMAÇÃO RELATIVA
        const t = smoothstep(progress);
        const wave = Math.sin(t * Math.PI);
        
        // Ajuste estes valores para controlar a trajetória de saída
        const x = 50 * t;         // Move para a esquerda conforme desce
        const y = 70 * t;         // Move para cima conforme desce
        const rotate = 15 * t;    // Inclinação suave
        const scale = 1 - (0.3 * t); 
        const opacity = clamp(1 - (t * 4));

        planeHero.classList.add("plane-in-flight");
        planeHero.style.visibility = "visible";
        
        // O translate abaixo move o elemento A PARTIR da posição original do CSS
        planeHero.style.transform = `translate(${x}vw, ${y}vh) rotate(${rotate}deg) scale(${scale})`;
        planeHero.style.opacity = opacity;

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

    const destCards = document.querySelectorAll(".dest-card");
    const destOptionsContainer = document.querySelector(".cards-grid");

    revealEls.forEach((el, i) => {
        el.style.transitionDelay = (i % 4) * 90 + "ms";
    });

    destCards.forEach((card) => {
        card.addEventListener("click", (event) => {
            if (event.target.closest(".dest-option-btn")) {
                return;
            }
            toggleDestCard(card);
        });

        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                if (event.target.closest(".dest-option-btn")) {
                    return;
                }
                event.preventDefault();
                toggleDestCard(card);
            }
        });
    });

    destOptionsContainer.addEventListener("click", (event) => {
        const button = event.target.closest(".dest-option-btn");
        if (!button) {
            return;
        }
        event.stopPropagation();
        const destination = button.dataset.destination;
        const category = button.dataset.category;
        fillContactFormDestination(destination, category);
    });

    toggleButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const requestType = button.dataset.requestType;
            setRequestType(requestType);
        });
    });

    function setRequestType(requestType) {
        toggleButtons.forEach((button) => {
            button.classList.toggle("active", button.dataset.requestType === requestType);
        });
        if (requestTypeInput) {
            requestTypeInput.value = requestType;
        }
        if (viagemGroup && servicoGroup) {
            viagemGroup.classList.toggle("hidden", requestType !== "viagem");
            servicoGroup.classList.toggle("hidden", requestType !== "servico");
        }
        if (requestType === "viagem") {
            destinationInput?.focus();
        } else {
            serviceSelect?.focus();
        }
    }

    let activeDestCard = null;

    function closeAllDestCards() {
        destCards.forEach((card) => {
            card.classList.remove("active");
            card.setAttribute("aria-expanded", "false");
            const options = card.querySelector(".dest-options");
            if (options) {
                options.setAttribute("aria-hidden", "true");
                options.style.display = "none";
            }
        });
        activeDestCard = null;
    }

    function openDestCard(card) {
        const options = card.querySelector(".dest-options");
        if (!options) return;

        card.classList.add("active");
        card.setAttribute("aria-expanded", "true");
        options.setAttribute("aria-hidden", "false");
        options.style.display = "block";
        activeDestCard = card;
    }

    function toggleDestCard(card) {
        const isActive = card === activeDestCard;
        if (isActive) {
            closeAllDestCards();
            return;
        }
        closeAllDestCards();
        openDestCard(card);
    }

    function fillContactFormDestination(destination, category) {
        setRequestType("viagem");
        if (destinationInput) {
            destinationInput.value = destination;
        }
        if (travelTypeSelect && category) {
            const validValue = Array.from(travelTypeSelect.options).find((option) => option.value === category);
            if (validValue) {
                travelTypeSelect.value = category;
            }
        }
        if (messageTextarea) {
            messageTextarea.value = `Olá, gostaria de receber mais informações sobre o destino ${destination}.`;
        }
        if (contactForm) {
            contactForm.scrollIntoView({ behavior: "smooth", block: "center" });
            contactForm.classList.add("form-highlight");
            setTimeout(() => contactForm.classList.remove("form-highlight"), 1800);
        }
    }

    function revealElements() {
        const trigger = window.innerHeight * 0.88;
        revealEls.forEach(el => {
            if (el.getBoundingClientRect().top < trigger) {
                el.classList.add("visible");
            }
        });
    }
    const servicesTrack = document.querySelector(".services-track");

    window.addEventListener("load", () => {
        updatePlaneTarget(window.scrollY);
        duplicateServiceTrack();
    });

    function duplicateServiceTrack() {
        if (!servicesTrack) return;

        // Remove clones antigos (caso exista algum por recarregamento parcial)
        servicesTrack.querySelectorAll(".service-item.cloned").forEach((n) => n.remove());

        const items = Array.from(servicesTrack.querySelectorAll(".service-item"));
        if (items.length === 0) return;

        // Para ficar com “cara” de infinito contínuo, duplicamos a lista inteira.
        // A animação em CSS move -50% assumindo que o conteúdo duplicado permite o loop.
        // Assim, quando terminar a primeira metade, começa a mesma sequência novamente.
        const fragment = document.createDocumentFragment();
        items.forEach((item) => {
            const clone = item.cloneNode(true);
            clone.classList.add("cloned");
            fragment.appendChild(clone);
        });
        servicesTrack.appendChild(fragment);
    }

    if (servicesTrack) {
        servicesTrack.addEventListener("mouseenter", () => {
            servicesTrack.style.animationPlayState = "paused";
        });
        servicesTrack.addEventListener("mouseleave", () => {
            servicesTrack.style.animationPlayState = "running";
        });
        servicesTrack.addEventListener("touchstart", () => {
            servicesTrack.style.animationPlayState = "paused";
        }, { passive: true });
        servicesTrack.addEventListener("touchend", () => {
            servicesTrack.style.animationPlayState = "running";
        });
    }

    /* ================================================================
       MENU MOBILE
       ================================================================ */
    hamburger.addEventListener("click", () => {
        mobileMenu.classList.toggle("open");
        const [s0, s1, s2] = hamburger.querySelectorAll("span");
        if (mobileMenu.classList.contains("open")) {
            s0.style.transform = "rotate(45deg) translate(5px,5px)";
            s1.style.opacity = "0";
            s2.style.transform = "rotate(-45deg) translate(5px,-5px)";
        } else {
            s0.style.transform = s2.style.transform = "";
            s1.style.opacity = "";
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
            const nome = contactForm.querySelector("input[name='nome']").value.trim();
            const email = contactForm.querySelector("input[name='email']").value.trim();
            const requestType = contactForm.querySelector("input[name='requestType']").value;
            const destino = contactForm.querySelector("input[name='destino']").value.trim() || "não informado";
            const tipo = contactForm.querySelector("select[name='tipo']").value.trim() || "não informado";
            const servico = contactForm.querySelector("select[name='servico']").value.trim() || "não informado";
            const descricao = contactForm.querySelector("textarea[name='descricao']").value.trim();

            function buildTravelMessage() {
                const artigos = {
                    "Praia": "um pacote de praia",
                    "Internacional": "uma viagem internacional",
                    "Cruzeiro": "um cruzeiro",
                    "Lua de Mel": "um pacote de lua de mel",
                    "Família": "um pacote para família",
                };
                const tipoTexto = artigos[tipo] || `uma viagem do tipo "${tipo}"`;
                let travelMsg = `Olá Céu Tur, eu me chamo *${nome}* e quero saber mais sobre a viagem para *${destino}*.`;
                travelMsg += `\n\nEstou interessado em ${tipoTexto}.`;
                return travelMsg;
            }

            function buildServiceMessage() {
                let serviceMsg = `Olá Céu Tur, eu me chamo *${nome}* e gostaria de contratar o serviço *${servico}*.`;
                if (destino) {
                    serviceMsg += `\n\nSe necessário, o destino ou local preferido é *${destino}*.`;
                }
                return serviceMsg;
            }

            let msg;
            if (requestType === "servico") {
                msg = buildServiceMessage();
            } else {
                msg = buildTravelMessage();
            }

            if (descricao) {
                msg += `\n\nVou explicar melhor... ${descricao}`;
            }
            if (email) {
                msg += `\n\n📧 Meu e-mail para contato: ${email}`;
            }

            const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
            window.open(url, "_blank");

            /* feedback visual no botão */
            const btn = contactForm.querySelector(".btn-primary");
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
