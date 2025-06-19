import type { ReactNode } from 'react';
import { formatCurrency } from '../utils/formatters';

type SummaryCardProps = {
  title: string;
  value: number;
  icon: ReactNode;
  variation?: {
    value: string;
    isPositive: boolean;
  };
  additionalInfo?: {
    label: string;
    value: number;
    color: string;
  };
  className?: string;
};

export function SummaryCard({ title, value, icon, variation, additionalInfo, className = '' }: SummaryCardProps) {
  // Formatação do valor para exibição
  const formattedValue = formatCurrency(value);
  
  // Determinar se é a caixa de saldo para aplicar estilo especial
  const isBalanceCard = title === 'Saldo atual';
  const boxClass = isBalanceCard ? 'balance-box' : 'content-box';
  
  return (
    <div 
      className={`h-full flex items-start justify-between ${boxClass} ${className}`}
      style={{ alignItems: 'flex-start', gap: '12px' }}
    >
      {/* Ícone à esquerda */}
      <div 
        className="flex items-center justify-center rounded-lg flex-shrink-0"
        style={{ 
          width: '48px', 
          height: '48px', 
          marginTop: '3px',
          padding: '0px'
        }}
      >
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      
      {/* Texto principal no centro */}
      <div className="flex flex-col flex-1 min-w-0">
        <p 
          className="font-normal text-xs sm:text-sm text-text-secondary truncate"
          style={{
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
          }}
        >
          {title}
        </p>
        <p 
          className="font-semibold text-text text-base sm:text-lg lg:text-xl xl:text-[22px] truncate"
          style={{
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
          }}
        >
          {formattedValue}
        </p>
        {/* Informação adicional (A receber / A pagar) */}
        {additionalInfo && additionalInfo.value > 0 && (
          <p 
            className="text-sm text-text-secondary font-semibold mt-1"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              marginTop: '4px'
            }}
          >
            {additionalInfo.label}: {formatCurrency(additionalInfo.value)}
          </p>
        )}
      </div>
      
      {/* Porcentagem à direita */}
      {variation && (
        <div 
          className="flex items-center justify-center flex-shrink-0 ml-2 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-3 lg:py-1.5 rounded-lg text-xs sm:text-xs lg:text-[12px]"
          style={{
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            fontWeight: '400',
            color: title === 'Saídas' ? '#CC4B4B' : '#02B15A',
            backgroundColor: title === 'Saídas' ? 'rgba(204, 75, 75, 0.15)' : 'rgba(2, 177, 90, 0.15)',
          }}
        >
          {variation.value}
        </div>
      )}
    </div>
  );
} 