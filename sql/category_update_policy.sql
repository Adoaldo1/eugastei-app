-- Verifica se o RLS está ativado na tabela categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Cria a política de RLS para permitir que usuários atualizem apenas suas próprias categorias
CREATE POLICY "Usuário pode editar suas categorias"
ON public.categories
FOR UPDATE
TO public
USING (auth.uid() = user_id);

-- Nota: Execute este SQL no console SQL do Supabase
-- Ele permite que usuários autenticados atualizem apenas suas próprias categorias 