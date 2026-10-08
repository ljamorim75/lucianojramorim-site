# Luciano Jr Amorim — site autoral

Site estático de Luciano Jr Amorim, organizado como uma biblioteca de ficção especulativa. A pasta `dist/` é o conteúdo pronto para publicação.

## Estrutura

- `src/data/textos.json`: catálogo e metadados das obras.
- `src/content/textos/`: manuscritos em HTML semântico.
- `src/assets/`: estilos, scripts e imagens.
- `scripts/build.mjs`: gerador estático sem dependências externas.
- `dist/`: site final gerado para o GitHub Pages.

## Executar localmente

Ambiente preparado com Node.js 24.21.0 LTS e npm 11.19.0.

```bash
npm run build
npm run serve
```

No Windows sem Node.js, use o gerador equivalente em PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build.ps1
powershell -ExecutionPolicy Bypass -File scripts/serve.ps1
```

Também é possível abrir `dist/index.html` diretamente, mas um servidor local representa melhor o comportamento publicado.

## Publicar no GitHub Pages

1. Execute `npm run build`.
2. Publique o conteúdo da pasta `dist/` na branch configurada no GitHub Pages.
3. Configure o domínio personalizado `lucianojramorim.com.br` no repositório. O arquivo `CNAME` já é gerado.

O site final é totalmente estático e não exige Node.js no servidor.

## Inserir ou trocar o emblema

1. Preserve o arquivo original.
2. Crie uma cópia otimizada em PNG, preferencialmente quadrada e com até 1200 px.
3. Salve a cópia em `src/assets/img/emblema-metalico-lja-com-estrela.png`.
4. Execute `npm run build`.

Enquanto a imagem não existir, o site mostra um espaço tipográfico neutro identificado como provisório.

## Alterar textos da página inicial

Edite as seções correspondentes no arquivo `scripts/build.mjs`. Título, tipo, gênero e sinopse da obra em destaque vêm de `src/data/textos.json`.

## Inserir o manuscrito de Monaksía

Substitua o marcador em `src/content/textos/monaksia.html` pelo texto final, usando:

- `<p>` para parágrafos;
- `<h2>` para títulos de dias ou seções;
- `<hr>` para separadores narrativos;
- `<em>` para ênfase.

Depois, ajuste `tempoLeitura`, `status` e `dataPublicacao` em `src/data/textos.json` e execute `npm run build`.

## Adicionar um novo conto

1. Adicione um novo objeto em `src/data/textos.json`, copiando a estrutura de Monaksía e atualizando todos os campos.
2. Crie o arquivo indicado em `arquivoConteudo` dentro de `src/content/textos/`.
3. Execute `npm run build`.

O catálogo, a página individual, os metadados e o sitemap serão gerados automaticamente.
