export interface Country {
  [key: string]: string;
  country: string;
  continent: string;
  currency_code: string;
  city: string;
  tld: string;
  flag_base64: string;
}

export enum FILTER_TYPE {
  ASCENDING = 'ASC',
  DESCENDING = 'DESC',
}

export interface Filter {
  header: string;
  type: FILTER_TYPE;
}

export interface CountryTable {
  currentRows: Country[];
  currentRowCount: number;
  filter: Filter;
  headers: Country;
  rows: Country[];
  totalRows: number;
}

export const bgColors = [
  'bg-primary',
  'bg-secondary',
  'bg-danger',
  'bg-success',
  'bg-warning',
  'bg-info',
];
