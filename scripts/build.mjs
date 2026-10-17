import { validateWorks, validateShelf, escapeHtml, jsonForScript } from './site-utils.mjs';
import { optimizeImages } from './optimize-images.mjs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const domain = 'https://lucianojramorim.com.br';
const isProduction = process.argv.includes('--prod');

const allWorks = JSON.parse(
  await readFile(
    path.join(src, 'data', 'textos.json'),
    'utf8'
  )
);

validateWorks(allWorks, src);

const visibleWorks = isProduction
  ? allWorks.filter(
      (work) => work.status === 'em_breve' || work.status === 'publicado'
    )
  : allWorks;

const pageWorks = isProduction
  ? allWorks.filter((work) => work.status === 'publicado')
  : allWorks.filter((work) => existsSync(path.join(src, 'content', 'textos', work.arquivoConteudo)));

await rm(
  dist,
  {
    recursive: true,
    force: true
  }
);

await mkdir(
  dist,
  {
    recursive: true
  }
);

await cp(
  path.join(src, 'assets'),
  path.join(dist, 'assets'),
  {
    recursive: true
  }
);

const images = await optimizeImages({ src, dist, works: allWorks });

function workImage(work, className = '', loading = 'lazy') {
  if (!work.imagem) return '';
  const image = images[work.imagem];
  return `<img class="${className}" src="${image.src}" srcset="${image.srcset}" sizes="(max-width: 47.99rem) 100vw, 60vw" width="${image.width}" height="${image.height}" alt="" loading="${loading}" decoding="async">`;
}

const hasEmblem = existsSync(
  path.join(
    src,
    'assets',
    'img',
    'lja-emblema.png'
  )
);

const emblem = (className = 'brand-mark') =>
  hasEmblem
    ? `<img class="${className}" src="/assets/img/lja-emblema.png" alt="Emblema LJA" width="320" height="320">`
    : `<span class="${
        className === 'hero-mark'
          ? 'hero-placeholder'
          : 'brand-placeholder'
      }" aria-label="Espaço reservado para o emblema LJA">LJA</span>`;

const navItems = [
  ['inicio', '/', 'Início'],
  ['textos', '/textos/', 'Textos'],
  ['autor', '/autor/', 'Autor'],
  ['contato', '/contato/', 'Contato']
];

function escapeHtmlAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function footerCopyright() {
  return `<span class="footer-copyright-text">© Luciano Jr Amorim. Todos os direitos reservados.</span>`;
}

function footerSocialLinks() {
  return `<nav class="footer-social-links" aria-label="Redes sociais">
    <a class="footer-social-link footer-instagram" href="https://www.instagram.com/l.j.amorim/" target="_blank" rel="noopener noreferrer" aria-label="Instagram de Luciano Jr Amorim" data-footer-social="instagram">
      <svg class="footer-social-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="18" height="18" rx="5"></rect>
        <circle cx="12" cy="12" r="4"></circle>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle>
      </svg>
    </a>

    <a class="footer-social-link footer-tiktok" href="https://www.tiktok.com/@l.j.amorim" target="_blank" rel="noopener noreferrer" aria-label="TikTok de Luciano Jr Amorim" data-footer-social="tiktok">
      <svg class="footer-social-icon" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M19.59 6.686a4.793 4.793 0 0 1-3.771-4.245h-3.512v14.124a2.914 2.914 0 1 1-2.057-2.784V10.2a6.425 6.425 0 1 0 5.568 6.365V9.404a8.301 8.301 0 0 0 4.773 1.526V7.414a4.807 4.807 0 0 1-1.001-.728Z"></path>
      </svg>
    </a>

    <a class="footer-social-link footer-substack" href="https://substack.com/@ljamorim" target="_blank" rel="noopener noreferrer" aria-label="Substack de Luciano Jr Amorim" data-footer-social="substack">
      <svg class="footer-social-icon" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M1.46 0h21.08v2.836H1.46V0Zm0 5.406h21.08v2.836H1.46V5.406Zm0 5.406h21.08v2.836H1.46v-2.836Zm0 5.405h21.08V24L12 18.11 1.46 24v-7.783Z"></path>
      </svg>
    </a>
  </nav>`;
}

