import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { DataContextType } from '../types';
import { supabase } from '../firebase/client';

const getInitialData = () => ({
  qa_records: [],
  employees: [],
  qa_entries: [],
});

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState(getInitialData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          { data: qa_records, error: qaRecordsError },
          { data: employees, error: employeesError },
          { data: qa_entries, error: qaEntriesError }
        ] = await Promise.all([
          supabase.from('qa_records').select('*'),
          supabase.from('employees').select('*'),
          supabase.from('qa_entries').select('*'),
        ]);

        if (qaRecordsError) throw qaRecordsError;
        if (employeesError) throw employeesError;
        if (qaEntriesError) throw qaEntriesError;
        
        setData({
          qa_records: qa_records || [],
          employees: employees || [],
          qa_entries: qa_entries || [],
        });
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred while fetching data from Supabase.');
        setData(getInitialData());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ data, loading, error, source: 'supabase' }}>
      {children}
    </DataContext.Provider>
  );
};
