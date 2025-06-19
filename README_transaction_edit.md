# Implementação da Funcionalidade de Editar Transações

Este documento descreve as mudanças necessárias para implementar a funcionalidade de edição de transações no projeto EuGastei.

## 1. Supabase (Backend)

Execute o SQL abaixo no console SQL do Supabase para criar uma política de Row Level Security (RLS) que permitirá que os usuários editem apenas suas próprias transações:

```sql
-- Certifique-se que o RLS está ativado na tabela transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários editem apenas suas próprias transações
CREATE POLICY "Usuário pode editar suas transações"
ON public.transactions
FOR UPDATE
TO public
USING (auth.uid() = user_id);
```

O arquivo `sql/transaction_update_policy.sql` contém este código SQL.

## 2. Frontend

As seguintes alterações foram feitas no frontend:

### 2.1 Modificação do Componente TransactionForm

O componente `TransactionForm` (em `app/components/TransactionForm.tsx`) foi atualizado para:

1. Aceitar uma transação existente como propriedade (prop) para edição
2. Preencher o formulário com os dados da transação quando estiver no modo de edição
3. Usar o método `transactionsService.update()` quando estiver editando uma transação existente
4. Alterar o título e texto do botão de envio conforme o modo (criar/editar)

### 2.2 Atualização do Componente TransactionsTable

O componente `TransactionsTable` (em `app/components/TransactionsTable.tsx`) foi atualizado para incluir:

1. Um botão "Editar" para cada transação
2. Uma propriedade `onEdit` que é chamada quando o usuário clica no botão de edição
3. Um callback para passar a transação selecionada para o componente pai

### 2.3 Atualização da Página de Transações

O arquivo `app/routes/transactions.tsx` foi atualizado para:

1. Gerenciar o estado da transação selecionada para edição
2. Controlar o modo do formulário (criar/editar)
3. Abrir o modal com os dados preenchidos quando o usuário clica em "Editar"

### 2.4 Atualização da Página Inicial

O arquivo `app/routes/home.tsx` foi atualizado similarmente para permitir a edição de transações diretamente da página inicial.

## Como Testar

1. Execute o SQL no console do Supabase
2. Inicie o aplicativo localmente
3. Faça login e navegue até a página inicial ou de transações
4. Clique no botão "Editar" ao lado de uma transação
5. Modifique os dados no formulário e clique em "Atualizar transação"
6. Verifique se a transação foi atualizada na lista e se o dashboard foi atualizado

## Verificação do Serviço de Transações

O arquivo `app/services/transactions.ts` já contém o método `update` que implementa a funcionalidade de edição:

```typescript
update: async (id: string, transaction: Partial<CreateTransactionData>) => {
  const user = await supabase.auth.getUser();
  
  if (!user.data.user) {
    console.error('No authenticated user found');
    return { data: null, error: new Error('No authenticated user found') };
  }
  
  // Mapear apenas os campos que foram fornecidos
  const updateData: Record<string, any> = {};
  
  if (transaction.name !== undefined) updateData.nome = transaction.name;
  if (transaction.type !== undefined) updateData.tipo = mapTypeToDb(transaction.type);
  if (transaction.category !== undefined) updateData.categoria = transaction.category;
  if (transaction.category_id !== undefined) updateData.categoria_id = transaction.category_id;
  if (transaction.category_color !== undefined) updateData.categoria_cor = transaction.category_color;
  if (transaction.method !== undefined) updateData.metodo_pagamento = transaction.method;
  if (transaction.date !== undefined) updateData.data = transaction.date;
  
  if (transaction.amount !== undefined) {
    updateData.valor = typeof transaction.amount === 'string'
      ? parseFloat(transaction.amount.replace('R$', '').replace('.', '').replace(',', '.'))
      : transaction.amount;
  }
  
  const { data, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.data.user.id)
    .select();
    
  const mappedData = data?.[0] ? mapFromDbFormat(data[0]) : null;
    
  return { data: mappedData as Transaction, error };
}
``` 