function footerLower(className = '') {
  return `<div class="footer-lower${className ? ` ${className}` : ''}">
    ${footerCopyright()}
    ${footerSocialLinks()}
    <a class="privacy-link" href="/privacidade/">Privacidade</a>
  </div>`;
}

function layout({
  title,
  description,
  route,
  current,
  content,
  schema = '',
  showFooter = true,
  socialImage = '/assets/img/og-site.png',
  socialImageAlt = '',
  canonical: includeCanonical = true,
  robots = '',
  social = true,
  socialType = 'website'
}) {
  const canonical = `${domain}${route}`;
  const isHome = current === 'inicio';

  const socialImageUrl = socialImage
    ? `${domain}${images[socialImage]?.social || socialImage}`
    : '';

  const socialAlt = socialImageAlt || title;

  const nav = navItems
    .map(
      ([key, href, label]) =>
        `<a href="${href}"${
          current === key
            ? ' aria-current="page"'
            : ''
        }>${label}</a>`
    )
    .join('');

  const footer = !showFooter
    ? ''
    : isHome
      ? `  <footer class="home-footer">${footerLower('shell')}</footer>`
      : `  <footer class="site-footer">
    <div class="shell footer-grid">
      <div class="footer-title">Luciano Jr Amorim</div>

      <nav class="footer-links" aria-label="Navegação do rodapé">
        <a href="/textos/">Textos</a>
        <a href="/autor/">Autor</a>
        <a href="/contato/">Contato</a>
      </nav>

      ${footerLower('footer-copy')}
    </div>
  </footer>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>${escapeHtml(title)}</title>

  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#070708">

  ${includeCanonical ? `<link rel="canonical" href="${canonical}">` : ''}
  ${robots ? `<meta name="robots" content="${robots}">` : ''}

  <link
    rel="icon"
    type="image/png"
    sizes="32x32"
    href="/assets/img/favicon-lja-32.png"
  >

  <link
    rel="icon"
    type="image/png"
    sizes="16x16"
    href="/assets/img/favicon-lja-16.png"
  >

  ${social ? `<meta property="og:type" content="${socialType}">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="Luciano Jr Amorim">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">

  ${socialImageUrl ? `<meta property="og:image" content="${socialImageUrl}">
  <meta property="og:image:alt" content="${escapeHtml(socialAlt)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">` : ''}

  <meta name="twitter:card" content="${socialImageUrl ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">

  ${socialImageUrl ? `<meta name="twitter:image" content="${socialImageUrl}">
  <meta name="twitter:image:alt" content="${escapeHtml(socialAlt)}">` : ''}` : ''}

  <link rel="stylesheet" href="/assets/css/site.css">

  ${schema}
</head>

<body${isHome ? ' class="home-page"' : route === '/autor/' ? ' class="author-shell"' : route === '/contato/' ? ' class="contact-shell"' : route === '/textos/' ? ' class="texts-shell"' : ''}>
  <a class="skip-link" href="#conteudo">
    Pular para o conteúdo
  </a>

  <header class="site-header">
    <div class="shell header-inner">
      <a
        class="brand"
        href="/"
        aria-label="Luciano Jr Amorim — Início"
      >
        ${emblem()}
        <span>Luciano Jr Amorim</span>
      </a>

      <button
        class="menu-button"
        type="button"
        aria-label="Abrir menu"
        aria-expanded="false"
        aria-controls="menu-principal"
        data-menu-button
      ></button>

      <nav
        class="site-nav"
        id="menu-principal"
        aria-label="Navegação principal"
        data-menu
        data-open="false"
      >
        ${nav}
      </nav>
    </div>
  </header>

  <main id="conteudo">${content}</main>

${footer}

  <section class="consent-banner" aria-label="Preferências de privacidade" data-consent-banner hidden>
    <p>Com sua autorização, usamos o Google Analytics para entender visitas e leitura. <a href="/privacidade/">Saiba mais</a>.</p>
    <button type="button" data-consent="accepted">Aceitar análise</button>
    <button type="button" data-consent="rejected">Recusar</button>
  </section>
  <script type="module" src="/assets/js/site.js"></script>
</body>
</html>`;
}

