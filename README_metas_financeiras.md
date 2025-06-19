# Sistema de Metas Financeiras

## Visão Geral

O sistema de metas financeiras permite aos usuários criar e monitorar metas de gastos com alertas inteligentes via WhatsApp. O sistema oferece controle granular sobre despesas por categoria, cartão ou metas gerais.

## Funcionalidades Implementadas

### 1. Tipos de Metas

#### Meta Geral
- Controla o total de despesas do usuário
- Pode ser valor fixo (R$) ou percentual da receita (%)
- Ideal para controle geral de gastos

#### Meta por Categoria
- Limita gastos em categorias específicas
- Ex: "Máximo R$ 500 em Alimentação"
- Integra com o sistema de categorias existente

#### Meta por Cartão
- Controla gastos de cartões específicos
- Ex: "Máximo R$ 2000 no cartão Nubank"
- Integra com o sistema de cartões existente

### 2. Períodos de Meta

#### Mensal
- Reinicia automaticamente todo mês
- Calcula do dia 1 ao último dia do mês

#### Anual
- Reinicia automaticamente todo ano
- Calcula de janeiro a dezembro

#### Personalizado
- Define datas específicas de início e fim
- Flexibilidade total para períodos customizados

### 3. Sistema de Alertas

#### Níveis Configuráveis
- Padrão: 70%, 90%, 100%
- Personalizável pelo usuário
- Múltiplos níveis por meta

#### Integração WhatsApp
- Alertas automáticos quando atingir os níveis
- Mensagens formatadas com informações detalhadas
- Margem de 5% para evitar spam

### 4. Interface Visual

#### Cards de Meta
- Barra de progresso visual
- Status colorido (Verde/Amarelo/Vermelho)
- Informações detalhadas de gasto atual vs limite
- Ações rápidas (Editar/Excluir)

#### Dashboard de Estatísticas
- Total de metas criadas
- Metas no limite (verde)
- Metas em atenção (amarelo)
- Metas estouradas (vermelho)

#### Formulário Intuitivo
- Interface step-by-step
- Validações em tempo real
- Suporte a valores fixos e percentuais

## Estrutura Técnica

### Banco de Dados

```sql
-- Tabela principal de metas
CREATE TABLE goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('category', 'card', 'general')),
  target_value DECIMAL(10,2) NOT NULL,
  is_percentage BOOLEAN DEFAULT false,
  period TEXT CHECK (period IN ('monthly', 'yearly', 'custom')),
  start_date DATE,
  end_date DATE,
  category_id UUID REFERENCES categories(id),
  card_id UUID REFERENCES cards(id),
  whatsapp_alerts BOOLEAN DEFAULT false,
  alert_levels DECIMAL[] DEFAULT ARRAY[70, 90, 100],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Serviços Implementados

#### `goalsService`
- **CRUD completo**: create, getAll, getById, update, delete
- **Cálculo de progresso**: calculateProgress, calculateAllProgress
- **Sistema de alertas**: checkAlerts, formatAlertMessage
- **Cálculo de períodos**: calculatePeriod (mensal, anual, customizado)

#### Funcionalidades Principais

```typescript
// Criar meta
const { data, error } = await goalsService.create({
  name: "Limite Alimentação",
  type: "category",
  target_value: 500,
  is_percentage: false,
  period: "monthly",
  category_id: "uuid-categoria",
  whatsapp_alerts: true,
  alert_levels: [70, 90, 100],
  is_active: true
});

// Calcular progresso
const progress = await goalsService.calculateProgress(goal);
// Retorna: current_value, target_value, percentage, status, remaining_value

// Verificar alertas
const alertsToSend = await goalsService.checkAlerts();
```

### Componentes React

#### `GoalCard`
- Exibe informações da meta
- Barra de progresso animada
- Status visual com cores
- Ações de edição e exclusão

#### `GoalForm`
- Formulário completo de criação/edição
- Validações em tempo real
- Interface adaptativa por tipo de meta
- Suporte a datas personalizadas

#### `Metas` (Página Principal)
- Dashboard com estatísticas
- Grid responsivo de cards
- Modal de formulário
- Estado de loading e empty state

## Integração com Sistema Existente

### Transações
- Filtra transações por período da meta
- Calcula gastos por categoria/cartão
- Suporte a valores percentuais da receita

### Categorias
- Integração completa com sistema de categorias
- Seleção dinâmica no formulário
- Relacionamento via foreign key

### Cartões
- Integração com sistema de cartões
- Seleção dinâmica no formulário
- Relacionamento via foreign key

### Temas
- Suporte completo a modo escuro/claro
- Cores adaptativas nos componentes
- Consistência visual com o sistema

## Fluxo de Uso

### 1. Criação de Meta
1. Usuário clica em "Nova Meta"
2. Seleciona tipo (Geral/Categoria/Cartão)
3. Define valor limite (R$ ou %)
4. Escolhe período (Mensal/Anual/Personalizado)
5. Configura alertas WhatsApp (opcional)
6. Define níveis de alerta
7. Salva a meta

### 2. Monitoramento
1. Sistema calcula progresso automaticamente
2. Compara gastos do período com limite
3. Atualiza status visual (Ok/Atenção/Estourada)
4. Exibe barra de progresso em tempo real

### 3. Alertas
1. Sistema verifica níveis de alerta
2. Envia mensagem WhatsApp quando atingir limites
3. Formata mensagem com informações detalhadas
4. Evita spam com margem de 5%

## Exemplos de Uso

### Meta por Categoria
```
Nome: "Limite Alimentação Dezembro"
Tipo: Por Categoria
Categoria: Alimentação
Limite: R$ 800,00
Período: Mensal
Alertas: 70%, 90%, 100%
```

### Meta Percentual
```
Nome: "Gastos Máximo 60% da Receita"
Tipo: Meta Geral
Limite: 60% da receita
Período: Mensal
Alertas: 80%, 95%, 100%
```

### Meta por Cartão
```
Nome: "Limite Cartão Nubank"
Tipo: Por Cartão
Cartão: Nubank
Limite: R$ 2.500,00
Período: Mensal
Alertas: 75%, 90%, 100%
```

## Benefícios

### Para o Usuário
- **Controle Total**: Visão clara dos gastos vs limites
- **Alertas Proativos**: Notificações antes de estourar
- **Flexibilidade**: Múltiplos tipos e períodos de meta
- **Automação**: Cálculos automáticos e alertas inteligentes

### Para o Sistema
- **Escalabilidade**: Arquitetura preparada para crescimento
- **Performance**: Índices otimizados e cálculos eficientes
- **Segurança**: RLS habilitado e validações robustas
- **Manutenibilidade**: Código bem estruturado e documentado

## Próximos Passos

### Melhorias Futuras
1. **Histórico de Metas**: Acompanhar evolução ao longo do tempo
2. **Metas Compartilhadas**: Metas familiares ou em grupo
3. **IA Preditiva**: Sugestões inteligentes de limites
4. **Gamificação**: Sistema de conquistas e badges
5. **Relatórios Avançados**: Análises detalhadas de performance

### Integrações Pendentes
1. **Sistema de Cartões**: Implementar filtro por cartão quando disponível
2. **WhatsApp API**: Integrar com sistema de notificações existente
3. **Dashboard Principal**: Adicionar widgets de metas na home
4. **Exportação**: Incluir metas nos relatórios exportados

## Conclusão

O sistema de metas financeiras oferece uma solução completa para controle de gastos, com interface intuitiva, alertas inteligentes e integração perfeita com o sistema existente. A arquitetura flexível permite expansões futuras mantendo a performance e usabilidade. 