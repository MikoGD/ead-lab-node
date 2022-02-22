interface Country {
  [key: string]: string | undefined;
  coutntry: string;
  continent?: string | undefined;
  currency_code?: string | undefined;
  city?: string | undefined;
  tld?: string | undefined;
  flag_base64?: string | undefined;
}

let currentRowCount = 0;
let cachedHeaders: string[] = [];
let cachedCountriesData: Record<string, Country> = {};

function addRow() {
  Object.values(cachedCountriesData)
    .splice(currentRowCount)
    .every((row, rowIndex) => {
      if (rowIndex > 20) {
        currentRowCount += 20;
        return false;
      }

      const currRow = $('<tr>');
      cachedHeaders.forEach((currHeader, headerIndex, headersArr) => {
        let cell;

        if (headerIndex === headersArr.length - 1) {
          cell = $('<td>');
          const flag = $('<img>', {
            src: row[currHeader],
            class: 'flag',
          });
          cell.append(flag);
        } else {
          cell = $('<td>').text(row[currHeader] ?? '&nbsp;');
        }

        currRow.append(cell);
      });

      $('#tableBody').append(currRow);

      return true;
    });
}

function createTable(
  headers: string[],
  rows: Record<string, Record<string, any>>
) {
  const table = $('<table>', {
    class: 'table overflow-scroll',
    id: 'countryTable',
  });

  const header = $('<thead>');
  const headerRow = header.append('<tr>');
  headers.forEach((headerString) => {
    const col = $('<th>', { scope: 'col' }).text(headerString);
    headerRow.append(col);
  });

  table.append(headerRow);
  const tableBody = $('<tbody>', { id: 'tableBody' });

  Object.values(rows).every((row, rowIndex) => {
    if (rowIndex > 20) {
      currentRowCount += 20;
      return false;
    }

    const currRow = $('<tr>');
    headers.forEach((currHeader, headerIndex, headersArr) => {
      let cell;

      if (headerIndex === headersArr.length - 1) {
        cell = $('<td>');
        const flag = $('<img>', {
          src: row[currHeader],
          class: 'flag',
        });
        cell.append(flag);
      } else {
        cell = $('<td>').text(row[currHeader]);
      }

      currRow.append(cell);
    });

    tableBody.append(currRow);

    return true;
  });

  table.append(tableBody);

  const tableContainer = $('#tableContainer');

  tableContainer.append(table);

  tableContainer.on('scroll', (event) => {
    if (
      event.target.offsetHeight + event.target.scrollTop >=
      event.target.scrollHeight - event.target.scrollHeight * 0.2
    ) {
      addRow();
    }
  });
}

function getCountriesData() {
  const xhttp = new XMLHttpRequest();
  const start = performance.now();
  xhttp.onload = function () {
    cachedCountriesData = JSON.parse(this.response);

    if (cachedCountriesData) {
      cachedHeaders = Object.keys(Object.values(cachedCountriesData)[0]).map(
        (header) => header
      );

      createTable(cachedHeaders, cachedCountriesData);
      const end = performance.now();
      console.log(`Time to render table: ${end - start}`);
    }
  };

  xhttp.open('GET', '/api/countries', true);
  xhttp.send();
}

$('#dataButton').on('click', () => {
  console.log('button clicked');
  getCountriesData();
});
