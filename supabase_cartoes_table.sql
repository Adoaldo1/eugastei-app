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

-- Adicionar coluna cartao_id à tabela transactions para relacionar transações com cartões
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS cartao_id UUID REFERENCES cartoes(id) ON DELETE SET NULL;

-- Habilitar Row Level Security
ALTER TABLE cartoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para cartões
CREATE POLICY "Users can view own cartoes" 
ON cartoes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cartoes" 
ON cartoes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cartoes" 
ON cartoes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cartoes" 
ON cartoes FOR DELETE 
USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_cartoes_user_id ON cartoes(user_id);
CREATE INDEX IF NOT EXISTS idx_cartoes_ativo ON cartoes(ativo);
CREATE INDEX IF NOT EXISTS idx_transactions_cartao_id ON transactions(cartao_id);

-- Inserir um cartão de exemplo para testes (opcional)
-- UNCOMMENT para inserir dados de exemplo
/*
INSERT INTO cartoes (user_id, nome, limite, vencimento, cor) 
VALUES (auth.uid(), 'Nubank', 5000.00, 15, '#8A2BE2');
*/ 