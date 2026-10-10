const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');

if (menuButton && menu) {
  menuButton.addEventListener('click', () => {
    const isOpen =
      menuButton.getAttribute('aria-expanded') === 'true';

    menuButton.setAttribute(
      'aria-expanded',
      String(!isOpen)
    );

    menu.dataset.open = String(!isOpen);
  });

  menu.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuButton.setAttribute(
        'aria-expanded',
        'false'
      );

      menu.dataset.open = 'false';
    }
  });
}

const homeWorkLinks =
  document.querySelectorAll('[data-home-work]');

homeWorkLinks.forEach((homeWorkLink) => {
  homeWorkLink.addEventListener('click', (event) => {
    const isMobile =
      window.matchMedia(
        '(max-width: 47.99rem)'
      ).matches;

    const work =
      homeWorkLink.closest(
        '.home-work--available'
      );

    if (
      isMobile &&
      work &&
      !work.classList.contains('is-open')
    ) {
      event.preventDefault();
      work.classList.add('is-open');
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