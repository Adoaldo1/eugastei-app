-- Verifica se o RLS está ativado na tabela transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Cria a política de RLS para permitir que usuários excluam apenas suas próprias transações
CREATE POLICY "Usuário pode deletar suas transações"
ON public.transactions
FOR DELETE
TO public
USING (auth.uid() = user_id);

-- Nota: Execute este SQL no console SQL do Supabase
-- Ele permite que usuários autenticados excluam apenas suas próprias transações 