import { transactionsService, type TransactionFilters } from './transactions';
import { categoriesService } from './categories';
import { cartoesService } from './cartoes';
import type { ReportFilters } from '../components/reports/ReportFilters';

export type ReportSummary = {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  pendingReceivables: number;
  pendingPayables: number;
  transactionCount: number;
};

export const reportsService = {
  // Converter filtros de relatório para filtros de transação
  convertFiltersToTransactionFilters: (filters: ReportFilters): TransactionFilters => {
    const transactionFilters: TransactionFilters = {};

    // Tipo
    if (filters.type !== 'all') {
      transactionFilters.type = filters.type;
    }

    // Categoria
    if (filters.categoryId) {
      transactionFilters.categoryId = filters.categoryId;
    }

    // Método
    if (filters.method) {
      transactionFilters.method = filters.method;
    }

    // Período
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    switch (filters.period) {
      case 'current_month':
        const startOfMonth = new Date(currentYear, currentMonth, 1);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
        transactionFilters.startDate = startOfMonth.toISOString().split('T')[0];
        transactionFilters.endDate = endOfMonth.toISOString().split('T')[0];
        break;

      case 'last_3_months':
        const start3Months = new Date(currentYear, currentMonth - 2, 1);
        const end3Months = new Date(currentYear, currentMonth + 1, 0);
        transactionFilters.startDate = start3Months.toISOString().split('T')[0];
        transactionFilters.endDate = end3Months.toISOString().split('T')[0];
        break;

      case 'last_6_months':
        const start6Months = new Date(currentYear, currentMonth - 5, 1);
        const end6Months = new Date(currentYear, currentMonth + 1, 0);
        transactionFilters.startDate = start6Months.toISOString().split('T')[0];
        transactionFilters.endDate = end6Months.toISOString().split('T')[0];
        break;

      case 'current_year':
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31);
        transactionFilters.startDate = startOfYear.toISOString().split('T')[0];
        transactionFilters.endDate = endOfYear.toISOString().split('T')[0];
        break;

      case 'custom':
        if (filters.startDate) {
          transactionFilters.startDate = filters.startDate;
        }
        if (filters.endDate) {
          transactionFilters.endDate = filters.endDate;
        }
        break;
    }

    return transactionFilters;
  },

  // Gerar resumo financeiro
  generateSummary: async (filters: ReportFilters): Promise<ReportSummary> => {
    const transactionFilters = reportsService.convertFiltersToTransactionFilters(filters);
    const { data: transactions } = await transactionsService.getAllWithFilters(transactionFilters);

    if (!transactions) {
      return {
        totalBalance: 0,
        totalIncome: 0,
        totalExpense: 0,
        pendingReceivables: 0,
        pendingPayables: 0,
        transactionCount: 0
      };
    }

    let totalIncome = 0;
    let totalExpense = 0;
    let pendingReceivables = 0;
    let pendingPayables = 0;

    transactions.forEach(transaction => {
      const amount = typeof transaction.amount === 'number' 
        ? transaction.amount 
        : parseFloat(transaction.amount.toString());

      if (transaction.type === 'income') {
        totalIncome += amount;
        if (!transaction.realizado) {
          pendingReceivables += amount;
        }
      } else {
        totalExpense += amount;
        if (!transaction.realizado) {
          pendingPayables += amount;
        }
      }
    });

    return {
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      pendingReceivables,
      pendingPayables,
      transactionCount: transactions.length
    };
  },

  // Buscar dados para relatórios
  getReportData: async (filters: ReportFilters) => {
    try {
      // Buscar transações filtradas
      const transactionFilters = reportsService.convertFiltersToTransactionFilters(filters);
      const { data: transactions, error: transactionsError } = await transactionsService.getAllWithFilters(transactionFilters);

      if (transactionsError) {
        throw transactionsError;
      }

      // Buscar categorias
      const { data: categories, error: categoriesError } = await categoriesService.getAll();
      if (categoriesError) {
        throw categoriesError;
      }

      // Buscar cartões
      const { data: cards, error: cardsError } = await cartoesService.getAll();
      if (cardsError) {
        throw cardsError;
      }

      // Gerar resumo
      const summary = await reportsService.generateSummary(filters);

      return {
        transactions: transactions || [],
        categories: categories || [],
        cards: cards || [],
        summary,
        error: null
      };
    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
      return {
        transactions: [],
        categories: [],
        cards: [],
        summary: {
          totalBalance: 0,
          totalIncome: 0,
          totalExpense: 0,
          pendingReceivables: 0,
          pendingPayables: 0,
          transactionCount: 0
        },
        error: error as Error
      };
    }
  },

  // Calcular tendências (comparação com período anterior)
  calculateTrends: async (filters: ReportFilters) => {
    try {
      // Período atual
      const currentSummary = await reportsService.generateSummary(filters);

      // Calcular período anterior baseado no filtro
      const previousFilters = { ...filters };
      const now = new Date();

      switch (filters.period) {
        case 'current_month':
          const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          previousFilters.period = 'custom';
          previousFilters.startDate = prevMonth.toISOString().split('T')[0];
          previousFilters.endDate = prevMonthEnd.toISOString().split('T')[0];
          break;

        case 'last_3_months':
          const prev3MonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          const prev3MonthsEnd = new Date(now.getFullYear(), now.getMonth() - 2, 0);
          previousFilters.period = 'custom';
          previousFilters.startDate = prev3MonthsStart.toISOString().split('T')[0];
          previousFilters.endDate = prev3MonthsEnd.toISOString().split('T')[0];
          break;

        case 'last_6_months':
          const prev6MonthsStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
          const prev6MonthsEnd = new Date(now.getFullYear(), now.getMonth() - 5, 0);
          previousFilters.period = 'custom';
          previousFilters.startDate = prev6MonthsStart.toISOString().split('T')[0];
          previousFilters.endDate = prev6MonthsEnd.toISOString().split('T')[0];
          break;

        case 'current_year':
          const prevYear = now.getFullYear() - 1;
          previousFilters.period = 'custom';
          previousFilters.startDate = `${prevYear}-01-01`;
          previousFilters.endDate = `${prevYear}-12-31`;
          break;

        default:
          // Para períodos customizados, não calcular tendência
          return null;
      }

      const previousSummary = await reportsService.generateSummary(previousFilters);

      // Calcular percentuais de mudança
      const calculatePercentChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      return {
        income: {
          value: calculatePercentChange(currentSummary.totalIncome, previousSummary.totalIncome),
          isPositive: currentSummary.totalIncome >= previousSummary.totalIncome
        },
        expense: {
          value: calculatePercentChange(currentSummary.totalExpense, previousSummary.totalExpense),
          isPositive: currentSummary.totalExpense <= previousSummary.totalExpense // Menos despesa é positivo
        },
        balance: {
          value: calculatePercentChange(currentSummary.totalBalance, previousSummary.totalBalance),
          isPositive: currentSummary.totalBalance >= previousSummary.totalBalance
        }
      };
    } catch (error) {
      console.error('Erro ao calcular tendências:', error);
      return null;
    }
  }
}; 