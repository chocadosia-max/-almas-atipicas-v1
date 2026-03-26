import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserProfile = {
  id: string;
  full_name?: string;
  avatar_url?: string;
  estado?: string;
  cidade?: string;
  nivel_suporte_filho?: string;
  idade_filho?: string;
  bio?: string;
  is_admin?: boolean;
  onboarding_complete?: boolean;
};

type AuthContextType = {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  onboardingNeeded: boolean;
  signOut: () => Promise<void>;
  completeOnboarding: (data: Partial<UserProfile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  onboardingNeeded: false,
  signOut: async () => {},
  completeOnboarding: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }
      
      // Se não existir perfil, o usuário precisará fazer onboarding criando um novo registro
      if (data) {
        setUser({ ...data, id: userId });
      } else {
        setUser({ id: userId });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const completeOnboarding = async (data: Partial<UserProfile>) => {
    if (!session?.user) return;
    try {
      setLoading(true);
      const updates = {
        id: session.user.id,
        ...data,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      
      if (error) throw error;
      
      setUser((prev) => prev ? { ...prev, ...updates } : updates as UserProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.is_admin || false;
  // If user exists but onboarding_complete is false or undefined
  const onboardingNeeded = !!user && !user.onboarding_complete;

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, onboardingNeeded, signOut, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
