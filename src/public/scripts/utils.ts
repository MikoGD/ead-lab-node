import { bgColors, FILTER_TYPE, CountryTable } from './types';

// eslint-disable-next-line no-undef
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

export function renderFilteredRows({ currentRows, headers }: CountryTable) {
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

export function applyFilter(countryTable: CountryTable) {
  const {
    filter: { header, type: filterType },
    currentRows,
  } = countryTable;

  countryTable.currentRows = currentRows.sort((a, b) => {
    const textA = !a || !a[header] ? '' : a[header]!.toUpperCase();
    const textB = !b || !b[header] ? '' : b[header]!.toUpperCase();

    /* eslint-disable no-nested-ternary */
    if (filterType === FILTER_TYPE.ASCENDING) {
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    }

    return textA > textB ? -1 : textA < textB ? 1 : 0;
    /* eslint-enable no-nested-ternary */
  });

  renderFilteredRows(countryTable);
}

export function addFilterOnClickListener(
  col: JQuery<HTMLElement>,
  countryTable: CountryTable,
  currHeader: string
) {
  const { filter } = countryTable;

  col.on('click', () => {
    if (filter.header !== currHeader) {
      $(`#col-${filter.header}`).children('span').removeClass('fa-up-long');
      $(`#col-${filter.header}`).children('span').removeClass('fa-down-long');
    }

    filter.header = currHeader;

    const icon = col.children('span');

    if (filter.type === FILTER_TYPE.ASCENDING) {
      icon.removeClass('fa-up-long');
      icon.addClass('fa-down-long');
      filter.type = FILTER_TYPE.DESCENDING;
    } else {
      icon.removeClass('fa-down-long');
      icon.addClass('fa-up-long');
      filter.type = FILTER_TYPE.ASCENDING;
    }

    applyFilter(countryTable);
  });
}
