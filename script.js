
(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  /* -------------------------------------------------------
     1. Premium page loader
     Shows on first load and when navigating between pages.
  ------------------------------------------------------- */
  const loader = document.createElement("div");
  loader.id = "luxury-loader";
  loader.innerHTML = `
    <div class="loader-content">
      <div class="loader-mark"></div>
      <div class="loader-title">Student Career</div>
      <div class="loader-line"></div>
    </div>
  `;
  document.body.prepend(loader);

  const hideLoader = () => {
    setTimeout(() => loader.classList.add("is-hidden"), 420);
  };

  if (document.readyState === "complete") hideLoader();
  else window.addEventListener("load", hideLoader, { once:true });

  /* -------------------------------------------------------
     2. Scroll progress bar
  ------------------------------------------------------- */
  const progress = document.createElement("div");
  progress.id = "scroll-progress";
  document.body.appendChild(progress);

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${height > 0 ? (scrollTop / height) * 100 : 0}%`;
  };

  /* -------------------------------------------------------
     3. Navigation behavior
  ------------------------------------------------------- */
  const nav = $(".nav");
  const menu = $(".menu");
  const navLinks = $(".nav-links");

  if (menu && navLinks) {
    menu.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      menu.setAttribute("aria-expanded", navLinks.classList.contains("open"));
    });

    $$(".nav-links a").forEach(link => {
      link.addEventListener("click", () => navLinks.classList.remove("open"));
    });
  }

  const onScroll = () => {
    updateProgress();
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 15);
    const backTop = $("#back-top");
    if (backTop) backTop.classList.toggle("show", window.scrollY > 500);
  };

  window.addEventListener("scroll", onScroll, { passive:true });
  onScroll();

  /* -------------------------------------------------------
     4. Active page detection
  ------------------------------------------------------- */
  const currentPage = location.pathname.split("/").pop() || "index.html";
  $$(".nav-links a").forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPage) link.classList.add("active");
    if (currentPage === "" && href === "index.html") link.classList.add("active");
  });

  /* -------------------------------------------------------
     5. Smooth page transitions
  ------------------------------------------------------- */
  $$(".nav-links a, .btn").forEach(link => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("http")) return;

    link.addEventListener("click", event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();

      loader.classList.remove("is-hidden");
      setTimeout(() => {
        window.location.href = href;
      }, 330);
    });
  });

  /* -------------------------------------------------------
     6. Scroll reveal animation
  ------------------------------------------------------- */
  const revealTargets = [
    ".section-head", ".card", ".stat", ".step",
    ".dark-panel", ".quote", ".cta", ".hero-meta"
  ];

  revealTargets.forEach(selector => {
    $$(selector).forEach((element, index) => {
      element.classList.add("reveal");
      element.style.transitionDelay = `${Math.min(index * 55, 280)}ms`;
    });
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold:0.12 });

  $$(".reveal").forEach(el => revealObserver.observe(el));

  /* -------------------------------------------------------
     7. Back-to-top button
  ------------------------------------------------------- */
  const backTop = document.createElement("button");
  backTop.id = "back-top";
  backTop.type = "button";
  backTop.setAttribute("aria-label", "Back to top");
  backTop.innerHTML = "↑";
  document.body.appendChild(backTop);

  backTop.addEventListener("click", () => {
    window.scrollTo({ top:0, behavior:"smooth" });
  });

  /* -------------------------------------------------------
     8. Dynamic year
  ------------------------------------------------------- */
  $$("[data-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* -------------------------------------------------------
     9. Premium cursor glow on desktop
  ------------------------------------------------------- */
  if (window.matchMedia("(pointer:fine)").matches) {
    const glow = document.createElement("div");
    glow.id = "cursor-glow";
    document.body.appendChild(glow);

    let raf = null;
    let mouseX = -500;
    let mouseY = -500;

    window.addEventListener("mousemove", event => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          glow.style.left = `${mouseX}px`;
          glow.style.top = `${mouseY}px`;
          raf = null;
        });
      }
    }, { passive:true });
  }

  /* -------------------------------------------------------
     10. Button ripple effect
  ------------------------------------------------------- */
  $$(".btn").forEach(button => {
    button.addEventListener("click", event => {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.style.cssText = `
        position:absolute;
        width:10px;height:10px;border-radius:50%;
        background:rgba(255,255,255,.35);
        left:${event.clientX - rect.left - 5}px;
        top:${event.clientY - rect.top - 5}px;
        transform:scale(0);
        pointer-events:none;
      `;
      button.appendChild(ripple);
      ripple.animate(
        [{transform:"scale(0)",opacity:.8},{transform:"scale(25)",opacity:0}],
        {duration:600,easing:"ease-out"}
      ).onfinish = () => ripple.remove();
    });
  });

  /* -------------------------------------------------------
     11. Smart counters
  ------------------------------------------------------- */
  const counters = $$(".stat strong");

  const animateCounter = (element) => {
    const raw = element.textContent.trim();
    const match = raw.match(/^(\d+)(.*)$/);
    if (!match) return;

    const target = Number(match[1]);
    const suffix = match[2];
    const duration = 900;
    const start = performance.now();

    const tick = now => {
      const progressValue = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progressValue, 3);
      element.textContent = `${Math.floor(target * eased)}${suffix}`;
      if (progressValue < 1) requestAnimationFrame(tick);
      else element.textContent = raw;
    };

    requestAnimationFrame(tick);
  };

  if (counters.length) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, {threshold:.6});
    counters.forEach(counter => counterObserver.observe(counter));
  }

  /* -------------------------------------------------------
     12. Keyboard shortcut: Home / Escape
  ------------------------------------------------------- */
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && navLinks) navLinks.classList.remove("open");
    if (event.key.toLowerCase() === "h" && !event.ctrlKey && !event.metaKey) {
      window.scrollTo({top:0, behavior:"smooth"});
    }
  });

  /* -------------------------------------------------------
     13. Friendly first-visit toast
  ------------------------------------------------------- */
  if (!sessionStorage.getItem("studentCareerWelcome")) {
    const toast = document.createElement("div");
    toast.id = "luxury-toast";
    toast.textContent = "Welcome to Student Career — your journey starts here.";
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 1100);
    setTimeout(() => toast.classList.remove("show"), 4700);
    sessionStorage.setItem("studentCareerWelcome", "1");
  }

})();
