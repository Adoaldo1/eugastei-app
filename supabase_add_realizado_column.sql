-- Adicionar coluna 'realizado' à tabela transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS realizado BOOLEAN DEFAULT true;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_realizado 
ON transactions(realizado);

-- Comentário explicando a coluna
COMMENT ON COLUMN transactions.realizado IS 'Indica se a transação já foi realizada (true) ou está pendente (false). Usado para separar transações atuais de "a receber" e "a pagar"'; 