import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transactionsService, type Transaction } from '../services/transactions';
import { recurringTransactionsService, type FrequencyType } from '../services/recurringTransactions';
import { categoriesService, type Category } from '../services/categories';
import type { TransactionType } from '../services/transactions';

type TransactionFormProps = {
  onClose: () => void;
  onSuccess: () => void;
  transaction?: Transaction; // Transaction to edit (optional)
  isEditing?: boolean;
};

export function TransactionForm({ onClose, onSuccess, transaction, isEditing = false }: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>(transaction?.type || 'income');
  const [name, setName] = useState<string>(transaction?.name || '');
  const [amount, setAmount] = useState<string>(transaction ? 
    (typeof transaction.amount === 'number' ? 
      transaction.amount.toString() : transaction.amount) : '');
  const [categoryId, setCategoryId] = useState<string>(transaction?.category_id || '');
  const [paymentMethod, setPaymentMethod] = useState<string>(transaction?.method || 'Pix');
  const [date, setDate] = useState<string>(transaction?.date || new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  
  // Campos para transações recorrentes
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<FrequencyType>('mensal');
  const [startDate, setStartDate] = useState<string>(date);
  const [endDate, setEndDate] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  
  // Campo para indicar se a transação já foi realizada
  const [realizado, setRealizado] = useState<boolean>(transaction?.realizado !== undefined ? transaction.realizado : true);

  // Carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const { data, error } = await categoriesService.getAll();
        if (error) throw new Error(error.message);
        setCategories(data);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setError('Não foi possível carregar as categorias');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Filtrar categorias com base no tipo de transação
  const filteredCategories = categories.filter(
    category => category.type === transactionType
  );

  // Atualizar a data de início recorrente quando a data normal mudar
  useEffect(() => {
    setStartDate(date);
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validação básica
    if (!name.trim()) {
      setError('Nome da transação é obrigatório');
      return;
    }
    
    if (!amount.trim()) {
      setError('Valor é obrigatório');
      return;
    }
    
    if (!categoryId) {
      setError('Categoria é obrigatória');
      return;
    }
    
    // Validações específicas para transações recorrentes
    if (isRecurring) {
      if (!startDate) {
        setError('Data de início é obrigatória para transações recorrentes');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      // Encontrar a categoria selecionada
      const selectedCategory = categories.find(cat => cat.id === categoryId);
      
      if (!selectedCategory) {
        throw new Error('Categoria selecionada não encontrada');
      }
      
      // Se não for uma transação recorrente, salvar como transação normal
      if (!isRecurring) {
        const transactionData = {
          name,
          amount,
          type: transactionType,
          category: selectedCategory.name,
          category_id: selectedCategory.id,
          category_color: selectedCategory.color,
          method: paymentMethod,
          date,
          realizado,
        };
        
        let saveError;
        
        if (isEditing && transaction) {
          // Atualizar transação existente
          const { error } = await transactionsService.update(transaction.id, transactionData);
          saveError = error;
        } else {
          // Criar nova transação
          const { error } = await transactionsService.create(transactionData);
          saveError = error;
        }
        
        if (saveError) {
          throw new Error(saveError.message);
        }
      } 
      // Caso seja uma transação recorrente
      else {
        const recurringTransactionData = {
          name,
          amount,
          type: transactionType,
          category_id: selectedCategory.id,
          payment_method: paymentMethod,
          frequency,
          start_date: startDate,
          end_date: endDate || undefined,
          is_active: isActive,
        };
        
        // Criar nova transação recorrente
        const { error } = await recurringTransactionsService.create(recurringTransactionData);
        
        if (error) {
          throw new Error(error.message);
        }
      }
      
      // Notificar que a transação foi criada/atualizada com sucesso
      onSuccess();
      
      // Fechar o modal
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  // Classes responsivas para inputs e labels
      const inputClassName = "w-full rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-text-muted bg-input-bg border border-input-border/30 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base hover:bg-input-bg/80";
    const labelClassName = "block text-white text-xs sm:text-sm font-normal mb-1.5 sm:mb-2";
    const iconInputClassName = "w-full pl-10 sm:pl-12 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-text-muted bg-input-bg border border-input-border/30 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base hover:bg-input-bg/80";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-6 sm:gap-8">
        {/* Cabeçalho do Modal responsivo */}
        <div className="flex flex-col items-start gap-3 sm:gap-4">
          <Link 
            to="/home" 
            className="text-[#A6A6A6] text-xs sm:text-sm font-medium hover:text-white transition-colors"
          >
            &lt; Painel
          </Link>
          <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight">
            {isEditing ? 'Editar transação' : isRecurring ? 'Nova transação recorrente' : 'Nova transação'}
          </h2>

          {/* Botões Receita/Despesa responsivos */}
          <div className="flex w-full gap-1 sm:gap-2 bg-transparent border border-white/10 rounded-full p-1">
            <button
              type="button"
              className={`w-1/2 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base lg:text-lg transition-all ${
                transactionType === 'income'
                  ? 'bg-[#52CC4B] text-white'
                  : 'text-white/50 hover:text-white/70'
              }`}
              onClick={() => {
                setTransactionType('income');
                setCategoryId(''); // Reset category when type changes
              }}
            >
              Receita
            </button>
            <button
              type="button"
              className={`w-1/2 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base lg:text-lg transition-all ${
                transactionType === 'expense'
                  ? 'bg-[#CC4B4B] text-white'
                  : 'text-white/50 hover:text-white/70'
              }`}
              onClick={() => {
                setTransactionType('expense');
                setCategoryId(''); // Reset category when type changes
              }}
            >
              Despesa
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 sm:p-4 rounded-lg text-xs sm:text-sm border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-8">
          {/* Campos do Formulário responsivos */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Nome da transação */}
            <div>
              <label htmlFor="name" className={labelClassName}>
                Nome da transação
              </label>
              <input
                type="text"
                id="name"
                placeholder="Ex: Compra de supermercado"
                className={inputClassName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Valor */}
            <div>
              <label htmlFor="amount" className={labelClassName}>
                Valor
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
                  <span className="text-text text-sm sm:text-base">R$</span>
                </div>
                <input
                  type="text"
                  id="amount"
                  placeholder="0,00"
                  className={iconInputClassName}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label htmlFor="category" className={labelClassName}>
                Categoria
              </label>
              {loadingCategories ? (
                <div className={`${inputClassName} flex items-center justify-center text-white/50`}>
                  <span className="text-xs sm:text-sm">Carregando categorias...</span>
                </div>
              ) : (
                <>
                  {filteredCategories.length > 0 ? (
                    <select
                      id="category"
                      className={inputClassName}
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                    >
                      <option value="" className="bg-input-bg text-text-muted">Selecione uma categoria</option>
                      {filteredCategories.map(category => (
                        <option key={category.id} value={category.id} className="bg-[#1a1a1a] text-white">
                          {category.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex flex-col space-y-2 sm:space-y-3">
                      <div className={`${inputClassName} text-white/50 text-xs sm:text-sm`}>
                        Nenhuma categoria encontrada para {transactionType === 'income' ? 'receitas' : 'despesas'}
                      </div>
                      <Link
                        to="/categories"
                        className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Criar categorias
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Método de pagamento */}
            <div>
              <label htmlFor="paymentMethod" className={labelClassName}>
                Método de pagamento
              </label>
              <select
                id="paymentMethod"
                className={inputClassName}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="Pix" className="bg-[#1a1a1a] text-white">Pix</option>
                <option value="Cartão" className="bg-[#1a1a1a] text-white">Cartão</option>
                <option value="Transferência" className="bg-[#1a1a1a] text-white">Transferência</option>
                <option value="Dinheiro" className="bg-[#1a1a1a] text-white">Dinheiro</option>
                <option value="Outro" className="bg-[#1a1a1a] text-white">Outro</option>
              </select>
            </div>

            {/* Data (apenas para transações não recorrentes) */}
            {!isRecurring && (
              <div>
                <label htmlFor="date" className={labelClassName}>
                  Data
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    id="date"
                    className={iconInputClassName}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Seção Final: Checkbox e configurações de recorrência */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Checkbox para indicar se a transação já foi realizada */}
            <label className="flex items-start gap-3 text-white text-xs sm:text-sm font-normal cursor-pointer">
              <input
                type="checkbox"
                id="realizado"
                checked={realizado}
                onChange={(e) => setRealizado(e.target.checked)}
                className="mt-0.5 appearance-none w-4 h-4 sm:w-5 sm:h-5 rounded border border-[#A6A6A6] checked:bg-[#007AFF] checked:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/30 transition-all"
              />
              <span>Já foi realizado?</span>
            </label>
            
            <label className="flex items-start gap-3 text-white text-xs sm:text-sm font-normal cursor-pointer">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                disabled={isEditing}
                className="mt-0.5 appearance-none w-4 h-4 sm:w-5 sm:h-5 rounded border border-[#A6A6A6] checked:bg-[#007AFF] checked:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/30 transition-all"
              />
              <span>Tornar esta transação recorrente</span>
            </label>
            
            {isEditing && (
              <p className="text-xs text-gray-400 -mt-2">
                A edição de transações recorrentes deve ser feita através da página específica de transações recorrentes.
              </p>
            )}
            
            {!isEditing && isRecurring && (
              <p className="text-xs text-gray-400 -mt-2">
                Transações recorrentes serão executadas automaticamente conforme a frequência definida. Você poderá gerenciá-las na página de Transações Recorrentes.
              </p>
            )}

            {/* Configurações de recorrência */}
            {isRecurring && (
                              <div className="border border-gray-600/30 rounded-lg p-4 sm:p-6 bg-[#1C1D21]">
                <h3 className="text-white text-sm sm:text-base font-medium mb-4 sm:mb-6">
                  Configurações de recorrência
                </h3>
                
                <div className="space-y-4 sm:space-y-6">
                  {/* Frequência */}
                  <div>
                    <label htmlFor="frequency" className={labelClassName}>
                      Frequência
                    </label>
                    <select
                      id="frequency"
                      className={inputClassName}
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as FrequencyType)}
                      required
                    >
                      <option value="mensal" className="bg-[#1a1a1a] text-white">Mensal</option>
                      <option value="semanal" className="bg-[#1a1a1a] text-white">Semanal</option>
                      <option value="anual" className="bg-[#1a1a1a] text-white">Anual</option>
                    </select>
                  </div>
                  
                  {/* Data de início */}
                  <div>
                    <label htmlFor="startDate" className={labelClassName}>
                      Data de início
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="date"
                        id="startDate"
                        className={iconInputClassName}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Data de fim */}
                  <div>
                    <label htmlFor="endDate" className={labelClassName}>
                      Data de fim (opcional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="date"
                        id="endDate"
                        className={iconInputClassName}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Checkbox Ativo */}
                  <div>
                    <label className="flex items-start gap-3 text-white text-xs sm:text-sm font-normal cursor-pointer">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="mt-0.5 appearance-none w-4 h-4 sm:w-5 sm:h-5 rounded border border-[#A6A6A6] checked:bg-[#007AFF] checked:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/30 transition-all"
                      />
                      <span>Ativo</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Botão de submit responsivo */}
            <button
              type="submit"
              disabled={loading || loadingCategories || filteredCategories.length === 0}
              className="bg-gradient-to-r from-[#1A4D99] to-[#2C80FF] text-white text-sm sm:text-base lg:text-lg font-semibold px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-4 rounded-lg w-full transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed btn-transaction-gradient"
            >
              {loading ? 'Salvando...' : 'Salvar transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 