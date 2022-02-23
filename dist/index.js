"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const promises_1 = __importDefault(require("fs/promises"));
const url_1 = __importDefault(require("url"));
const path_1 = __importDefault(require("path"));
let countriesData = {};
function handleError(err, res) {
    res.write(err);
    res.end();
}
function sendFile(filePath, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const file = yield promises_1.default.readFile(path_1.default.join(__dirname, `public${filePath === '/' ? '/index.html' : filePath}`));
            if (filePath.includes('css')) {
                res.writeHead(200, { 'Content-Type': 'text/css' });
            }
            res.write(file);
            res.end();
        }
        catch (err) {
            handleError(err, res);
        }
    });
}
function sendCountriesData(res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (Object.keys(countriesData).length > 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(countriesData));
            res.end();
        }
        else {
            const startTime = performance.now();
            const names = yield promises_1.default.readFile(path_1.default.join(__dirname, 'country-objects/country-by-name.json'));
            const currencies = yield promises_1.default.readFile(path_1.default.join(__dirname, 'country-objects/country-by-currency-code.json'));
            const capitals = yield promises_1.default.readFile(path_1.default.join(__dirname, 'country-objects/country-by-capital-city.json'));
            const domain = yield promises_1.default.readFile(path_1.default.join(__dirname, 'country-objects/country-by-domain-tld.json'));
            const flag = yield promises_1.default.readFile(path_1.default.join(__dirname, 'country-objects/country-by-flag.json'));
            const continents = yield promises_1.default.readFile(path_1.default.join(__dirname, 'country-objects/country-by-continent.json'));
            const rawData = yield Promise.all([
                names,
                continents,
                currencies,
                capitals,
                domain,
                flag,
            ]);
            const readingTime = performance.now();
            const parsedData = rawData.map((currData) => JSON.parse(String(currData)));
            const temp = {};
            parsedData.forEach((dataArr) => {
                dataArr.forEach((elem) => {
                    var _a;
                    temp[elem.country] = Object.assign(Object.assign({}, ((_a = temp[elem.country]) !== null && _a !== void 0 ? _a : {})), elem);
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
    });
}
function sendResource(resourcePath, res) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (resourcePath) {
            case '/api/countries':
                sendCountriesData(res);
                break;
            default:
                handleError(`cannot find data for ${resourcePath}`, res);
        }
    });
}
function handleRequest(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.url) {
            res.write('<h1>Error to read url</h1>');
            res.end();
            return;
        }
        const currUrl = url_1.default.parse(req.url);
        if (currUrl.pathname) {
            if (currUrl.pathname.includes('api')) {
                sendResource(currUrl.pathname, res);
            }
            else {
                sendFile(currUrl.pathname, res);
            }
        }
        else {
            handleError('failed to parse url', res);
        }
    });
}
http_1.default
    .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    handleRequest(req, res);
})
    .listen(3000);
