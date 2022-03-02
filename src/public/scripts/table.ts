import { FILTER_TYPE } from './types';
import {
  addCellColorChangeClickListener,
  addFilterOnClickListener,
  applyFilter,
} from './utils';
import { addRowsToCurrent, store } from './store';

function addRow() {
  const { rows, currentRowCount } = store.getState();
  const increment = 20;

  const nextRows = rows.slice(currentRowCount, currentRowCount + increment);

  store.dispatch(addRowsToCurrent({ rows: nextRows, count: increment }));

  applyFilter();
}

export function createTableHeaders() {
  const { headers } = store.getState();
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
      addFilterOnClickListener(col, header);
    }

    headerRow.append(col);
  });

  headerRowContainer.append(headerRow);

  return headerRowContainer;
}

export function createTableBody() {
  const { currentRows, headers } = store.getState();
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

export function createTable() {
  const table = $('<table>', {
    class: 'table overflow-scroll',
    id: 'countryTable',
  });

  const tableHeader = createTableHeaders();
  const tableBody = createTableBody();

  table.append(tableHeader);
  table.append(tableBody);

  table.hide();

  const tableContainer = $('#tableContainer');

  tableContainer.append(table);

  addCellColorChangeClickListener($('.row-cell'));

  tableContainer.on('scroll', (event) => {
    const { offsetHeight, scrollTop, scrollHeight } = event.target;
    const { rows, currentRowCount, filter } = store.getState();

    // Check if scroll is 80% down if so more rows if there are more
    if (
      offsetHeight + scrollTop >= scrollHeight - scrollHeight * 0.2 &&
      currentRowCount < rows.length &&
      filter.type !== FILTER_TYPE.DESCENDING
    ) {
      addRow();
    }
  });

  table.fadeIn();
}
