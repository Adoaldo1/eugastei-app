-- Verifica se o RLS está ativado na tabela transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Cria a política de RLS para permitir que usuários atualizem apenas suas próprias transações
CREATE POLICY "Usuário pode editar suas transações"
ON public.transactions
FOR UPDATE
TO public
USING (auth.uid() = user_id);

-- Nota: Execute este SQL no console SQL do Supabase
-- Ele permite que usuários autenticados atualizem apenas suas próprias transações 