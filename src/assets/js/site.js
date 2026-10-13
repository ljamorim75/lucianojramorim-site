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

const analyticsHosts = new Set([
  'lucianojramorim.com.br',
  'www.lucianojramorim.com.br'
]);

const analyticsEnabled =
  analyticsHosts.has(window.location.hostname) &&
  typeof window.gtag === 'function';

function sendAnalyticsEvent(eventName, eventParameters = {}) {
  if (!analyticsEnabled) return false;

  window.gtag(
    'event',
    eventName,
    eventParameters
  );

  return true;
}

const progress =
  document.querySelector(
    '[data-reading-progress]'
  );

const readingContent =
  document.querySelector(
    '[data-reading-content]'
  );

if (readingContent) {
  const storyParameters = {
    story_slug:
      readingContent.dataset.storySlug || '',
    story_title:
      readingContent.dataset.storyTitle || ''
  };

  const hasStoryParameters =
    Boolean(
      storyParameters.story_slug &&
      storyParameters.story_title
    );

  const sentReadingEvents = new Set();

  const sendReadingEventOnce = (eventName) => {
    if (
      !hasStoryParameters ||
      sentReadingEvents.has(eventName)
    ) {
      return;
    }

    if (
      sendAnalyticsEvent(
        eventName,
        storyParameters
      )
    ) {
      sentReadingEvents.add(eventName);
    }
  };

  const readingMilestones = [
    [0.5, 'story_50_percent'],
    [0.75, 'story_75_percent'],
    [0.9, 'story_90_percent']
  ];

  const readingEndElement =
    readingContent.lastElementChild;

  const updateReadingExperience = () => {
    if (progress) {
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
    }

    if (!analyticsEnabled) return;

    const readingBounds =
      readingContent.getBoundingClientRect();

    const readingEnd =
      readingEndElement
        ?.getBoundingClientRect().bottom ??
      readingBounds.bottom;

    if (
      readingBounds.top <=
        window.innerHeight * 0.75 &&
      readingEnd > 0
    ) {
      sendReadingEventOnce('start_reading');
    }

    if (
      !sentReadingEvents.has('start_reading')
    ) {
      return;
    }

    const readingHeight =
      Math.max(
        0,
        readingEnd - readingBounds.top
      );

    const readingAmount =
      readingHeight > 0
        ? Math.min(
            1,
            Math.max(
              0,
              (
                window.innerHeight -
                readingBounds.top
              ) /
              readingHeight
            )
          )
        : 0;

    readingMilestones.forEach(
      ([threshold, eventName]) => {
        if (readingAmount >= threshold) {
          sendReadingEventOnce(eventName);
        }
      }
    );

    if (
      readingHeight > 0 &&
      readingEnd <=
        window.innerHeight + 1
    ) {
      sendReadingEventOnce('story_complete');
    }
  };

  let readingUpdateScheduled = false;

  const scheduleReadingUpdate = () => {
    if (readingUpdateScheduled) return;

    readingUpdateScheduled = true;

    window.requestAnimationFrame(() => {
      readingUpdateScheduled = false;
      updateReadingExperience();
    });
  };

  const startReadingLink =
    document.querySelector(
      'a[href="#inicio-leitura"]'
    );

  startReadingLink?.addEventListener(
    'click',
    () => sendReadingEventOnce('start_reading')
  );

  document.addEventListener(
    'scroll',
    scheduleReadingUpdate,
    { passive: true }
  );

  window.addEventListener(
    'resize',
    scheduleReadingUpdate
  );

  scheduleReadingUpdate();
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

const instagramLinks =
  document.querySelectorAll(
    '.footer-instagram[href="https://www.instagram.com/l.j.amorim/"]'
  );

instagramLinks.forEach((link) => {
  link.addEventListener('click', () => {
    sendAnalyticsEvent(
      'instagram_click',
      {
        link_url: link.href,
        link_location: 'footer'
      }
    );
  });
});
