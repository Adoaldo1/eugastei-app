import { supabase } from './supabase';

export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  user_id?: string;
  name: string;
  amount: number | string;
  type: TransactionType;
  category: string;
  category_id?: string;
  category_color?: string;
  method: string;
  date: string;
  realizado?: boolean;
  created_at?: string;
};

// Mapeamento entre os tipos internos da aplicação e os tipos no banco
const mapTypeToDb = (type: TransactionType): string => {
  return type === 'income' ? 'receita' : 'despesa';
};

const mapTypeFromDb = (type: string): TransactionType => {
  return type === 'receita' ? 'income' : 'expense';
};

// Conversão de dados internos para o formato do banco
const mapToDbFormat = (transaction: CreateTransactionData) => {
  return {
    nome: transaction.name,
    tipo: mapTypeToDb(transaction.type),
    categoria: transaction.category,
    categoria_id: transaction.category_id,
    categoria_cor: transaction.category_color,
    metodo_pagamento: transaction.method,
    valor: typeof transaction.amount === 'string'
      ? parseFloat(transaction.amount.replace('R$', '').replace('.', '').replace(',', '.'))
      : transaction.amount,
    data: transaction.date,
    realizado: transaction.realizado !== undefined ? transaction.realizado : true
  };
};

// Conversão de dados do banco para o formato interno
const mapFromDbFormat = (dbTransaction: any): Transaction => {
  // Se existe o relacionamento com categoria, usar os dados da categoria
  // Caso contrário, usar os dados antigos da transação (para compatibilidade)
  const categoryData = dbTransaction.categoria;
  
  // Debug: log para verificar os dados da categoria
  if (dbTransaction.categoria_id && !categoryData) {
    console.log('Transação com categoria_id mas sem dados de categoria:', {
      id: dbTransaction.id,
      nome: dbTransaction.nome,
      categoria_id: dbTransaction.categoria_id,
      categoria: dbTransaction.categoria,
      categoryData
    });
  }
  
  return {
    id: dbTransaction.id,
    user_id: dbTransaction.user_id,
    name: dbTransaction.nome,
    type: mapTypeFromDb(dbTransaction.tipo),
    category: categoryData ? categoryData.nome : dbTransaction.categoria,
    category_id: dbTransaction.categoria_id,
    category_color: categoryData ? categoryData.cor : dbTransaction.categoria_cor,
    method: dbTransaction.metodo_pagamento,
    amount: dbTransaction.valor,
    date: dbTransaction.data,
    realizado: dbTransaction.realizado !== undefined ? dbTransaction.realizado : true,
    created_at: dbTransaction.created_at
  };
};

export type CreateTransactionData = Omit<Transaction, 'id' | 'created_at' | 'user_id'>;

// Definição dos filtros disponíveis
export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  method?: string;
  searchTerm?: string;
  sortBy?: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