async function writePage(route, html) {
  const target =
    route === '/'
      ? dist
      : path.join(dist, route);

  await mkdir(
    target,
    {
      recursive: true
    }
  );

  await writeFile(
    path.join(
      target,
      'index.html'
    ),
    html,
    'utf8'
  );
}

const personSchema =
  `<script type="application/ld+json">${jsonForScript({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Luciano Jr Amorim',
    url: domain
  })}</script>`;

/*
 * HOME
 *
 * A configuração editorial da estante é independente da publicação.
 */

const shelf = JSON.parse(await readFile(path.join(src, 'data', 'home-shelf.json'), 'utf8'));
validateShelf(shelf);
const pageSlugs = new Set(pageWorks.map(work => work.slug));
const homeSlots = shelf.map((spine) => {
  const work = visibleWorks.find((item) => item.slug === spine.slug);
  return work
    ? { ...work, ...spine }
    : { ...spine, status: 'em_breve', homePlaceholder: true };
});

const homeItems = homeSlots
  .map(
    (work, index) => {
      const universeLines = work.universoLinhas;

      const media =
        work.imagem
          ? `<span
              class="home-work-media"
              aria-hidden="true"
            >
              ${workImage(work, '', index === 0 ? 'eager' : 'lazy')}
            </span>`
          : '';

      const isUpcoming = work.homePlaceholder || (work.status === 'em_breve' && (isProduction || !pageSlugs.has(work.slug)));
      const tag = isUpcoming ? 'button' : 'a';

      return `<li class="home-work home-work--available${work.homePlaceholder ? ' home-work--future' : ''}">
        <${tag}
          class="home-work-link"
          ${isUpcoming ? `type="button" aria-label="${escapeHtml(work.titulo)} — em breve" aria-expanded="false" aria-controls="${work.slug}-details"` : `href="/textos/${work.slug}/"`}
          data-home-work
        >
          ${media}

          <span class="home-work-composition">
            <span class="home-work-title">
              ${escapeHtml(work.titulo)}
            </span>

            <span class="home-work-details"${isUpcoming ? ` id="${work.slug}-details"` : ''}>
              ${isUpcoming ? `<span class="home-work-announcement-title">${escapeHtml(work.titulo)}</span>
              <span class="home-work-announcement-universe">
                ${universeLines.map((line) => `<span class="home-work-universe-line">${escapeHtml(line)}</span>`).join('')}
              </span>` : `
              ${work.tipo ? `<span class="home-work-meta">
                ${escapeHtml(work.tipo)} · ${escapeHtml(work.genero)}
              </span>` : ''}

              <span class="home-work-synopsis">
                ${escapeHtml(work.sinopse)}
              </span>`}

              <span class="home-work-action">
                ${isUpcoming ? 'EM BREVE' : `Ler ${escapeHtml(work.titulo)}`}
              </span>
            </span>
          </span>
          <span class="home-work-universe">
            ${universeLines.map((line) => `<span class="home-work-universe-line">${escapeHtml(line)}</span>`).join('')}
          </span>
        </${tag}>
      </li>`;
    }
  )
  .join('');

const home =
  `<h1 class="visually-hidden">
    Luciano Jr Amorim — ficção especulativa
  </h1>

  <nav
    class="home-library-nav"
    aria-label="Biblioteca de textos"
  >
    <ol class="home-library">
      ${homeItems}
    </ol>
  </nav>`;

