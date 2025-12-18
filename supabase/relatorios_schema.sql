-- ============================================
-- TABELA: relatorios
-- Sistema de Relatórios Assíncronos
-- ============================================

CREATE TABLE IF NOT EXISTS relatorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informações do relatório
    nome TEXT NOT NULL,
    descricao TEXT,
    
    -- Status e execução
    status TEXT NOT NULL DEFAULT 'processando',
    -- Valores possíveis: 'processando', 'concluido', 'erro'
    
    error_message TEXT,
    
    -- Arquivo
    arquivo_nome TEXT,
    arquivo_url TEXT,
    arquivo_tamanho BIGINT, -- em bytes
    
    -- Dados da busca
    parametros_busca JSONB NOT NULL,
    total_registros INTEGER,
    
    -- Metadados
    processado_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint de validação
    CONSTRAINT valid_status CHECK (status IN ('processando', 'concluido', 'erro'))
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_relatorios_user_id ON relatorios(user_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_status ON relatorios(status);
CREATE INDEX IF NOT EXISTS idx_relatorios_created_at ON relatorios(created_at DESC);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE relatorios ENABLE ROW LEVEL SECURITY;

-- Usuários só veem seus próprios relatórios
CREATE POLICY "Users can view own reports"
    ON relatorios FOR SELECT
    USING (auth.uid() = user_id);

-- Usuários podem criar relatórios
CREATE POLICY "Users can create reports"
    ON relatorios FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar seus próprios relatórios
CREATE POLICY "Users can delete own reports"
    ON relatorios FOR DELETE
    USING (auth.uid() = user_id);

-- n8n pode atualizar qualquer relatório (via service_role key)
CREATE POLICY "Service can update reports"
    ON relatorios FOR UPDATE
    USING (true);

-- ============================================
-- FUNCTION: Atualizar updated_at automaticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_relatorios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_relatorios_updated_at
    BEFORE UPDATE ON relatorios
    FOR EACH ROW
    EXECUTE FUNCTION update_relatorios_updated_at();

-- ============================================
-- COMENTÁRIOS (Documentação)
-- ============================================

COMMENT ON TABLE relatorios IS 'Armazena metadados de relatórios gerados assincronamente pelo n8n';
COMMENT ON COLUMN relatorios.status IS 'processando, concluido, ou erro';
COMMENT ON COLUMN relatorios.arquivo_url IS 'URL pública do arquivo no Supabase Storage';
COMMENT ON COLUMN relatorios.parametros_busca IS 'JSON com os filtros aplicados na busca';
