// Dented Crown Games — small progressive enhancements. Everything works without JS.
(() => {
  document.documentElement.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header border once the page scrolls
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile navigation
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  // Reveal on scroll
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  // Toast helper
  let toastTimer;
  const toast = (msg) => {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(() => el.classList.add("is-visible"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 3200);
  };

  // Easter egg: bonk the crown. Five bonks and the Mafia notices.
  let bonks = 0;
  document.querySelectorAll(".crown").forEach((crown) => {
    const bonk = () => {
      crown.classList.remove("is-bonked");
      void crown.offsetWidth; // restart animation
      crown.classList.add("is-bonked");
      bonks += 1;
      if (bonks === 5) toast("The Mafia would like a word.");
      if (bonks === 12) toast("Okay, that one’s definitely dented now.");
    };
    crown.addEventListener("click", (e) => {
      if (crown.closest("a")) return; // let logo links navigate
      e.preventDefault();
      bonk();
    });
    crown.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); bonk(); }
    });
  });

  // Decorative debt counter on the All in Debt! page
  const debt = document.querySelector("[data-debt]");
  if (debt) {
    const target = Number(debt.dataset.debt);
    const bar = document.querySelector(".debt-bar span");
    const fmt = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
    const show = (v) => { debt.textContent = fmt.format(v); };
    if (reduceMotion || !("IntersectionObserver" in window)) {
      show(target);
      if (bar) bar.style.width = "100%";
      return;
    }
    show(0);
    const run = () => {
      const start = performance.now();
      const dur = 1800;
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 4);
        show(Math.round(target * eased));
        if (bar) bar.style.width = `${eased * 100}%`;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { run(); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(debt);
  }
})();
