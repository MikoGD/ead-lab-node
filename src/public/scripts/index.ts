import '../styles/index.css';
import { Country, CountryTable, FILTER_TYPE } from './types';
import { createTable } from './table';

const countryTable: CountryTable = {
  currentRows: [],
  currentRowCount: 0,
  filter: {
    header: '',
    type: FILTER_TYPE.ASCENDING,
  },
  headers: {} as Country,
  rows: [],
};

function getCountriesData() {
  const xhttp = new XMLHttpRequest();

  const start = performance.now();

  xhttp.onload = function () {
    const countriesData: Record<string, Country> = JSON.parse(this.response);

    countryTable.headers = Object.keys(Object.values(countriesData)[0]).reduce(
      (currHeaders: Partial<Country>, header) => {
        switch (header) {
          case 'currency_code':
            currHeaders[header] = 'Currency name';
            break;
          case 'tld':
            currHeaders[header] = 'Internet domain';
            break;
          case 'flag_base64':
            currHeaders[header] = 'Flag';
            break;
          default:
            const displayHeader = header.split('');
            displayHeader[0] = displayHeader[0].toUpperCase();
            currHeaders[header] = displayHeader.join('');
        }

        return currHeaders;
      },
      {}
    ) as Country;

    countryTable.rows = Object.values(countriesData);

    countryTable.currentRows = [
      ...countryTable.rows.slice(countryTable.currentRowCount, 20),
    ];

    countryTable.currentRowCount += 20;

    createTable(countryTable);
    const end = performance.now();
    console.log(`Time to render table: ${end - start}`);
  };

  xhttp.open('GET', '/api/countries', true);
  xhttp.send();
}

$('#dataButton').on('click', (event) => {
  event.target.setAttribute('disabled', 'true');
  $('.spinner-border').removeClass('invisible');

  setTimeout(() => {
    getCountriesData();

    $('.spinner-border').remove();

    const paragraph = $('p');
    paragraph.fadeIn();
    paragraph.text('Folder has been read!!!');
    paragraph.addClass('display-2 text-center');
  }, 1000);
});
