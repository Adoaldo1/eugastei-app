import { supabase } from './supabase';
import { transactionsService } from './transactions';

export type TransactionType = 'income' | 'expense';
export type FrequencyType = 'mensal' | 'semanal' | 'anual';

export type RecurringTransaction = {
  id: string;
  user_id?: string;
  name: string;
  amount: number | string;
  type: TransactionType;
  category_id: string;
  // Campos apenas para UI, não enviados ao Supabase
  category?: string;
  category_color?: string;
  payment_method: string;
  frequency: FrequencyType;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at?: string;
  last_execution?: string; // Data da última execução desta transação recorrente
};

// Mapeamento entre os tipos internos da aplicação e os tipos no banco
const mapTypeToDb = (type: TransactionType): string => {
  return type === 'income' ? 'receita' : 'despesa';
};

const mapTypeFromDb = (type: string): TransactionType => {
  return type === 'receita' ? 'income' : 'expense';
};

// Conversão de dados internos para o formato do banco
const mapToDbFormat = (transaction: CreateRecurringTransactionData) => {
  const dbData: any = {
    nome: transaction.name,
    tipo: mapTypeToDb(transaction.type),
    categoria_id: transaction.category_id,
    metodo_pagamento: transaction.payment_method,
    valor: typeof transaction.amount === 'string'
      ? parseFloat(transaction.amount.replace('R$', '').replace('.', '').replace(',', '.'))
      : transaction.amount,
    frequencia: transaction.frequency,
    data_inicio: transaction.start_date,
    data_fim: transaction.end_date,
    ativo: transaction.is_active
  };

  return dbData;
};

// Conversão de dados do banco para o formato interno
const mapFromDbFormat = (dbTransaction: any): RecurringTransaction => {
  return {
    id: dbTransaction.id,
    user_id: dbTransaction.user_id,
    name: dbTransaction.nome,
    type: mapTypeFromDb(dbTransaction.tipo),
    category_id: dbTransaction.categoria_id,
    category: dbTransaction.categoria,
    category_color: dbTransaction.categoria_cor,
    payment_method: dbTransaction.metodo_pagamento,
    amount: dbTransaction.valor,
    frequency: dbTransaction.frequencia,
    start_date: dbTransaction.data_inicio,
    end_date: dbTransaction.data_fim,
    is_active: dbTransaction.ativo,
    created_at: dbTransaction.created_at,
    last_execution: dbTransaction.ultima_execucao
  };
};

export type CreateRecurringTransactionData = Omit<RecurringTransaction, 'id' | 'created_at' | 'user_id'>;

