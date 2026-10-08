$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $projectRoot 'src'
$outputRoot = Join-Path $projectRoot 'dist'
$domain = 'https://lucianojramorim.com.br'
$works = Get-Content -Raw -Encoding UTF8 (Join-Path $sourceRoot 'data/textos.json') | ConvertFrom-Json

if (Test-Path -LiteralPath $outputRoot) {
  Remove-Item -LiteralPath $outputRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $outputRoot | Out-Null
Copy-Item -LiteralPath (Join-Path $sourceRoot 'assets') -Destination (Join-Path $outputRoot 'assets') -Recurse

$emblemPath = Join-Path $sourceRoot 'assets/img/emblema-metalico-lja-com-estrela.png'
$hasEmblem = Test-Path -LiteralPath $emblemPath

function Get-Emblem([string]$className = 'brand-mark') {
  if ($hasEmblem) {
    return "<img class=`"$className`" src=`"/assets/img/emblema-metalico-lja-com-estrela.png`" alt=`"Emblema LJA`" width=`"640`" height=`"640`">"
  }
  $fallbackClass = if ($className -eq 'hero-mark') { 'hero-placeholder' } else { 'brand-placeholder' }
  return "<span class=`"$fallbackClass`" aria-label=`"Espaço reservado para o emblema LJA`">LJA</span>"
}

function Get-Layout {
  param([string]$title, [string]$description, [string]$route, [string]$current, [string]$content, [string]$schema = '')
  $nav = @(
    @{ Key = 'inicio'; Href = '/'; Label = 'Início' },
    @{ Key = 'textos'; Href = '/textos/'; Label = 'Textos' },
    @{ Key = 'autor'; Href = '/autor/'; Label = 'Autor' },
    @{ Key = 'contato'; Href = '/contato/'; Label = 'Contato' }
  ) | ForEach-Object {
    $active = if ($current -eq $_.Key) { ' aria-current="page"' } else { '' }
    "<a href=`"$($_.Href)`"$active>$($_.Label)</a>"
  }
  $brandEmblem = Get-Emblem
  $canonical = "$domain$route"
  return @"
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>$title</title>
  <meta name="description" content="$description">
  <meta name="theme-color" content="#070708">
  <link rel="canonical" href="$canonical">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="Luciano Jr Amorim">
  <meta property="og:title" content="$title">
  <meta property="og:description" content="$description">
  <meta property="og:url" content="$canonical">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="$title">
  <meta name="twitter:description" content="$description">
  <link rel="stylesheet" href="/assets/css/site.css">
  $schema
</head>
<body>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <header class="site-header">
    <div class="shell header-inner">
      <a class="brand" href="/" aria-label="Luciano Jr Amorim — Início">$brandEmblem<span>Luciano Jr Amorim</span></a>
      <button class="menu-button" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu-principal" data-menu-button></button>
      <nav class="site-nav" id="menu-principal" aria-label="Navegação principal" data-menu data-open="false">$($nav -join '')</nav>
    </div>
  </header>
  <main id="conteudo">$content</main>
  <footer class="site-footer">
    <div class="shell footer-grid">
      <div class="footer-title">Luciano Jr Amorim</div>
      <nav class="footer-links" aria-label="Navegação do rodapé"><a href="/textos/">Textos</a><a href="/autor/">Autor</a><a href="/contato/">Contato</a></nav>
      <div class="footer-copy">© Luciano Jr Amorim. Todos os direitos reservados.</div>
    </div>
  </footer>
  <script type="module" src="/assets/js/site.js"></script>
</body>
</html>
"@
}

function Write-Page([string]$route, [string]$html) {
  $target = if ($route -eq '/') { $outputRoot } else { Join-Path $outputRoot $route.Trim('/') }
  New-Item -ItemType Directory -Path $target -Force | Out-Null
  [IO.File]::WriteAllText((Join-Path $target 'index.html'), $html, [Text.UTF8Encoding]::new($false))
}

$primary = $works[0]
$personSchema = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Person","name":"Luciano Jr Amorim","url":"https://lucianojramorim.com.br"}</script>'
$heroEmblem = Get-Emblem 'hero-mark'
$homeContent = @"
<section class="hero"><div class="shell hero-grid"><div class="hero-copy"><p class="eyebrow">Ficção especulativa</p><h1><span>Autor</span>Luciano Jr Amorim</h1><p class="lede">Ficção especulativa sobre tecnologia, isolamento, controle e os limites da experiência humana.</p><div class="actions"><a class="button" href="/textos/$($primary.slug)/">Ler Monaksía</a><a class="button button-secondary" href="/textos/">Ver textos</a></div></div>$heroEmblem</div></section>
<section class="section"><div class="shell section-grid"><div><p class="eyebrow">Texto em destaque</p><div class="feature-number">01</div></div><div class="section-copy"><h2>$($primary.titulo)</h2><p class="catalogue-meta">$($primary.tipo) · $($primary.genero)</p><p>$($primary.sinopse)</p><div class="actions"><a class="button" href="/textos/$($primary.slug)/">Ler o conto</a></div></div></div></section>
<section class="section"><div class="shell section-grid"><div><p class="eyebrow">Biblioteca</p><h2>Textos</h2></div><div><a class="catalogue-item" href="/textos/$($primary.slug)/"><span class="catalogue-number">$($primary.numero)</span><div><h3>$($primary.titulo)</h3><span class="catalogue-meta">$($primary.tipo) · $($primary.genero)</span></div><p>$($primary.sinopse)</p></a></div></div></section>
<section class="section"><div class="shell section-grid"><div><p class="eyebrow">Autor</p><h2>Luciano<br>Jr Amorim</h2></div><div class="section-copy"><p>Luciano Jr Amorim escreve ficção especulativa sobre tecnologia, sistemas, isolamento e as formas pelas quais ideias levadas ao limite transformam a experiência humana.</p><div class="actions"><a class="button button-secondary" href="/autor/">Sobre o autor</a></div></div></div></section>
"@
Write-Page '/' (Get-Layout 'Luciano Jr Amorim — Ficção especulativa' 'Textos de ficção especulativa de Luciano Jr Amorim sobre tecnologia, isolamento, controle e experiência humana.' '/' 'inicio' $homeContent $personSchema)

$catalogue = $works | ForEach-Object { "<a class=`"catalogue-item`" href=`"/textos/$($_.slug)/`"><span class=`"catalogue-number`">$($_.numero)</span><div><h2>$($_.titulo)</h2><span class=`"catalogue-meta`">$($_.tipo) · $($_.genero)</span></div><p>$($_.sinopse)</p></a>" }
$textsContent = "<header class=`"page-intro`"><div class=`"shell`"><p class=`"eyebrow`">Biblioteca</p><h1>Textos</h1><p class=`"lede`">Obras curtas de ficção especulativa, reunidas em uma biblioteca em expansão.</p><div class=`"catalogue`">$($catalogue -join '')</div></div></header>"
Write-Page '/textos/' (Get-Layout 'Textos — Luciano Jr Amorim' 'Biblioteca de contos e textos de ficção especulativa de Luciano Jr Amorim.' '/textos/' 'textos' $textsContent)

$authorContent = '<header class="page-intro"><div class="shell section-grid"><div><p class="eyebrow">Autor</p><h1>Luciano<br>Jr Amorim</h1></div><div class="section-copy"><p class="lede">Luciano Jr Amorim escreve ficção especulativa sobre tecnologia, sistemas, isolamento e as formas pelas quais ideias levadas ao limite transformam a experiência humana.</p><div class="actions"><a class="button button-secondary" href="/textos/">Ver textos</a></div></div></div></header>'
Write-Page '/autor/' (Get-Layout 'Autor — Luciano Jr Amorim' 'Conheça a proposta literária de Luciano Jr Amorim, autor de ficção especulativa.' '/autor/' 'autor' $authorContent $personSchema)

$contactContent = '<header class="page-intro"><div class="shell section-grid"><div><p class="eyebrow">Contato</p><h1>Contato</h1></div><div class="section-copy"><p class="lede">Para questões relacionadas aos textos, projetos literários, convites ou outras formas de contato.</p><div class="contact-placeholder"><p>Canal de contato em definição.</p></div></div></div></header>'
Write-Page '/contato/' (Get-Layout 'Contato — Luciano Jr Amorim' 'Contato para questões relacionadas aos textos e projetos literários de Luciano Jr Amorim.' '/contato/' 'contato' $contactContent)

foreach ($work in $works) {
  $manuscript = Get-Content -Raw -Encoding UTF8 (Join-Path $sourceRoot "content/textos/$($work.arquivoConteudo)")
  $storySchemaObject = @{ '@context' = 'https://schema.org'; '@type' = 'ShortStory'; name = $work.titulo; author = @{ '@type' = 'Person'; name = 'Luciano Jr Amorim' }; genre = $work.genero; description = $work.sinopse; url = "$domain/textos/$($work.slug)/" }
  $storySchema = '<script type="application/ld+json">' + ($storySchemaObject | ConvertTo-Json -Compress -Depth 4) + '</script>'
  $storyContent = "<div class=`"reading-progress`" data-reading-progress aria-hidden=`"true`"></div><header class=`"story-header`"><div class=`"shell`"><p class=`"eyebrow`">$($work.tipo) · $($work.genero)</p><h1>$($work.titulo)</h1><p class=`"story-byline`">um conto de Luciano Jr Amorim</p><div class=`"story-meta`"><span>$($work.tempoLeitura) de leitura</span><a href=`"#leitura`">Começar leitura</a></div></div></header><div class=`"reading-toolbar`" aria-label=`"Tamanho do texto`"><span>Texto</span><button type=`"button`" data-font-size=`"normal`" aria-pressed=`"true`" aria-label=`"Tamanho de texto normal`">A</button><button type=`"button`" data-font-size=`"large`" aria-pressed=`"false`" aria-label=`"Texto maior`">A+</button></div><article class=`"story-content`" id=`"leitura`" data-reading-content>$manuscript</article><footer class=`"story-end`"><p>$($work.titulo)</p><p>Luciano Jr Amorim</p><a href=`"/textos/`">Voltar aos textos</a></footer>"
  Write-Page "/textos/$($work.slug)/" (Get-Layout "$($work.titulo) — Luciano Jr Amorim" $work.sinopse "/textos/$($work.slug)/" 'textos' $storyContent $storySchema)
}

$routes = @('/', '/textos/') + @($works | ForEach-Object { "/textos/$($_.slug)/" }) + @('/autor/', '/contato/')
$sitemapEntries = $routes | ForEach-Object { "<url><loc>$domain$_</loc></url>" }
[IO.File]::WriteAllText((Join-Path $outputRoot 'sitemap.xml'), "<?xml version=`"1.0`" encoding=`"UTF-8`"?>`n<urlset xmlns=`"http://www.sitemaps.org/schemas/sitemap/0.9`">$($sitemapEntries -join '')</urlset>`n", [Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText((Join-Path $outputRoot 'robots.txt'), "User-agent: *`nAllow: /`nSitemap: $domain/sitemap.xml`n", [Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText((Join-Path $outputRoot 'CNAME'), "lucianojramorim.com.br`n", [Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText((Join-Path $outputRoot '.nojekyll'), '', [Text.UTF8Encoding]::new($false))

Write-Output "Site gerado em dist/ com $($routes.Count) páginas."


