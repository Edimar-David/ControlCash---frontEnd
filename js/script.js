/**
 * script.js
 * ─────────────────────────────────────────────────────────────
 * Navbar scroll effect, mobile menu toggle, scroll reveal.
 * Updated to match refactored class names.
 * ─────────────────────────────────────────────────────────────
 */

const navbar       = document.getElementById("navbar");
const mobileToggle = document.getElementById("mobileToggle");
const mobileMenu   = document.getElementById("mobileMenu");

/* ── Navbar: add .scrolled class after 20px scroll ── */
window.addEventListener("scroll", () => {
  navbar?.classList.toggle("scrolled", window.scrollY > 20);
});

/* ── Mobile menu: toggle visibility + aria-expanded ── */
mobileToggle?.addEventListener("click", () => {
  const isOpen = mobileMenu?.classList.toggle("active");
  mobileToggle.setAttribute("aria-expanded", String(isOpen));
});

/* ── Mobile menu: close on link click ── */
mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
    mobileToggle?.setAttribute("aria-expanded", "false");
  });
});

/* ── Scroll reveal: IntersectionObserver ── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".reveal").forEach((el) => {
  revealObserver.observe(el);
});