// Serviço para gerenciar transações
export const transactionsService = {
  // Buscar todas as transações
  getAll: async () => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: [], error: new Error('No authenticated user found') };
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categoria:categories!categoria_id (
          id,
          nome,
          cor
        )
      `)
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false });
    
    // Mapear os dados do banco para o formato da aplicação
    const mappedData = data ? data.map(mapFromDbFormat) : [];
      
    return { data: mappedData as Transaction[], error };
  },
  
  // Buscar transações com filtros
  getAllWithFilters: async (filters: TransactionFilters) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: [], error: new Error('No authenticated user found') };
    }
    
    let query = supabase
      .from('transactions')
      .select(`
        *,
        categoria:categories!categoria_id (
          id,
          nome,
          cor
        )
      `)
      .eq('user_id', user.data.user.id);
    
    // Aplicar filtros se fornecidos
    if (filters.type) {
      query = query.eq('tipo', mapTypeToDb(filters.type));
    }
    
    if (filters.categoryId) {
      query = query.eq('categoria_id', filters.categoryId);
    }
    
    if (filters.startDate) {
      query = query.gte('data', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('data', filters.endDate);
    }
    
    if (filters.minAmount !== undefined) {
      query = query.gte('valor', filters.minAmount);
    }
    
    if (filters.maxAmount !== undefined) {
      query = query.lte('valor', filters.maxAmount);
    }
    
    if (filters.method) {
      query = query.eq('metodo_pagamento', filters.method);
    }
    
    if (filters.searchTerm) {
      query = query.ilike('nome', `%${filters.searchTerm}%`);
    }
    
    // Aplicar ordenação
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'date_desc':
          query = query.order('data', { ascending: false });
          break;
        case 'date_asc':
          query = query.order('data', { ascending: true });
          break;
        case 'amount_desc':
          query = query.order('valor', { ascending: false });
          break;
        case 'amount_asc':
          query = query.order('valor', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query;
    
    // Mapear os dados do banco para o formato da aplicação
    const mappedData = data ? data.map(mapFromDbFormat) : [];
      
    return { data: mappedData as Transaction[], error };
  },
  
  // Criar uma nova transação
  create: async (transaction: CreateTransactionData) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: null, error: new Error('No authenticated user found') };
    }
    
    const dbData = mapToDbFormat(transaction);
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...dbData,
        user_id: user.data.user.id,
      }])
      .select();
      
    const mappedData = data?.[0] ? mapFromDbFormat(data[0]) : null;
      
    return { data: mappedData as Transaction, error };
  },
  
  // Buscar uma transação pelo ID
  getById: async (id: string) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: null, error: new Error('No authenticated user found') };
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categoria:categories!categoria_id (
          id,
          nome,
          cor
        )
      `)
      .eq('id', id)
      .eq('user_id', user.data.user.id)
      .single();
      
    const mappedData = data ? mapFromDbFormat(data) : null;
      
    return { data: mappedData as Transaction, error };
  },
  
  // Atualizar uma transação
  update: async (id: string, transaction: Partial<CreateTransactionData>) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: null, error: new Error('No authenticated user found') };
    }
    
    // Mapear apenas os campos que foram fornecidos
    const updateData: Record<string, any> = {};
    
    if (transaction.name !== undefined) updateData.nome = transaction.name;
    if (transaction.type !== undefined) updateData.tipo = mapTypeToDb(transaction.type);
    if (transaction.category !== undefined) updateData.categoria = transaction.category;
    if (transaction.category_id !== undefined) updateData.categoria_id = transaction.category_id;
    if (transaction.category_color !== undefined) updateData.categoria_cor = transaction.category_color;
    if (transaction.method !== undefined) updateData.metodo_pagamento = transaction.method;
    if (transaction.date !== undefined) updateData.data = transaction.date;
    
    if (transaction.amount !== undefined) {
      updateData.valor = typeof transaction.amount === 'string'
        ? parseFloat(transaction.amount.replace('R$', '').replace('.', '').replace(',', '.'))
        : transaction.amount;
    }
    
    if (transaction.realizado !== undefined) updateData.realizado = transaction.realizado;
    
    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.data.user.id)
      .select();
      
    const mappedData = data?.[0] ? mapFromDbFormat(data[0]) : null;
      
    return { data: mappedData as Transaction, error };
  },
  
  // Excluir uma transação
  delete: async (id: string) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { error: new Error('No authenticated user found') };
    }
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.data.user.id);
      
    return { error };
  },
  
  // Criar transação a partir de uma transação recorrente
  createFromRecurring: async (transactionData: any) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select();
        
      if (error) {
        console.error('Erro ao criar transação da recorrente:', error);
        return { data: null, error };
      }
      
      return { data: data?.[0], error: null };
    } catch (err) {
      console.error('Erro ao criar transação da recorrente:', err);
      return { data: null, error: err instanceof Error ? err : new Error('Erro desconhecido') };
    }
  },
}; 