await writePage(
  '/',
  layout({
    title:
      'Luciano Jr Amorim — Ficção especulativa',

    description:
      'Textos de ficção especulativa de Luciano Jr Amorim sobre tecnologia, isolamento, controle e experiência humana.',

    route: '/',
    current: 'inicio',
    content: home,
    schema: personSchema
  })
);

/*
 * CATÁLOGO
 */

const catalogue = visibleWorks
  .map(
    (work) => {
      const isUpcoming = work.status === 'em_breve' && (isProduction || !pageSlugs.has(work.slug));
      const tag = isUpcoming ? 'article' : 'a';
      return `<${tag}
        class="text-work"
        ${isUpcoming ? '' : `href="/textos/${work.slug}/"`}
      >
          ${workImage(work, 'text-work-image')}
          <h2 class="text-work-title">${escapeHtml(work.titulo)}</h2>

          <span class="text-work-meta">
            ${escapeHtml(work.tipo)} · ${escapeHtml(work.genero)}
          </span>
          ${isUpcoming ? '<span class="text-work-status">EM BREVE</span>' : ''}

        <p class="text-work-synopsis">
          ${escapeHtml(work.sinopse)}
        </p>
      </${tag}>`;
    }
  )
  .join('');

await writePage(
  '/textos/',
  layout({
    title:
      'Textos — Luciano Jr Amorim',

    description:
      'Biblioteca de contos e textos de ficção especulativa de Luciano Jr Amorim.',

    route: '/textos/',
    current: 'textos',

    content:
      `<section class="texts-page">
        <div class="shell texts-grid">
          <header class="texts-intro">
          <p class="eyebrow">
            Biblioteca
          </p>

          <h1>Textos</h1>

          <p class="lede">
            Obras curtas de ficção especulativa,
            reunidas em uma biblioteca em expansão.
          </p>

          </header>

          <div class="texts-list">
            ${catalogue}
          </div>
        </div>
      </section>`
  })
);

/*
 * AUTOR
 */

await writePage(
  '/autor/',
  layout({
    title:
      'Autor — Luciano Jr Amorim',

    description:
      'Conheça a proposta literária de Luciano Jr Amorim, autor de ficção especulativa.',

    route: '/autor/',
    current: 'autor',

    content:
      `<header class="page-intro author-page">
        <div class="shell author-grid">
          <div class="author-identity">
            <p class="eyebrow">
              Autor
            </p>

            <h1>
              Luciano<br>
              Jr Amorim
            </h1>
          </div>

          <div class="author-copy">
            <p class="lede">
              Escreve ficção especulativa sobre pessoas colocadas diante de sistemas, tecnologias e ideias levadas ao limite.
            </p>

            <p class="lede">
              Seus textos exploram isolamento, controle, escolha e as consequências humanas de mundos construídos para funcionar.
            </p>

            <p class="author-themes">
              Ficção especulativa<br>
              Ficção científica · Distopia
            </p>

            <div class="actions">
              <a
                class="button button-secondary"
                href="/textos/"
              >
                Ver textos
              </a>
            </div>
          </div>
        </div>
      </header>`,

    schema:
      personSchema
  })
);

/*
 * CONTATO
 */

await writePage(
  '/contato/',
  layout({
    title:
      'Contato — Luciano Jr Amorim',

    description:
      'Contato para questões relacionadas aos textos e projetos literários de Luciano Jr Amorim.',

    route: '/contato/',
    current: 'contato',

    content:
      `<header class="page-intro contact-page">
        <div class="shell contact-grid">
          <div class="contact-identity">
            <p class="eyebrow">
              Contato
            </p>

            <h1>
              Contato
            </h1>
          </div>

          <div class="contact-copy">
            <p class="lede">
              Para questões relacionadas aos textos,
              projetos literários, convites ou outras
              formas de contato.
            </p>

            <div class="contact-channel">
              <p class="contact-label">
                E-mail
              </p>
              <a class="contact-email" href="mailto:contato.ljamorim@gmail.com">
                contato.ljamorim@gmail.com
              </a>
            </div>

            <div class="actions">
              <a class="button button-secondary" href="mailto:contato.ljamorim@gmail.com">
                Enviar e-mail
              </a>
            </div>
          </div>
        </div>
      </header>`
  })
);

