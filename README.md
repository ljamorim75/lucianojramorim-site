# Luciano Jr Amorim — Site autoral

Site estático autoral destinado à publicação de ficção especulativa.

## Arquitetura

```text
src/
  assets/
  content/
  data/
scripts/
dist/
```

- `src/`: fonte do site.
- `src/data/textos.json`: catálogo e metadados das obras. Atualmente contém somente MONAKSÍA, em preparação.
- `src/content/textos/`: conteúdo HTML das obras. O manuscrito de Monaksía deve ser preservado sem alterações automáticas.
- `src/assets/`: CSS, JavaScript e imagens da identidade visual.
- `scripts/build.mjs`: gerador principal; contém os templates das páginas e as regras de publicação.
- `dist/`: saída gerada automaticamente. Não deve ser editada manualmente; cada build apaga e recria essa pasta.

## Executar localmente

É necessário ter Node.js e npm disponíveis.

```bash
npm run build
npm run serve
```

`npm run build` gera o preview local, incluindo obras ainda em preparação.
`npm run serve` serve a pasta `dist/` em `http://localhost:4173/`.

## Build de produção

```bash
npm run build:prod
```

Inclui somente obras com `status === "publicado"` no catálogo, nas páginas individuais, na Home e no sitemap. Os ativos de `src/assets/` são copiados integralmente em ambos os modos.

**ALERTA: NUNCA publicar diretamente uma saída gerada por `npm run build` se houver textos em preparação. Para publicação deve ser utilizado o build de produção.**

MONAKSÍA permanece excluída das páginas de produção enquanto seu status for `preparacao`.

O domínio configurado é `lucianojramorim.com.br`. O gerador cria `CNAME`, `.nojekyll`, `robots.txt` e `sitemap.xml` em `dist/`.
