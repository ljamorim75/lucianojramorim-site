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
  menu.dataset.enhanced = '';
  menuButton.dataset.ready = '';
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

homeWorkLinks.forEach((control) => {
  const work = control.closest('.home-work--available');
  if (!work) return;
  const isDisclosure = control instanceof HTMLButtonElement;
  const mobile = window.matchMedia('(max-width: 47.99rem)');
  function setExpanded(expanded) {
    work.classList.toggle('is-open', expanded);
    if (isDisclosure) control.setAttribute('aria-expanded', String(expanded));
  }
  if (isDisclosure) {
    control.addEventListener('click', () => setExpanded(!work.classList.contains('is-open')));
    control.addEventListener('keydown', event => {
      if (event.key === 'Escape') setExpanded(false);
    });
    // O clique controla os anúncios; foco e hover expandem apenas links de leitura.
    work.classList.add('home-work--disclosure');
  } else {
    control.addEventListener('click', event => {
      if (mobile.matches && !work.classList.contains('is-open')) {
        event.preventDefault();
        setExpanded(true);
      }
    });
  }
  work.addEventListener('focusout', event => {
    if (!work.contains(event.relatedTarget)) setExpanded(false);
  });
  mobile.addEventListener('change', () => setExpanded(false));
});

const analyticsHosts = new Set([
  'lucianojramorim.com.br',
  'www.lucianojramorim.com.br'
]);

let analyticsEnabled = false;
const consentKey = 'lja-analytics-consent-v1';
const consentBanner = document.querySelector('[data-consent-banner]');
function readConsent() {
  try { return localStorage.getItem(consentKey); } catch { return null; }
}
function startAnalytics() {
  if (analyticsEnabled || !analyticsHosts.has(location.hostname)) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-35T91X4MC3');
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-35T91X4MC3';
  document.head.appendChild(script);
  analyticsEnabled = true;
}
if (readConsent() === 'accepted') startAnalytics();
if (consentBanner && !['accepted', 'rejected'].includes(readConsent())) consentBanner.hidden = false;
document.querySelectorAll('[data-consent]').forEach(button => {
  button.addEventListener('click', () => {
    const choice = button.dataset.consent;
    try { localStorage.setItem(consentKey, choice); } catch { /* Vale apenas para esta visita. */ }
    consentBanner.hidden = true;
    if (choice === 'accepted') startAnalytics();
  });
});
document.querySelector('[data-privacy-settings]')?.addEventListener('click', () => {
  try { localStorage.removeItem(consentKey); } catch { /* Armazenamento indisponível. */ }
  window['ga-disable-G-35T91X4MC3'] = true;
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if (!/^_ga(?:_|$)/.test(name)) return;
    for (const domain of ['', location.hostname, '.lucianojramorim.com.br']) {
      document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '');
    }
  });
  location.reload();
});

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

const footerSocialEvents = {
  instagram: 'instagram_click',
  tiktok: 'tiktok_click',
  substack: 'substack_click'
};

const footerSocialLinks =
  document.querySelectorAll(
    '[data-footer-social]'
  );

footerSocialLinks.forEach((link) => {
  const eventName =
    footerSocialEvents[
      link.dataset.footerSocial
    ];

  if (!eventName) return;

  link.addEventListener('click', () => {
    sendAnalyticsEvent(
      eventName,
      {
        link_url: link.href,
        link_location: 'footer'
      }
    );
  });
});