/*
 * PÁGINAS INDIVIDUAIS DAS OBRAS
 */

for (const work of pageWorks) {
  const manuscript =
    await readFile(
      path.join(
        src,
        'content',
        'textos',
        work.arquivoConteudo
      ),
      'utf8'
    );

  const creativeWorkSchema =
    `<script type="application/ld+json">${jsonForScript({
      '@context':
        'https://schema.org',

      '@type':
        'ShortStory',

      name:
        work.titulo,

      ...(work.dataPublicacao ? { datePublished: work.dataPublicacao } : {}),

      author: {
        '@type':
          'Person',

        name:
          'Luciano Jr Amorim'
      },

      genre:
        work.genero,

      description:
        work.sinopse,

      url:
        `${domain}/textos/${work.slug}/`
    })}</script>`;

  const readingTime =
    work.tempoLeitura &&
    work.tempoLeitura
      .trim()
      .toLocaleLowerCase(
        'pt-BR'
      ) !== 'a definir'
      ? `<span>${escapeHtml(work.tempoLeitura)} de leitura</span>`
      : '';

  const story =
    `<div
      class="reading-progress"
      data-reading-progress
      aria-hidden="true"
    ></div>` +

    `<header class="story-header">
      <div class="shell">
        <p class="eyebrow">
          ${escapeHtml(work.tipo)} · ${escapeHtml(work.genero)}
        </p>

        <h1>
          ${escapeHtml(work.titulo)}
        </h1>

        <p class="story-byline">
          um conto de Luciano Jr Amorim
        </p>

        <div class="story-meta">
          ${readingTime}

          <a href="#inicio-leitura">
            Começar leitura
          </a>
        </div>
      </div>
    </header>` +

    `<div
      class="reading-toolbar"
      aria-label="Tamanho do texto"
    >
      <span>
        Texto
      </span>

      <button
        type="button"
        data-font-size="normal"
        aria-pressed="true"
        aria-label="Tamanho de texto normal"
      >
        A
      </button>

      <button
        type="button"
        data-font-size="large"
        aria-pressed="false"
        aria-label="Texto maior"
      >
        A+
      </button>
    </div>` +

    `<article
      class="story-content"
      id="inicio-leitura"
      data-reading-content
      data-story-slug="${escapeHtmlAttribute(work.slug)}"
      data-story-title="${escapeHtmlAttribute(work.titulo)}"
    >
      ${manuscript}
    </article>` +

    `<footer class="story-end">
      <p>
        ${escapeHtml(work.titulo)}
      </p>

      <p>
        Luciano Jr Amorim
      </p>

      ${footerLower('story-copyright')}

      <a href="/textos/">
        ← Voltar aos textos
      </a>
    </footer>`;

  await writePage(
    `/textos/${work.slug}/`,
    layout({
      title:
        `${escapeHtml(work.titulo)} — Luciano Jr Amorim`,

      description:
        work.sinopse,

      route:
        `/textos/${work.slug}/`,

      current:
        'textos',

      content:
        story,

      schema:
        creativeWorkSchema,

      showFooter:
        false,

      socialImage:
        work.imagemSocial || '/assets/img/og-site.png',

      socialType:
        'article',

      socialImageAlt:
        `${escapeHtml(work.titulo)} \u2014 um conto de Luciano Jr Amorim`
    })
  );
}

/*
 * SITEMAP E ARQUIVOS DE PUBLICAÇÃO
 */

