import {
  createReadStream,
  existsSync,
  statSync
} from 'node:fs';

import { createServer } from 'node:http';
import path from 'node:path';

const port = Number.parseInt(
  process.env.PORT ?? '4173',
  10
);

const webRoot = path.resolve('dist');

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

createServer((request, response) => {
  const requestedPath = decodeURIComponent(
    new URL(
      request.url,
      `http://${request.headers.host}`
    ).pathname
  );

  let filePath = path.resolve(
    webRoot,
    `.${requestedPath}`
  );

  if (!filePath.startsWith(webRoot)) {
    response
      .writeHead(403)
      .end();

    return;
  }

  if (
    existsSync(filePath) &&
    statSync(filePath).isDirectory()
  ) {
    filePath = path.join(
      filePath,
      'index.html'
    );
  }

  if (
    !existsSync(filePath) ||
    !statSync(filePath).isFile()
  ) {
    const notFoundPage = path.join(webRoot, '404.html');
    if (existsSync(notFoundPage) && statSync(notFoundPage).isFile()) {
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      createReadStream(notFoundPage).pipe(response);
      return;
    }

    response
      .writeHead(
        404,
        {
          'Content-Type':
            'text/plain; charset=utf-8'
        }
      )
      .end('Não encontrado');

    return;
  }

  const extension =
    path.extname(filePath).toLowerCase();

  const contentType =
    mimeTypes[extension] ??
    'application/octet-stream';

  response.writeHead(
    200,
    {
      'Content-Type': contentType
    }
  );

  createReadStream(filePath).pipe(response);
}).listen(
  port,
  '127.0.0.1',
  () => {
    console.log(
      `Local: http://localhost:${port}/`
    );
  }
);
