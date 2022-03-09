import { bgColors, FILTER_TYPE } from './types';
import { store, updateCurrentRows, updateFilter } from './store';

export function addCellColorChangeClickListener(elements: JQuery<HTMLElement>) {
  elements.on('click', (event) => {
    const classToRemove = $(event.target).attr('class')?.split(' ').pop();

    if (classToRemove && classToRemove.includes('bg')) {
      event.target.classList.remove(classToRemove);
    }

    let colorIndex = Math.floor(Math.random() * bgColors.length);
    let newClass = bgColors[colorIndex];

    if (newClass === classToRemove) {
      colorIndex = (colorIndex + 1) % bgColors.length;
      newClass = bgColors[colorIndex];
    }

    event.target.classList.add(newClass);
  });
}

export function renderFilteredRows() {
  const { currentRows, headers, filter } = store.getState();

  $('#tableBody').empty();

  currentRows.forEach((row) => {
    const currRow = $('<tr>');

    Object.keys(headers).forEach((header, headerIndex, headersArr) => {
      const cell = $('<td>', { class: 'row-cell text-center' });

      if (headerIndex === headersArr.length - 1) {
        const flag = $('<img>', {
          src: row[header],
          class: 'flag',
        });

        cell.append(flag);
      } else {
        cell.text(row[header] ?? 'N/A');
      }

      currRow.append(cell);

      addCellColorChangeClickListener(currRow.children('td.row-cell'));
    });

    $('#tableBody').append(currRow);
  });
}

export function applyFilter() {
  const {
    filter: { header, type: filterType },
    currentRows,
  } = store.getState();

  const currentRowsCopy = [...currentRows];

  store.dispatch(
    updateCurrentRows(
      currentRowsCopy.sort((a, b) => {
        const textA = !a || !a[header] ? '' : a[header]!.toUpperCase();
        const textB = !b || !b[header] ? '' : b[header]!.toUpperCase();

        /* eslint-disable no-nested-ternary */
        if (filterType === FILTER_TYPE.ASCENDING) {
          return textA < textB ? -1 : textA > textB ? 1 : 0;
        }

        return textA > textB ? -1 : textA < textB ? 1 : 0;
        /* eslint-enable no-nested-ternary */
      })
    )
  );

  renderFilteredRows();
}

export function addFilterOnClickListener(
  col: JQuery<HTMLElement>,
  currHeader: string
) {
  col.on('click', () => {
    const { filter } = store.getState();

    if (filter.header !== currHeader) {
      $(`#col-${filter.header}`).children('span').removeClass('fa-up-long');
      $(`#col-${filter.header}`).children('span').removeClass('fa-down-long');
    }

    const icon = col.children('span');
    const newFilter = { header: currHeader, type: FILTER_TYPE.ASCENDING };

    if (filter.type === FILTER_TYPE.ASCENDING) {
      icon.removeClass('fa-up-long');
      icon.addClass('fa-down-long');

      newFilter.type = FILTER_TYPE.DESCENDING;
    } else {
      icon.removeClass('fa-down-long');
      icon.addClass('fa-up-long');
    }

    store.dispatch(updateFilter(newFilter));

    applyFilter();
  });
}
