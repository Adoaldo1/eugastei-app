-- Criar tabela de metas financeiras
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('category', 'card', 'general')),
  target_value DECIMAL(10,2) NOT NULL CHECK (target_value > 0),
  is_percentage BOOLEAN NOT NULL DEFAULT false,
  period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly', 'custom')),
  start_date DATE,
  end_date DATE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  whatsapp_alerts BOOLEAN NOT NULL DEFAULT false,
  alert_levels DECIMAL[] NOT NULL DEFAULT ARRAY[70, 90, 100],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(type);
CREATE INDEX IF NOT EXISTS idx_goals_category_id ON goals(category_id);
CREATE INDEX IF NOT EXISTS idx_goals_card_id ON goals(card_id);
CREATE INDEX IF NOT EXISTS idx_goals_is_active ON goals(is_active);
CREATE INDEX IF NOT EXISTS idx_goals_period ON goals(period);

-- Habilitar RLS (Row Level Security)
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas suas próprias metas
CREATE POLICY "Users can view their own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários criem suas próprias metas
CREATE POLICY "Users can create their own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem suas próprias metas
CREATE POLICY "Users can update their own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que usuários excluam suas próprias metas
CREATE POLICY "Users can delete their own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_goals_updated_at_trigger
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_goals_updated_at();

-- Adicionar constraints de validação
ALTER TABLE goals ADD CONSTRAINT check_custom_period_dates 
  CHECK (
    (period != 'custom') OR 
    (period = 'custom' AND start_date IS NOT NULL AND end_date IS NOT NULL AND start_date <= end_date)
  );

ALTER TABLE goals ADD CONSTRAINT check_category_type 
  CHECK (
    (type != 'category') OR 
    (type = 'category' AND category_id IS NOT NULL)
  );

ALTER TABLE goals ADD CONSTRAINT check_card_type 
  CHECK (
    (type != 'card') OR 
    (type = 'card' AND card_id IS NOT NULL)
  );

-- Comentários para documentação
COMMENT ON TABLE goals IS 'Tabela para armazenar metas financeiras dos usuários';
COMMENT ON COLUMN goals.id IS 'Identificador único da meta';
COMMENT ON COLUMN goals.user_id IS 'ID do usuário proprietário da meta';
COMMENT ON COLUMN goals.name IS 'Nome descritivo da meta';
COMMENT ON COLUMN goals.type IS 'Tipo da meta: category, card ou general';
COMMENT ON COLUMN goals.target_value IS 'Valor limite da meta (em reais ou percentual)';
COMMENT ON COLUMN goals.is_percentage IS 'Se true, target_value é percentual da receita';
COMMENT ON COLUMN goals.period IS 'Período da meta: monthly, yearly ou custom';
COMMENT ON COLUMN goals.start_date IS 'Data inicial (apenas para período custom)';
COMMENT ON COLUMN goals.end_date IS 'Data final (apenas para período custom)';
COMMENT ON COLUMN goals.category_id IS 'ID da categoria (apenas para tipo category)';
COMMENT ON COLUMN goals.card_id IS 'ID do cartão (apenas para tipo card)';
COMMENT ON COLUMN goals.whatsapp_alerts IS 'Se deve enviar alertas via WhatsApp';
COMMENT ON COLUMN goals.alert_levels IS 'Níveis de alerta em percentual (ex: [70, 90, 100])';
COMMENT ON COLUMN goals.is_active IS 'Se a meta está ativa';
COMMENT ON COLUMN goals.created_at IS 'Data de criação da meta';
COMMENT ON COLUMN goals.updated_at IS 'Data da última atualização da meta'; 