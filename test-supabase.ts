import { supabase } from './app/services/supabase';

// Teste para verificar a conexão com o Supabase
async function testSupabaseConnection() {
  console.log('Testando conexão com o Supabase...');
  
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