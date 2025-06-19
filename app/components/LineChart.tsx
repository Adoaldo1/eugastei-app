import { useDashboard } from '../context/DashboardContext';
import { formatCurrency } from '../utils/formatters';
import { useState, useEffect } from 'react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

type LineChartProps = {
  title: string;
  className?: string;
};

type ChartData = {
  mes: string;
  entrada: number;
  saida: number;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    color: string;
    dataKey: string;
    name: string;
    value: number;
  }>;
  label?: string;
};

// Componente de Tooltip customizado com design idêntico aos cards da plataforma
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Encontrar entradas e saídas no payload
  const entradas = payload.find(item => item.dataKey === 'entrada');
  const saidas = payload.find(item => item.dataKey === 'saida');

  return (
    <div 
      className="shadow-lg z-50"
      style={{
        backgroundColor: '#13141F',
        border: '1px solid #20212A',
        borderRadius: '8px',
        padding: '16px',
        width: '200px',
        height: '110px'
      }}
    >
      {/* Mês no topo */}
      <div 
        className="text-xs font-semibold mb-3"
        style={{ color: '#8C89B4' }}
      >
        {label}
      </div>
      
      {/* Linhas de dados */}
      <div className="space-y-2">
        {/* Linha de Entradas */}
        {entradas && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#4ADE80' }}
              />
              <span 
                className="font-medium"
                style={{ 
                  color: '#C0C2D4',
                  fontSize: '14px'
                }}
              >
                Entradas
              </span>
            </div>
            <span 
              className="text-sm font-semibold text-right"
              style={{ color: '#FFFFFF' }}
            >
              {formatCurrency(entradas.value || 0)}
            </span>
          </div>
        )}
        
        {/* Linha de Saídas */}
        {saidas && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#F87171' }}
              />
              <span 
                className="font-medium"
                style={{ 
                  color: '#C0C2D4',
                  fontSize: '14px'
                }}
              >
                Saídas
              </span>
            </div>
            <span 
              className="text-sm font-semibold text-right"
              style={{ color: '#FFFFFF' }}
            >
              {formatCurrency(saidas.value || 0)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export function LineChart({ title, className = '' }: LineChartProps) {
  const { dashboardData, filterDate, setFilterDate, loading } = useDashboard();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  // Hook para detectar tamanho da tela responsivo
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    // Configuração inicial
    handleResize();

    // Listener para mudanças de tamanho
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Função para mudar o filtro de período
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value as 'mensal' | 'trimestral' | 'anual';
    setFilterDate({
      ...filterDate,
      period: period
    });
  };

  // Usar dados processados do DashboardContext
  const processChartData = (): ChartData[] => {
    const { lineChartData } = dashboardData;
    
    return lineChartData.months.map((mes, index) => ({
      mes,
      entrada: lineChartData.incomes[index] || 0,
      saida: lineChartData.expenses[index] || 0
    }));
  };

  const chartData = processChartData();

  // Calcular valor máximo para escala dinâmica
  const maxValue = Math.max(
    ...chartData.map(d => Math.max(d.entrada, d.saida)),
    100 // Valor mínimo para evitar escala muito pequena
  );

  // Gerar ticks do eixo Y (5 linhas)
  const yAxisTicks = [0, Math.ceil(maxValue * 0.25), Math.ceil(maxValue * 0.5), Math.ceil(maxValue * 0.75), Math.ceil(maxValue)];

  // Configurações responsivas
  const fontSize = isMobile ? 10 : isTablet ? 11 : 12;
  const strokeWidth = isMobile ? 2 : 3;
  const activeDotRadius = isMobile ? 4 : 6;
  
  // Margens responsivas
  const chartMargins = {
    top: isMobile ? 15 : 20,
    right: isMobile ? 15 : isTablet ? 25 : 30,
    left: isMobile ? 5 : isTablet ? 15 : 20,
    bottom: isMobile ? 5 : 10,
  };

  // Handlers para controlar a linha vertical do hover
  const handleMouseMove = (event: any) => {
    if (event && event.activeLabel) {
      setActiveLabel(event.activeLabel);
    }
  };

  const handleMouseLeave = () => {
    setActiveLabel(null);
  };

  return (
    <div className={`content-box w-full relative flex flex-col ${className}`}>
      {/* Header responsivo com título, legenda e filtro */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-text">
          {title}
        </h3>
        
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:gap-4 lg:gap-6">
          {/* Legenda responsiva */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-success"></span>
              <span className="text-xs sm:text-sm text-text-secondary font-normal">Entradas</span>
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-danger"></span>
              <span className="text-xs sm:text-sm text-text-secondary font-normal">Saídas</span>
            </div>
          </div>
          
          {/* Filtro responsivo */}
          <div className="flex flex-col sm:flex-row gap-2">
            <select 
              className="text-xs sm:text-sm bg-background text-text-secondary border border-border rounded-md py-1.5 sm:py-2 px-2 sm:px-3 w-full sm:w-auto hover:bg-card transition-colors"
              onChange={handleFilterChange}
              value={filterDate.period}
            >
              <option value="mensal">Mensal</option>
              <option value="trimestral">Trimestral</option>
              <option value="anual">Anual</option>
            </select>
            
            {/* Seletor de mês (apenas para filtros mensal e trimestral) */}
            {(filterDate.period === 'mensal' || filterDate.period === 'trimestral') && (
              <select 
                className="text-xs sm:text-sm bg-background text-text-secondary border border-border rounded-md py-1.5 sm:py-2 px-2 sm:px-3 w-full sm:w-auto hover:bg-card transition-colors"
                value={filterDate.month}
                onChange={(e) => setFilterDate({
                  ...filterDate,
                  month: parseInt(e.target.value)
                })}
              >
                <option value={1}>Janeiro</option>
                <option value={2}>Fevereiro</option>
                <option value={3}>Março</option>
                <option value={4}>Abril</option>
                <option value={5}>Maio</option>
                <option value={6}>Junho</option>
                <option value={7}>Julho</option>
                <option value={8}>Agosto</option>
                <option value={9}>Setembro</option>
                <option value={10}>Outubro</option>
                <option value={11}>Novembro</option>
                <option value={12}>Dezembro</option>
              </select>
            )}
            
            {/* Seletor de ano */}
            <select 
              className="text-xs sm:text-sm bg-background text-text-secondary border border-border rounded-md py-1.5 sm:py-2 px-2 sm:px-3 w-full sm:w-auto hover:bg-card transition-colors"
              value={filterDate.year}
              onChange={(e) => setFilterDate({
                ...filterDate,
                year: parseInt(e.target.value)
              })}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>{year}</option>
                );
              })}
            </select>
          </div>
        </div>
      </div>
      
      {/* Container do gráfico ocupando toda a altura restante */}
      <div className="w-full flex-1 relative min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-text-secondary">Carregando dados...</span>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={chartData}
              margin={chartMargins}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255, 255, 255, 0.1)" 
                horizontal={true}
                vertical={false}
              />
              <XAxis 
                dataKey="mes" 
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fill: '#9CA3AF', 
                  fontSize: fontSize,
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                  dy: isMobile ? 8 : 10
                }}
                height={isMobile ? 20 : 25}
                interval={filterDate.period === 'mensal' && chartData.length > 10 ? Math.ceil(chartData.length / 10) : 0}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fill: '#9CA3AF', 
                  fontSize: fontSize,
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
                }}
                tickFormatter={(value) => {
                  // Formatação responsiva para valores do eixo Y
                  if (isMobile && value >= 1000) {
                    return `R$ ${(value / 1000).toFixed(0)}k`;
                  }
                  return formatCurrency(value);
                }}
                domain={[0, maxValue]}
                ticks={yAxisTicks}
                tickCount={5}
                width={isMobile ? 45 : isTablet ? 60 : 80}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: 'rgba(255, 255, 255, 0.2)', strokeWidth: 1 }}
              />
              {/* Linha vertical tracejada roxa no hover */}
              {activeLabel && (
                <ReferenceLine 
                  x={activeLabel}
                  stroke="#6243FF"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  strokeOpacity={0.7}
                  ifOverflow="extendDomain"
                />
              )}
              <Line 
                type="monotone" 
                dataKey="entrada" 
                stroke="#52CC4B" 
                strokeWidth={strokeWidth}
                dot={{ fill: '#52CC4B', strokeWidth: 0, r: 0 }}
                activeDot={{ 
                  r: activeDotRadius, 
                  fill: '#52CC4B', 
                  strokeWidth: 2, 
                  stroke: '#FFFFFF' 
                }}
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="saida" 
                stroke="#CC4B4B" 
                strokeWidth={strokeWidth}
                dot={{ fill: '#CC4B4B', strokeWidth: 0, r: 0 }}
                activeDot={{ 
                  r: activeDotRadius, 
                  fill: '#CC4B4B', 
                  strokeWidth: 2, 
                  stroke: '#FFFFFF' 
                }}
                connectNulls={false}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
} 