import http, { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs/promises';
import url from 'url';
import path from 'path';

interface Country {
  [key: string]: string | undefined;
  coutntry: string;
  continent?: string | undefined;
  currency_code?: string | undefined;
  city?: string | undefined;
  tld?: string | undefined;
  flag_base64?: string | undefined;
}

let countriesData: Record<string, Country> = {};

function handleError(err: string, res: ServerResponse) {
  res.write(err);
  res.end();
}

async function sendFile(filePath: string, res: ServerResponse) {
  console.log(filePath);
  try {
    if (filePath === '/' || filePath.includes('html')) {
      const file = await fs.readFile(
        path.join(__dirname, '../public/index.html')
      );

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(file);
      res.end();
    }

    if (filePath.includes('js')) {
      const file = await fs.readFile(
        path.join(__dirname, '../public/scripts/index.js')
      );

      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.write(file);
      res.end();
    }
  } catch (err) {
    handleError(err as string, res);
  }
}

async function sendCountriesData(res: ServerResponse) {
  if (Object.keys(countriesData).length > 0) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(countriesData));
    res.end();
  } else {
    const startTime = performance.now();
    const names = fs.readFile(
      path.join(__dirname, '../country-objects/country-by-name.json')
    );

    const currencies = fs.readFile(
      path.join(__dirname, '../country-objects/country-by-currency-code.json')
    );

    const capitals = fs.readFile(
      path.join(__dirname, '../country-objects/country-by-capital-city.json')
    );

    const domain = fs.readFile(
      path.join(__dirname, '../country-objects/country-by-domain-tld.json')
    );

    const flag = fs.readFile(
      path.join(__dirname, '../country-objects/country-by-flag.json')
    );

    const continents = fs.readFile(
      path.join(__dirname, '../country-objects/country-by-continent.json')
    );

    const rawData = await Promise.all([
      names,
      continents,
      currencies,
      capitals,
      domain,
      flag,
    ]);

    const readingTime = performance.now();

    const parsedData: Record<string, any>[][] = rawData.map((currData) =>
      JSON.parse(String(currData))
    );

    const temp: Record<string, Country> = {};

    parsedData.forEach((dataArr) => {
      dataArr.forEach((elem) => {
        temp[elem.country] = { ...(temp[elem.country] ?? {}), ...elem };
      });
    });

    countriesData = temp;

    const parsingTime = performance.now();

    console.log(`Time to read files: ${readingTime - startTime}`);
    console.log(`Time to parse data: ${parsingTime - readingTime}`);
    console.log(`Total elapsed time: ${parsingTime - startTime}`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(countriesData));
    res.end();
  }
}

async function sendResource(resourcePath: string, res: ServerResponse) {
  switch (resourcePath) {
    case '/api/countries':
      sendCountriesData(res);
      break;
    default:
      handleError(`cannot find data for ${resourcePath}`, res);
  }
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  if (!req.url) {
    res.write('<h1>Error reading url</h1>');
    res.end();
    return;
  }

  const currUrl = url.parse(req.url);

  if (currUrl.pathname) {
    if (currUrl.pathname.includes('api')) {
      sendResource(currUrl.pathname, res);
    } else {
      sendFile(currUrl.pathname, res);
    }
  } else {
    handleError('failed to parse url', res);
  }
}

http
  .createServer((req, res) => {
    handleRequest(req, res);
  })
  .listen(3000);
