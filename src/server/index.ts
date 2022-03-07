import http, { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs/promises';
import url from 'url';
import path from 'path';

interface CountryEntry {
  [key: string]: string;
  country: string;
}
interface Country {
  [key: string]: string | undefined;
  country?: string;
  continent?: string | undefined;
  currency_code?: string | undefined;
  city?: string | undefined;
  tld?: string | undefined;
  flag_base64?: string | undefined;
}

const countryFiles = [
  'name',
  'continent',
  'currency-code',
  'capital-city',
  'domain-tld',
  'flag',
];

let mergedCountriesData: Record<string, Country> = {};

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

async function getCountryData() {
  return await Promise.all(
    /* Return an array of promises containing the promises of reading the files */
    countryFiles.map((file) => {
      const filePath = path.join(
        __dirname,
        `../country-objects/country-by-${file}.json`
      );

      try {
        return fs.readFile(filePath);
      } catch (err) {
        throw new Error(
          `failed to read file: ${filePath}${
            typeof err === 'string' ? ` - ${err}` : ''
          }`
        );
      }
    })
  );
}

/*
A map is created where the key is the country and the value is an object with each data from the
JSON files. This work as when it loops through the entries from the JSON files it gets the country
key and spreads that object into the object contained in the key with the same country name.
*/

function mergeCountriesData(countriesData: CountryEntry[][]) {
  const mergedCountriesData: Record<string, Country> = {};

  countriesData.forEach((countryEntries) => {
    countryEntries.forEach((entry) => {
      const key = entry.country;

      mergedCountriesData[key] = {
        ...(mergedCountriesData[key] ?? {}),
        ...entry,
      };
    });
  });

  return mergedCountriesData;
}

async function sendCountriesData(res: ServerResponse) {
  if (Object.keys(mergedCountriesData).length > 0) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(mergedCountriesData));
    res.end();
  } else {
    const startTime = performance.now();

    const rawCountryData = await getCountryData();

    const readingTime = performance.now();

    const parsedData: CountryEntry[][] = rawCountryData.map((currData) =>
      JSON.parse(String(currData))
    );

    const mergedCountriesData = mergeCountriesData(parsedData);

    const parsingTime = performance.now();

    console.log(`Time to read files: ${readingTime - startTime}`);
    console.log(`Time to parse data: ${parsingTime - readingTime}`);
    console.log(`Total elapsed time: ${parsingTime - startTime}`);

    console.log('sending files');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(mergedCountriesData));
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

http.createServer(handleRequest).listen(3000);
