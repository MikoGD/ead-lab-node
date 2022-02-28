interface Country {
  [key: string]: string | undefined;
  coutntry: string;
  continent?: string | undefined;
  currency_code?: string | undefined;
  city?: string | undefined;
  tld?: string | undefined;
  flag_base64?: string | undefined;
}

enum FILTER_TYPE {
  ASCENDING,
  DESCENDING,
}

interface Filter {
  header: string;
  type: FILTER_TYPE;
}

const bgColors = [
  'bg-primary',
  'bg-secondary',
  'bg-danger',
  'bg-success',
  'bg-warning',
  'bg-info',
];

let currentRowCount = 0;
let headers: string[] = [];
let currentRows: Country[] = [];
let totalRows: Country[] = [];
const currentFilter: Partial<Filter> = {};

// eslint-disable-next-line no-undef
function addCellColorChange(elements: JQuery<HTMLElement>) {
  elements.on('click', (event) => {
    const classToRemove = $(event.target).attr('class')?.split(' ').pop();

    if (classToRemove && classToRemove.includes('bg')) {
      event.target.classList.remove(classToRemove);
    }

    let colorIndex = Math.floor(Math.random() * bgColors.length);
    let newClass = bgColors[colorIndex];

    if (newClass === classToRemove) {
      colorIndex += 1;
      newClass = bgColors[colorIndex];
    }

    event.target.classList.add(newClass);
  });
}

function addRow() {
  const nextRows = totalRows.slice(currentRowCount, currentRowCount + 20);

  currentRows = [...currentRows, ...nextRows];

  nextRows.forEach((row) => {
    const currRow = $('<tr>');
    headers.forEach((currHeader, headerIndex, headersArr) => {
      const cell = $('<td>', { class: 'row-cell text-center' });

      if (headerIndex === headersArr.length - 1) {
        const flag = $('<img>', {
          src: row[currHeader],
          class: 'flag',
        });

        cell.append(flag);
      } else {
        cell.text(row[currHeader] ?? 'N/A');
      }

      currRow.append(cell);

      addCellColorChange(currRow.children('td.row-cell'));
    });

    $('#tableBody').append(currRow);
  });
}

function renderFilteredRows(filteredRows: Country[]) {
  $('#tableBody').empty();
  console.log(filteredRows.slice(0, 10));

  filteredRows.forEach((row) => {
    const currRow = $('<tr>');
    headers.forEach((currHeader, headerIndex, headersArr) => {
      const cell = $('<td>', { class: 'row-cell text-center' });

      if (headerIndex === headersArr.length - 1) {
        const flag = $('<img>', {
          src: row[currHeader],
          class: 'flag',
        });

        cell.append(flag);
      } else {
        cell.text(row[currHeader] ?? 'N/A');
      }

      currRow.append(cell);

      addCellColorChange(currRow.children('td.row-cell'));
    });

    $('#tableBody').append(currRow);
  });
}

function applyFilter(header: string, filterType: FILTER_TYPE) {
  console.log('header: ', header);
  console.log('filterType: ', filterType);

  currentRows = currentRows.sort((a, b) => {
    const textA = !a || !a[header] ? '' : a[header]!.toUpperCase();
    const textB = !b || !b[header] ? '' : b[header]!.toUpperCase();

    /* eslint-disable no-nested-ternary */
    if (filterType === FILTER_TYPE.ASCENDING) {
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    }

    return textA > textB ? -1 : textA < textB ? 1 : 0;
    /* eslint-enable no-nested-ternary */
  });

  renderFilteredRows(currentRows);
}

/* eslint-disable no-undef */
function addFilterOnClick(col: JQuery<HTMLElement>, header: string) {
  /* eslint-enable no-undef */
  col.on('click', () => {
    if (currentFilter.header !== header) {
      $(`#col-${currentFilter.header}`)
        .children('span')
        .removeClass('fa-up-long');
      $(`#col-${currentFilter.header}`)
        .children('span')
        .removeClass('fa-down-long');
    }

    currentFilter.header = header;

    const icon = col.children('span');

    if (currentFilter.type === FILTER_TYPE.ASCENDING) {
      icon.removeClass('fa-up-long');
      icon.addClass('fa-down-long');
      currentFilter.type = FILTER_TYPE.DESCENDING;
    } else {
      icon.removeClass('fa-down-long');
      icon.addClass('fa-up-long');
      currentFilter.type = FILTER_TYPE.ASCENDING;
    }

    applyFilter(header, currentFilter.type);
  });
}

function createTable(displayHeaders: string[]) {
  const table = $('<table>', {
    class: 'table overflow-scroll',
    id: 'countryTable',
  });

  const header = $('<thead>');
  const headerRow = header.append('<tr>');

  displayHeaders.forEach((headerString, index) => {
    const col = $('<th>', {
      scope: 'col',
      class: 'text-center table-header',
      id: `col-${headers[index]}`,
    }).text(headerString);

    const icon = $('<span>', { class: 'fa-solid' });

    col.append(icon);

    if (index === 0) {
      icon.addClass('fa-long-up');

      currentFilter.header = headers[index];
      currentFilter.type = FILTER_TYPE.ASCENDING;
    }

    addFilterOnClick(col, headers[index]);

    headerRow.append(col);
  });

  table.append(headerRow);
  const tableBody = $('<tbody>', { id: 'tableBody' });

  currentRows.forEach((row) => {
    const currRow = $('<tr>');
    headers.forEach((currHeader, headerIndex, headersArr) => {
      const cell = $('<td>', { class: 'row-cell text-center' });

      if (headerIndex === headersArr.length - 1) {
        const flag = $('<img>', {
          src: row[currHeader],
          class: 'flag',
        });

        cell.append(flag);
      } else {
        cell.text(row[currHeader] ?? '');
      }

      currRow.append(cell);
    });

    tableBody.append(currRow);
  });

  table.append(tableBody);

  const tableContainer = $('#tableContainer');

  table.hide();

  tableContainer.append(table);

  addCellColorChange($('.row-cell'));

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

  table.fadeIn();
}

function getCountriesData() {
  const xhttp = new XMLHttpRequest();

  const start = performance.now();

  xhttp.onload = function () {
    const countriesData: Record<string, Country> = JSON.parse(this.response);
    const displayHeaders: string[] = [];

    if (countriesData) {
      headers = Object.keys(Object.values(countriesData)[0]).map((header) => {
        if (header === 'currency_code') {
          displayHeaders.push('Currency name');
        } else if (header === 'tld') {
          displayHeaders.push('Internet domain');
        } else if (header === 'flag_base64') {
          displayHeaders.push('Flag');
        } else {
          const displayHeader = header.split('');
          displayHeader[0] = displayHeader[0].toUpperCase();
          displayHeaders.push(displayHeader.join(''));
        }

        return header;
      });

      totalRows = Object.values(countriesData);

      currentRows = [...currentRows, ...totalRows.slice(currentRowCount, 20)];
      currentRowCount += 20;

      createTable(displayHeaders);
      const end = performance.now();
      console.log(`Time to render table: ${end - start}`);
    }
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
