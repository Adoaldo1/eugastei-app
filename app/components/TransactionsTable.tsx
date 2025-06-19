import type { Transaction as SupabaseTransaction } from '../services/transactions';
import { formatCurrency } from '../utils/formatters';
import { getContrastingTextColor } from '../utils/colorContrast';
import { transactionsService } from '../services/transactions';
import { useState, useEffect } from 'react';

type Transaction = {
  id: string;
  name: string;
  date: string;
  amount: string | number;
  method: string;
  type: 'income' | 'expense';
  category?: string;
  category_id?: string;
  category_color?: string;
};

type TransactionsTableProps = {
  title: string;
  transactions: SupabaseTransaction[];
  className?: string;
  onRefresh?: () => Promise<void>;
  onEdit?: (transaction: SupabaseTransaction) => void;
};

// Função para formatar a data
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// Função para converter transações do Supabase para o formato da tabela
export function mapTransactions(transactions: SupabaseTransaction[]): Transaction[] {
  return transactions.map(transaction => ({
    id: transaction.id,
    name: transaction.name,
    date: formatDate(transaction.date),
    amount: typeof transaction.amount === 'number'
      ? formatCurrency(transaction.amount)
      : transaction.amount,
    method: transaction.method,
    type: transaction.type,
    category: transaction.category,
    category_id: transaction.category_id,
    category_color: transaction.category_color,
  }));
}

