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
- `src/data/textos.json`: catálogo e metadados das obras. Atualmente contém somente MONAKSÍA, em breve.
- `src/content/textos/`: conteúdo HTML das obras. O manuscrito de Monaksía deve ser preservado sem alterações automáticas.
- `src/assets/`: CSS, JavaScript e imagens da identidade visual.
- `scripts/build.mjs`: gerador principal; contém os templates das páginas e as regras de publicação.
- `dist/`: saída gerada automaticamente e não versionada. Não deve ser editada manualmente; cada build apaga e recria essa pasta.

## Política de Versionamento

`src/` e `scripts/` são a fonte versionada, com uma exceção editorial específica: `src/content/textos/monaksia.html` permanece local e privado enquanto MONAKSÍA não estiver publicada. O arquivo não é versionado no repositório público e tem uma regra específica no `.gitignore`. Preserve uma cópia de segurança privada.

O preview local pode usar esse manuscrito. Um clone do repositório público não o contém; para gerar o preview completo, é necessário disponibilizar a cópia privada nesse caminho. O build de produção filtra obras não publicadas antes de tentar ler seu conteúdo e funciona sem esse arquivo.

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

Os estados editoriais têm regras explícitas:

- `preparacao`: invisível em produção.
- `em_breve`: aparece na Home e no catálogo com imagem, metadados, sinopse e EM BREVE; não possui link nem página de leitura e não entra no sitemap. Não exige manuscrito no build de produção.
- `publicado`: aparece na biblioteca com link, gera página individual e entra no sitemap.

Valores desconhecidos ficam excluídos da produção. No preview, todas as obras aparecem; páginas individuais são geradas quando o arquivo de conteúdo existe. Os ativos de `src/assets/` são copiados integralmente em ambos os modos.

**ALERTA: NUNCA publicar diretamente uma saída gerada por `npm run build` se houver textos em preparação. Para publicação deve ser utilizado o build de produção.**

MONAKSÍA é divulgada como `em_breve`, sem publicação do manuscrito ou da página de leitura.

O domínio configurado é `lucianojramorim.com.br`. O gerador cria `CNAME`, `.nojekyll`, `robots.txt` e `sitemap.xml` em `dist/`.

O build também gera `dist/404.html`, usada pelo GitHub Pages e pelo servidor `npm run serve` em rotas inexistentes, com status HTTP 404. Essa página não entra no sitemap.

## Validação e Publicação

O workflow `.github/workflows/production-build-check.yml` valida o build de produção em pushes para `main` e pull requests direcionados a `main`. Não instala dependências, não envia artefatos e não faz deployment.

`main` é a branch principal da fonte e da produção. GitHub Pages publica por GitHub Actions; o workflow manual constrói o commit de `main` selecionado na execução.

O workflow `.github/workflows/deploy-pages.yml` usa gatilho exclusivamente manual (`workflow_dispatch`), build de produção e validações antes do upload. O workflow definitivo em `main` mantém as proteções editoriais antes de publicar `dist/`.

Nunca execute deployment sem revisar o build de produção. Nesta fase, o workflow bloqueia qualquer página de Monaksía ou marcador editorial na saída e verifica o domínio antes do upload.
