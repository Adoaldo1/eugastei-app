-- Verifica se o RLS está ativado na tabela categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Cria a política de RLS para permitir que usuários excluam apenas suas próprias categorias
CREATE POLICY "Usuário pode deletar suas categorias"
ON public.categories
FOR DELETE
TO public
USING (auth.uid() = user_id);

-- Nota: Execute este SQL no console SQL do Supabase
-- Ele permite que usuários autenticados excluam apenas suas próprias categorias 