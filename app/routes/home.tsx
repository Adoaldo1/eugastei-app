import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { Link } from 'react-router-dom';
import { SidebarLayout } from '../layouts/SidebarLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/Card';
import { SummaryCard } from '../components/SummaryCard';
import { BalanceAndCardsCard } from '../components/CreditCardCarousel';
import { LineChart } from '../components/LineChart';
import { PieChart } from '../components/PieChart';
import { TransactionsTable } from '../components/TransactionsTable';
import { CompactTransactionsCard } from '../components/CompactTransactionsCard';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Modal } from '../components/Modal';
import { TransactionForm } from '../components/TransactionForm';
import { useState } from 'react';
import { type Transaction } from '../services/transactions';

// Importar ícones SVG locais
import IconReceita from '../../src/assets/receita.svg';
import IconDespesa from '../../src/assets/despesa.svg';
import IconSaldo from '../../src/assets/saldo.svg';

export default function Home() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-8">EuGastei</h1>
        <Card className="w-full max-w-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-center">Gerenciador Financeiro Pessoal</h2>
          <p className="text-text-secondary mb-8 text-center">
            Controle suas finanças, acompanhe gastos e gerencie seu orçamento com facilidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-6 py-2 bg-blue-600 text-white rounded-md text-center hover:bg-blue-700 transition-colors"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-md text-center hover:bg-blue-50 transition-colors"
            >
              Cadastrar
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SidebarLayout>
          <DashboardContent 
            user={user} 
            isModalOpen={isModalOpen} 
            setIsModalOpen={setIsModalOpen} 
          />
        </SidebarLayout>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function DashboardContent({ 
  user, 
  isModalOpen, 
  setIsModalOpen 
}: { 
  user: any;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
}) {
  const { dashboardData, loading, error, refreshDashboard } = useDashboard();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Função para lidar com o sucesso da adição/edição de transação
  const handleTransactionSuccess = async () => {
    setIsModalOpen(false); // Fechar o modal
    setSelectedTransaction(null); // Limpar transação selecionada
    setIsEditing(false); // Resetar modo de edição
    await refreshDashboard(); // Atualizar os dados do dashboard
  };
  
  // Função para abrir o modal de edição
  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Função para abrir o modal de nova transação
  const handleNewTransaction = () => {
    setSelectedTransaction(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Obter nome do usuário (usa o email por enquanto, poderia vir de um perfil mais completo futuramente)
  const userName = user.email?.split('@')[0] || 'Usuário';
  const capitalizedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  return (
    <>
      <div className="w-full" data-route="home">
        {/* Page Header - Container de 104px com conteúdo centralizado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ height: '104px', display: 'flex', alignItems: 'center', paddingLeft: '40px', paddingRight: '40px' }}>
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text">
              Bem vindo de volta, {capitalizedName} 👋
            </h1>
            <p className="text-text-secondary mt-1 text-sm sm:text-base lg:text-lg">
              Confira suas finanças pessoais
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <button 
              className="bg-gradient-to-r from-[#1A4D99] to-[#2C80FF] text-white text-sm lg:text-[16px] font-semibold px-4 sm:px-6 lg:px-[42px] py-3 lg:py-[16px] rounded-[8px] flex items-center w-full sm:w-auto justify-center transition-all hover:opacity-90 btn-transaction-gradient"
              style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
              onClick={handleNewTransaction}
            >
              <span className="hidden sm:inline">Adicionar transação</span>
              <span className="sm:hidden">Nova transação</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="ml-2 w-4 h-4" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Moldura Externa da Dashboard - Colada no menu lateral */}
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
          {/* Layout Reorganizado - Nova Estrutura */}
          <div className="flex flex-col lg:flex-row gap-6 xl:gap-[20px] 2xl:gap-[24px] 3xl:gap-[28px] 4xl:gap-[32px] h-full">
            
            {/* Coluna Esquerda: Bloco Saldo+Cartões + Gráfico de Pizza - Largura fixa */}
            <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6 w-full lg:w-auto lg:flex-shrink-0" style={{ minWidth: '470px' }}>
              
              {/* Bloco Superior: Saldo Atual + Cartões de Crédito */}
              <div className="h-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-text-secondary">Carregando dados...</div>
                  </div>
                ) : (
                  <BalanceAndCardsCard 
                    balance={dashboardData.summary.balance}
                    previousMonthBalance={dashboardData.summary.previousMonthBalance}
                    cartoes={dashboardData.creditCards.cartoes}
                    faturas={dashboardData.creditCards.faturas}
                  />
                )}
              </div>
              
              {/* Gráfico de Pizza (Atividade) */}
              <div>
                <PieChart title="Atividade" />
              </div>
              
            </div>
            
            {/* Coluna Direita: Cards de Entradas/Saídas + Gráfico de Linhas + Transações Recentes - Expansível */}
            <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6 w-full lg:flex-1 lg:min-w-0">
              {/* Cards de Entradas e Saídas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                {/* Card Entradas */}
                <div className="w-full">
                  <SummaryCard
                    title="Entradas"
                    value={dashboardData.summary.incomes}
                    variation={{ value: "1.28%", isPositive: true }}
                    additionalInfo={{
                      label: "A receber",
                      value: dashboardData.summary.aReceber,
                      color: "#4ADE80"
                    }}
                    icon={
                      <img 
                        src={IconReceita} 
                        alt="Receita" 
                        style={{ width: '100%', height: '100%' }}
                      />
                    }
                  />
                </div>
                
                {/* Card Saídas */}
                <div className="w-full">
                  <SummaryCard
                    title="Saídas"
                    value={dashboardData.summary.expenses}
                    variation={{ value: "3.2%", isPositive: false }}
                    additionalInfo={{
                      label: "A pagar",
                      value: dashboardData.summary.aPagar,
                      color: "#F87171"
                    }}
                    icon={
                      <img 
                        src={IconDespesa} 
                        alt="Despesa" 
                        style={{ width: '100%', height: '100%' }}
                      />
                    }
                  />
                </div>
              </div>
              
              {/* Gráfico de Linhas - Expansível */}
              <div className="flex-1 min-h-[350px] sm:min-h-[400px] lg:min-h-[450px]">
                <LineChart title="Visão Geral" className="h-full w-full" />
              </div>
              
              {/* Transações Recentes - Logo abaixo do gráfico */}
              <div className="w-full">
                {loading ? (
                  <div className="content-box flex justify-center items-center min-h-[200px]">
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-text-secondary text-sm">Carregando...</span>
                  </div>
                ) : error ? (
                  <div className="content-box">
                    <div className="text-red-500 p-4 text-center text-sm">
                      {error}
                      <button 
                        onClick={refreshDashboard} 
                        className="ml-2 text-primary underline hover:opacity-80 transition-opacity"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  </div>
                ) : (
                  <CompactTransactionsCard 
                    title="Transações recentes" 
                    transactions={dashboardData.recentTransactions} 
                    onRefresh={refreshDashboard}
                    onEdit={handleEdit}
                    maxItems={6}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Adicionar/Editar Transação */}
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
    </>
  );
}
