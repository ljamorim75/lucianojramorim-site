import sharp from 'sharp';
import path from 'node:path';
import { writeFile } from 'node:fs/promises';

export async function optimizeImages({ src, dist, works }) {
  const manifest = {};
  const sources = new Set(works.flatMap(work => [work.imagem, work.imagemSocial]).filter(Boolean));
  sources.add('/assets/img/og-site.png');
  for (const source of sources) {
    const input = path.join(src, source.slice(1));
    const metadata = await sharp(input).metadata();
    const stem = path.posix.basename(source, path.posix.extname(source));
    if (stem.startsWith('og-')) {
      const social = `/assets/img/${stem}-social.jpg`;
      await sharp(input).resize(1200, 630, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(dist, social.slice(1)));
      manifest[source] = { social };
      continue;
    }
    const widths = [...new Set([480, 960, 1440].map(width => Math.min(width, metadata.width)))];
    const variants = [];
    for (const width of widths) {
      const url = `/assets/img/${stem}-${width}.webp`;
      await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 })
        .toFile(path.join(dist, url.slice(1)));
      variants.push({ url, width });
    }
    manifest[source] = {
      src: variants[Math.min(1, variants.length - 1)].url,
      srcset: variants.map(image => `${image.url} ${image.width}w`).join(', '),
      width: metadata.width, height: metadata.height
    };
  }
  await writeFile(path.join(dist, 'image-manifest.json'), JSON.stringify(manifest, null, 2));
  return manifest;
}
