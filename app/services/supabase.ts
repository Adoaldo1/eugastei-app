import { createClient } from '@supabase/supabase-js';

// Configuração direta do Supabase (sem variáveis de ambiente)
const supabaseUrl = 'https://ogqrdnoxjrqcvivtqovv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ncXJkbm94anJxY3ZpdnRxb3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MzM0ODEsImV4cCI6MjA2MzAwOTQ4MX0.dCrFFzZDldl75lkE3PAg12TpqCVfX4lHJdfS_ymts2I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções de autenticação
export const auth = {
  // Registrar usuário
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    return { data, error };
  },
  
  // Login
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  },
  
  // Logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
  
  // Obter usuário atual
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },
  
  // Verificar se está autenticado
  isAuthenticated: async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user !== null;
  },
}; 