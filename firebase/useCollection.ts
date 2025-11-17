
import { useData } from '../context/useData';

type CollectionPath = 'qa_records' | 'employees' | 'qa_entries';

export const useCollection = <T,>(path: CollectionPath) => {
  const { data, loading, error } = useData();

  return { data: data[path] as T[] | null, loading, error };
};
