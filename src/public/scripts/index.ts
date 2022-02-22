interface Country {
  [key: string]: string | undefined;
  coutntry: string;
  continent?: string | undefined;
  currency_code?: string | undefined;
  city?: string | undefined;
  tld?: string | undefined;
  flag_base64?: string | undefined;
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
  const tableBody = $('<tbody>');

  Object.values(rows).every((row, rowIndex) => {
    if (rowIndex > 20) {
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

  $('#tableContainer').append(table);
}

function getCountriesData() {
  const xhttp = new XMLHttpRequest();
  xhttp.onload = function () {
    const countriesData: Record<string, Country> = JSON.parse(this.response);

    if (countriesData) {
      const headers = Object.keys(Object.values(countriesData)[0]).map(
        (header) => header
      );

      createTable(headers, countriesData);
    }
  };

  xhttp.open('GET', '/api/countries', true);
  xhttp.send();
}

$('#dataButton').on('click', () => {
  console.log('button clicked');
  getCountriesData();
});
