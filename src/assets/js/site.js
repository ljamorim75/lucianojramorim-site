const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');

if (menuButton && menu) {
  const desktopViewport = window.matchMedia('(min-width: 48rem)');

  function setMenuState(isOpen) {
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    menu.dataset.open = String(isOpen);
  }

  function openMenu() {
    setMenuState(true);
  }

  function closeMenu() {
    setMenuState(false);
  }

  function toggleMenu() {
    if (menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    } else {
      openMenu();
    }
  }

  closeMenu();
  menuButton.addEventListener('click', toggleMenu);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !desktopViewport.matches && menu.dataset.open === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });

  menu.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  desktopViewport.addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });
}

const homeWorkLinks =
  document.querySelectorAll('[data-home-work]');

homeWorkLinks.forEach((homeWorkLink) => {
  const mobileViewport = window.matchMedia('(max-width: 47.99rem)');
  const work = homeWorkLink.closest('.home-work--available');

  function updateExpandedState() {
    if (!homeWorkLink.hasAttribute('aria-expanded')) return;

    const isExpanded = document.activeElement === homeWorkLink ||
      (mobileViewport.matches && work?.classList.contains('is-open'));
    homeWorkLink.setAttribute('aria-expanded', String(Boolean(isExpanded)));
  }

  if (homeWorkLink.hasAttribute('aria-expanded')) {
    homeWorkLink.addEventListener('focus', updateExpandedState);
    homeWorkLink.addEventListener('blur', updateExpandedState);
    mobileViewport.addEventListener('change', updateExpandedState);
  }

  homeWorkLink.addEventListener('click', (event) => {
    const isMobile = mobileViewport.matches;

    if (
      isMobile &&
      work &&
      !work.classList.contains('is-open')
    ) {
      event.preventDefault();
      work.classList.add('is-open');
      updateExpandedState();
    }
  });
});

const progress =
  document.querySelector(
    '[data-reading-progress]'
  );

const readingContent =
  document.querySelector(
    '[data-reading-content]'
  );

if (progress && readingContent) {
  const updateProgress = () => {
    const start =
      readingContent.offsetTop;

    const distance =
      readingContent.offsetHeight -
      window.innerHeight;

    const amount =
      distance > 0
        ? (window.scrollY - start) / distance
        : 0;

    progress.style.setProperty(
      '--reading-progress',
      `${
        Math.min(
          1,
          Math.max(0, amount)
        ) * 100
      }%`
    );
  };

  document.addEventListener(
    'scroll',
    updateProgress,
    { passive: true }
  );

  window.addEventListener(
    'resize',
    updateProgress
  );

  updateProgress();
}

const sizeButtons =
  document.querySelectorAll(
    '[data-font-size]'
  );

const article =
  document.querySelector(
    '[data-reading-content]'
  );

sizeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!article) return;

    article.dataset.fontSize =
      button.dataset.fontSize;

    sizeButtons.forEach((item) => {
      item.setAttribute(
        'aria-pressed',
        String(item === button)
      );
    });
  });
});
