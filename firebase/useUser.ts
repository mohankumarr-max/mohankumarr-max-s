import { useContext } from 'react';
import { AuthContext } from './FirebaseProvider';
import type { AuthContextType } from '../types';

export const useUser = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider');
  }
  return context;
};