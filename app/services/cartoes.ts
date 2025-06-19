import { supabase } from './supabase';

export type Cartao = {
  id: string;
  user_id?: string;
  nome: string;
  limite: number;
  vencimento: number;
  cor: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CreateCartaoData = Omit<Cartao, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

// Conversão de dados do banco para o formato interno
const mapFromDbFormat = (dbCartao: any): Cartao => {
  return {
    id: dbCartao.id,
    user_id: dbCartao.user_id,
    nome: dbCartao.nome,
    limite: parseFloat(dbCartao.limite),
    vencimento: dbCartao.vencimento,
    cor: dbCartao.cor,
    ativo: dbCartao.ativo,
    created_at: dbCartao.created_at,
    updated_at: dbCartao.updated_at
  };
};

// Conversão de dados internos para o formato do banco
const mapToDbFormat = (cartao: CreateCartaoData) => {
  const dbData: any = {};
  
  // Apenas campos que devem ser enviados para o banco
  if (cartao.nome) dbData.nome = cartao.nome;
  if (cartao.limite !== undefined) dbData.limite = cartao.limite;
  if (cartao.vencimento !== undefined) dbData.vencimento = cartao.vencimento;
  if (cartao.cor) dbData.cor = cartao.cor;
  if (cartao.ativo !== undefined) dbData.ativo = cartao.ativo;
  
  return dbData;
};

export const cartoesService = {
  // Buscar todos os cartões do usuário
  getAll: async (userId?: string) => {
    try {
      let currentUserId = userId;

      // Se não foi passado userId, tenta obter da sessão
      if (!currentUserId) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user?.id) {
          console.error('Error getting session:', sessionError);
          return { data: [], error: new Error('Usuário não autenticado. Faça login novamente.') };
        }
        
        currentUserId = session.user.id;
      }

      const { data, error } = await supabase
        .from('cartoes')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cards:', error);
        return { data: [], error };
      }

      const mappedData = data ? data.map(mapFromDbFormat) : [];
      return { data: mappedData as Cartao[], error: null };
    } catch (err) {
      console.error('Error in getAll:', err);
      return { data: [], error: err instanceof Error ? err : new Error('Erro ao buscar cartões') };
    }
  },

  // Buscar o cartão mais recente
  getLatest: async () => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: null, error: new Error('No authenticated user found') };
    }

    const { data, error } = await supabase
      .from('cartoes')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('ativo', true)
      .order('created_at', { ascending: false })
      .limit(1);

    const mappedData = data?.[0] ? mapFromDbFormat(data[0]) : null;
    return { data: mappedData as Cartao | null, error };
  },

  // Buscar um cartão pelo ID
  getById: async (id: string) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: null, error: new Error('No authenticated user found') };
    }

    const { data, error } = await supabase
      .from('cartoes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.data.user.id)
      .single();

    const mappedData = data ? mapFromDbFormat(data) : null;
    return { data: mappedData as Cartao, error };
  },

  // Criar novo cartão
  create: async (cartao: CreateCartaoData, userId?: string) => {
    try {
      let currentUserId = userId;

      // Se não foi passado userId, tenta obter da sessão
      if (!currentUserId) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user?.id) {
          console.error('Error getting session:', sessionError);
          return { data: null, error: new Error('Usuário não autenticado. Faça login novamente.') };
        }
        
        currentUserId = session.user.id;
      }

      // Validar dados obrigatórios
      if (!cartao.nome || !cartao.limite || !cartao.vencimento || !cartao.cor) {
        return { data: null, error: new Error('Todos os campos são obrigatórios') };
      }

      // Validar limite positivo
      if (cartao.limite <= 0) {
        return { data: null, error: new Error('Limite deve ser maior que zero') };
      }

      // Validar dia de vencimento
      if (cartao.vencimento < 1 || cartao.vencimento > 31) {
        return { data: null, error: new Error('Dia de vencimento deve estar entre 1 e 31') };
      }

      const dbData = mapToDbFormat(cartao);

      // Preparar dados para inserção (sem id, será gerado automaticamente)
      const insertData: Record<string, any> = {
        nome: dbData.nome,
        limite: dbData.limite,
        vencimento: dbData.vencimento,
        cor: dbData.cor,
        ativo: dbData.ativo,
        user_id: currentUserId,
      };

      // Remover campos undefined/null
      Object.keys(insertData).forEach(key => {
        if (insertData[key] === undefined || insertData[key] === null) {
          delete insertData[key];
        }
      });

      console.log('Inserting card data:', insertData);

      const { data, error } = await supabase
        .from('cartoes')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        
        // Tratamento específico de erros comuns
        if (error.code === 'PGRST301') {
          return { data: null, error: new Error('Acesso negado. Verifique suas permissões.') };
        }
        
        if (error.code === '42703') {
          return { data: null, error: new Error('Erro de estrutura da tabela. Contate o suporte.') };
        }
        
        return { data: null, error: new Error(`Erro no banco de dados: ${error.message}`) };
      }

      const mappedData = data?.[0] ? mapFromDbFormat(data[0]) : null;
      return { data: mappedData as Cartao, error: null };
    } catch (err) {
      console.error('Error creating card:', err);
      return { data: null, error: err instanceof Error ? err : new Error('Erro desconhecido ao criar cartão') };
    }
  },

  // Atualizar cartão
  update: async (id: string, cartao: Partial<CreateCartaoData>) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: null, error: new Error('No authenticated user found') };
    }

    const updateData: Record<string, any> = {};
    
    if (cartao.nome !== undefined) updateData.nome = cartao.nome;
    if (cartao.limite !== undefined) updateData.limite = cartao.limite;
    if (cartao.vencimento !== undefined) updateData.vencimento = cartao.vencimento;
    if (cartao.cor !== undefined) updateData.cor = cartao.cor;
    if (cartao.ativo !== undefined) updateData.ativo = cartao.ativo;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('cartoes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.data.user.id)
      .select();

    const mappedData = data?.[0] ? mapFromDbFormat(data[0]) : null;
    return { data: mappedData as Cartao, error };
  },

  // Deletar cartão
  delete: async (id: string) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { error: new Error('No authenticated user found') };
    }

    const { error } = await supabase
      .from('cartoes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.data.user.id);

    return { error };
  },

  // Calcular fatura atual de um cartão
  calculateFaturaAtual: async (cartaoId: string) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      return { fatura: 0, error: new Error('No authenticated user found') };
    }

    // Buscar transações do cartão no mês atual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('transactions')
      .select('valor')
      .eq('user_id', user.data.user.id)
      .eq('cartao_id', cartaoId)
      .eq('tipo', 'despesa') // Apenas despesas geram fatura
      .gte('data', startOfMonth.toISOString().split('T')[0])
      .lte('data', endOfMonth.toISOString().split('T')[0]);

    if (error) {
      return { fatura: 0, error };
    }

    const fatura = data?.reduce((total, transaction) => {
      return total + parseFloat(transaction.valor || 0);
    }, 0) || 0;

    return { fatura, error: null };
  }
}; 