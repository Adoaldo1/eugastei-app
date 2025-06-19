# Implementação de Transações A Receber e A Pagar

## Objetivo
Implementar funcionalidade para exibir valores "A receber" e "A pagar" na dashboard, permitindo ao usuário distinguir entre transações já realizadas e transações futuras/pendentes.

## Mudanças Implementadas

### 1. Banco de Dados
- **Arquivo**: `supabase_add_realizado_column.sql`
- **Mudança**: Adicionada coluna `realizado` (BOOLEAN) na tabela `transactions`
- **Padrão**: `true` (transações existentes são consideradas realizadas por padrão)
- **Índice**: Criado índice para melhor performance nas consultas

### 2. Modelo de Dados
- **Arquivo**: `app/services/transactions.ts`
- **Mudanças**:
  - Adicionado campo `realizado?: boolean` ao tipo `Transaction`
  - Atualizado `mapToDbFormat()` para incluir campo `realizado`
  - Atualizado `mapFromDbFormat()` para mapear campo `realizado` do banco
  - Atualizado função `update()` para permitir atualização do campo `realizado`

### 3. Contexto do Dashboard
- **Arquivo**: `app/context/DashboardContext.tsx`
- **Mudanças**:
  - Adicionados campos `aReceber` e `aPagar` ao tipo `DashboardData.summary`
  - Atualizada lógica de cálculo para separar transações realizadas das pendentes
  - Filtro no gráfico de linha para considerar apenas transações realizadas
  - Cálculo separado:
    - **Entradas realizadas**: `tipo === 'entrada' && realizado === true`
    - **Saídas realizadas**: `tipo === 'saida' && realizado === true`
    - **A receber**: `tipo === 'entrada' && realizado === false`
    - **A pagar**: `tipo === 'saida' && realizado === false`

### 4. Componente SummaryCard
- **Arquivo**: `app/components/SummaryCard.tsx`
- **Mudanças**:
  - Adicionado prop `additionalInfo` para exibir informações extras
  - Exibição de "A receber" e "A pagar" abaixo dos valores principais
  - Cores diferenciadas:
    - **A receber**: Azul (`#007AFF`)
    - **A pagar**: Vermelho (`#CC4B4B`)

### 5. Formulário de Transações
- **Arquivo**: `app/components/TransactionForm.tsx`
- **Mudanças**:
  - Adicionado estado `realizado` com valor padrão `true`
  - Adicionado checkbox "Já foi realizado?" no formulário
  - Campo `realizado` incluído nos dados enviados ao salvar transação
  - Inicialização baseada na transação sendo editada (se aplicável)

### 6. Dashboard Principal
- **Arquivo**: `app/routes/home.tsx`
- **Mudanças**:
  - Cards de "Entradas" e "Saídas" agora exibem informações adicionais
  - **Card Entradas**: Mostra "A receber" em azul
  - **Card Saídas**: Mostra "A pagar" em vermelho
  - Valores são exibidos apenas quando > 0

## Comportamento

### Transações Realizadas (realizado = true)
- Contam para o cálculo do saldo atual
- Aparecem nos gráficos de linha
- São consideradas nos totais de "Entradas" e "Saídas"

### Transações Pendentes (realizado = false)
- **NÃO** contam para o saldo atual
- **NÃO** aparecem nos gráficos de linha
- Aparecem como "A receber" ou "A pagar" nos cards

### Interface do Usuário
- **Checkbox padrão**: "Já foi realizado?" (marcado por padrão)
- **Desmarcado**: Transação fica como pendente (a receber/pagar)
- **Marcado**: Transação é considerada realizada

### Compatibilidade
- Transações existentes no banco são consideradas realizadas (`realizado = true`)
- Código é compatível com transações que não possuem o campo `realizado`

## Arquivos SQL a Executar
```sql
-- Executar no Supabase
-- Arquivo: supabase_add_realizado_column.sql
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS realizado BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_transactions_realizado 
ON transactions(realizado);
```

## Resultado Final
- Dashboard mostra claramente valores realizados vs pendentes
- Usuário pode cadastrar transações futuras
- Saldo atual considera apenas transações realizadas
- Visibilidade completa do fluxo de caixa (atual e futuro) 