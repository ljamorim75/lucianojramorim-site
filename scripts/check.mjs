import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { validateWorks, escapeHtml } from './site-utils.mjs';

const dist = path.resolve('dist');
const read = file => readFile(path.join(dist, file), 'utf8');
const works = JSON.parse(await readFile('src/data/textos.json', 'utf8'));
validateWorks(works, path.resolve('src'));
const sitemap = await read('sitemap.xml');
assert.equal((await read('CNAME')).trim(), 'lucianojramorim.com.br');
for (const file of ['index.html', 'textos/index.html', 'autor/index.html', 'contato/index.html', 'privacidade/index.html', '404.html']) await read(file);
const home = await read('index.html');
const catalogue = await read('textos/index.html');
for (const work of works) {
  const route = `/textos/${work.slug}/`;
  const file = path.join(dist, route, 'index.html');
  if (work.status === 'publicado') {
    const html = await read(`textos/${work.slug}/index.html`);
    assert(html.includes('data-reading-content'), `Conteúdo ausente: ${route}`);
    assert(html.includes(`<title>${escapeHtml(work.titulo)} — Luciano Jr Amorim</title>`));
    assert(html.includes(`rel="canonical" href="https://lucianojramorim.com.br${route}"`));
    assert(sitemap.includes(`https://lucianojramorim.com.br${route}`));
    assert(home.includes(`href="${route}"`) && catalogue.includes(`href="${route}"`));
  } else {
    await assert.rejects(stat(file), { code: 'ENOENT' });
    assert(!sitemap.includes(route), `Rascunho no sitemap: ${route}`);
    assert(!home.includes(`href="${route}"`) && !catalogue.includes(`href="${route}"`));
  }
}
const notFound = await read('404.html');
assert(notFound.includes('noindex, follow') && !notFound.includes('rel="canonical"'));
assert(!sitemap.includes('/404'));
let pages = 0;
async function checkDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await checkDirectory(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    pages++;
    const html = await readFile(file, 'utf8');
    assert(html.includes('<html lang="pt-BR">'));
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `H1 inválido: ${file}`);
    assert(!/manuscript-placeholder|manuscript-status|Publicação em preparação/iu.test(html));
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `IDs repetidos: ${file}`);
    assert(!html.includes('googletagmanager.com'), `Analytics carregado antes do consentimento: ${file}`);
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
    for (const match of html.matchAll(/\b(?:href|src)="([^"#]+)"/g)) {
      const url = match[1];
      if (!url.startsWith('/')) continue;
      const resource = path.join(dist, url.split(/[?#]/)[0]);
      const info = await stat(resource).catch(() => null);
      assert(info, `Recurso ausente: ${url} em ${file}`);
      if (info.isDirectory()) await stat(path.join(resource, 'index.html'));
    }
    for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
      for (const variant of match[1].split(',')) await stat(path.join(dist, variant.trim().split(' ')[0]));
    }
  }
}
await checkDirectory(dist);
const images = JSON.parse(await read('image-manifest.json'));
let originalBytes = 0, optimizedBytes = 0;
for (const [source, image] of Object.entries(images)) {
  if (image.social) {
    assert((await stat(path.join(dist, image.social))).size < 500_000, `Imagem social excessiva: ${source}`);
  } else {
    originalBytes += (await stat(path.join('src', source))).size;
    optimizedBytes += (await stat(path.join(dist, image.src))).size;
  }
}
assert(optimizedBytes < originalBytes, 'As imagens não foram reduzidas');
console.log(`${pages} páginas verificadas. Imagens padrão: ${originalBytes} → ${optimizedBytes} bytes.`);
