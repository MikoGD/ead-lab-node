import { FILTER_TYPE } from './types';
import {
  addCellColorChangeClickListener,
  addFilterOnClickListener,
  applyFilter,
} from './utils';
import { addRowsToCurrent, store, updateFilter } from './store';

type JQueryScrollEvent = JQuery.ScrollEvent<
  HTMLElement,
  undefined,
  HTMLElement,
  HTMLElement
>;

function addRow(scrollEvent?: JQueryScrollEvent) {
  const { rows, currentRowCount, filter } = store.getState();
  const increment = 20;

  const nextRows = rows.slice(currentRowCount, currentRowCount + increment);
  if (scrollEvent) {
    const { offsetHeight, scrollTop, scrollHeight } = scrollEvent.target;

    // Check if scroll is 80% down if so more rows if there are more
    if (
      offsetHeight + scrollTop >= scrollHeight - scrollHeight * 0.2 &&
      currentRowCount < rows.length &&
      filter.type !== FILTER_TYPE.DESCENDING
    ) {
      store.dispatch(addRowsToCurrent({ rows: nextRows, count: increment }));
      applyFilter();
    }
  } else if (currentRowCount < rows.length) {
    store.dispatch(addRowsToCurrent({ rows: nextRows, count: increment }));
    applyFilter();
  }

  if (currentRowCount + increment > rows.length) {
    $('#loadMoreButton').prop('disabled', true);
  }
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

function createResetFilterButton() {
  const resetFilterButton = $('<button>', {
    type: 'button',
    class: 'btn btn-secondary me-3',
    id: 'resetButton',
  })
    .text('Reset filter')
    .prop('disabled', true)
    .on('click', () => {
      const { headers, filter } = store.getState();

      const firstHeader = Object.keys(headers)[0];
      console.log('firstHeader: ', firstHeader);

      store.dispatch(
        updateFilter({ header: firstHeader, type: FILTER_TYPE.ASCENDING })
      );

      if (filter.type === FILTER_TYPE.ASCENDING) {
        $('.fa-up-long').removeClass('fa-up-long');
      } else {
        $('.fa-down-long').removeClass('fa-down-long');
      }

      $(`#col-${firstHeader}`).children('span').addClass('fa-up-long');

      applyFilter();
    });

  return resetFilterButton;
}

function createLoadMoreButton() {
  const loadMoreButton = $('<button>', {
    class: 'btn btn-secondary',
    id: 'loadMoreButton',
    type: 'button',
  })
    .text('Load next rows')
    .on('click', () => addRow());

  return loadMoreButton;
}

export function addTableButtons() {
  const resetButton = createResetFilterButton();
  const loadMoreButton = createLoadMoreButton();

  $('#tableContainer').append(resetButton).append(loadMoreButton);
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
    addRow(event);
  });

  table.fadeIn();
}
