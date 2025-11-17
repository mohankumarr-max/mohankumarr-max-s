import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './client';
import { getUserProfile } from './firestore';
import type { AuthContextType, UserProfile, User } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        setUser({ uid: session.user.id, email: session.user.email });
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    
    // Also check the initial session on component mount
     const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
       if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        setUser({ uid: session.user.id, email: session.user.email });
        setUserProfile(profile);
      }
      setLoading(false);
    };

    checkInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
