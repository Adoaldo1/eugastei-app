import { formatCurrency } from '../utils/formatters';
import { Link } from 'react-router-dom';

type CreditCardProps = {
  cartao: {
    nome: string;
    limite: number;
    vencimento: number;
    cor: string;
  };
  faturaAtual: number;
  className?: string;
};

export function CreditCard({ cartao, faturaAtual, className = '' }: CreditCardProps) {
  const limiteDisponivel = cartao.limite - faturaAtual;
  const percentualUtilizado = (faturaAtual / cartao.limite) * 100;

  return (
    <div className={`${className}`}>
      {/* Container com largura total e altura automática */}
      <div className="w-full h-auto mb-4">
        {/* Cartão de Crédito */}
        <div 
          className="w-full rounded-xl text-text relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${cartao.cor}, ${cartao.cor}dd)`,
            padding: '32px',
            aspectRatio: '1.6',
            maxWidth: '100%'
          }}
        >
        {/* Background pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Conteúdo do cartão */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg sm:text-xl font-bold">{cartao.nome}</h3>
            <div className="text-right">
              <div className="text-xs opacity-80">Vencimento</div>
              <div className="font-semibold">Dia {cartao.vencimento}</div>
            </div>
          </div>
          
          {/* Valores principais */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Fatura atual</span>
              <span className="font-bold text-lg">{formatCurrency(faturaAtual)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Limite disponível</span>
              <span className="font-semibold">{formatCurrency(limiteDisponivel)}</span>
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Utilizado</span>
              <span>{percentualUtilizado.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-background bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-background rounded-full h-2 transition-all duration-300"
                style={{ width: `${Math.min(percentualUtilizado, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Limite total */}
          <div className="text-xs opacity-80">
            Limite total: {formatCurrency(cartao.limite)}
          </div>
        </div>
      </div>
      </div>
      
      {/* Botão Gerenciar Cartões */}
      <div className="mt-4">
        <Link 
          to="/cartoes"
          className="block w-full bg-card hover:bg-card text-primary text-center py-3 px-4 rounded-lg font-semibold transition-colors border border-border"
        >
          Gerenciar cartões
        </Link>
      </div>
    </div>
  );
} 