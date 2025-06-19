import { useState, useEffect } from 'react';
import { categoriesService, type Category } from '../services/categories';
import type { TransactionFilters } from '../services/transactions';

interface TransactionFiltersProps {
  onFilterChange: (filters: TransactionFilters) => void;
  loading?: boolean;
  onClearFilters: () => void;
}

export function TransactionFiltersPanel({ onFilterChange, loading = false, onClearFilters }: TransactionFiltersProps) {
  // Estado para os filtros
  const [filters, setFilters] = useState<TransactionFilters>({});
  
  // Estado para as categorias disponíveis
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // Carregar categorias do usuário
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const { data, error } = await categoriesService.getAll();
        if (error) throw error;
        setCategories(data);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Função para atualizar um filtro específico
  const updateFilter = (key: keyof TransactionFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    
    // Se o valor for vazio ou undefined, remova a chave do objeto
    if (value === '' || value === undefined) {
      delete newFilters[key];
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // Limpar todos os filtros
  const handleClearFilters = () => {
    setFilters({});
    onClearFilters();
  };
  
  // Lista de métodos de pagamento para o dropdown
  const paymentMethods = ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Transferência', 'Boleto'];
  
  // Estilo comum para inputs e selects
      const inputClassName = "w-full rounded-md border border-input-border/30 bg-input-bg text-text text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:bg-input-bg/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClassName = "block text-xs sm:text-sm font-medium text-text-secondary mb-1.5";
  
  return (
    <div className="content-box p-4 sm:p-6 mb-4 sm:mb-6">
      {/* Header dos filtros */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-medium text-text">Filtros de pesquisa</h3>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Use os filtros abaixo para refinar sua busca
          </p>
        </div>
        <button
          onClick={handleClearFilters}
          className="text-xs sm:text-sm text-primary hover:opacity-80 focus:outline-none transition-opacity disabled:opacity-30 disabled:cursor-not-allowed self-start sm:self-auto"
          disabled={loading || Object.keys(filters).length === 0}
        >
          Limpar todos os filtros
        </button>
      </div>
      
      {/* Grid responsivo de filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {/* Filtro de tipo de transação */}
        <div className="space-y-1.5">
          <label className={labelClassName}>
            Tipo de transação
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => updateFilter('type', e.target.value || undefined)}
            className={inputClassName}
            disabled={loading}
          >
            <option value="">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
        </div>
        
        {/* Filtro de categoria */}
        <div className="space-y-1.5">
          <label className={labelClassName}>
            Categoria
          </label>
          <select
            value={filters.categoryId || ''}
            onChange={(e) => updateFilter('categoryId', e.target.value || undefined)}
            className={inputClassName}
            disabled={loading || loadingCategories}
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.type === 'income' ? 'Receita' : 'Despesa'})
              </option>
            ))}
          </select>
        </div>
        
        {/* Filtro de método de pagamento */}
        <div className="space-y-1.5">
          <label className={labelClassName}>
            Método de pagamento
          </label>
          <select
            value={filters.method || ''}
            onChange={(e) => updateFilter('method', e.target.value || undefined)}
            className={inputClassName}
            disabled={loading}
          >
            <option value="">Todos os métodos</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
        
        {/* Filtro de ordenação */}
        <div className="space-y-1.5">
          <label className={labelClassName}>
            Ordenação
          </label>
          <select
            value={filters.sortBy || 'date_desc'}
            onChange={(e) => updateFilter('sortBy', e.target.value || undefined)}
            className={inputClassName}
            disabled={loading}
          >
            <option value="date_desc">Mais recentes</option>
            <option value="date_asc">Mais antigos</option>
            <option value="amount_desc">Maior valor</option>
            <option value="amount_asc">Menor valor</option>
          </select>
        </div>
      </div>
      
      {/* Segunda linha - Filtros de período e valor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mt-4 sm:mt-6">
        {/* Filtros de período */}
        <div className="space-y-1.5">
          <label className={labelClassName}>
            Data inicial
          </label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => updateFilter('startDate', e.target.value || undefined)}
            className={inputClassName}
            disabled={loading}
          />
        </div>
        
        <div className="space-y-1.5">
          <label className={labelClassName}>
            Data final
          </label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => updateFilter('endDate', e.target.value || undefined)}
            className={inputClassName}
            disabled={loading}
          />
        </div>
        
        {/* Filtros de valor */}
        <div className="space-y-1.5">
          <label className={labelClassName}>
            Valor mínimo
          </label>
          <input
            type="number"
            value={filters.minAmount || ''}
            onChange={(e) => updateFilter('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
            className={`${inputClassName} placeholder:text-text-muted`}
            placeholder="R$ 0,00"
            min="0"
            step="0.01"
            disabled={loading}
          />
        </div>
        
        <div className="space-y-1.5">
          <label className={labelClassName}>
            Valor máximo
          </label>
          <input
            type="number"
            value={filters.maxAmount || ''}
            onChange={(e) => updateFilter('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
            className={`${inputClassName} placeholder:text-text-muted`}
            placeholder="R$ 0,00"
            min="0"
            step="0.01"
            disabled={loading}
          />
        </div>
      </div>
      
      {/* Filtro de busca por texto - linha separada */}
      <div className="mt-4 sm:mt-6">
        <label className={labelClassName}>
          Buscar por nome da transação
        </label>
        <div className="relative">
          <input
            type="text"
            value={filters.searchTerm || ''}
            onChange={(e) => updateFilter('searchTerm', e.target.value || undefined)}
            placeholder="Digite o nome da transação..."
            className={`${inputClassName} pl-10 placeholder:text-text-muted`}
            disabled={loading}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5 text-text opacity-40 absolute left-3 top-1/2 transform -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      
      {/* Indicador de filtros ativos (apenas em mobile) */}
      {Object.keys(filters).length > 0 && (
        <div className="mt-4 sm:hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-secondary">
              {Object.keys(filters).length} {Object.keys(filters).length === 1 ? 'filtro ativo' : 'filtros ativos'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 