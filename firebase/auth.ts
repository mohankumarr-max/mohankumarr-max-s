import { supabase } from './client';

// This interface is kept for compatibility with the UI components
interface MockUserCredential {
  user: {
    uid: string;
    email: string | null;
  };
}

export const signup = async (name: string, email: string, password: string): Promise<MockUserCredential> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw new Error(`Auth: ${error.message}`);
  if (!data.user) throw new Error("Auth: Signup failed, no user returned.");
  
  // Insert user profile into the 'profiles' table
  // FIX: Wrap insert data in an array to fix type inference issues.
  const { error: profileError } = await supabase.from('profiles').insert([{
    uid: data.user.id,
    name,
    email,
    role: "QA", // Default role for new signups
  }]);

  if (profileError) {
    // In a production app, you might want to delete the auth user if profile creation fails
    console.error("Failed to create user profile:", profileError.message);
    throw new Error(`Profile creation failed: ${profileError.message}`);
  }

  return { user: { uid: data.user.id, email: data.user.email } };
};

export const login = async (email: string, password: string): Promise<MockUserCredential> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(`Auth: ${error.message}`);
  if (!data.user) throw new Error("Auth: Login failed, no user returned.");

  return { user: { uid: data.user.id, email: data.user.email } };
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Auth: ${error.message}`);
};

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(`Auth: ${error.message}`);
};