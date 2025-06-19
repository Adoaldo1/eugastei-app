import { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '../utils/formatters';
import { Link } from 'react-router-dom';
import type { Cartao } from '../services/cartoes';

type CreditCardCarouselProps = {
  cartoes: Cartao[];
  faturas: Record<string, number>;
  className?: string;
};

type BalanceAndCardsCardProps = {
  balance: number;
  previousMonthBalance: number;
  cartoes: Cartao[];
  faturas: Record<string, number>;
  className?: string;
};

// Novo componente unificado para saldo e cartões
export function BalanceAndCardsCard({ 
  balance, 
  previousMonthBalance, 
  cartoes, 
  faturas, 
  className = '' 
}: BalanceAndCardsCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cartoesValidos = Array.isArray(cartoes) ? cartoes.filter(cartao => cartao && cartao.id) : [];

  return (
    <div 
      className={`w-full ${className}`}
      style={{
        backgroundColor: '#13141F',
        border: '1px solid #20212A',
        borderRadius: '16px',
        padding: '32px',
        width: '470px',
        height: 'auto',
        minHeight: '400px',
        overflow: 'visible'
      }}
    >
      {/* Seção do Saldo - Topo */}
      <div className="mb-8">
        <div className="flex flex-col" style={{ gap: '10px' }}>
          <p 
            className="font-normal"
            style={{ 
              color: '#A6A6A6',
              fontSize: '18px',
              margin: 0,
              padding: 0,
              lineHeight: 1,
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
            }}
          >
            Saldo atual
          </p>
          <p 
            className="font-semibold text-white"
            style={{ 
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: '36px',
              margin: 0,
              padding: 0,
              lineHeight: 1
            }}
          >
            {formatCurrency(balance)}
          </p>
          <p 
            className="flex items-center gap-1"
            style={{ 
              fontSize: '14px',
              margin: 0,
              padding: 0,
              lineHeight: 1,
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
            }}
          >
            <span 
              className="font-medium"
              style={{ 
                color: '#FFFFFF',
                lineHeight: 1
              }}
            >
              {formatCurrency(previousMonthBalance)}
            </span>
            <span 
              className="font-normal"
              style={{ 
                color: '#88899A',
                lineHeight: 1
              }}
            >
              do mês anterior
            </span>
          </p>
        </div>
      </div>

      {/* Seção do Carousel - Meio */}
      <div className="mb-8" style={{ overflow: 'visible' }}>
        {cartoesValidos.length === 0 ? (
          <EmptyCardsDisplay />
        ) : (
          <CardsCarousel cartoes={cartoesValidos} faturas={faturas} />
        )}
      </div>

      {/* Seção dos Botões - Base */}
      <div className="flex gap-4">
        <Link 
          to="/cartoes"
          className="flex-1 text-center py-3 px-4 rounded-lg font-medium transition-all duration-200"
          style={{
            backgroundColor: '#6243FF',
            border: '1px solid #8C89B4',
            color: '#FFFFFF'
          }}
        >
          Configurar Cartões
        </Link>
        <Link 
          to="/cartoes"
          className="flex-1 text-center py-3 px-4 rounded-lg font-medium transition-all duration-200"
          style={{
            backgroundColor: '#1F202D',
            border: '1px solid #353645',
            color: '#FFFFFF'
          }}
        >
          Configurar Cartões
        </Link>
      </div>
    </div>
  );
}

// Componente para exibir quando não há cartões
function EmptyCardsDisplay() {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#20212A' }}>
        <svg className="w-8 h-8" style={{ color: '#8C89B4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
      <p className="text-white font-medium mb-1">Nenhum cartão encontrado</p>
      <p className="text-sm" style={{ color: '#8C89B4' }}>
        Adicione seu primeiro cartão de crédito
      </p>
    </div>
  );
}

// Componente do carousel dos cartões com efeito de profundidade
function CardsCarousel({ cartoes, faturas }: { cartoes: Cartao[]; faturas: Record<string, number> }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Se há apenas 1 cartão, ele ocupa 100% da largura
  if (cartoes.length === 1) {
    const cartao = cartoes[0];
    const faturaAtual = faturas[cartao.id] || 0;
    return (
      <div className="relative w-full">
        <CreditCardDisplay cartao={cartao} faturaAtual={faturaAtual} isActive={true} isSingle={true} />
      </div>
    );
  }

  // Função para calcular as transformações baseadas no número de cartões
  const calculateTransformations = (totalCards: number, currentIndex: number, cardIndex: number) => {
    // Calcular posição relativa com rotação circular
    let offset = cardIndex - currentIndex;
    
    // Ajustar para rotação circular - sempre escolher o caminho mais curto
    if (offset > totalCards / 2) {
      offset = offset - totalCards;
    } else if (offset < -totalCards / 2) {
      offset = offset + totalCards;
    }
    
    const absOffset = Math.abs(offset);
    
    // Limitar quantos cartões são visíveis (máximo 4 no stack: 1 ativo + 3 atrás)
    const isVisible = absOffset <= 3;
    
    if (!isVisible) return null;
    
    // Calcular escala do cartão principal baseado no número total de cartões
    let mainCardScale = 1;
    if (totalCards === 2) {
      mainCardScale = 0.95; // 95% para 2 cartões
    } else if (totalCards === 3) {
      mainCardScale = 0.90; // 90% para 3 cartões
    } else if (totalCards >= 4) {
      mainCardScale = 0.85; // 85% para 4+ cartões
    }
    
    // Configurações para o cartão ativo (principal)
    if (offset === 0) {
      return {
        translateX: 0,
        translateY: 0,
        scale: mainCardScale,
        zIndex: 100,
        opacity: 1,
        width: '100%'
      };
    }
    
    // Configurações para cartões de fundo - todos empilham à direita
    const stackLevel = Math.min(absOffset, 3); // Máximo 3 níveis de stack
    
    // Todos os cartões não-ativos vão para a direita, empilhados em ordem
    const baseTranslateX = 40; // Deslocamento base ainda maior
    
    // Determinar a posição no stack baseado na ordem circular
    let stackPosition;
    if (offset > 0) {
      // Cartões que vêm depois na sequência
      stackPosition = offset;
    } else {
      // Cartões que vêm antes na sequência - vão para o final do stack
      stackPosition = totalCards + offset;
    }
    
    // Limitar a posição no stack para máximo 3 níveis visíveis
    stackPosition = Math.min(stackPosition, 3);
    
    // Aumentar ainda mais o deslocamento progressivo para maior visibilidade
    const translateX = baseTranslateX + (stackPosition - 1) * 30;
    
    // Deslocamento vertical sutil para profundidade
    const translateY = stackPosition * 5;
    
    // Escala decrescente para cartões de fundo
    const backgroundScale = mainCardScale - (stackPosition * 0.05); // 5% de redução por nível
    
    // Opacidade total para todos os cartões - sem transparência
    const opacity = 1; // 100% de opacidade para todos
    
    // Z-index decrescente
    const zIndex = 100 - stackPosition;
    
    return {
      translateX,
      translateY,
      scale: backgroundScale,
      zIndex,
      opacity,
      width: '100%'
    };
  };

      return (
      <div className="relative w-full" style={{ height: 'auto', minHeight: '250px' }}>
        {/* Container dos cartões com efeito de empilhamento */}
        <div className="relative w-full" style={{ height: 'auto', minHeight: '200px', overflow: 'visible' }}>
          {cartoes.map((cartao, index) => {
            const faturaAtual = faturas[cartao.id] || 0;
            const isActive = index === currentIndex;
            
            const transformations = calculateTransformations(cartoes.length, currentIndex, index);
            
            if (!transformations) return null;
            
            return (
              <div
                key={cartao.id}
                className="absolute top-0 transition-all duration-300 ease-out cursor-pointer"
                style={{
                  left: 0,
                  width: transformations.width,
                  transform: `translateX(${transformations.translateX}px) translateY(${transformations.translateY}px) scale(${transformations.scale})`,
                  zIndex: transformations.zIndex,
                  opacity: transformations.opacity,
                  transformOrigin: 'left center', // Alinha à esquerda
                }}
                onClick={() => setCurrentIndex(index)}
              >
                <CreditCardDisplay 
                  cartao={cartao} 
                  faturaAtual={faturaAtual} 
                  isActive={isActive}
                  isSingle={false}
                />
              </div>
            );
          })}
        </div>

        {/* Indicadores de posição (bolinhas) */}
        {cartoes.length > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {cartoes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="w-2 h-2 rounded-full transition-all duration-200 hover:scale-110"
                style={{
                  backgroundColor: index === currentIndex ? '#6243FF' : '#20212A',
                  border: index === currentIndex ? '1px solid #8C89B4' : '1px solid transparent'
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
}

// Componente individual do cartão
function CreditCardDisplay({ 
  cartao, 
  faturaAtual, 
  isActive,
  isSingle
}: { 
  cartao: Cartao; 
  faturaAtual: number; 
  isActive: boolean;
  isSingle: boolean;
}) {
  const limiteDisponivel = cartao.limite - faturaAtual;
  const percentualUtilizado = (faturaAtual / cartao.limite) * 100;

  return (
    <div 
      className="text-white relative overflow-hidden transition-all duration-300 w-full"
      style={{
        background: `linear-gradient(135deg, ${cartao.cor}, ${cartao.cor}ff)`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        borderRadius: '16px',
        aspectRatio: '1.586 / 1', // Mantém proporção de cartão
        border: 'none'
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
      <div className="relative z-10 p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-sm font-bold truncate flex-1">{cartao.nome}</h3>
          <div className="text-right text-xs ml-2">
            <div className="opacity-80">Venc</div>
            <div className="font-semibold">Dia {cartao.vencimento}</div>
          </div>
        </div>
        
        {/* Valores */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <div className="text-xs opacity-90 mb-1">Fatura atual</div>
              <div className="font-bold text-sm">{formatCurrency(faturaAtual)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-90 mb-1">Disponível</div>
              <div className="font-semibold text-sm">{formatCurrency(limiteDisponivel)}</div>
            </div>
          </div>
        </div>
        
        {/* Barra de progresso */}
        <div className="mt-auto">
          <div className="flex justify-between text-xs mb-1">
            <span className="opacity-90">Utilizado</span>
            <span>{percentualUtilizado.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-1.5">
            <div 
              className="bg-white rounded-full h-1.5 transition-all duration-500"
              style={{ width: `${Math.min(percentualUtilizado, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente CreditCardCarousel original (mantido para compatibilidade)
export function CreditCardCarousel({ cartoes, faturas, className = '' }: CreditCardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cartoesValidos = Array.isArray(cartoes) ? cartoes.filter(cartao => cartao && cartao.id) : [];

  if (!cartoesValidos || cartoesValidos.length === 0) {
    return <EmptyCardsDisplay />;
  }

  if (cartoesValidos.length === 1) {
    const cartao = cartoesValidos[0];
    const faturaAtual = faturas[cartao.id] || 0;
    return (
      <div className={className}>
        <CreditCardDisplay cartao={cartao} faturaAtual={faturaAtual} isActive={true} isSingle={true} />
      </div>
    );
  }

  return (
    <div className={className}>
      <CardsCarousel cartoes={cartoesValidos} faturas={faturas} />
    </div>
  );
} 