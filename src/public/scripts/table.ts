import { CountryTable, FILTER_TYPE } from './types';
import {
  addCellColorChangeClickListener,
  addFilterOnClickListener,
  applyFilter,
} from './utils';

function addRow(countryTable: CountryTable) {
  const { rows, currentRows, currentRowCount } = countryTable;
  const nextRows = rows.slice(currentRowCount, currentRowCount + 20);

  countryTable.currentRows = [...currentRows, ...nextRows];

  applyFilter(countryTable);
}

export function createTableHeaders(countryTable: CountryTable) {
  const { headers } = countryTable;
  const headersLength = Object.keys(headers).length;
  const headerRowContainer = $('<thead>');
  const headerRow = $('<tr>');

  Object.entries(headers).forEach(([header, displayHeader], index) => {
    const col = $('<th>', {
      scope: 'col',
      class: [
        'text-center table-header',
        index !== headersLength - 1 && 'col-pointer',
      ].join(' '),
      id: `col-${header}`,
    }).text(displayHeader ?? 'N/A');

    const icon = $('<span>', { class: 'fa-solid' });

    col.append(icon);

    if (index === 0) {
      icon.addClass('fa-up-long');
    }

    if (index !== headersLength - 1) {
      addFilterOnClickListener(col, countryTable, headers[index]);
    }

    headerRow.append(col);
  });

  headerRowContainer.append(headerRow);

  return headerRowContainer;
}

export function createTableBody(countryTable: CountryTable) {
  const { currentRows, headers } = countryTable;
  const tableBody = $('<tbody>', { id: 'tableBody' });

  currentRows.forEach((row) => {
    const currRow = $('<tr>');

    Object.keys(headers).forEach((currHeader, headerIndex, headersArr) => {
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

  return tableBody;
}

export function createTable(countryTable: CountryTable) {
  const table = $('<table>', {
    class: 'table overflow-scroll',
    id: 'countryTable',
  });

  const tableHeader = createTableHeaders(countryTable);
  const tableBody = createTableBody(countryTable);

  table.append(tableHeader);
  table.append(tableBody);

  table.hide();

  const tableContainer = $('#tableContainer');

  tableContainer.append(table);

  addCellColorChangeClickListener($('.row-cell'));

  tableContainer.on('scroll', (event) => {
    const { offsetHeight, scrollTop, scrollHeight } = event.target;
    const { rows, currentRowCount, filter } = countryTable;

    const totalRowsLength = countryTable.rows.length;

    // Check if scroll is 80% down if so more rows if there are more
    if (
      offsetHeight + scrollTop >= scrollHeight - scrollHeight * 0.2 &&
      currentRowCount < rows.length &&
      filter.type !== FILTER_TYPE.DESCENDING
    ) {
      addRow(countryTable);

      countryTable.currentRowCount =
        currentRowCount + 20 > totalRowsLength
          ? totalRowsLength
          : currentRowCount + 20;
    }
  });

  table.fadeIn();
}
