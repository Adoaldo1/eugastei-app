import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { recurringTransactionsService, type RecurringTransaction, type TransactionType, type FrequencyType } from '../services/recurringTransactions';
import { categoriesService, type Category } from '../services/categories';
import { useAuth } from '../context/AuthContext';

type RecurringTransactionFormProps = {
  onClose: () => void;
  onSuccess: () => void;
  transaction?: RecurringTransaction; // Transaction to edit (optional)
  isEditing?: boolean;
};

type FormValues = {
  name: string;
  amount: string;
  type: TransactionType;
  category_id: string;
  payment_method: string;
  frequency: FrequencyType;
  start_date: string;
  end_date?: string;
  is_active: boolean;
};

export function RecurringTransactionForm({ 
  onClose, 
  onSuccess, 
  transaction, 
  isEditing = false 
}: RecurringTransactionFormProps) {
  // Usando try/catch para evitar erros com useContext
  let user;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (error) {
    console.error("Erro ao usar AuthContext:", error);
    // Caso o contexto não esteja disponível, forneça um usuário fake
    user = { id: 'test-user-id', email: 'test@example.com' };
  }
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    control, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors } 
  } = useForm<FormValues>({
    defaultValues: {
      name: transaction?.name || '',
      amount: transaction ? 
        (typeof transaction.amount === 'number' ? 
          transaction.amount.toString() : transaction.amount) : '',
      type: transaction?.type || 'income',
      category_id: transaction?.category_id || '',
      payment_method: transaction?.payment_method || 'Pix',
      frequency: transaction?.frequency || 'mensal',
      start_date: transaction?.start_date || new Date().toISOString().split('T')[0],
      end_date: transaction?.end_date || '',
      is_active: transaction?.is_active !== undefined ? transaction.is_active : true,
    }
  });

  const transactionType = watch('type');

  // Filtrar categorias com base no tipo de transação
  const filteredCategories = categories.filter(
    category => category.type === transactionType
  );

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

  // Atualizar o campo de categoria quando o tipo de transação mudar
  useEffect(() => {
    setValue('category_id', '');
  }, [transactionType, setValue]);

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setLoading(true);
    
    try {
      // Encontrar a categoria selecionada
      const selectedCategory = categories.find(cat => cat.id === data.category_id);
      
      if (!selectedCategory) {
        throw new Error('Categoria selecionada não encontrada');
      }
      
      const transactionData = {
        name: data.name,
        amount: data.amount,
        type: data.type,
        category_id: selectedCategory.id,
        category_color: selectedCategory.color,
        payment_method: data.payment_method,
        frequency: data.frequency,
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: data.is_active,
      };
      
      let saveError;
      
      if (isEditing && transaction) {
        // Atualizar transação existente
        const { error } = await recurringTransactionsService.update(transaction.id, transactionData);
        saveError = error;
      } else {
        // Criar nova transação
        const { error } = await recurringTransactionsService.create(transactionData);
        saveError = error;
      }
      
      if (saveError) {
        throw new Error(saveError.message);
      }
      
      // Notificar que a transação foi criada/atualizada com sucesso
      onSuccess();
      
      // Fechar o modal
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar transação recorrente');
    } finally {
      setLoading(false);
    }
  };

  // Classes responsivas para inputs e labels
      const inputClassName = "w-full rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-text-muted bg-input-bg border border-input-border/30 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base hover:bg-input-bg/80";
    const labelClassName = "block text-text text-xs sm:text-sm font-normal mb-1.5 sm:mb-2";
    const iconInputClassName = "w-full pl-10 sm:pl-12 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-text-muted bg-input-bg border border-input-border/30 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base hover:bg-input-bg/80";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-6 sm:gap-8">
        {/* Cabeçalho responsivo */}
        <div className="flex flex-col items-start gap-3 sm:gap-4">
          <Link 
            to="/home" 
            className="text-[#A6A6A6] text-xs sm:text-sm font-medium hover:text-text transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Painel
          </Link>
          <h2 className="text-text text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight">
            {isEditing ? 'Editar transação recorrente' : 'Nova transação recorrente'}
          </h2>
        </div>

        {error && (
          <div className="bg-danger/20 text-red-400 p-3 sm:p-4 rounded-lg text-xs sm:text-sm border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 sm:gap-8">
          {/* Tipo de transação */}
          <div>
            <label className={labelClassName}>
              Tipo de transação
            </label>
            <Controller
              name="type"
              control={control}
              rules={{ required: "Tipo é obrigatório" }}
              render={({ field }) => (
                <div className="flex w-full gap-1 sm:gap-2 bg-transparent border border-white/10 rounded-full p-1">
                  <button
                    type="button"
                    className={`w-1/2 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base lg:text-lg transition-all ${
                      field.value === 'income'
                        ? 'bg-[#52CC4B] text-text'
                        : 'text-text/50 hover:text-text/70'
                    }`}
                    onClick={() => field.onChange('income')}
                  >
                    Receita
                  </button>
                  <button
                    type="button"
                    className={`w-1/2 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base lg:text-lg transition-all ${
                      field.value === 'expense'
                        ? 'bg-[#CC4B4B] text-text'
                        : 'text-text/50 hover:text-text/70'
                    }`}
                    onClick={() => field.onChange('expense')}
                  >
                    Despesa
                  </button>
                </div>
              )}
            />
            {errors.type && (
              <p className="text-red-400 text-xs mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* Campos do formulário responsivos */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Nome da transação */}
            <div>
              <label className={labelClassName}>
                Nome da transação
              </label>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Nome é obrigatório" }}
                render={({ field }) => (
                  <input
                    type="text"
                    placeholder="Ex: Salário mensal"
                    className={inputClassName}
                    {...field}
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Valor */}
            <div>
              <label className={labelClassName}>
                Valor
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
                  <span className="text-text text-sm sm:text-base">R$</span>
                </div>
                <Controller
                  name="amount"
                  control={control}
                  rules={{ required: "Valor é obrigatório" }}
                  render={({ field }) => (
                    <input
                      type="text"
                      placeholder="0,00"
                      className={iconInputClassName}
                      {...field}
                    />
                  )}
                />
              </div>
              {errors.amount && (
                <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className={labelClassName}>
                Categoria
              </label>
              {loadingCategories ? (
                <div className={`${inputClassName} flex items-center justify-center text-text/50`}>
                  <span className="text-xs sm:text-sm">Carregando categorias...</span>
                </div>
              ) : (
                <>
                  {filteredCategories.length > 0 ? (
                    <Controller
                      name="category_id"
                      control={control}
                      rules={{ required: "Categoria é obrigatória" }}
                      render={({ field }) => (
                        <select
                          className={inputClassName}
                          {...field}
                        >
                          <option value="" className="bg-input-bg text-text-muted">Selecione uma categoria</option>
                          {filteredCategories.map(category => (
                            <option key={category.id} value={category.id} className="bg-[#1a1a1a] text-text">
                              {category.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  ) : (
                    <div className="flex flex-col space-y-2 sm:space-y-3">
                      <div className={`${inputClassName} text-text/50 text-xs sm:text-sm`}>
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
              {errors.category_id && (
                <p className="text-red-400 text-xs mt-1">{errors.category_id.message}</p>
              )}
            </div>

            {/* Método de pagamento */}
            <div>
              <label className={labelClassName}>
                Método de pagamento
              </label>
              <Controller
                name="payment_method"
                control={control}
                rules={{ required: "Método é obrigatório" }}
                render={({ field }) => (
                  <select
                    className={inputClassName}
                    {...field}
                  >
                    <option value="Pix" className="bg-[#1a1a1a] text-text">Pix</option>
                    <option value="Cartão de Crédito" className="bg-[#1a1a1a] text-text">Cartão de Crédito</option>
                    <option value="Cartão de Débito" className="bg-[#1a1a1a] text-text">Cartão de Débito</option>
                    <option value="Transferência" className="bg-[#1a1a1a] text-text">Transferência</option>
                    <option value="Dinheiro" className="bg-[#1a1a1a] text-text">Dinheiro</option>
                    <option value="Boleto" className="bg-[#1a1a1a] text-text">Boleto</option>
                  </select>
                )}
              />
              {errors.payment_method && (
                <p className="text-red-400 text-xs mt-1">{errors.payment_method.message}</p>
              )}
            </div>

            {/* Frequência */}
            <div>
              <label className={labelClassName}>
                Frequência
              </label>
              <Controller
                name="frequency"
                control={control}
                rules={{ required: "Frequência é obrigatória" }}
                render={({ field }) => (
                  <select
                    className={inputClassName}
                    {...field}
                  >
                    <option value="mensal" className="bg-[#1a1a1a] text-text">Mensal</option>
                    <option value="semanal" className="bg-[#1a1a1a] text-text">Semanal</option>
                    <option value="anual" className="bg-[#1a1a1a] text-text">Anual</option>
                  </select>
                )}
              />
              {errors.frequency && (
                <p className="text-red-400 text-xs mt-1">{errors.frequency.message}</p>
              )}
            </div>

            {/* Datas em grid responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Data de início */}
              <div>
                <label className={labelClassName}>
                  Data de início
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-text" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <Controller
                    name="start_date"
                    control={control}
                    rules={{ required: "Data de início é obrigatória" }}
                    render={({ field }) => (
                      <input
                        type="date"
                        className={iconInputClassName}
                        {...field}
                      />
                    )}
                  />
                </div>
                {errors.start_date && (
                  <p className="text-red-400 text-xs mt-1">{errors.start_date.message}</p>
                )}
              </div>

              {/* Data de fim */}
              <div>
                <label className={labelClassName}>
                  Data de fim (opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-text" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <Controller
                    name="end_date"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="date"
                        className={iconInputClassName}
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Checkbox Ativo */}
            <div>
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <label className="flex items-start gap-3 text-text text-xs sm:text-sm font-normal cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="mt-0.5 appearance-none w-4 h-4 sm:w-5 sm:h-5 rounded border border-[#A6A6A6] checked:bg-[#007AFF] checked:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/30 transition-all"
                    />
                    <span>Transação ativa</span>
                  </label>
                )}
              />
            </div>
          </div>

          {/* Botão de submit responsivo */}
          <button
            type="submit"
            disabled={loading || loadingCategories || filteredCategories.length === 0}
            className="bg-gradient-to-r from-[#1A4D99] to-[#2C80FF] text-text text-sm sm:text-base lg:text-lg font-semibold px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-4 rounded-lg w-full transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed btn-transaction-gradient"
          >
            {loading ? 'Salvando...' : isEditing ? 'Atualizar transação' : 'Criar transação recorrente'}
          </button>
        </form>
      </div>
    </div>
  );
} 