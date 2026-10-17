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
- `src/data/textos.json`: catálogo e metadados das obras. Atualmente contém seis obras publicadas.
- `src/content/textos/`: conteúdo HTML das obras. O manuscrito de Monaksía deve ser preservado sem alterações automáticas.
- `src/assets/`: CSS, JavaScript e imagens da identidade visual.
- `scripts/build.mjs`: gerador principal; contém os templates das páginas e as regras de publicação.
- `dist/`: saída gerada automaticamente e não versionada. Não deve ser editada manualmente; cada build apaga e recria essa pasta.

## Política de Versionamento

`src/` e `scripts/` são a fonte versionada. As seis obras publicadas, incluindo MONAKSÍA, estão no repositório público. Não armazene manuscritos privados, segredos ou materiais confidenciais neste repositório: estados editoriais controlam a saída do build, não a visibilidade dos arquivos e do histórico do Git.

Mantenha obras inéditas confidenciais fora do repositório público. O preview pode utilizar cópias privadas locais; não as adicione ao Git.

## Executar localmente

Use Node.js 24.19.0 (também indicado em `.nvmrc`) e npm. Instale as dependências com `npm ci` antes do primeiro build. A dependência de desenvolvimento `sharp` está fixada em 0.35.5 e gera variantes WebP responsivas e JPEG de 1200 × 630 para compartilhamento. Os originais são preservados.

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

MONAKSÍA e as outras cinco obras do catálogo estão publicadas. A estante também contém anúncios de obras futuras sem páginas de leitura.

O domínio configurado é `lucianojramorim.com.br`. O gerador cria `CNAME`, `.nojekyll`, `robots.txt` e `sitemap.xml` em `dist/`.

O build também gera `dist/404.html`, usada pelo GitHub Pages e pelo servidor `npm run serve` em rotas inexistentes, com status HTTP 404. Essa página não entra no sitemap.

## Validação e Publicação

O workflow `.github/workflows/production-build-check.yml` valida o build de produção em pushes para `main` e pull requests direcionados a `main`. Instala o otimizador, executa os testes e valida todas as obras e os recursos gerados; não faz deployment.

`main` é a branch principal da fonte e da produção. GitHub Pages publica por GitHub Actions; o workflow manual constrói o commit de `main` selecionado na execução.

O workflow `.github/workflows/deploy-pages.yml` usa gatilho exclusivamente manual (`workflow_dispatch`), build de produção e validações antes do upload. O workflow definitivo em `main` mantém as proteções editoriais antes de publicar `dist/`.

Nunca execute deployment sem revisar o build de produção. O workflow valida as obras publicadas, exclui páginas não publicadas do sitemap, verifica recursos internos, metadados, domínio, página 404 e orçamento das imagens sociais antes do upload.

## Verificações e privacidade

Execute `npm test`, `npm run build:prod` e `npm run check`. A validação é centralizada em `scripts/check.mjs`; execute-a somente após o build de produção. Testes de regressão cobrem contenção de caminhos, escape de metadados e regras editoriais.

O Google Analytics só é carregado após autorização expressa. A preferência fica no armazenamento local do navegador. A página `/privacidade/` explica os eventos e permite rever a escolha. Sem JavaScript, a navegação principal permanece acessível e nenhuma análise é carregada.

Os workflows fixam Node.js e as ações por SHA. Para atualizar, confira a versão e o commit oficial de cada ação e execute as verificações antes de publicar. A instalação usa npm ci e package-lock.json para fixar também as dependências transitivas.
