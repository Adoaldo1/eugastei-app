import { useState, useEffect } from 'react';
import { SidebarLayout } from '../layouts/SidebarLayout';
import { ReportCard } from '../components/reports/ReportCard';
import { ReportFiltersComponent, type ReportFilters } from '../components/reports/ReportFilters';
import { ReportCharts } from '../components/reports/ReportCharts';
import { TransactionsTable } from '../components/reports/TransactionsTable';
import { reportsService, type ReportSummary } from '../services/reports';
import { transactionsService } from '../services/transactions';
import { formatCurrency } from '../utils/formatters';
import { useTheme } from '../hooks/useTheme';
import type { Transaction } from '../services/transactions';
import { ProtectedRoute } from '../components/ProtectedRoute';

export default function Relatorio() {
  const { theme } = useTheme();
  const [filters, setFilters] = useState<ReportFilters>({
    period: 'current_month',
    type: 'all'
  });
  
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ReportSummary>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    pendingReceivables: 0,
    pendingPayables: 0,
    transactionCount: 0
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [cards, setCards] = useState<Array<{ id: string; nome: string }>>([]);
  const [trends, setTrends] = useState<any>(null);

  // Carregar dados do relatório
  const loadReportData = async () => {
    setLoading(true);
    try {
      const [reportData, trendsData] = await Promise.all([
        reportsService.getReportData(filters),
        reportsService.calculateTrends(filters)
      ]);

      if (reportData.error) {
        console.error('Erro ao carregar dados:', reportData.error);
      } else {
        setTransactions(reportData.transactions);
        setCategories(reportData.categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          color: cat.color
        })));
        setCards(reportData.cards);
        setSummary(reportData.summary);
      }

      setTrends(trendsData);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [filters]);

  // Handlers para ações da tabela
  const handleEditTransaction = (transaction: Transaction) => {
    // Redirecionar para página de transações com ID para edição
    window.location.href = `/transactions?edit=${transaction.id}`;
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        const { error } = await transactionsService.delete(transactionId);
        if (error) {
          alert('Erro ao excluir transação');
        } else {
          // Recarregar dados
          loadReportData();
        }
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
        alert('Erro ao excluir transação');
      }
    }
  };

  return (
    <ProtectedRoute>
      <SidebarLayout>
        <div className="w-full" data-route="relatorio">
          {/* Page Header - Container de 104px com conteúdo centralizado */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ height: '104px', display: 'flex', alignItems: 'center', paddingLeft: '40px', paddingRight: '40px' }}>
            <div className="mb-4 sm:mb-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text">
                Relatórios Financeiros
              </h1>
              <p className="text-text-secondary mt-1 text-sm sm:text-base lg:text-lg">
                Análise detalhada das suas finanças
              </p>
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
            <div className="space-y-6">
              {/* Filtros de período */}
              <ReportFiltersComponent
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories}
                cards={cards}
              />

              {/* Estados de carregamento e erro */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-text-secondary">Carregando relatórios...</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Cards de resumo */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ReportCard
                      title="Total de Receitas"
                      value={formatCurrency(summary.totalIncome)}
                      icon="trending-up"
                      trend={trends?.income}
                    />
                    <ReportCard
                      title="Total de Despesas"
                      value={formatCurrency(summary.totalExpense)}
                      icon="trending-down"
                      trend={trends?.expense}
                    />
                    <ReportCard
                      title="Saldo Líquido"
                      value={formatCurrency(summary.totalIncome - summary.totalExpense)}
                      icon="calculator"
                    />
                  </div>

                  {/* Gráficos */}
                  <ReportCharts 
                    transactions={transactions} 
                    isDarkMode={theme === 'dark'} 
                  />

                  {/* Tabela de transações */}
                  {transactions.length > 0 && (
                    <TransactionsTable
                      transactions={transactions}
                      onEdit={handleEditTransaction}
                      onDelete={handleDeleteTransaction}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
} 