export function TransactionsTable({ title, transactions, className = '', onRefresh, onEdit }: TransactionsTableProps) {
  // Estados para controlar o carregamento e responsividade
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar se é mobile baseado no breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Mapear transações para garantir formatação correta
  const formattedTransactions = mapTransactions(transactions);
  
  // Função para lidar com a exclusão de uma transação
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir essa transação?');
    if (!confirmDelete) return;
    
    setDeletingId(id);
    
    try {
      const { error } = await transactionsService.delete(id);
      
      if (error) {
        console.error('Erro ao deletar transação:', error.message);
        alert('Erro ao excluir transação: ' + error.message);
        return;
      }
      
      // Se a exclusão for bem-sucedida e onRefresh estiver disponível, atualize os dados
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.error('Erro ao excluir transação:', err);
      alert('Ocorreu um erro ao excluir a transação.');
    } finally {
      setDeletingId(null);
    }
  };
  
  // Função para lidar com a edição de uma transação
  const handleEdit = (transaction: SupabaseTransaction) => {
    if (onEdit) {
      onEdit(transaction);
    }
  };

  // Renderizar layout em cards para mobile
  const renderMobileCards = () => (
    <div className="space-y-4">
      {formattedTransactions.map(transaction => (
        <div 
          key={transaction.id} 
          className="bg-card rounded-lg p-4 border border-border"
        >
          {/* Header do card com nome e valor */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-card flex items-center justify-center mr-3">
                <span className="text-sm font-semibold text-text">
                  {transaction.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-text text-sm truncate">
                  {transaction.name}
                </h4>
                <p className="text-xs text-text-secondary">
                  {transaction.date}
                </p>
              </div>
            </div>
            <div className="text-right ml-3">
              <p className={`font-semibold text-base ${
                transaction.type === 'income' 
                  ? 'text-success' 
                  : 'text-danger'
              }`}>
                {typeof transaction.amount === 'number' ? formatCurrency(transaction.amount) : transaction.amount}
              </p>
            </div>
          </div>
          
          {/* Detalhes adicionais */}
          <div className="flex flex-wrap gap-2 mb-3">
            {/* Tipo */}
            {transaction.type === 'income' ? (
              <span 
                className="inline-flex items-center text-xs px-2.5 py-1 rounded-full text-text"
                style={{ backgroundColor: '#52CC4B', color: '#FFFFFF' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Receita
              </span>
            ) : (
              <span 
                className="inline-flex items-center text-xs px-2.5 py-1 rounded-full text-text"
                style={{ backgroundColor: '#CC4B4B', color: '#FFFFFF' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Despesa
              </span>
            )}
            
            {/* Categoria */}
            {transaction.category ? (
              <span 
                className="inline-flex items-center text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ 
                  backgroundColor: transaction.category_color || 
                    (transaction.type === 'income' ? '#52CC4B' : '#CC4B4B'),
                  color: transaction.category_color 
                    ? getContrastingTextColor(transaction.category_color)
                    : '#FFFFFF'
                }}
              >
                {transaction.category}
              </span>
            ) : (
              <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-card text-text font-semibold">
                Sem categoria
              </span>
            )}
            
            {/* Método */}
            <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-card text-text">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              {transaction.method}
            </span>
          </div>
          
          {/* Ações */}
          <div className="flex justify-end space-x-3 pt-2 border-t border-border">
            {onEdit && (
              <button
                onClick={() => handleEdit(transactions.find(t => t.id === transaction.id)!)}
                className="text-primary hover:opacity-80 text-sm font-semibold focus:outline-none"
              >
                Editar
              </button>
            )}
            <button
              onClick={() => handleDelete(transaction.id)}
              disabled={deletingId === transaction.id}
              className={`text-danger hover:opacity-80 text-sm font-semibold focus:outline-none ${
                deletingId === transaction.id ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {deletingId === transaction.id ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Renderizar layout em tabela para desktop
  const renderDesktopTable = () => (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="text-left text-xs font-semibold text-text-secondary border-b border-border">
            <th className="px-3 py-3 min-w-[200px]">Nome</th>
            <th className="px-3 py-3 min-w-[100px]">Tipo</th>
            <th className="px-3 py-3 min-w-[120px] hidden lg:table-cell">Categoria</th>
            <th className="px-3 py-3 min-w-[100px] hidden md:table-cell">Data</th>
            <th className="px-3 py-3 text-right min-w-[120px]">Valor</th>
            <th className="px-3 py-3 min-w-[100px] hidden lg:table-cell">Método</th>
            <th className="px-3 py-3 text-right min-w-[120px]">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#26272C]">
                      {formattedTransactions.map(transaction => (
              <tr key={transaction.id} className="hover:bg-background/5 transition-colors">
              <td className="px-3 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-9 w-9 rounded-full bg-card flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-text">{transaction.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0 max-w-[150px]">
                    <span className="font-semibold text-text block text-sm truncate" title={transaction.name}>
                      {transaction.name}
                    </span>
                    <span className="text-xs text-text-secondary lg:hidden">
                      {transaction.category || 'Sem categoria'}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-3 py-4">
                {transaction.type === 'income' ? (
                  <span 
                    className="inline-flex items-center text-xs px-2.5 py-1 rounded-full text-text whitespace-nowrap"
                    style={{ backgroundColor: '#52CC4B', color: '#FFFFFF' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Receita
                  </span>
                ) : (
                  <span 
                    className="inline-flex items-center text-xs px-2.5 py-1 rounded-full text-text whitespace-nowrap"
                    style={{ backgroundColor: '#CC4B4B', color: '#FFFFFF' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Despesa
                  </span>
                )}
              </td>
              <td className="px-3 py-4 hidden lg:table-cell">
                {transaction.category ? (
                  <span 
                    className="inline-flex items-center text-xs px-2.5 py-1 rounded-full font-semibold max-w-[100px] truncate"
                    style={{ 
                      backgroundColor: transaction.category_color || 
                        (transaction.type === 'income' ? '#52CC4B' : '#CC4B4B'),
                      color: transaction.category_color 
                        ? getContrastingTextColor(transaction.category_color)
                        : '#FFFFFF'
                    }}
                    title={transaction.category}
                  >
                    {transaction.category}
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-card text-text font-semibold">
                    Sem categoria
                  </span>
                )}
              </td>
              <td className="px-3 py-4 text-sm text-text-secondary hidden md:table-cell whitespace-nowrap">
                {transaction.date}
              </td>
              <td className={`px-3 py-4 font-semibold text-right whitespace-nowrap ${
                transaction.type === 'income' 
                  ? 'text-success' 
                  : 'text-danger'
              }`}>
                <span>{typeof transaction.amount === 'number' ? formatCurrency(transaction.amount) : transaction.amount}</span>
                <span className="block text-xs text-text-secondary md:hidden">{transaction.date}</span>
              </td>
              <td className="px-3 py-4 hidden lg:table-cell">
                <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-card text-text whitespace-nowrap">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                  {transaction.method}
                </span>
              </td>
              <td className="px-3 py-4 text-right">
                <div className="flex justify-end space-x-2 lg:space-x-3">
                  {onEdit && (
                    <button
                      onClick={() => handleEdit(transactions.find(t => t.id === transaction.id)!)}
                      className="text-primary hover:opacity-80 text-xs lg:text-sm font-semibold focus:outline-none whitespace-nowrap"
                    >
                      Editar
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    disabled={deletingId === transaction.id}
                    className={`text-danger hover:opacity-80 text-xs lg:text-sm font-semibold focus:outline-none whitespace-nowrap ${
                      deletingId === transaction.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {deletingId === transaction.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  return (
    <div className={`p-4 sm:p-6 content-box ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-text">{title}</h3>
        <div className="mt-2 sm:mt-0 text-xs sm:text-sm text-text-secondary">
          {formattedTransactions.length} {formattedTransactions.length === 1 ? 'transação' : 'transações'}
        </div>
      </div>
      
      {formattedTransactions.length > 0 ? (
        isMobile ? renderMobileCards() : renderDesktopTable()
      ) : (
        <div className="py-12 text-center">
          <div className="mx-auto w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-text-secondary text-sm sm:text-base">Nenhuma transação encontrada</p>
          <p className="text-text-muted text-xs sm:text-sm mt-1">Adicione sua primeira transação para começar</p>
        </div>
      )}
    </div>
  );
} 