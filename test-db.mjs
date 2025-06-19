import { createClient } from '@supabase/supabase-js';

// Usar os mesmos valores que estão no arquivo env-config.txt
const supabaseUrl = 'https://ogqrdnoxjrqcvivtqovv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ncXJkbm94anJxY3ZpdnRxb3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MzM0ODEsImV4cCI6MjA2MzAwOTQ4MX0.dCrFFzZDldl75lkE3PAg12TpqCVfX4lHJdfS_ymts2I';

// Criar um cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para testar a conexão
async function testSupabaseConnection() {
  console.log('Testando conexão com o Supabase...');
  console.log('URL do Supabase:', supabaseUrl);
  
  try {
    // Teste para verificar se a tabela transactions existe
    const { data, error } = await supabase.from('transactions').select('*').limit(1);
    
    if (error) {
      console.error('Erro ao acessar a tabela transactions:', error);
    } else {
      console.log('Conexão com o Supabase bem-sucedida!');
      console.log('Dados da tabela transactions:', data);
    }
  } catch (err) {
    console.error('Erro ao conectar ao Supabase:', err);
  }
}

// Executar o teste
testSupabaseConnection(); 