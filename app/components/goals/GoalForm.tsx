import { useState, useEffect } from 'react';
import type { Goal, GoalType, GoalPeriod } from '../../services/goals';
import { categoriesService } from '../../services/categories';
import { cartoesService } from '../../services/cartoes';

type GoalFormProps = {
  goal?: Goal;
  onSubmit: (goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export function GoalForm({ goal, onSubmit, onCancel, isLoading = false }: GoalFormProps) {
  const [formData, setFormData] = useState({
    name: goal?.name || '',
    type: goal?.type || 'general' as GoalType,
    target_value: goal?.target_value || 0,
    is_percentage: goal?.is_percentage || false,
    period: goal?.period || 'monthly' as GoalPeriod,
    start_date: goal?.start_date || '',
    end_date: goal?.end_date || '',
    category_id: goal?.category_id || '',
    card_id: goal?.card_id || '',
    whatsapp_alerts: goal?.whatsapp_alerts || false,
    alert_levels: goal?.alert_levels || [70, 90, 100],
    is_active: goal?.is_active !== undefined ? goal.is_active : true
  });

  const [categories, setCategories] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [cards, setCards] = useState<Array<{ id: string; nome: string }>>([]);
  const [customAlertLevels, setCustomAlertLevels] = useState(
    goal?.alert_levels?.join(', ') || '70, 90, 100'
  );

  // Carregar categorias e cartões
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesResult, cardsResult] = await Promise.all([
          categoriesService.getAll(),
          cartoesService.getAll()
        ]);

        if (categoriesResult.data) {
          setCategories(categoriesResult.data.map(cat => ({
            id: cat.id,
            name: cat.name,
            color: cat.color
          })));
        }

        if (cardsResult.data) {
          setCards(cardsResult.data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Processar níveis de alerta
    const alertLevels = customAlertLevels
      .split(',')
      .map(level => parseFloat(level.trim()))
      .filter(level => !isNaN(level) && level > 0 && level <= 100)
      .sort((a, b) => a - b);

    const goalData = {
      ...formData,
      alert_levels: alertLevels
    };

    onSubmit(goalData);
  };

  const handleTypeChange = (type: GoalType) => {
    setFormData(prev => ({
      ...prev,
      type,
      category_id: type === 'category' ? prev.category_id : '',
      card_id: type === 'card' ? prev.card_id : ''
    }));
  };

  const handlePeriodChange = (period: GoalPeriod) => {
    setFormData(prev => ({
      ...prev,
      period,
      start_date: period === 'custom' ? prev.start_date : '',
      end_date: period === 'custom' ? prev.end_date : ''
    }));
  };

  return (
    <div className="content-box p-6">
      <h2 className="text-xl font-semibold text-text mb-6">
        {goal ? 'Editar Meta' : 'Nova Meta Financeira'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome da Meta */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Nome da Meta *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex: Limite de gastos com alimentação"
            required
          />
        </div>

        {/* Tipo de Meta */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Tipo de Meta *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('general')}
              className={`p-4 border rounded-lg text-left transition-colors ${
                formData.type === 'general'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">Meta Geral</span>
              </div>
              <p className="text-sm text-text-secondary">
                Limite total de despesas
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('category')}
              className={`p-4 border rounded-lg text-left transition-colors ${
                formData.type === 'category'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="font-medium">Por Categoria</span>
              </div>
              <p className="text-sm text-text-secondary">
                Limite para uma categoria específica
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('card')}
              className={`p-4 border rounded-lg text-left transition-colors ${
                formData.type === 'card'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="font-medium">Por Cartão</span>
              </div>
              <p className="text-sm text-text-secondary">
                Limite para um cartão específico
              </p>
            </button>
          </div>
        </div>

        {/* Seleção de Categoria (se tipo for categoria) */}
        {formData.type === 'category' && (
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Categoria *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Seleção de Cartão (se tipo for cartão) */}
        {formData.type === 'card' && (
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Cartão *
            </label>
            <select
              value={formData.card_id}
              onChange={(e) => setFormData(prev => ({ ...prev, card_id: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Selecione um cartão</option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Valor Limite */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Valor Limite *
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={!formData.is_percentage}
                  onChange={() => setFormData(prev => ({ ...prev, is_percentage: false }))}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm">Valor fixo (R$)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={formData.is_percentage}
                  onChange={() => setFormData(prev => ({ ...prev, is_percentage: true }))}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm">Percentual da receita (%)</span>
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                {formData.is_percentage ? '%' : 'R$'}
              </span>
              <input
                type="number"
                value={formData.target_value}
                onChange={(e) => setFormData(prev => ({ ...prev, target_value: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={formData.is_percentage ? "Ex: 60" : "Ex: 1500.00"}
                min="0"
                step={formData.is_percentage ? "1" : "0.01"}
                required
              />
            </div>
          </div>
        </div>

        {/* Período */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Período *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <button
              type="button"
              onClick={() => handlePeriodChange('monthly')}
              className={`p-3 border rounded-lg text-center transition-colors ${
                formData.period === 'monthly'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="font-medium">Mensal</span>
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange('yearly')}
              className={`p-3 border rounded-lg text-center transition-colors ${
                formData.period === 'yearly'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="font-medium">Anual</span>
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange('custom')}
              className={`p-3 border rounded-lg text-center transition-colors ${
                formData.period === 'custom'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="font-medium">Personalizado</span>
            </button>
          </div>

          {/* Datas Personalizadas */}
          {formData.period === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Data Inicial *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Data Final *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* Alertas WhatsApp */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <input
              type="checkbox"
              id="whatsapp_alerts"
              checked={formData.whatsapp_alerts}
              onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_alerts: e.target.checked }))}
              className="text-primary focus:ring-primary"
            />
            <label htmlFor="whatsapp_alerts" className="text-sm font-medium text-text">
              Ativar alertas via WhatsApp
            </label>
          </div>

          {formData.whatsapp_alerts && (
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Níveis de Alerta (%)
              </label>
              <input
                type="text"
                value={customAlertLevels}
                onChange={(e) => setCustomAlertLevels(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: 70, 90, 100"
              />
              <p className="text-xs text-text-secondary mt-1">
                Separe os valores por vírgula. Ex: 70, 90, 100
              </p>
            </div>
          )}
        </div>

        {/* Status Ativo */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="text-primary focus:ring-primary"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-text">
            Meta ativa
          </label>
        </div>

        {/* Botões */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-text-secondary hover:text-text transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : goal ? 'Atualizar Meta' : 'Criar Meta'}
          </button>
        </div>
      </form>
    </div>
  );
} 