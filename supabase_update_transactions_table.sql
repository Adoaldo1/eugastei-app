-- Update the transactions table to include category_id and category_color
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS categoria_id UUID,
ADD COLUMN IF NOT EXISTS categoria_cor TEXT;

-- Add a foreign key constraint to link transactions to categories
ALTER TABLE transactions 
ADD CONSTRAINT fk_categoria 
FOREIGN KEY (categoria_id) 
REFERENCES categories(id)
ON DELETE SET NULL; -- If a category is deleted, keep the transaction but set category_id to NULL

-- Create an index for better performance on category lookups
CREATE INDEX IF NOT EXISTS idx_transactions_categoria_id 
ON transactions(categoria_id);

-- Add RLS policy to ensure users can only see their own transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

-- Create RLS policies for transactions
CREATE POLICY "Users can view own transactions" 
ON transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
ON transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" 
ON transactions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" 
ON transactions FOR DELETE 
USING (auth.uid() = user_id); 