import { SidebarLayout } from "../layouts/SidebarLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { transactionsService, type Transaction, type TransactionFilters } from "../services/transactions";
import { TransactionsTable } from "../components/TransactionsTable";
import { Modal } from "../components/Modal";
import { TransactionForm } from "../components/TransactionForm";
import { TransactionFiltersPanel } from "../components/TransactionFilters";

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const fetchTransactions = async (appliedFilters: TransactionFilters = {}) => {
    setLoading(true);
    try {
      const { data, error } = await transactionsService.getAllWithFilters(appliedFilters);
      if (error) throw error;
      setTransactions(data);
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
      setError('Não foi possível carregar as transações. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(filters);
  }, [filters]);

  const handleTransactionSuccess = async () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
    setIsEditing(false);
    await fetchTransactions(filters);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleNewTransaction = () => {
    setSelectedTransaction(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleFilterChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <ProtectedRoute>
      <SidebarLayout>
        <div className="w-full">
          {/* Page Header - Container de 104px com conteúdo centralizado */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4" style={{ height: '104px', display: 'flex', alignItems: 'center', paddingLeft: '40px', paddingRight: '40px' }}>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">Transações</h1>
              <p className="text-sm sm:text-base text-secondary mt-1">
                Gerencie todas as suas transações
              </p>
            </div>
            
            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button 
                className="flex items-center justify-center gap-2 bg-card border border-border text-secondary text-sm sm:text-[14px] px-3 sm:px-4 py-2.5 sm:py-2 rounded-[6px] transition-all hover:bg-gray-100 order-2 sm:order-1"
                style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
                onClick={toggleFilters}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="hidden xs:inline">
                  {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                </span>
                <span className="xs:hidden">
                  {showFilters ? "Ocultar" : "Filtros"}
                </span>
                {Object.keys(filters).length > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {Object.keys(filters).length}
                  </span>
                )}
              </button>
              
              <button 
                className="bg-gradient-to-r from-[#1A4D99] to-[#2C80FF] text-white text-sm sm:text-[16px] font-semibold px-4 sm:px-6 lg:px-[42px] py-3 lg:py-[16px] rounded-[8px] flex items-center justify-center transition-all hover:opacity-90 order-1 sm:order-2 btn-transaction-gradient"
                style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
                onClick={handleNewTransaction}
              >
                <span className="hidden sm:inline">Nova Transação</span>
                <span className="sm:hidden">Nova Transação</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="ml-2 w-4 h-4 sm:w-[16px] sm:h-[16px]"
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Moldura Externa da Dashboard */}
          <div 
            className="border-t-2 border-l-2 border-[#20212A] shadow-sm min-h-[calc(100vh-110px)] light-mode-frame-border"
            style={{
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '0',
              borderBottomLeftRadius: '0',
              borderBottomRightRadius: '0',
              padding: '40px',
              margin: '0'
            }}
          >
            <div className="space-y-4 sm:space-y-6">
              {/* Painel de filtros responsivo */}
              {showFilters && (
                <div className="transition-all duration-300 ease-in-out">
                  <TransactionFiltersPanel 
                    onFilterChange={handleFilterChange}
                    loading={loading}
                    onClearFilters={handleClearFilters}
                  />
                </div>
              )}

              {/* Estados de carregamento, erro e conteúdo */}
              {loading ? (
                <div className="p-4 sm:p-5 content-box flex flex-col sm:flex-row justify-center items-center h-48 sm:h-60 gap-3">
                  <svg className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-[#007AFF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-secondary text-sm sm:text-base text-center">Carregando transações...</span>
                </div>
              ) : error ? (
                <div className="p-4 sm:p-5 content-box">
                  <div className="text-[#CC4B4B] p-4 text-center text-sm sm:text-base">
                    <p className="mb-3">{error}</p>
                    <button 
                      onClick={() => fetchTransactions(filters)} 
                      className="text-[#007AFF] underline hover:opacity-80 transition-opacity"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Informações sobre os resultados */}
                  <div className="p-4 sm:p-6 content-box">
                    <div className="mb-4 sm:mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className="text-xs sm:text-sm text-secondary">
                          {Object.keys(filters).length > 0
                            ? `${transactions.length} ${transactions.length === 1 ? 'transação encontrada' : 'transações encontradas'} com os filtros aplicados`
                            : `${transactions.length} ${transactions.length === 1 ? 'transação' : 'transações'} no total`}
                        </p>
                        
                        {/* Indicador de filtros ativos em mobile */}
                        {Object.keys(filters).length > 0 && (
                          <button
                            onClick={handleClearFilters}
                            className="text-xs text-[#007AFF] hover:opacity-80 transition-opacity self-start sm:self-auto"
                          >
                            Limpar filtros
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Conteúdo das transações */}
                    {transactions.length === 0 ? (
                      <div className="text-center py-8 sm:py-12">
                        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-card border border-border rounded-full flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-secondary text-sm sm:text-base mb-2">
                          {Object.keys(filters).length > 0 
                            ? "Nenhuma transação corresponde aos filtros aplicados"
                            : "Nenhuma transação encontrada"}
                        </p>
                        {Object.keys(filters).length === 0 && (
                          <p className="text-text-muted text-xs sm:text-sm">
                            Adicione sua primeira transação para começar
                          </p>
                        )}
                      </div>
                    ) : (
                      <TransactionsTable 
                        title="Lista de transações"
                        transactions={transactions} 
                        onEdit={handleEdit}
                        onRefresh={() => fetchTransactions(filters)}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal de transação */}
        <Modal isOpen={isModalOpen} onClose={() => {
          setIsModalOpen(false);
          setSelectedTransaction(null);
          setIsEditing(false);
        }}>
          <TransactionForm 
            onClose={() => {
              setIsModalOpen(false);
              setSelectedTransaction(null);
              setIsEditing(false);
            }} 
            onSuccess={handleTransactionSuccess}
            transaction={selectedTransaction || undefined}
            isEditing={isEditing}
          />
        </Modal>
      </SidebarLayout>
    </ProtectedRoute>
  );
} 