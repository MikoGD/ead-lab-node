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
let headers: string[] = [];
let currentRows: Country[] = [];
let totalRows: Country[] = [];

function addRow() {
  const nextRows = totalRows.splice(currentRowCount, 20);

  currentRows = [...currentRows, ...nextRows];

  nextRows.forEach((row) => {
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
        cell = $('<td>').text(row[currHeader] ?? '&nbsp;');
      }

      currRow.append(cell);
    });

    $('#tableBody').append(currRow);
  });
}

function createTable() {
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

  totalRows.every((row, rowIndex) => {
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
        cell = $('<td>').text(row[currHeader] ?? '');
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
        event.target.scrollHeight - event.target.scrollHeight * 0.2 &&
      currentRowCount <= totalRows.length
    ) {
      addRow();
    }
  });
}

function getCountriesData() {
  const xhttp = new XMLHttpRequest();
  const start = performance.now();
  xhttp.onload = function () {
    const countriesData: Record<string, Country> = JSON.parse(this.response);

    if (countriesData) {
      headers = Object.keys(Object.values(countriesData)[0]).map(
        (header) => header
      );

      totalRows = Object.values(countriesData);

      currentRows = [...currentRows, ...totalRows.slice(currentRowCount, 20)];

      createTable();
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
