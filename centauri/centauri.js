const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const year = document.querySelector('#year');
const bgLayers = [...document.querySelectorAll('.centauri-bg')];
const chapters = [...document.querySelectorAll('.centauri-chapter[data-background]')];
const chapterLinks = [...document.querySelectorAll('.main-nav a[data-section]')];

if (year) year.textContent = new Date().getFullYear();

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 18);
}, { passive: true });

menuToggle?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});

mainNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Abrir menu');
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .10 });

document.querySelectorAll('.reveal').forEach(el => {
  el.classList.add('reveal-pending');
  revealObserver.observe(el);
});

function activateChapter(chapter) {
  if (!chapter) return;
  const background = chapter.dataset.background;
  const id = chapter.id;

  bgLayers.forEach(layer => {
    layer.classList.toggle('active', layer.dataset.bg === background);
  });

  chapterLinks.forEach(link => {
    const active = link.dataset.section === id;
    link.classList.toggle('active', active);
    if (active) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

const chapterObserver = new IntersectionObserver(entries => {
  const visible = entries
    .filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

  if (visible[0]) activateChapter(visible[0].target);
}, {
  rootMargin: '-28% 0px -52% 0px',
  threshold: [0, .05, .15, .3, .6]
});

chapters.forEach(chapter => chapterObserver.observe(chapter));

chapterLinks.forEach(link => {
  link.addEventListener('click', () => {
    const target = document.getElementById(link.dataset.section);
    activateChapter(target);
  });
});

activateChapter(document.getElementById('origem'));
