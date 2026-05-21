import { createContext } from 'react';
import { FUEL, COMMODITIES, LAST_UPDATED } from '../data/constants';

export const DataContext = createContext({
  fuel: FUEL,
  commodities: COMMODITIES,
  lastUpdated: LAST_UPDATED,
  macro: null,
});