// Serviço para gerenciar transações recorrentes
export const recurringTransactionsService = {
  // Buscar todas as transações recorrentes
  getAll: async () => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: [], error: new Error('No authenticated user found') };
    }
    
    const { data, error } = await supabase
      .from('transacoes_recorrentes')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false });
    
    // Mapear os dados do banco para o formato da aplicação
    const mappedData = data ? data.map(mapFromDbFormat) : [];
      
    return { data: mappedData as RecurringTransaction[], error };
  },
  
  // Executar transações recorrentes
  executarTransacoesRecorrentes: async () => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { success: false, error: new Error('No authenticated user found') };
    }
    
    try {
      // Buscar todas as transações recorrentes ativas do usuário atual
      const { data: recurringTransactions, error } = await supabase
        .from('transacoes_recorrentes')
        .select('*')
        .eq('user_id', user.data.user.id)
        .eq('ativo', true);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!recurringTransactions || recurringTransactions.length === 0) {
        return { success: true, count: 0 };
      }
      
      // Data atual para verificação
      const hoje = new Date();
      const dataHoje = hoje.toISOString().split('T')[0]; // formato YYYY-MM-DD
      
      // Contador de transações executadas
      let executedCount = 0;
      
      // Processar cada transação recorrente
      for (const transacao of recurringTransactions) {
        // Verificar se a transação já foi executada ou se deve ser executada hoje
        const deveExecutar = await verificarSeDeveExecutar(transacao);
        
        if (deveExecutar) {
          // Criar a transação real na tabela transacoes
          const novaTransacao = {
            nome: transacao.nome,
            tipo: transacao.tipo,
            valor: transacao.valor,
            categoria_id: transacao.categoria_id,
            metodo_pagamento: transacao.metodo_pagamento,
            data: dataHoje,
            user_id: user.data.user.id
          };
          
          // Inserir nova transação 
          const { error: insertError } = await transactionsService.createFromRecurring(novaTransacao);
          
          if (insertError) {
            console.error(`Erro ao criar transação a partir da recorrente ${transacao.id}:`, insertError);
            continue;
          }
          
          // Atualizar o campo ultima_execucao
          const { error: updateError } = await supabase
            .from('transacoes_recorrentes')
            .update({ ultima_execucao: dataHoje })
            .eq('id', transacao.id);
          
          if (updateError) {
            console.error(`Erro ao atualizar última execução da transação ${transacao.id}:`, updateError);
            continue;
          }
          
          executedCount++;
        }
      }
      
      return { success: true, count: executedCount };
      
    } catch (err) {
      console.error('Erro ao executar transações recorrentes:', err);
      return { success: false, error: err instanceof Error ? err : new Error('Erro desconhecido') };
    }
  },
  
  // Criar uma nova transação recorrente
  create: async (transaction: CreateRecurringTransactionData) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: null, error: new Error('No authenticated user found') };
    }
    
    const dbData = mapToDbFormat(transaction);
    
    // Debug log para verificar o tipo selecionado
    console.log("Tipo selecionado:", transaction.type);
    console.log("Tipo mapeado para banco:", dbData.tipo);
    
    const { data, error } = await supabase
      .from('transacoes_recorrentes')
      .insert([{
        ...dbData,
        user_id: user.data.user.id,
      }])
      .select();
      
    const mappedData = data?.[0] ? mapFromDbFormat(data[0]) : null;
      
    return { data: mappedData as RecurringTransaction, error };
  },
  
  // Buscar uma transação recorrente pelo ID
  getById: async (id: string) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: null, error: new Error('No authenticated user found') };
    }
    
    const { data, error } = await supabase
      .from('transacoes_recorrentes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.data.user.id)
      .single();
      
    const mappedData = data ? mapFromDbFormat(data) : null;
      
    return { data: mappedData as RecurringTransaction, error };
  },
  
  // Atualizar uma transação recorrente
  update: async (id: string, transaction: Partial<CreateRecurringTransactionData>) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: null, error: new Error('No authenticated user found') };
    }
    
    // Mapear apenas os campos que foram fornecidos
    const updateData: Record<string, any> = {};
    
    if (transaction.name !== undefined) updateData.nome = transaction.name;
    if (transaction.type !== undefined) updateData.tipo = mapTypeToDb(transaction.type);
    if (transaction.category_id !== undefined) updateData.categoria_id = transaction.category_id;
    if (transaction.payment_method !== undefined) updateData.metodo_pagamento = transaction.payment_method;
    if (transaction.frequency !== undefined) updateData.frequencia = transaction.frequency;
    if (transaction.start_date !== undefined) updateData.data_inicio = transaction.start_date;
    if (transaction.end_date !== undefined) updateData.data_fim = transaction.end_date;
    if (transaction.is_active !== undefined) updateData.ativo = transaction.is_active;
    
    if (transaction.amount !== undefined) {
      updateData.valor = typeof transaction.amount === 'string'
        ? parseFloat(transaction.amount.replace('R$', '').replace('.', '').replace(',', '.'))
        : transaction.amount;
    }
    
    const { data, error } = await supabase
      .from('transacoes_recorrentes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.data.user.id)
      .select();
      
    const mappedData = data?.[0] ? mapFromDbFormat(data[0]) : null;
      
    return { data: mappedData as RecurringTransaction, error };
  },
  
  // Excluir uma transação recorrente
  delete: async (id: string) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { error: new Error('No authenticated user found') };
    }
    
    const { error } = await supabase
      .from('transacoes_recorrentes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.data.user.id);
      
    return { error };
  },

  // Atualizar o status de uma transação recorrente
  updateStatus: async (id: string, isActive: boolean) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: null, error: new Error('No authenticated user found') };
    }
    
    const { data, error } = await supabase
      .from('transacoes_recorrentes')
      .update({ ativo: isActive })
      .eq('id', id)
      .eq('user_id', user.data.user.id)
      .select();
      
    const mappedData = data?.[0] ? mapFromDbFormat(data[0]) : null;
      
    return { data: mappedData as RecurringTransaction, error };
  },
};

// Função auxiliar para verificar se uma transação recorrente deve ser executada hoje
async function verificarSeDeveExecutar(transacao: any): Promise<boolean> {
  const hoje = new Date();
  const dataHoje = hoje.toISOString().split('T')[0]; // formato YYYY-MM-DD
  
  // Se nunca foi executada (ultima_execucao é null), deve executar
  if (!transacao.ultima_execucao) {
    return true;
  }
  
  // Converter a última execução para um objeto Date
  const ultimaExecucao = new Date(transacao.ultima_execucao);
  ultimaExecucao.setHours(0, 0, 0, 0); // Resetar horas para comparação apenas de data
  
  // Verificar com base na frequência
  switch (transacao.frequencia) {
    case 'semanal':
      // Se passou pelo menos 7 dias desde a última execução
      const umaSemanaDepois = new Date(ultimaExecucao);
      umaSemanaDepois.setDate(ultimaExecucao.getDate() + 7);
      return umaSemanaDepois <= hoje;
      
    case 'mensal':
      // Se estamos em um mês diferente do mês da última execução
      // E o dia do mês atual é maior ou igual ao dia da última execução
      const mesmoOuMaiorDiaDoMes = hoje.getDate() >= ultimaExecucao.getDate();
      const mesmoMes = hoje.getMonth() === ultimaExecucao.getMonth();
      const mesmoAno = hoje.getFullYear() === ultimaExecucao.getFullYear();
      
      if (mesmoMes && mesmoAno) {
        return false; // Ainda estamos no mesmo mês
      }
      
      // Se estamos em um mês diferente e o dia atual é maior ou igual 
      // ao dia da última execução, devemos executar
      if (mesmoOuMaiorDiaDoMes) {
        return true;
      }
      
      // Se o dia atual é menor que o dia da última execução,
      // verificar se é o último dia do mês (para meses com menos dias)
      const ultimoDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
      return hoje.getDate() === ultimoDiaDoMes && ultimaExecucao.getDate() > ultimoDiaDoMes;
      
    case 'anual':
      // Se estamos em um ano diferente e na mesma data ou depois
      const mesmaDataOuDepois = 
        (hoje.getMonth() > ultimaExecucao.getMonth()) || 
        (hoje.getMonth() === ultimaExecucao.getMonth() && hoje.getDate() >= ultimaExecucao.getDate());
      
      return hoje.getFullYear() > ultimaExecucao.getFullYear() && mesmaDataOuDepois;
      
    default:
      return false;
  }
} 