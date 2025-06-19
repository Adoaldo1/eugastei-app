-- Script para inserir um cartão de crédito de exemplo
-- ⚠️ IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo seu UUID real de usuário

-- Para encontrar seu USER_ID:
-- 1. Vá no Supabase Dashboard
-- 2. Authentication → Users
-- 3. Copie o UUID do seu usuário
-- 4. Substitua abaixo

-- Exemplo de cartão Nubank
INSERT INTO cartoes (user_id, nome, limite, vencimento, cor, ativo) 
VALUES ('SEU_USER_ID_AQUI', 'Nubank', 5000.00, 15, '#8A2BE2', true);

-- OU use este comando para pegar automaticamente o usuário logado (se estiver executando via RLS)
-- INSERT INTO cartoes (user_id, nome, limite, vencimento, cor, ativo) 
-- VALUES (auth.uid(), 'Nubank', 5000.00, 15, '#8A2BE2', true);

-- Exemplos adicionais de cartões (descomente se quiser mais cartões):

-- Cartão Bradesco
-- INSERT INTO cartoes (user_id, nome, limite, vencimento, cor, ativo) 
-- VALUES ('SEU_USER_ID_AQUI', 'Bradesco Elo', 3000.00, 10, '#CC092F', true);

-- Cartão Itaú
-- INSERT INTO cartoes (user_id, nome, limite, vencimento, cor, ativo) 
-- VALUES ('SEU_USER_ID_AQUI', 'Itaú Personnalité', 8000.00, 5, '#EC7000', true);

-- Cartão Santander
-- INSERT INTO cartoes (user_id, nome, limite, vencimento, cor, ativo) 
-- VALUES ('SEU_USER_ID_AQUI', 'Santander SX', 4000.00, 20, '#EA0029', true);

-- Verificar se foi inserido corretamente:
-- SELECT * FROM cartoes WHERE user_id = 'SEU_USER_ID_AQUI'; 