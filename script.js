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
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
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

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));


// Alterna Nova Aurora e Centauri no fundo da abertura a cada 60 segundos.
const heroSlides = Array.from(document.querySelectorAll(".hero-bg"));
let activeHeroSlide = 0;

if (heroSlides.length > 1) {
  window.setInterval(() => {
    heroSlides[activeHeroSlide].classList.remove("active");
    activeHeroSlide = (activeHeroSlide + 1) % heroSlides.length;
    heroSlides[activeHeroSlide].classList.add("active");
  }, 60000);
}
