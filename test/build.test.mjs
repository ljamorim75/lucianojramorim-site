import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const project = fileURLToPath(new URL('../', import.meta.url));

test('preview e produção respeitam os estados e escapam metadados editoriais', async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), 'lja-build-'));
  try {
    await cp(path.join(project, 'src'), path.join(fixture, 'src'), { recursive: true });
    const dataPath = path.join(fixture, 'src/data/textos.json');
    const works = JSON.parse(await readFile(dataPath, 'utf8'));
    works[0].status = 'em_breve';
    works[0].titulo = 'Uma "obra" <teste>';
    works[0].sinopse = '</script><script>alert(1)</script>';
    await writeFile(dataPath, JSON.stringify(works));
    const build = path.join(project, 'scripts/build.mjs');
    await run(process.execPath, [build], { cwd: fixture });
    const preview = await readFile(path.join(fixture, 'dist/index.html'), 'utf8');
    assert(preview.includes('href="/textos/monaksia/"'), 'Preview deve permitir leitura de obra em breve');
    const story = await readFile(path.join(fixture, 'dist/textos/monaksia/index.html'), 'utf8');
    assert(story.includes('Uma &quot;obra&quot; &lt;teste&gt;'));
    assert(!story.includes('</script><script>alert(1)</script>'));
    for (const match of story.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      assert.equal(JSON.parse(match[1]).description, works[0].sinopse);
    }
    await run(process.execPath, [build, '--prod'], { cwd: fixture });
    const production = await readFile(path.join(fixture, 'dist/index.html'), 'utf8');
    assert(!production.includes('href="/textos/monaksia/"'));
    assert(!(await readFile(path.join(fixture, 'dist/sitemap.xml'), 'utf8')).includes('/textos/monaksia/'));
    await assert.rejects(readFile(path.join(fixture, 'dist/textos/monaksia/index.html')), { code:'ENOENT' });
  } finally {
    // Diretório temporário exclusivo criado por este teste.
    await rm(fixture, { recursive:true, force:true });
  }
});
