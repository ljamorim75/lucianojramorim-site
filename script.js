const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const year = document.querySelector("#year");

year.textContent = new Date().getFullYear();

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 18);
});

menuToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => {
  el.classList.add("reveal-pending");
  observer.observe(el);
});


// A seção que cruza 40% da tela determina o fundo, inclusive ao voltar a rolagem.
const sections = Array.from(document.querySelectorAll("main > section"));
const backgroundLayers = Array.from(document.querySelectorAll(".background-layer"));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let currentSection = null;
let heroBackground = "aurora";
let heroTimer = null;
let scrollFrame = null;

function showBackground(name) {
  backgroundLayers.forEach((layer) => {
    layer.classList.toggle("active", layer.dataset.background === name);
  });
}

function syncHeroTimer() {
  window.clearInterval(heroTimer);
  heroTimer = null;
  if (currentSection !== sections[0] || reducedMotion.matches || document.hidden) return;
  heroTimer = window.setInterval(() => {
    heroBackground = heroBackground === "aurora" ? "centauri" : "aurora";
    showBackground(heroBackground);
  }, 60000);
}

function updateBackground() {
  scrollFrame = null;
  const readingLine = window.innerHeight * 0.4;
  let nextSection = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= readingLine) nextSection = section;
  }
  if (nextSection === currentSection) return;
  currentSection = nextSection;
  showBackground(currentSection === sections[0] ? heroBackground : currentSection.id);
  syncHeroTimer();
}

function scheduleBackgroundUpdate() {
  if (scrollFrame === null) scrollFrame = window.requestAnimationFrame(updateBackground);
}

window.addEventListener("scroll", scheduleBackgroundUpdate, { passive: true });
window.addEventListener("resize", scheduleBackgroundUpdate);
window.addEventListener("pageshow", scheduleBackgroundUpdate);
document.addEventListener("visibilitychange", syncHeroTimer);
reducedMotion.addEventListener("change", syncHeroTimer);
updateBackground();
