-- SQL para criar tabela de histórico de pesquisas no Supabase

-- ============================================
-- Tabela: search_history
-- Descrição: Armazena histórico de pesquisas dos usuários
-- ============================================

CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  search_params JSONB NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índice para melhorar performance de queries
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Criar índice para buscas por user_id e data
CREATE INDEX IF NOT EXISTS idx_search_history_user_created 
  ON search_history(user_id, created_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Habilitar RLS na tabela
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem visualizar apenas seu próprio histórico
CREATE POLICY "Users can view own search history"
  ON search_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir apenas em seu próprio histórico
CREATE POLICY "Users can insert own search history"
  ON search_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar apenas seu próprio histórico
CREATE POLICY "Users can delete own search history"
  ON search_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Comentários nas colunas
-- ============================================

COMMENT ON TABLE search_history IS 'Histórico de pesquisas de empresas realizadas pelos usuários';
COMMENT ON COLUMN search_history.id IS 'Identificador único da pesquisa';
COMMENT ON COLUMN search_history.user_id IS 'ID do usuário que realizou a pesquisa';
COMMENT ON COLUMN search_history.search_params IS 'Parâmetros JSON da pesquisa (filtros aplicados)';
COMMENT ON COLUMN search_history.results_count IS 'Quantidade de resultados retornados';
COMMENT ON COLUMN search_history.created_at IS 'Data e hora da pesquisa';


-- ============================================
-- Query de exemplo para verificar
-- ============================================

-- Verificar se a tabela foi criada corretamente
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'search_history';

-- Verificar políticas RLS
-- SELECT * FROM pg_policies WHERE tablename = 'search_history';
