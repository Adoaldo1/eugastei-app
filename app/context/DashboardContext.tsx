import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { transactionsService } from '../services/transactions';
import { recurringTransactionsService } from '../services/recurringTransactions';
import { cartoesService } from '../services/cartoes';
import type { Transaction } from '../services/transactions';
import type { Cartao } from '../services/cartoes';
import { formatCurrency } from '../utils/formatters';

// Tipos de dados para o dashboard
type DashboardData = {
  summary: {
    incomes: number;
    expenses: number;
    balance: number;
    aReceber: number;
    aPagar: number;
    previousMonthBalance: number;
  };
  lineChartData: {
    months: string[];
    incomes: number[];
    expenses: number[];
  };
  pieChartData: {
    expenses: {
      categories: string[];
      values: number[];
      colors: string[];
      percentages: number[];
    };
    incomes: {
      categories: string[];
      values: number[];
      colors: string[];
      percentages: number[];
    };
  };
  recentTransactions: Transaction[];
  creditCards: {
    cartoes: Cartao[];
    faturas: Record<string, number>;
  };
};

type FilterDate = {
  month: number;
  year: number;
  period: 'mensal' | 'trimestral' | 'anual';
};

type DashboardContextType = {
  dashboardData: DashboardData;
  loading: boolean;
  error: string | null;
  filterDate: FilterDate;
  setFilterDate: (filter: FilterDate) => void;
  refreshDashboard: () => Promise<void>;
};

const defaultData: DashboardData = {
  summary: {
    incomes: 0,
    expenses: 0,
    balance: 0,
    aReceber: 0,
    aPagar: 0,
    previousMonthBalance: 0,
  },
  lineChartData: {
    months: [],
    incomes: [],
    expenses: [],
  },
  pieChartData: {
    expenses: {
      categories: [],
      values: [],
      colors: [],
      percentages: [],
    },
    incomes: {
      categories: [],
      values: [],
      colors: [],
      percentages: [],
    },
  },
  recentTransactions: [],
  creditCards: {
    cartoes: [],
    faturas: {},
  },
};

const colorPalette = [
  '#4ADE80', // green-500
  '#F87171', // red-400
  '#60A5FA', // blue-400
  '#FBBF24', // yellow-400
  '#A78BFA', // purple-400
  '#FB923C', // orange-400
  '#38BDF8', // sky-400
  '#2DD4BF', // teal-500
  '#F472B6', // pink-400
];

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Função para processar dados mensais (diários)
const processarDadosMensais = (transactions: Transaction[], filterDate: FilterDate) => {
  if (!transactions || transactions.length === 0) {
    return { months: [], incomes: [], expenses: [] };
  }

  // Filtrar transações do mês específico
  const monthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const realizado = transaction.realizado !== undefined ? transaction.realizado : true;
    return (
      transactionDate.getMonth() + 1 === filterDate.month &&
      transactionDate.getFullYear() === filterDate.year &&
      realizado
    );
  });

  // Agrupar por dia
  const dayMap = new Map<number, { income: number; expense: number }>();
  
  monthTransactions.forEach(transaction => {
    const transactionDate = new Date(transaction.date);
    const day = transactionDate.getDate();
    
    const amount = typeof transaction.amount === 'string'
      ? parseFloat(transaction.amount.toString().replace('R$', '').replace('.', '').replace(',', '.'))
      : transaction.amount;

    if (!dayMap.has(day)) {
      dayMap.set(day, { income: 0, expense: 0 });
    }

    if (transaction.type === 'income') {
      dayMap.get(day)!.income += amount;
    } else {
      dayMap.get(day)!.expense += amount;
    }
  });

  // Criar labels dos dias do mês
  const daysInMonth = new Date(filterDate.year, filterDate.month, 0).getDate();
  const days: string[] = [];
  const incomes: number[] = [];
  const expenses: number[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day.toString());
    const dayData = dayMap.get(day) || { income: 0, expense: 0 };
    incomes.push(dayData.income);
    expenses.push(dayData.expense);
  }

  return {
    months: days,
    incomes,
    expenses,
  };
};

