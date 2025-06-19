import { supabase } from './supabase';

export type CategoryType = 'income' | 'expense';

export type Category = {
  id: string;
  user_id?: string;
  name: string;
  type: CategoryType;
  color: string;
  created_at?: string;
};

// Mapeamento entre os tipos internos da aplicação e os tipos no banco
const mapTypeToDb = (type: CategoryType): string => {
  return type === 'income' ? 'receita' : 'despesa';
};

const mapTypeFromDb = (type: string): CategoryType => {
  return type === 'receita' ? 'income' : 'expense';
};

// Conversão de dados internos para o formato do banco
const mapToDbFormat = (category: CreateCategoryData) => {
  return {
    nome: category.name,
    tipo: mapTypeToDb(category.type),
    cor: category.color,
  };
};

// Conversão de dados do banco para o formato interno
const mapFromDbFormat = (dbCategory: any): Category => {
  return {
    id: dbCategory.id,
    user_id: dbCategory.user_id,
    name: dbCategory.nome,
    type: mapTypeFromDb(dbCategory.tipo),
    color: dbCategory.cor,
    created_at: dbCategory.created_at
  };
};

export type CreateCategoryData = Omit<Category, 'id' | 'created_at' | 'user_id'>;

// Serviço para gerenciar categorias
export const categoriesService = {
  // Buscar todas as categorias
  getAll: async () => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: [], error: new Error('No authenticated user found') };
    }
    
    console.log('Current user:', user.data.user);
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false });
    
    console.log('Categories from Supabase:', data);
    
    // Mapear os dados do banco para o formato da aplicação
    const mappedData = data ? data.map(mapFromDbFormat) : [];
    console.log('Mapped categories:', mappedData);
      
    return { data: mappedData as Category[], error };
  },
  
  // Criar uma nova categoria
  create: async (category: CreateCategoryData) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: null, error: new Error('No authenticated user found') };
    }
    
    const dbData = mapToDbFormat(category);
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        ...dbData,
        user_id: user.data.user.id,
      }])
      .select();
      
    const mappedData = data?.[0] ? mapFromDbFormat(data[0]) : null;
      
    return { data: mappedData as Category, error };
  },
  
  // Buscar uma categoria pelo ID
  getById: async (id: string) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: null, error: new Error('No authenticated user found') };
    }
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.data.user.id)
      .single();
      
    const mappedData = data ? mapFromDbFormat(data) : null;
      
    return { data: mappedData as Category, error };
  },
  
  // Atualizar uma categoria
  update: async (id: string, category: Partial<CreateCategoryData>) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { data: null, error: new Error('No authenticated user found') };
    }
    
    // Mapear apenas os campos que foram fornecidos
    const updateData: Record<string, any> = {};
    
    if (category.name !== undefined) updateData.nome = category.name;
    if (category.type !== undefined) updateData.tipo = mapTypeToDb(category.type);
    if (category.color !== undefined) updateData.cor = category.color;
    
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.data.user.id)
      .select();
      
    const mappedData = data?.[0] ? mapFromDbFormat(data[0]) : null;
      
    return { data: mappedData as Category, error };
  },
  
  // Excluir uma categoria
  delete: async (id: string) => {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('No authenticated user found');
      return { error: new Error('No authenticated user found') };
    }
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.data.user.id);
      
    return { error };
  },
}; 