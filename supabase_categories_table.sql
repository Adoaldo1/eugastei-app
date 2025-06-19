-- Create the categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  cor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- SELECT policy: Users can only view their own categories
CREATE POLICY "Users can view their own categories" 
  ON categories 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- INSERT policy: Users can only insert categories for themselves
CREATE POLICY "Users can insert their own categories" 
  ON categories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: Users can only update their own categories
CREATE POLICY "Users can update their own categories" 
  ON categories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- DELETE policy: Users can only delete their own categories
CREATE POLICY "Users can delete their own categories" 
  ON categories 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create an index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Create initial default categories (optional)
-- Uncomment and modify if you want to add default categories for all users
/*
INSERT INTO categories (user_id, nome, tipo, cor) VALUES
  (auth.uid(), 'Salário', 'receita', '#1DB954'),
  (auth.uid(), 'Freelance', 'receita', '#4C6EF5'),
  (auth.uid(), 'Alimentação', 'despesa', '#FF4D4F'),
  (auth.uid(), 'Transporte', 'despesa', '#FF9F1C'),
  (auth.uid(), 'Moradia', 'despesa', '#8E44AD'),
  (auth.uid(), 'Saúde', 'despesa', '#3498DB');
*/ 