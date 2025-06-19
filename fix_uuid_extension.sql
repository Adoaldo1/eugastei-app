-- Habilitar extensão UUID (necessário para uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar se a tabela existe e se a coluna ID tem o default correto
DO $$
BEGIN
    -- Verificar se a tabela cartoes existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cartoes') THEN
        -- Verificar se a coluna id tem o default uuid_generate_v4()
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'cartoes' 
            AND column_name = 'id' 
            AND column_default LIKE '%uuid_generate_v4%'
        ) THEN
            -- Alterar a coluna para ter o default correto
            ALTER TABLE cartoes ALTER COLUMN id SET DEFAULT uuid_generate_v4();
            RAISE NOTICE 'Default UUID adicionado à coluna id da tabela cartoes';
        END IF;
    ELSE
        RAISE NOTICE 'Tabela cartoes não existe, execute o script supabase_cartoes_table.sql primeiro';
    END IF;
END
$$;

-- Verificar se há dados na tabela
SELECT 
    COUNT(*) as total_cartoes,
    COUNT(CASE WHEN id IS NULL THEN 1 END) as cartoes_sem_id
FROM cartoes;

-- Listar estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'cartoes' 
ORDER BY ordinal_position;