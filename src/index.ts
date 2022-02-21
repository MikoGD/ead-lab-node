import http, { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import url from 'url';
import path from 'path';

function handleError(err: string, res: ServerResponse) {
  res.write(err);
  res.end();
}

async function sendFile(filePath: string, res: ServerResponse) {
  fs.readFile(
    path.join(
      __dirname,
      `public${filePath === '/' ? '/index.html' : filePath}`
    ),
    (err, data) => {
      if (err) {
        handleError(err.message, res);
        return;
      }

      res.write(data);
      res.end();
    }
  );
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  if (!req.url) {
    res.write('<h1>Error to read url</h1>');
    res.end();
    return;
  }

  const currUrl = url.parse(req.url);

  if (currUrl.pathname) {
    sendFile(currUrl.pathname, res);
  } else {
    handleError('failed to parse url', res);
  }
}

http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    handleRequest(req, res);
  })
  .listen(3000);
