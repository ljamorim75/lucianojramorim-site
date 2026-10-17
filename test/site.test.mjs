import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { resolveRequestPath, escapeHtml, jsonForScript, validateWorks, validateShelf } from '../scripts/site-utils.mjs';

test('caminhos não escapam da raiz, inclusive para diretórios com prefixo semelhante', () => {
  const root = path.resolve('dist');
  assert.equal(resolveRequestPath(root, '/%2e%2e/dist-private/secret'), null);
  assert.equal(resolveRequestPath(root, '/../private/secret'), null);
  assert.equal(resolveRequestPath(root, '/textos/?x=1'), path.join(root, 'textos'));
  assert.throws(() => resolveRequestPath(root, '/%ZZ'), URIError);
  assert.throws(() => resolveRequestPath(root, '/%00'), URIError);
  assert.throws(() => resolveRequestPath(root, '/%5cprivate'), URIError);
});

test('metadados não podem encerrar atributos nem scripts de dados', () => {
  assert.equal(escapeHtml('"<script>&'), '&quot;&lt;script&gt;&amp;');
  const payload = { name: '</script><script>alert(1)</script>' };
  const encoded = jsonForScript(payload);
  assert(!encoded.includes('<'));
  assert.deepEqual(JSON.parse(encoded), payload);
});

test('catálogo rejeita estados inválidos, caminhos externos e slugs duplicados', () => {
  const work = { slug: 'teste', status: 'em_breve', titulo: 'Teste', tipo: 'Conto', genero: 'Ficção', sinopse: 'Teste', arquivoConteudo: 'teste.html' };
  assert.doesNotThrow(() => validateWorks([work], 'src'));
  assert.throws(() => validateWorks([work, work], 'src'));
  assert.throws(() => validateWorks([{ ...work, status: 'desconhecido' }], 'src'));
  assert.throws(() => validateWorks([{ ...work, arquivoConteudo: '../segredo.html' }], 'src'));
  assert.throws(() => validateWorks([{ ...work, imagem: 'javascript:alert(1)' }], 'src'));
  assert.throws(() => validateWorks([{ ...work, slug: undefined }], 'src'));
  assert.throws(() => validateShelf([{ slug: '" onclick="alert(1)', titulo: 'Teste', universoLinhas: ['A'] }]));
});
