// app/components/PieChart.tsx

import React from 'react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip } from 'recharts';
import { useDashboard } from '~/context/DashboardContext';
import { formatCurrency } from '~/utils/formatters';
import { useRef, useState } from 'react';

// SVG para arcos semi-circulares desabilitado - usando Recharts
const HalfDonutChart = ({ data }: { data: any[] }) => null;

type PieChartProps = {
  title: string;
  className?: string;
};

type TransactionType = 'expense' | 'income';

export function PieChart({ title, className = '' }: PieChartProps) {
  const { dashboardData, filterDate, setFilterDate } = useDashboard();
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const containerRef = useRef<HTMLDivElement>(null);

  // Função para processar dados das transações baseado no tipo selecionado
  const processChartData = () => {
    const { pieChartData } = dashboardData;
    
    // Selecionar dados baseado no tipo de transação
    const currentData = transactionType === 'expense' ? pieChartData.expenses : pieChartData.incomes;
    
    // Se não há dados, retornar estrutura vazia
    if (!currentData.categories.length) {
      return { 
        categories: [], 
        values: [], 
        percentages: [], 
        colors: [], 
        totalValue: 0 
      };
    }
    
    // Usar os dados reais do contexto
    const totalValue = currentData.values.reduce((sum, val) => sum + val, 0);
    return { 
      categories: currentData.categories, 
      values: currentData.values, 
      percentages: currentData.percentages, 
      colors: currentData.colors, 
      totalValue 
    };
  };
  
  const { categories, values, percentages, colors, totalValue } = processChartData();
  
  // Determinar se precisa de scroll (mais de 5 categorias)
  const needsScroll = categories.length > 5;
  
  // Preparar dados para o Recharts
  const pieData = categories.map((category, index) => ({
    name: category,
    value: values[index],
    percentage: percentages[index],
    color: colors[index]
  }));
  
  // Handler para mudança de mês no filtro
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterDate({
      ...filterDate,
      month: parseInt(e.target.value)
    });
  };
  

  
  // Nomes dos meses
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  return (
    <div className={`content-box h-auto ${className}`} ref={containerRef} style={{ width: '470px' }}>
      {/* Título no topo, alinhado à esquerda */}
      <div className="mb-6">
        <h3 
          className="font-normal"
          style={{ 
            color: '#A6A6A6',
            fontSize: '14px',
            margin: 0,
            padding: 0,
            lineHeight: 1,
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
          }}
        >
          {title}
        </h3>
      </div>

      {/* Linha com controles: Toggle à esquerda, Select à direita */}
      <div className="flex items-center justify-between mb-4">
        {/* Toggle de Entradas/Saídas - Alinhado à esquerda */}
        <div className="flex rounded-lg" style={{ backgroundColor: '#040510', padding: '4px' }}>
          <button
            onClick={() => setTransactionType('income')}
            className="px-4 py-2 font-medium transition-all duration-200"
            style={{
              backgroundColor: transactionType === 'income' ? '#6243FF' : 'transparent',
              color: transactionType === 'income' ? '#FFFFFF' : '#A6A6A6',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            Entradas
          </button>
          <button
            onClick={() => setTransactionType('expense')}
            className="px-4 py-2 font-medium transition-all duration-200"
            style={{
              backgroundColor: transactionType === 'expense' ? '#6243FF' : 'transparent',
              color: transactionType === 'expense' ? '#FFFFFF' : '#A6A6A6',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            Saídas
          </button>
        </div>

        {/* Select dos meses - Alinhado à direita */}
        <select 
          className="font-normal py-1 px-3 hover:opacity-80 transition-colors"
          style={{
            backgroundColor: '#1F202D',
            color: '#FFFFFF',
            fontSize: '14px',
            border: '1px solid #353645',
            borderRadius: '8px'
          }}
          value={filterDate.month}
          onChange={handleMonthChange}
        >
          {months.map((month, index) => (
            <option key={index} value={index + 1}>{month}</option>
          ))}
        </select>
      </div>

          {/* Gráfico semi-donut */}
          <div className="w-full h-64 relative mb-6 mx-auto">
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="75%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={95}
                    outerRadius={140}
                    paddingAngle={2}
                    cornerRadius={4}
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div 
                            className="shadow-lg z-50"
                            style={{
                              backgroundColor: '#13141F',
                              border: '1px solid #20212A',
                              borderRadius: '8px',
                              padding: '16px',
                              width: '180px',
                              minHeight: '80px'
                            }}
                          >
                            {/* Categoria no topo */}
                            <div 
                              className="text-xs font-semibold mb-3"
                              style={{ color: '#8C89B4' }}
                            >
                              {data.name}
                            </div>
                            
                            {/* Linha de dados */}
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: data.color }}
                                />
                                <span 
                                  className="font-medium"
                                  style={{ 
                                    color: '#C0C2D4',
                                    fontSize: '14px'
                                  }}
                                >
                                  Valor
                                </span>
                              </div>
                              <div className="text-right">
                                <div 
                                  className="text-sm font-semibold"
                                  style={{ color: '#FFFFFF' }}
                                >
                                  {formatCurrency(data.value)}
                                </div>
                                <div 
                                  className="text-xs"
                                  style={{ color: '#8C89B4' }}
                                >
                                  {data.percentage}%
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-56 h-32 border-4 border-border rounded-t-full flex items-end justify-center pb-4 mx-auto mb-4">
                    <span className="text-sm text-text-secondary">Sem dados</span>
                  </div>
                  <p className="text-sm text-text-muted mt-2">
                    {transactionType === 'expense' 
                      ? 'Nenhuma despesa encontrada para este mês.' 
                      : 'Nenhuma receita encontrada para este mês.'}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Total */}
          {totalValue > 0 && (
            <div className="text-center mb-5">
              <span className="text-sm text-text-secondary">Total:</span>
              <span className="ml-2 font-semibold text-text">{formatCurrency(totalValue)}</span>
            </div>
          )}
          
          {/* Lista de categorias com barras de progresso */}
          {categories.length > 0 && (
            <div className={`mt-6 space-y-4 ${
              needsScroll ? 'max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent' : ''
            }`}>
              {categories.map((category, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: colors[index] }} 
                      />
                      <span className="text-sm text-text">{category}</span>
                    </div>
                    <span className="text-sm text-text font-medium">{percentages[index]}%</span>
                  </div>

                  {/* Barra de progresso */}
                  <div className="w-full h-2 rounded-full bg-card overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percentages[index]}%`,
                        backgroundColor: colors[index]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
    </div>
  );
}