// Função para processar dados trimestrais (últimos 3 meses)
const processarDadosTrimestrais = (transactions: Transaction[], filterDate: FilterDate) => {
  if (!transactions || transactions.length === 0) {
    return { months: [], incomes: [], expenses: [] };
  }

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const months: string[] = [];
  const incomes: number[] = [];
  const expenses: number[] = [];

  // Últimos 3 meses (incluindo o atual)
  for (let i = 2; i >= 0; i--) {
    let targetMonth = filterDate.month - i;
    let targetYear = filterDate.year;
    
    if (targetMonth <= 0) {
      targetMonth += 12;
      targetYear -= 1;
    }

    months.push(monthNames[targetMonth - 1]);

    // Filtrar transações deste mês específico
    const monthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const realizado = transaction.realizado !== undefined ? transaction.realizado : true;
      return (
        transactionDate.getMonth() + 1 === targetMonth &&
        transactionDate.getFullYear() === targetYear &&
        realizado
      );
    });

    // Calcular totais do mês
    let monthIncome = 0;
    let monthExpense = 0;

    monthTransactions.forEach(transaction => {
      const amount = typeof transaction.amount === 'string'
        ? parseFloat(transaction.amount.toString().replace('R$', '').replace('.', '').replace(',', '.'))
        : transaction.amount;

      if (transaction.type === 'income') {
        monthIncome += amount;
      } else {
        monthExpense += amount;
      }
    });

    incomes.push(monthIncome);
    expenses.push(monthExpense);
  }

  return {
    months,
    incomes,
    expenses,
  };
};

// Função para processar dados anuais (mês a mês)
const processarDadosAnuais = (transactions: Transaction[], filterDate: FilterDate) => {
  if (!transactions || transactions.length === 0) {
    return { months: [], incomes: [], expenses: [] };
  }

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const lineIncomes = Array(12).fill(0);
  const lineExpenses = Array(12).fill(0);

  transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.date);
    const month = transactionDate.getMonth();
    const year = transactionDate.getFullYear();
    
    // Apenas considerar transações do ano atual e que foram realizadas
    const realizado = transaction.realizado !== undefined ? transaction.realizado : true;
    if (year === filterDate.year && realizado) {
      const amount = typeof transaction.amount === 'string'
        ? parseFloat(transaction.amount.toString().replace('R$', '').replace('.', '').replace(',', '.'))
        : transaction.amount;
        
      if (transaction.type === 'income') {
        lineIncomes[month] += amount;
      } else {
        lineExpenses[month] += amount;
      }
    }
  });

  return {
    months,
    incomes: lineIncomes,
    expenses: lineExpenses,
  };
};

