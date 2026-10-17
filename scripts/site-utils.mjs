import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';

export function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function jsonForScript(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

export function validateWorks(works, src) {
  assert(Array.isArray(works), 'O catálogo deve ser uma lista');
  const slugs = new Set();
  for (const work of works) {
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(work.slug), 'Slug inválido');
    assert(!slugs.has(work.slug), `Slug repetido: ${work.slug}`);
    slugs.add(work.slug);
    assert(['preparacao', 'em_breve', 'publicado'].includes(work.status), `Estado inválido: ${work.slug}`);
    for (const key of ['titulo', 'tipo', 'genero', 'sinopse', 'arquivoConteudo']) {
      assert(typeof work[key] === 'string' && work[key].trim(), `Campo ${key} inválido: ${work.slug}`);
    }
    assert(/^[a-z0-9-]+\.html$/.test(work.arquivoConteudo), `Arquivo inválido: ${work.slug}`);
    if (work.status === 'publicado') {
      assert(existsSync(path.join(src, 'content', 'textos', work.arquivoConteudo)), `Texto ausente: ${work.slug}`);
    }
    for (const key of ['imagem', 'imagemSocial']) {
      if (!work[key]) continue;
      assert(/^\/assets\/img\/[a-z0-9-]+\.(png|jpe?g|webp)$/.test(work[key]), `Imagem inválida: ${work.slug}`);
      assert(existsSync(path.join(src, work[key].slice(1))), `Imagem ausente: ${work[key]}`);
    }
  }
}

export function resolveRequestPath(root, requestUrl) {
  // Decodificar antes de normalizar evita aceitar travessias percentualmente codificadas.
  const pathname = decodeURIComponent(requestUrl.split('?')[0]);
  if (pathname.includes('\0') || pathname.includes('\\')) throw new URIError('Caminho inválido');
  const target = path.resolve(root, '.' + pathname);
  const relative = path.relative(root, target);
  if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) return null;
  return target;
}
