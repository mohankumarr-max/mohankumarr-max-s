import { supabase, type Database } from './client';
import type { UserProfile } from "../types";

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('uid', uid)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found, which is not an error here
    console.error("Error fetching user profile:", error.message);
    return null;
  }
  return data as UserProfile | null;
};

// FIX: Type the `data` parameter with the specific `Update` type from the Database interface.
export const updateUserProfile = async (uid: string, data: Database['public']['Tables']['profiles']['Update']): Promise<void> => {
    const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('uid', uid);
    
    if (error) {
        console.error("Error updating user profile:", error.message);
        throw new Error(error.message);
    }
};

export const addQAEntry = async (data: any): Promise<void> => {
    const { error } = await supabase.from('qa_entries').insert(data);
    if (error) {
        console.error("Error adding QA entry:", error.message);
        throw new Error(error.message);
    }
};