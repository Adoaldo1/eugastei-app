# Layout de Profundidade Lateral - Modal de Cartão

## 🎯 Objetivo Alcançado
Implementado novo layout visual com cartão principal centralizado e dois cartões de fundo laterais, criando um efeito de profundidade sofisticado e moderno.

## 🎨 Novo Design Implementado

### 1. Layout de Profundidade Lateral
```
    ┌─────────┐
    │ Cartão  │    ┌─────────────┐    ┌─────────┐
    │ Esquerdo│    │   CARTÃO    │    │ Cartão  │
    │ (Fundo) │    │  PRINCIPAL  │    │ Direito │
    └─────────┘    │ (Destaque)  │    │ (Fundo) │
                   └─────────────┘    └─────────┘
```

### 2. Especificações dos Cartões de Fundo

#### Cartão Esquerdo
```tsx
<div 
  className="absolute bg-[#111214] opacity-80 rounded-2xl shadow-lg transform translate-x-[-24px]"
  style={{ zIndex: 1 }}
/>
```

#### Cartão Direito
```tsx
<div 
  className="absolute bg-[#111214] opacity-80 rounded-2xl shadow-lg transform translate-x-[24px]"
  style={{ zIndex: 2 }}
/>
```

**Características**:
- **Cor**: `#111214` (dark mode)
- **Opacidade**: 80%
- **Deslocamento**: ±24px horizontalmente
- **Sombra**: `shadow-lg`
- **Border-radius**: `rounded-2xl`

### 3. Cartão Principal Aprimorado

#### Dimensões Aumentadas
- **Desktop**: 440px × 260px
- **Responsivo**: `min(440px, 85vw)` × `min(260px, 50vw)`
- **Mínimo**: 320px × 190px
- **Máximo**: 440px × 260px

#### Estilo Refinado
```tsx
<div 
  className="relative rounded-2xl p-6 sm:p-8 text-white overflow-hidden transition-all duration-300 shadow-2xl"
  style={{
    background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}dd)`,
    zIndex: 3
  }}
/>
```

**Melhorias**:
- **Padding**: `p-6 sm:p-8` (24px → 32px)
- **Border-radius**: `rounded-2xl` (16px)
- **Sombra**: `shadow-2xl` (mais intensa)
- **Z-index**: 3 (sempre no topo)

### 4. Tipografia Aprimorada

#### Tamanhos Aumentados
```tsx
// Nome do cartão
<h3 className="text-lg sm:text-xl font-bold">
  
// Limite
<p className="text-lg sm:text-xl font-bold">
  
// Labels
<p className="text-sm opacity-80 mb-2">
  
// Vencimento
<p className="text-base font-semibold">
```

#### Espaçamento Melhorado
- **Badge**: `px-3 py-1.5` (mais padding)
- **Margem labels**: `mb-2` (8px)
- **Margem lateral**: `ml-4` (16px)
- **Max-width nome**: 65% (mais espaço)

### 5. Centralização e Alinhamento

#### Container Principal
```tsx
<div className="flex justify-center items-center flex-col mb-8">
  <div className="relative flex justify-center items-center">
    {/* Cartões */}
  </div>
</div>
```

**Características**:
- **Flex direction**: Column para empilhar elementos
- **Justify-center**: Centralização horizontal
- **Items-center**: Centralização vertical
- **Relative positioning**: Para cartões de fundo

## 🎭 Resultado Visual

### Layout Completo
```
┌─────────────────────────────────────────────────────────┐
│                    MODAL DE CARTÃO                     │
│                                                         │
│    ┌─────┐         ┌─────────────────┐         ┌─────┐ │
│    │     │         │ Nome do Cartão  │         │     │ │
│    │ BG  │         │            Ativo│         │ BG  │ │
│    │ L   │         │                 │         │ R   │ │
│    │     │         │ Limite    Venc. │         │     │ │
│    └─────┘         │ R$ 5.000   Dia15│         └─────┘ │
│                    └─────────────────┘                 │
│                                                         │
│    [Nome do cartão]                                     │
│    [Limite (R$)]                                        │
│    [Vencimento]                                         │
│    [Seleção de cores]                                   │
│                                                         │
│    [Cancelar]  [Salvar]                                 │
└─────────────────────────────────────────────────────────┘
```

### Efeito de Profundidade
```
Vista lateral:
     ┌─┐
   ┌─┤ │ ← Cartão direito (zIndex: 2)
 ┌─┤ │ │ ← Cartão principal (zIndex: 3)
 │ └─┤ │ ← Cartão esquerdo (zIndex: 1)
 └───┘ │
   └───┘
