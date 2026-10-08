import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const domain = 'https://lucianojramorim.com.br';
const works = JSON.parse(await readFile(path.join(src, 'data', 'textos.json'), 'utf8'));

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(src, 'assets'), path.join(dist, 'assets'), { recursive: true });

const hasEmblem = existsSync(path.join(src, 'assets', 'img', 'emblema-metalico-lja-com-estrela.png'));
const emblem = (className = 'brand-mark') => hasEmblem
  ? `<img class="${className}" src="/assets/img/emblema-metalico-lja-com-estrela.png" alt="Emblema LJA" width="640" height="640">`
  : `<span class="${className === 'hero-mark' ? 'hero-placeholder' : 'brand-placeholder'}" aria-label="Espaço reservado para o emblema LJA">LJA</span>`;

const navItems = [
  ['inicio', '/', 'Início'],
  ['textos', '/textos/', 'Textos'],
  ['autor', '/autor/', 'Autor'],
  ['contato', '/contato/', 'Contato']
];

function layout({ title, description, route, current, content, schema = '' }) {
  const canonical = `${domain}${route}`;
  const nav = navItems.map(([key, href, label]) => `<a href="${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#070708">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="Luciano Jr Amorim">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <link rel="stylesheet" href="/assets/css/site.css">
  ${schema}
</head>
<body>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <header class="site-header">
    <div class="shell header-inner">
      <a class="brand" href="/" aria-label="Luciano Jr Amorim — Início">${emblem()}<span>Luciano Jr Amorim</span></a>
      <button class="menu-button" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu-principal" data-menu-button></button>
      <nav class="site-nav" id="menu-principal" aria-label="Navegação principal" data-menu data-open="false">${nav}</nav>
    </div>
  </header>
  <main id="conteudo">${content}</main>
  <footer class="site-footer">
    <div class="shell footer-grid">
      <div class="footer-title">Luciano Jr Amorim</div>
      <nav class="footer-links" aria-label="Navegação do rodapé"><a href="/textos/">Textos</a><a href="/autor/">Autor</a><a href="/contato/">Contato</a></nav>
      <div class="footer-copy">© Luciano Jr Amorim. Todos os direitos reservados.</div>
    </div>
  </footer>
  <script type="module" src="/assets/js/site.js"></script>
</body>
</html>`;
}

async function writePage(route, html) {
  const target = route === '/' ? dist : path.join(dist, route);
  await mkdir(target, { recursive: true });
  await writeFile(path.join(target, 'index.html'), html, 'utf8');
}

const primary = works[0];
const personSchema = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: 'Luciano Jr Amorim', url: domain })}</script>`;
const home = `
<section class="hero"><div class="shell hero-grid"><div class="hero-copy"><p class="eyebrow">Ficção especulativa</p><h1><span>Autor</span>Luciano Jr Amorim</h1><p class="lede">Ficção especulativa sobre tecnologia, isolamento, controle e os limites da experiência humana.</p><div class="actions"><a class="button" href="/textos/${primary.slug}/">Ler Monaksía</a><a class="button button-secondary" href="/textos/">Ver textos</a></div></div>${emblem('hero-mark')}</div></section>
<section class="section"><div class="shell section-grid"><div><p class="eyebrow">Texto em destaque</p><div class="feature-number">01</div></div><div class="section-copy"><h2>${primary.titulo}</h2><p class="catalogue-meta">${primary.tipo} · ${primary.genero}</p><p>${primary.sinopse}</p><div class="actions"><a class="button" href="/textos/${primary.slug}/">Ler o conto</a></div></div></div></section>
<section class="section"><div class="shell section-grid"><div><p class="eyebrow">Biblioteca</p><h2>Textos</h2></div><div><a class="catalogue-item" href="/textos/${primary.slug}/"><span class="catalogue-number">${primary.numero}</span><div><h3>${primary.titulo}</h3><span class="catalogue-meta">${primary.tipo} · ${primary.genero}</span></div><p>${primary.sinopse}</p></a></div></div></section>
<section class="section"><div class="shell section-grid"><div><p class="eyebrow">Autor</p><h2>Luciano<br>Jr Amorim</h2></div><div class="section-copy"><p>Luciano Jr Amorim escreve ficção especulativa sobre tecnologia, sistemas, isolamento e as formas pelas quais ideias levadas ao limite transformam a experiência humana.</p><div class="actions"><a class="button button-secondary" href="/autor/">Sobre o autor</a></div></div></div></section>`;
await writePage('/', layout({ title: 'Luciano Jr Amorim — Ficção especulativa', description: 'Textos de ficção especulativa de Luciano Jr Amorim sobre tecnologia, isolamento, controle e experiência humana.', route: '/', current: 'inicio', content: home, schema: personSchema }));

const catalogue = works.map((work) => `<a class="catalogue-item" href="/textos/${work.slug}/"><span class="catalogue-number">${work.numero}</span><div><h2>${work.titulo}</h2><span class="catalogue-meta">${work.tipo} · ${work.genero}</span></div><p>${work.sinopse}</p></a>`).join('');
await writePage('/textos/', layout({ title: 'Textos — Luciano Jr Amorim', description: 'Biblioteca de contos e textos de ficção especulativa de Luciano Jr Amorim.', route: '/textos/', current: 'textos', content: `<header class="page-intro"><div class="shell"><p class="eyebrow">Biblioteca</p><h1>Textos</h1><p class="lede">Obras curtas de ficção especulativa, reunidas em uma biblioteca em expansão.</p><div class="catalogue">${catalogue}</div></div></header>` }));

await writePage('/autor/', layout({ title: 'Autor — Luciano Jr Amorim', description: 'Conheça a proposta literária de Luciano Jr Amorim, autor de ficção especulativa.', route: '/autor/', current: 'autor', content: `<header class="page-intro"><div class="shell section-grid"><div><p class="eyebrow">Autor</p><h1>Luciano<br>Jr Amorim</h1></div><div class="section-copy"><p class="lede">Luciano Jr Amorim escreve ficção especulativa sobre tecnologia, sistemas, isolamento e as formas pelas quais ideias levadas ao limite transformam a experiência humana.</p><div class="actions"><a class="button button-secondary" href="/textos/">Ver textos</a></div></div></div></header>` , schema: personSchema }));

await writePage('/contato/', layout({ title: 'Contato — Luciano Jr Amorim', description: 'Contato para questões relacionadas aos textos e projetos literários de Luciano Jr Amorim.', route: '/contato/', current: 'contato', content: `<header class="page-intro"><div class="shell section-grid"><div><p class="eyebrow">Contato</p><h1>Contato</h1></div><div class="section-copy"><p class="lede">Para questões relacionadas aos textos, projetos literários, convites ou outras formas de contato.</p><div class="contact-placeholder"><p>Canal de contato em definição.</p></div></div></div></header>` }));

for (const work of works) {
  const manuscript = await readFile(path.join(src, 'content', 'textos', work.arquivoConteudo), 'utf8');
  const creativeWorkSchema = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'ShortStory', name: work.titulo, author: { '@type': 'Person', name: 'Luciano Jr Amorim' }, genre: work.genero, description: work.sinopse, url: `${domain}/textos/${work.slug}/` })}</script>`;
  const story = `<div class="reading-progress" data-reading-progress aria-hidden="true"></div><header class="story-header"><div class="shell"><p class="eyebrow">${work.tipo} · ${work.genero}</p><h1>${work.titulo}</h1><p class="story-byline">um conto de Luciano Jr Amorim</p><div class="story-meta"><span>${work.tempoLeitura} de leitura</span><a href="#leitura">Começar leitura</a></div></div></header><div class="reading-toolbar" aria-label="Tamanho do texto"><span>Texto</span><button type="button" data-font-size="normal" aria-pressed="true" aria-label="Tamanho de texto normal">A</button><button type="button" data-font-size="large" aria-pressed="false" aria-label="Texto maior">A+</button></div><article class="story-content" id="leitura" data-reading-content>${manuscript}</article><footer class="story-end"><p>${work.titulo}</p><p>Luciano Jr Amorim</p><a href="/textos/">Voltar aos textos</a></footer>`;
  await writePage(`/textos/${work.slug}/`, layout({ title: `${work.titulo} — Luciano Jr Amorim`, description: work.sinopse, route: `/textos/${work.slug}/`, current: 'textos', content: story, schema: creativeWorkSchema }));
}

const routes = ['/', '/textos/', ...works.map((work) => `/textos/${work.slug}/`), '/autor/', '/contato/'];
await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${domain}${route}</loc></url>`).join('')}</urlset>\n`, 'utf8');
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${domain}/sitemap.xml\n`, 'utf8');
await writeFile(path.join(dist, 'CNAME'), 'lucianojramorim.com.br\n', 'utf8');
await writeFile(path.join(dist, '.nojekyll'), '', 'utf8');

console.log(`Site gerado em dist/ com ${routes.length} páginas.`);