// Função para processar dados do gráfico de pizza
const processarDadosPieChart = (transactions: Transaction[], type: 'expense' | 'income' = 'expense') => {
  if (!transactions || transactions.length === 0) {
    return {
      categories: [],
      values: [],
      colors: [],
      percentages: [],
    };
  }

  // Filtrar transações pelo tipo especificado
  const filteredTransactions = transactions.filter(t => t.type === type);
  
  if (filteredTransactions.length === 0) {
    return {
      categories: [],
      values: [],
      colors: [],
      percentages: [],
    };
  }

  const categoryMap = new Map<string, { value: number; color: string }>();
  
  filteredTransactions.forEach(transaction => {
    const amount = typeof transaction.amount === 'string'
      ? parseFloat(transaction.amount.toString().replace('R$', '').replace('.', '').replace(',', '.'))
      : transaction.amount;
    
    const categoryName = transaction.category || 'Sem categoria';
    const categoryColor = transaction.category_color || colorPalette[categoryMap.size % colorPalette.length];
    
    if (categoryMap.has(categoryName)) {
      categoryMap.get(categoryName)!.value += amount;
    } else {
      categoryMap.set(categoryName, { value: amount, color: categoryColor });
    }
  });

  // Converter para arrays
  const categories = Array.from(categoryMap.keys());
  const values = Array.from(categoryMap.values()).map(item => item.value);
  const colors = Array.from(categoryMap.values()).map(item => item.color);
  
  // Calcular percentuais
  const totalValue = values.reduce((sum, val) => sum + val, 0);
  const percentages = values.map(val => Math.round((val / totalValue) * 100));

  return {
    categories,
    values,
    colors,
    percentages,
  };
};

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtro de data padrão (mês atual)
  const [filterDate, setFilterDate] = useState<FilterDate>({
    month: new Date().getMonth() + 1, // Janeiro é 0, então adicionamos 1
    year: new Date().getFullYear(),
    period: 'mensal',
  });

  // Função para recalcular os dados do dashboard
  const recalcularDashboardDados = async (userId: string, filterDate: FilterDate) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Executar transações recorrentes antes de carregar os dados
      await recurringTransactionsService.executarTransacoesRecorrentes();
      
      // 1. Buscar todas as transações do usuário
      const { data: allTransactions, error } = await transactionsService.getAll();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Se não há transações, usar dados padrão mas ainda carregar os cartões
      let hasTransactions = allTransactions && allTransactions.length > 0;
      
      // 2. Processar dados baseado no período selecionado
      let lineChartData;
      let summaryTransactions;
      
      if (filterDate.period === 'mensal') {
        // MENSAL: mostrar dados diários do mês atual
        lineChartData = processarDadosMensais(allTransactions, filterDate);
        summaryTransactions = hasTransactions ? allTransactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return (
            transactionDate.getMonth() + 1 === filterDate.month &&
            transactionDate.getFullYear() === filterDate.year
          );
        }) : [];
      } else if (filterDate.period === 'trimestral') {
        // TRIMESTRAL: mostrar dados dos últimos 3 meses
        lineChartData = processarDadosTrimestrais(allTransactions, filterDate);
        summaryTransactions = hasTransactions ? allTransactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          const currentMonth = filterDate.month;
          const currentYear = filterDate.year;
          
          // Últimos 3 meses (incluindo o atual)
          for (let i = 0; i < 3; i++) {
            let targetMonth = currentMonth - i;
            let targetYear = currentYear;
            
            if (targetMonth <= 0) {
              targetMonth += 12;
              targetYear -= 1;
            }
            
            if (transactionDate.getMonth() + 1 === targetMonth && transactionDate.getFullYear() === targetYear) {
              return true;
            }
          }
          return false;
        }) : [];
      } else {
        // ANUAL: mostrar dados mês a mês do ano atual
        lineChartData = processarDadosAnuais(allTransactions, filterDate);
        summaryTransactions = hasTransactions ? allTransactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate.getFullYear() === filterDate.year;
        }) : [];
      }
      
      // 3. Calcular resumo baseado nas transações filtradas
      const summary = hasTransactions ? summaryTransactions.reduce(
        (acc, transaction) => {
          const amount = typeof transaction.amount === 'string'
            ? parseFloat(transaction.amount.toString().replace('R$', '').replace('.', '').replace(',', '.'))
            : transaction.amount;
            
          // Verificar se a transação foi realizada (padrão: true para compatibilidade)
          const realizado = transaction.realizado !== undefined ? transaction.realizado : true;
            
          if (transaction.type === 'income') {
            if (realizado) {
              acc.incomes += amount;
            } else {
              acc.aReceber += amount;
            }
          } else {
            if (realizado) {
              acc.expenses += amount;
            } else {
              acc.aPagar += amount;
            }
          }
          
          return acc;
        },
        { incomes: 0, expenses: 0, balance: 0, aReceber: 0, aPagar: 0, previousMonthBalance: 0 }
      ) : { incomes: 0, expenses: 0, balance: 0, aReceber: 0, aPagar: 0, previousMonthBalance: 0 };
      
      summary.balance = summary.incomes - summary.expenses;
      
      // Calcular saldo do mês anterior para comparação
      const previousMonth = filterDate.month === 1 ? 12 : filterDate.month - 1;
      const previousYear = filterDate.month === 1 ? filterDate.year - 1 : filterDate.year;
      
      const previousMonthTransactions = hasTransactions ? allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const realizado = transaction.realizado !== undefined ? transaction.realizado : true;
        return (
          transactionDate.getMonth() + 1 === previousMonth &&
          transactionDate.getFullYear() === previousYear &&
          realizado
        );
      }) : [];
      
      const previousMonthSummary = previousMonthTransactions.reduce(
        (acc, transaction) => {
          const amount = typeof transaction.amount === 'string'
            ? parseFloat(transaction.amount.toString().replace('R$', '').replace('.', '').replace(',', '.'))
            : transaction.amount;
          
          if (transaction.type === 'income') {
            acc.incomes += amount;
          } else {
            acc.expenses += amount;
          }
          
          return acc;
        },
        { incomes: 0, expenses: 0 }
      );
      
      const previousMonthBalance = previousMonthSummary.incomes - previousMonthSummary.expenses;
      summary.previousMonthBalance = previousMonthBalance;
      
      // 4. Processar dados para o gráfico de pizza (baseado nas transações filtradas)
      const pieChartTransactions = filterDate.period === 'mensal' ? summaryTransactions : hasTransactions ? allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() + 1 === filterDate.month &&
          transactionDate.getFullYear() === filterDate.year
        );
      }) : [];
      
      const pieChartData = {
        expenses: processarDadosPieChart(pieChartTransactions, 'expense'),
        incomes: processarDadosPieChart(pieChartTransactions, 'income'),
      };
      
      // 5. Obter transações recentes (últimas 10 transações, ordenadas por data)
      const recentTransactions = hasTransactions ? allTransactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10) : [];
      
      // 6. Buscar todos os cartões de crédito do usuário
      let creditCardsData: { cartoes: Cartao[]; faturas: Record<string, number> } = { cartoes: [], faturas: {} };
      try {
        const { data: cartoes } = await cartoesService.getAll();
        
        if (cartoes && cartoes.length > 0) {
          const faturas: Record<string, number> = {};
          
          // Calcular fatura para cada cartão
          for (const cartao of cartoes) {
            try {
              const { fatura } = await cartoesService.calculateFaturaAtual(cartao.id);
              faturas[cartao.id] = fatura;
            } catch (err) {
              console.warn(`Erro ao calcular fatura do cartão ${cartao.nome}:`, err);
              faturas[cartao.id] = 0;
            }
          }
          
          creditCardsData = { cartoes, faturas };
        }
      } catch (err) {
        console.error('Erro ao buscar dados dos cartões:', err);
        // Mantém creditCardsData vazio se não houver cartões
      }
      
      // Atualizar o estado com todos os dados processados
      setDashboardData({
        summary,
        lineChartData,
        pieChartData: pieChartData,
        recentTransactions,
        creditCards: creditCardsData,
      });
      
    } catch (err) {
      console.error('Erro ao calcular dados do dashboard:', err);
      setError(err instanceof Error ? err.message : 'Erro ao calcular dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o componente montar ou quando o filtro mudar
  useEffect(() => {
    if (user?.id) {
      recalcularDashboardDados(user.id, filterDate);
    }
  }, [user?.id, filterDate]);

  // Função para atualizar o dashboard manualmente
  const refreshDashboard = async () => {
    if (user?.id) {
      await recalcularDashboardDados(user.id, filterDate);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,
        loading,
        error,
        filterDate,
        setFilterDate,
        refreshDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard deve ser usado dentro de um DashboardProvider');
  }
  return context;
}; 