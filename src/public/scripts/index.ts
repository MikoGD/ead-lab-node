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
  const nextRows = totalRows.slice(currentRowCount, currentRowCount + 20);

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

  currentRows.forEach((row) => {
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
  });

  table.append(tableBody);

  const tableContainer = $('#tableContainer');

  table.hide();

  tableContainer.append(table);

  table.fadeIn();

  tableContainer.on('scroll', (event) => {
    const { offsetHeight, scrollTop, scrollHeight } = event.target;
    const totalRowsLength = totalRows.length;

    // Check if scroll is 80% down if so more rows if there are more
    if (
      offsetHeight + scrollTop >= scrollHeight - scrollHeight * 0.2 &&
      currentRowCount < totalRows.length
    ) {
      addRow();
      currentRowCount =
        currentRowCount + 20 > totalRowsLength
          ? totalRowsLength
          : currentRowCount + 20;
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
      currentRowCount += 20;

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

  $('.spinner-border').removeClass('invisible');

  setTimeout(() => {
    getCountriesData();
    $('.spinner-border').remove();
    $('p').text('Folder has been read');
  }, 5000);
});
