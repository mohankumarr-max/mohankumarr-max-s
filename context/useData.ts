
import { useContext } from 'react';
import { DataContext } from './DataProvider';
import type { DataContextType } from '../types';

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
