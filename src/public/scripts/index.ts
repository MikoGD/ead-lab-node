interface Countries {
  [country: string]: string[];
  continent: string[];
  currency_code: string[];
  city: string[];
  tld: string[];
  flag_base64: string[];
}

function createTable(headers: string[], rows: string[][]) {
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

  rows.forEach((row) => {
    const currRow = $('<tr>');

    row.forEach((cellData, index, arr) => {
      let cell;
      if (index === arr.length - 1) {
        cell = $('<td>');
        const flag = $('<img>', {
          src: cellData,
        });
        flag.height('5rem');
        flag.width('100%');
        cell.append(flag);
      } else {
        cell = $('<td>').text(cellData);
      }
      currRow.append(cell);
    });
    tableBody.append(currRow);
  });

  table.append(tableBody);

  $('#tableContainer').append(table);
}

function getCountriesData() {
  const xhttp = new XMLHttpRequest();
  xhttp.onload = function () {
    const countriesData: Countries = JSON.parse(this.response);
    if (countriesData) {
      // // @ts-ignore
      // delete countriesData.flag_base64;
      const headers = Object.keys(countriesData).map((header) => header);
      const rows = [];

      for (let i = 0; i < countriesData.country.length; i += 1) {
        const currRow = headers.map((header) => countriesData[header][i]);
        rows.push(currRow);
      }

      createTable(headers, rows);
    }
  };

  xhttp.open('GET', '/api/countries', true);
  xhttp.send();
}

$('#dataButton').on('click', () => {
  console.log('button clicked');
  getCountriesData();
});
