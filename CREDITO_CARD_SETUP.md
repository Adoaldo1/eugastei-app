# 🛠️ Configuração do Sistema de Cartões de Crédito

Este documento explica como configurar e usar o novo sistema de cartões de crédito no dashboard.

## 📋 Estrutura Implementada

### 1. Banco de Dados
- **Tabela `cartoes`**: Armazena informações dos cartões
- **Coluna `cartao_id`**: Adicionada à tabela `transactions` para vincular transações aos cartões

### 2. Serviços Criados
- `app/services/cartoes.ts`: Gerenciamento completo de cartões
- Funções para buscar, criar, atualizar e deletar cartões
- Cálculo automático de fatura atual

### 3. Componentes
- `app/components/CreditCard.tsx`: Cartão visual com gradiente
- Integração na dashboard principal (card de saldo)
- Página dedicada `/cartoes` para gerenciamento

## 🚀 Como Configurar

### Passo 1: Executar SQL
Execute o arquivo `supabase_cartoes_table.sql` no seu Supabase:

```sql
-- Criar tabela de cartões de crédito
CREATE TABLE IF NOT EXISTS cartoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  nome TEXT NOT NULL,
  limite DECIMAL(10,2) NOT NULL DEFAULT 0,
  vencimento INTEGER NOT NULL CHECK (vencimento >= 1 AND vencimento <= 31),
  cor TEXT DEFAULT '#007AFF',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Passo 2: Criar Cartão de Exemplo
Execute este SQL para criar um cartão fictício:

```sql
-- Substitua 'SEU_USER_ID' pelo seu UUID de usuário real
INSERT INTO cartoes (user_id, nome, limite, vencimento, cor) 
VALUES ('SEU_USER_ID', 'Nubank', 5000.00, 15, '#8A2BE2');
```

**Como encontrar seu USER_ID:**
1. Vá no Supabase → Authentication → Users
2. Copie o UUID do seu usuário
3. Substitua no SQL acima

### Passo 3: Testar
1. Acesse a dashboard principal
2. Veja o cartão aparecer no card de saldo
3. Clique em "Gerenciar cartões" para ir à página dedicada

## 💡 Funcionalidades

### Dashboard Principal
- **Cartão visual**: Mostra nome, fatura atual, limite disponível
- **Barra de progresso**: Percentual de utilização do limite
- **Vencimento**: Dia do mês configurado
- **Botão**: Link direto para gerenciamento

### Página /cartoes
- Lista todos os cartões do usuário
- Cards visuais com gradiente personalizado
- Botões para editar/excluir (preparados para implementação futura)
- Layout responsivo

### Cálculo de Fatura
- Soma transações de **despesa** vinculadas ao cartão
- Filtro por mês atual
- Atualização automática quando há mudanças

## 🎨 Personalização

### Cores dos Cartões
Você pode personalizar as cores editando o campo `cor` na tabela:
- Nubank: `#8A2BE2` (roxo)
- Bradesco: `#CC092F` (vermelho)
- Itaú: `#EC7000` (laranja)
- Santander: `#EA0029` (vermelho)

### Layout Responsivo
- **Desktop**: Cartão aparece no card de saldo
- **Mobile**: Layout empilhado, mantém funcionalidade
- **Tablet**: Adaptação automática

## 🔧 Próximos Passos

### Funcionalidades Futuras
1. **Formulário de cartão**: Criar/editar cartões pela interface
2. **Vincular transações**: Selecionar cartão ao criar transação
3. **Múltiplos cartões**: Visualização de todos os cartões na dashboard
4. **Histórico de faturas**: Acompanhar faturas anteriores
5. **Alertas**: Notificações quando próximo do limite

### Integração com IA/WhatsApp
A estrutura já permite consultas como:
- "Quanto tenho de fatura no Nubank?"
- "Qual meu limite disponível?"
- "Quando vence meu cartão?"

## 🐛 Troubleshooting

### Cartão não aparece
1. Verifique se executou o SQL corretamente
2. Confirme se o `user_id` está correto
3. Verifique se o cartão está marcado como `ativo = true`

### Fatura zerada
1. Certifique-se que as transações têm `cartao_id` preenchido
2. Verifique se são transações do tipo `despesa`
3. Confirme se as transações estão no mês atual

### Erro de permissão
As políticas RLS foram configuradas automaticamente, mas verifique se:
- O usuário está autenticado
- As políticas estão ativas na tabela `cartoes`

## ✅ Conclusão

O sistema de cartões de crédito está totalmente integrado e funcional. Execute o SQL, crie um cartão de exemplo e veja a magia acontecer na sua dashboard! 🎉 