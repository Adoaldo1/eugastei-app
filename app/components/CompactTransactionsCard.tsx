import type { Transaction as SupabaseTransaction } from '../services/transactions';
import { formatCurrency } from '../utils/formatters';
import { getContrastingTextColor } from '../utils/colorContrast';
import { transactionsService } from '../services/transactions';
import { useState } from 'react';
import { Link } from 'react-router-dom';

type CompactTransactionsCardProps = {
  title: string;
  transactions: SupabaseTransaction[];
  className?: string;
  onRefresh?: () => Promise<void>;
  onEdit?: (transaction: SupabaseTransaction) => void;
  maxItems?: number;
};

// Função para formatar a data de forma compacta
function formatCompactDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  });
}

export function CompactTransactionsCard({ 
  title, 
  transactions, 
  className = '', 
  onRefresh, 
  onEdit,
  maxItems = 6 
}: CompactTransactionsCardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Limitar o número de transações exibidas
  const limitedTransactions = transactions.slice(0, maxItems);
  
  // Determinar se precisa de scroll (mais de 5 itens)
  const needsScroll = limitedTransactions.length > 5;
  
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

  return (
    <div className={`content-box h-auto ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text">{title}</h3>
          <Link 
            to="/transacoes" 
            className="text-xs text-primary hover:opacity-80 transition-opacity"
          >
            Ver todas
          </Link>
        </div>
        
        {/* Lista de transações horizontal */}
        <div className={`w-full text-sm text-text space-y-2 ${
          needsScroll ? 'max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent' : ''
        }`}>
            {limitedTransactions.length > 0 ? (
              limitedTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between bg-card px-4 py-2 rounded-md hover:bg-border transition-colors group"
                >
                  {/* Esquerda: Avatar + Nome */}
                  <div className="flex items-center gap-3 w-1/3 min-w-[150px]">
                    <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-xs uppercase text-text flex-shrink-0 border border-border">
                      {transaction.name.charAt(0)}
                    </div>
                    <span className="truncate text-text font-medium">
                      {transaction.name}
                    </span>
                  </div>

                  {/* Categoria */}
                  <div className="w-[100px] flex-shrink-0">
                    {transaction.category ? (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: transaction.category_color || '#E5E7EB',
                          color: transaction.category_color 
                            ? getContrastingTextColor(transaction.category_color)
                            : '#01040B'
                        }}
                      >
                        {transaction.category}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-border text-text-secondary">
                        Sem categoria
                      </span>
                    )}
                  </div>

                  {/* Valor */}
                  <div
                    className={`w-[90px] text-right font-medium ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {typeof transaction.amount === 'number' ? formatCurrency(transaction.amount) : transaction.amount}
                  </div>

                  {/* Data */}
                  <div className="w-[60px] text-right text-xs text-text-secondary">
                    {formatCompactDate(transaction.date)}
                  </div>

                  {/* Método de pagamento */}
                  <div className="w-[70px] text-right text-xs text-text-secondary">
                    {transaction.method}
                  </div>

                  {/* Ações (aparecem no hover) */}
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity w-[60px] justify-end">
                    {onEdit && (
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-primary hover:opacity-80 text-xs p-1 focus:outline-none mr-1"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      disabled={deletingId === transaction.id}
                      className={`text-red-500 hover:opacity-80 text-xs p-1 focus:outline-none ${
                        deletingId === transaction.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Excluir"
                    >
                      {deletingId === transaction.id ? (
                        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto w-12 h-12 bg-card rounded-full flex items-center justify-center mb-3 border border-border">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-text-secondary text-sm">Nenhuma transação encontrada</p>
              </div>
            )}
        </div>
    </div>
  );
} 