import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import type { Transaction } from '../../services/transactions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ReportChartsProps = {
  transactions: Transaction[];
  isDarkMode: boolean;
};

export function ReportCharts({ transactions, isDarkMode }: ReportChartsProps) {
  // Cores para os gráficos
  const colors = {
    primary: '#2C80FF',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    purple: '#8B5CF6',
    pink: '#EC4899',
    indigo: '#6366F1'
  };

  const textColor = isDarkMode ? '#E5E7EB' : '#374151';
  const gridColor = isDarkMode ? '#374151' : '#E5E7EB';

  // Dados para gráfico de evolução mensal
  const monthlyEvolutionData = useMemo(() => {
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      
      const amount = typeof transaction.amount === 'number' ? transaction.amount : parseFloat(transaction.amount.toString());
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += amount;
      } else {
        monthlyData[monthKey].expense += amount;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Receitas',
          data: sortedMonths.map(month => monthlyData[month].income),
          borderColor: colors.success,
          backgroundColor: colors.success + '20',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Despesas',
          data: sortedMonths.map(month => monthlyData[month].expense),
          borderColor: colors.danger,
          backgroundColor: colors.danger + '20',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [transactions]);

  // Dados para gráfico de pizza por categoria
  const categoryPieData = useMemo(() => {
    const categoryData: Record<string, { amount: number; color: string }> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const category = transaction.category || 'Sem categoria';
        const amount = typeof transaction.amount === 'number' ? transaction.amount : parseFloat(transaction.amount.toString());
        
        if (!categoryData[category]) {
          categoryData[category] = { 
            amount: 0, 
            color: transaction.category_color || colors.primary 
          };
        }
        categoryData[category].amount += amount;
      });

    const sortedCategories = Object.entries(categoryData)
      .sort(([,a], [,b]) => b.amount - a.amount)
      .slice(0, 8); // Top 8 categorias

    return {
      labels: sortedCategories.map(([name]) => name),
      datasets: [
        {
          data: sortedCategories.map(([,data]) => data.amount),
          backgroundColor: sortedCategories.map(([,data]) => data.color),
          borderWidth: 2,
          borderColor: isDarkMode ? '#1F2937' : '#FFFFFF'
        }
      ]
    };
  }, [transactions, isDarkMode]);

  // Dados para gráfico de barras por categoria
  const categoryBarData = useMemo(() => {
    const categoryData: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const category = transaction.category || 'Sem categoria';
        const amount = typeof transaction.amount === 'number' ? transaction.amount : parseFloat(transaction.amount.toString());
        
        if (!categoryData[category]) {
          categoryData[category] = 0;
        }
        categoryData[category] += amount;
      });

    const sortedCategories = Object.entries(categoryData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Top 10 categorias

    return {
      labels: sortedCategories.map(([name]) => name),
      datasets: [
        {
          label: 'Valor Gasto',
          data: sortedCategories.map(([,amount]) => amount),
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          borderWidth: 1
        }
      ]
    };
  }, [transactions]);

  // Dados para gráfico de saldo mensal
  const monthlyBalanceData = useMemo(() => {
    const monthlyData: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      
      const amount = typeof transaction.amount === 'number' ? transaction.amount : parseFloat(transaction.amount.toString());
      
      if (transaction.type === 'income') {
        monthlyData[monthKey] += amount;
      } else {
        monthlyData[monthKey] -= amount;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Saldo',
          data: sortedMonths.map(month => monthlyData[month]),
          backgroundColor: sortedMonths.map(month => 
            monthlyData[month] >= 0 ? colors.success : colors.danger
          ),
          borderColor: sortedMonths.map(month => 
            monthlyData[month] >= 0 ? colors.success : colors.danger
          ),
          borderWidth: 1
        }
      ]
    };
  }, [transactions]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: gridColor,
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          color: textColor
        },
        grid: {
          color: gridColor
        }
      },
      y: {
        ticks: {
          color: textColor,
          callback: function(value: any) {
            return new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(value);
          }
        },
        grid: {
          color: gridColor
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: textColor,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: gridColor,
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const value = new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(context.raw);
            return `${context.label}: ${value}`;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Evolução Mensal */}
      <div className="content-box p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Evolução Mensal</h3>
        <div className="h-80">
          <Line data={monthlyEvolutionData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribuição por Categoria */}
        <div className="content-box p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Despesas por Categoria</h3>
          <div className="h-80">
            <Pie data={categoryPieData} options={pieOptions} />
          </div>
        </div>

        {/* Maiores Categorias */}
        <div className="content-box p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Maiores Categorias de Gasto</h3>
          <div className="h-80">
            <Bar data={categoryBarData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Saldo Mensal */}
      <div className="content-box p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Saldo por Mês</h3>
        <div className="h-80">
          <Bar 
            data={monthlyBalanceData} 
            options={{
              ...chartOptions,
              indexAxis: 'y' as const,
              scales: {
                x: {
                  ticks: {
                    color: textColor,
                    callback: function(value: any) {
                      return new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(value);
                    }
                  },
                  grid: {
                    color: gridColor
                  }
                },
                y: {
                  ticks: {
                    color: textColor
                  },
                  grid: {
                    color: gridColor
                  }
                }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
} 