await writeFile(
  path.join(dist, '404.html'),
  layout({
    title: 'Página não encontrada — Luciano Jr Amorim',
    description: 'A página solicitada não foi encontrada no site de Luciano Jr Amorim.',
    route: '/404.html',
    current: '',
    canonical: false,
    robots: 'noindex, follow',
    social: false,
    socialImage: '',
    content: `<section class="not-found" aria-labelledby="not-found-title">
      <div class="shell not-found-inner">
        <div class="not-found-code" aria-hidden="true">404</div>
        <div class="not-found-copy">
          <p class="eyebrow">Página não encontrada</p>
          <h1 id="not-found-title">Esta página não está aqui.</h1>
          <p class="lede">O endereço pode ter mudado ou não existir.</p>
          <div class="actions not-found-actions">
            <a class="button" href="/">Voltar ao início</a>
            <a class="button button-secondary" href="/textos/">Ver textos</a>
          </div>
        </div>
      </div>
    </section>`
  }),
  'utf8'
);

await writePage('/privacidade/', layout({
  title: 'Privacidade — Luciano Jr Amorim',
  description: 'Informações sobre navegação, análise de visitas e preferências de privacidade.',
  route: '/privacidade/', current: '',
  content: `<section class="page-intro"><div class="shell privacy-content">
    <h1>Privacidade</h1>
    <p>Este site publica textos literários. Você pode navegar e ler sem autorizar ferramentas de análise.</p>
    <h2>Análise de visitas e leitura</h2>
    <p>Somente após sua autorização, carregamos o Google Analytics, fornecido pelo Google, para medir visitas, início e progresso de leitura e cliques nas redes sociais. Os eventos incluem o título ou identificador da obra e, nos links sociais, o endereço de destino. O serviço pode usar cookies e processar informações técnicas da navegação, inclusive fora do Brasil.</p>
    <p>Não enviamos ao Analytics o conteúdo de mensagens de e-mail. Consulte também a <a href="https://policies.google.com/privacy">política de privacidade do Google</a>.</p>
    <h2>Sua escolha</h2>
    <p>Salvamos sua escolha neste navegador, quando o armazenamento está disponível. Ao recusar, a ferramenta de análise não é carregada. Você pode rever sua escolha a qualquer momento pelo botão abaixo. Ao revogar uma autorização, a página será recarregada e tentaremos remover os cookies de análise deste domínio.</p>
    <button class="button" type="button" data-privacy-settings>Rever preferências de análise</button>
    <h2>Hospedagem e contato</h2>
    <p>O site é hospedado pelo GitHub Pages. O provedor pode processar registros técnicos necessários à entrega e segurança das páginas. Mensagens enviadas por e-mail são tratadas pelo serviço de e-mail para atender ao seu contato.</p>
    <p>Para dúvidas ou solicitações relacionadas à privacidade, escreva para <a href="mailto:contato.ljamorim@gmail.com">contato.ljamorim@gmail.com</a>.</p>
  </div></section>`
}));

const routes = [
  '/privacidade/',
  '/',

  '/textos/',

  ...pageWorks.map(
    (work) =>
      `/textos/${work.slug}/`
  ),

  '/autor/',

  '/contato/'
];

await writeFile(
  path.join(
    dist,
    'sitemap.xml'
  ),

  `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    routes
      .map(
        (route) =>
          `<url><loc>${domain}${route}</loc></url>`
      )
      .join('') +
    `</urlset>\n`,

  'utf8'
);

await writeFile(
  path.join(
    dist,
    'robots.txt'
  ),

  `User-agent: *\n` +
    `Allow: /\n` +
    `Sitemap: ${domain}/sitemap.xml\n`,

  'utf8'
);

await writeFile(
  path.join(
    dist,
    'CNAME'
  ),

  'lucianojramorim.com.br\n',

  'utf8'
);

await writeFile(
  path.join(
    dist,
    '.nojekyll'
  ),

  '',

  'utf8'
);

console.log(
  `Site gerado em dist/ com ${routes.length} páginas — ${
    isProduction
      ? 'produção'
      : 'preview'
  }.`
);
