import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { auth, supabase } from '../services/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

type AuthUser = {
  id: string;
  email: string;
} | null;

type AuthContextType = {
  user: AuthUser;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await auth.getCurrentUser();
        
        if (data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
          });
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
    
    // Listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    signIn: async (email: string, password: string) => {
      const { error } = await auth.signIn(email, password);
      return { error };
    },
    signUp: async (email: string, password: string) => {
      const { error } = await auth.signUp(email, password);
      return { error };
    },
    signOut: async () => {
      const { error } = await auth.signOut();
      return { error };
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 