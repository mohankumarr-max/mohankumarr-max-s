import { createClient } from '@supabase/supabase-js';
import type { UserProfile } from '../types';

const supabaseUrl = 'https://knbkvvkgebkuyiquiokg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYmt2dmtnZWJrdXlpcXVpb2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzcyNzYsImV4cCI6MjA3ODk1MzI3Nn0.a2Z3RfGCXyMPVrjYFpcd5uOnlUGD9SnF9Mk0CDxKxww';

// Type definitions for your Supabase schema.
// You can generate these automatically with the Supabase CLI.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          name: string
          score: number
          submissions: number
        }
        Insert: {
          name: string
          score: number
          submissions: number
        }
        Update: {
          name?: string
          score?: number
          submissions?: number
        }
      }
      profiles: {
        Row: UserProfile
        // FIX: Explicitly define Insert and Update types to avoid inference issues with utility types.
        Insert: {
          uid: string;
          name: string;
          email: string;
          role: "Admin" | "QA" | "Read-only";
          photoURL?: string | null;
        }
        Update: {
          name?: string;
          email?: string;
          role?: "Admin" | "QA" | "Read-only";
          photoURL?: string | null;
        }
      }
      qa_entries: {
        Row: {
          agent: string
          date: string
          id: number
          score: number
        }
        Insert: {
          agent: string
          date: string
          id?: number
          score: number
        }
        Update: {
          agent?: string
          date?: string
          id?: number
          score?: number
        }
      }
      qa_records: {
        Row: {
          criticality: "Critical" | "Non-Critical"
          customerRequired: number
          date: string
          errors: number
          id: string
          magnasoftQuality: number
          remarks: string
          ruleId: string
          ruleName: string
          totalFiles: number
          userId: string
          userName: string
        }
        Insert: {
          criticality: "Critical" | "Non-Critical"
          customerRequired: number
          date: string
          errors: number
          id?: string
          magnasoftQuality: number
          remarks: string
          ruleId: string
          ruleName: string
          totalFiles: number
          userId: string
          userName: string
        }
        Update: Partial<{
          criticality: "Critical" | "Non-Critical"
          customerRequired: number
          date: string
          errors: number
          magnasoftQuality: number
          remarks: string
          ruleId: string
          ruleName: string
          totalFiles: number
          userId: string
          userName: string
        }>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      // FIX: Define the `execute_sql` function to correctly type the `supabase.rpc` call.
      execute_sql: {
        Args: {
          query: string
        }
        Returns: Json | Json[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);