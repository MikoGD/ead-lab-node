import http, { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs/promises';
import url from 'url';
import path from 'path';

interface Countries {
  [country: string]: string[];
  continent: string[];
  currency_code: string[];
  city: string[];
  tld: string[];
  flag_base64: string[];
}

const countriesData: Countries = {
  country: [],
  continent: [],
  currency_code: [],
  city: [],
  tld: [],
  flag_base64: [],
};

function handleError(err: string, res: ServerResponse) {
  res.write(err);
  res.end();
}

async function sendFile(filePath: string, res: ServerResponse) {
  try {
    const file = await fs.readFile(
      path.join(
        __dirname,
        `public${filePath === '/' ? '/index.html' : filePath}`
      )
    );

    if (filePath.includes('css')) {
      res.writeHead(200, { 'Content-Type': 'text/css' });
    }

    res.write(file);
    res.end();
  } catch (err) {
    handleError(err as string, res);
  }
}

async function sendCountriesData(res: ServerResponse) {
  if (countriesData.continent.length > 0) {
    res.write(JSON.stringify(countriesData));
    res.end();
  } else {
    const names = await fs.readFile(
      path.join(__dirname, 'country-objects/country-by-name.json')
    );

    const currencies = await fs.readFile(
      path.join(__dirname, 'country-objects/country-by-currency-code.json')
    );

    const capitals = await fs.readFile(
      path.join(__dirname, 'country-objects/country-by-capital-city.json')
    );

    const domain = await fs.readFile(
      path.join(__dirname, 'country-objects/country-by-domain-tld.json')
    );

    const flag = await fs.readFile(
      path.join(__dirname, 'country-objects/country-by-flag.json')
    );

    const continents = await fs.readFile(
      path.join(__dirname, 'country-objects/country-by-continent.json')
    );

    const rawData = await Promise.all([
      names,
      continents,
      currencies,
      capitals,
      domain,
      flag,
    ]);

    const parsedData = rawData.map((currData) => JSON.parse(String(currData)));

    Object.keys(countriesData).forEach((key, index) => {
      countriesData[key] = parsedData[index].map((obj: any) => obj[key]);
    });

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
    res.write('<h1>Error to read url</h1>');
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
    res.writeHead(200, { 'Content-Type': 'text/html' });
    handleRequest(req, res);
  })
  .listen(3000);
