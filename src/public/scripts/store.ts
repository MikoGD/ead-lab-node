import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit';
import { FILTER_TYPE, Country, Filter, CountryTable } from './types';

interface RowPayload {
  rows: Country[];
  count: number;
}

const defaultStore: CountryTable = {
  currentRows: [],
  currentRowCount: 0,
  filter: {
    header: '',
    type: FILTER_TYPE.ASCENDING,
  },
  headers: {} as Country,
  rows: [],
  totalRows: 0,
};

const tableSlice = createSlice({
  name: 'table',
  initialState: defaultStore,
  reducers: {
    addRowsToStore: (state, action: PayloadAction<RowPayload>) => {
      const { rows, count } = action.payload;

      state.rows = rows;
      state.totalRows = rows.length;
      state.currentRowCount = count;
      state.currentRows = rows.slice(0, count);
    },
    updateFilter: (state, action: PayloadAction<Filter>) => {
      const { header, type } = action.payload;
      const { headers } = state;

      const firstHeader = Object.keys(headers)[0];
      console.log('[updateFilter] - header: ', header);
      console.log('[updateFilter] - type: ', type);

      if (header !== firstHeader || type !== FILTER_TYPE.ASCENDING) {
        $('#resetButton').prop('disabled', false);
      } else {
        $('#resetButton').prop('disabled', true);
      }

      state.filter = action.payload;
    },
    addHeaders: (state, action: PayloadAction<Country>) => {
      state.headers = action.payload;
    },
    addRowsToCurrent: (state, action: PayloadAction<RowPayload>) => {
      // count refers to increment in this context
      const { rows, count: increment } = action.payload;
      const { currentRows, totalRows, currentRowCount } = state;

      state.currentRows = [...currentRows, ...rows];
      state.currentRowCount =
        currentRowCount + increment > totalRows
          ? totalRows
          : currentRowCount + increment;
    },
    updateCurrentRows: (state, action: PayloadAction<Country[]>) => {
      state.currentRows = action.payload;
    },
  },
});

export const store = configureStore({ reducer: tableSlice.reducer });

export const {
  addRowsToStore,
  updateFilter,
  addHeaders,
  addRowsToCurrent,
  updateCurrentRows,
} = tableSlice.actions;
