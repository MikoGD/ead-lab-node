import '../styles/index.css';
import { Country, FILTER_TYPE } from './types';
import { addTableButtons, createTable } from './table';
import { addRowsToStore, store, addHeaders, updateFilter } from './store';
import { openModal, setupModalButtons } from './modal';

function sendCountriesDataRequest() {
  const xhttp = new XMLHttpRequest();

  xhttp.onload = function () {
    const countriesData: Record<string, Country> = JSON.parse(this.response);

    const headers = Object.keys(Object.values(countriesData)[0]).reduce(
      (currHeaders: Partial<Country>, header) => {
        switch (header) {
          case 'currency_code':
            currHeaders[header] = 'Currency name';
            break;
          case 'tld':
            currHeaders[header] = 'Internet domain';
            break;
          case 'flag_base64':
            currHeaders[header] = 'Flag';
            break;
          default:
            const displayHeader = header.split('');
            displayHeader[0] = displayHeader[0].toUpperCase();
            currHeaders[header] = displayHeader.join('');
        }

        return currHeaders;
      },
      {}
    ) as Country;

    store.dispatch(addHeaders(headers));

    store.dispatch(
      addRowsToStore({
        rows: Object.values(countriesData),
        count: 20,
      })
    );

    store.dispatch(
      updateFilter({
        header: Object.keys(headers)[0],
        type: FILTER_TYPE.ASCENDING,
      })
    );

    addTableButtons();
    createTable();
  };

  xhttp.open('GET', '/api/countries', true);
  xhttp.send();
}

$('#modalContainer').hide();

$('#dataButton').on('click', (event) => {
  $('.spinner-border').removeClass('invisible');

  setTimeout(() => {
    sendCountriesDataRequest();

    $('.spinner-border').remove();

    const paragraph = $('p');

    paragraph.fadeIn();
    paragraph.text('Folder has been read!!!');
    paragraph.addClass('display-2 text-center');
  }, 5000);

  $(event.target).addClass('remove');
});

$('#modalButton').on('click', () => {
  openModal();
});

setupModalButtons();
