import { useState } from 'react';

export type ReportFilters = {
  period: 'current_month' | 'last_3_months' | 'last_6_months' | 'current_year' | 'custom';
  type: 'all' | 'income' | 'expense';
  cardId?: string;
  categoryId?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
};

type ReportFiltersProps = {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  categories: Array<{ id: string; name: string; color: string }>;
  cards: Array<{ id: string; nome: string }>;
};

export function ReportFiltersComponent({ filters, onFiltersChange, categories, cards }: ReportFiltersProps) {
  const [showCustomDates, setShowCustomDates] = useState(filters.period === 'custom');

  const handlePeriodChange = (period: ReportFilters['period']) => {
    setShowCustomDates(period === 'custom');
    onFiltersChange({ ...filters, period });
  };

  const methods = [
    'Dinheiro',
    'PIX',
    'Cartão de Débito',
    'Cartão de Crédito',
    'Transferência',
    'Boleto'
  ];

  return (
    <div className="content-box p-6 space-y-6">
      <h3 className="text-lg font-semibold text-text">Filtros</h3>
      
      {/* Período */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">Período</label>
        <select
          value={filters.period}
          onChange={(e) => handlePeriodChange(e.target.value as ReportFilters['period'])}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="current_month">Mês Atual</option>
          <option value="last_3_months">Últimos 3 Meses</option>
          <option value="last_6_months">Últimos 6 Meses</option>
          <option value="current_year">Ano Atual</option>
          <option value="custom">Personalizado</option>
        </select>
      </div>

      {/* Datas Personalizadas */}
      {showCustomDates && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">Data Inicial</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">Data Final</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {/* Tipo */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">Tipo</label>
        <select
          value={filters.type}
          onChange={(e) => onFiltersChange({ ...filters, type: e.target.value as ReportFilters['type'] })}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Todos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>
      </div>

      {/* Cartão */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">Cartão</label>
        <select
          value={filters.cardId || ''}
          onChange={(e) => onFiltersChange({ ...filters, cardId: e.target.value || undefined })}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos os cartões</option>
          {cards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">Categoria</label>
        <select
          value={filters.categoryId || ''}
          onChange={(e) => onFiltersChange({ ...filters, categoryId: e.target.value || undefined })}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Método de Pagamento */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">Método de Pagamento</label>
        <select
          value={filters.method || ''}
          onChange={(e) => onFiltersChange({ ...filters, method: e.target.value || undefined })}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos os métodos</option>
          {methods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </div>

      {/* Botão Limpar Filtros */}
      <button
        onClick={() => onFiltersChange({
          period: 'current_month',
          type: 'all',
          cardId: undefined,
          categoryId: undefined,
          method: undefined,
          startDate: undefined,
          endDate: undefined
        })}
        className="w-full px-4 py-2 bg-text-secondary/10 text-text-secondary rounded-lg hover:bg-text-secondary/20 transition-colors"
      >
        Limpar Filtros
      </button>
    </div>
  );
} 