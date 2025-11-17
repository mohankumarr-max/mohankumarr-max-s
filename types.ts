

// A generic User type, no longer tied to Firebase
export interface User {
  uid: string;
  email: string | null;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'Admin' | 'QA' | 'Read-only';
  createdAt: any; // Date object in mock, ISO String from Supabase
  photoURL?: string;
}

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

export interface QaRecord {
    id: string;
    ruleId: string;
    ruleName: string;
    criticality: 'Critical' | 'Non-Critical';
    customerRequired: number; // as percentage, e.g. 95
    magnasoftQuality: number; // as percentage, e.g. 98
    errors: number;
    totalFiles: number; // A field needed for quality calculation
    remarks: string;
    userId: string;
    userName: string;
    date: any; // Date object in mock, ISO String from Supabase
}

export interface DataContextType {
  data: {
    qa_records: any[];
    employees: any[];
    qa_entries: any[];
  };
  loading: boolean;
  error: string | null;
  source: 'supabase';
}