```

## 🔧 Especificações Técnicas

### Dimensões Responsivas
```css
/* Desktop */
width: min(440px, 85vw)
height: min(260px, 50vw)

/* Limites */
max-width: 440px
max-height: 260px
min-width: 320px
min-height: 190px
```

### Z-Index Hierarchy
1. **Cartão esquerdo**: zIndex 1
2. **Cartão direito**: zIndex 2  
3. **Cartão principal**: zIndex 3

### Transformações
- **Esquerdo**: `translate-x-[-24px]`
- **Direito**: `translate-x-[24px]`
- **Principal**: Sem transformação (centralizado)

### Cores e Opacidades
- **Fundo**: `#111214` (dark mode)
- **Opacidade**: 80%
- **Principal**: Cor dinâmica do usuário
- **Gradiente**: 135deg com alpha dd

## ✨ Funcionalidades Mantidas

### Atualização em Tempo Real
- **Nome**: Atualiza conforme digitação
- **Limite**: Formatação automática como moeda
- **Vencimento**: Mostra "Dia X" ou "Dia --"
- **Cor**: Mudança instantânea do gradiente
- **Responsividade**: Adaptação automática

### Seleção de Cores
- **8 cores**: Pré-definidas + customizada
- **Quadrados**: 32×32px com rings
- **Gradiente**: Para cor customizada
- **Feedback**: Visual imediato

### Validação e Estados
- **Loading**: Durante salvamento
- **Erro**: Mensagens claras
- **Sucesso**: Feedback visual
- **Reset**: Limpeza automática

## 🚀 Como Testar

### 1. Visualização do Layout
1. Navegue para `/cartoes`
2. Clique em "Adicionar cartão"
3. Observe os 3 cartões: esquerdo, principal, direito
4. Note o efeito de profundidade lateral

### 2. Responsividade
1. Redimensione a janela
2. Veja cartões se adaptarem mantendo proporção
3. Teste em mobile: layout compacto
4. Verifique tipografia responsiva

### 3. Interações
1. Digite nome → Veja no cartão principal
2. Insira limite → Formatação automática
3. Defina vencimento → Atualização imediata
4. Mude cores → Gradiente dinâmico

### 4. Profundidade Visual
1. Observe cartões de fundo escuros
2. Note deslocamento lateral (±24px)
3. Veja sombras e opacidades
4. Confirme z-index correto

## 📁 Arquivos Modificados
- `app/routes/cartoes.tsx` - Layout de profundidade implementado
- `README_cartao_layout_profundidade.md` - Esta documentação

## 🎨 Resultado Final
- **✅ Profundidade lateral**: Cartões de fundo esquerdo/direito
- **✅ Cartão principal**: Centralizado e em destaque
- **✅ Dimensões maiores**: 440×260px mais realista
- **✅ Tipografia aprimorada**: Tamanhos e espaçamentos melhores
- **✅ Responsividade**: Adaptação perfeita a todas as telas
- **✅ Estética moderna**: Alinhado com design da plataforma
- **✅ Efeito sofisticado**: Visual profissional e elegante

O modal agora apresenta um layout extremamente sofisticado com efeito de profundidade lateral, onde o cartão principal se destaca centralizado com dois cartões escuros ao fundo, criando uma experiência visual moderna e profissional! 🎉 