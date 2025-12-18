-- Tabelas de Analytics para CNAEs

-- Tabela principal de analytics de seleção de CNAEs
CREATE TABLE IF NOT EXISTS cnae_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cnae_code VARCHAR(10) NOT NULL,
    cnae_description TEXT NOT NULL,
    search_term TEXT NOT NULL,
    position INTEGER, -- Posição na lista de resultados (1-5)
    is_ai_suggested BOOLEAN DEFAULT false,
    has_semantic_match BOOLEAN DEFAULT false,
    confidence DECIMAL(3,2), -- 0.00 a 1.00
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes para queries rápidas
    INDEX idx_cnae_code (cnae_code),
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_search_term (search_term)
);

-- Tabela de buscas realizadas
CREATE TABLE IF NOT EXISTS cnae_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    search_term TEXT NOT NULL,
    results_count INTEGER,
    ai_used BOOLEAN DEFAULT false,
    expanded_terms TEXT, -- Termos expandidos pela semântica
    suggested_cnaes TEXT, -- CNAEs sugeridos
    response_time_ms INTEGER, -- Tempo de resposta em ms
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_search_user (user_id),
    INDEX idx_search_timestamp (timestamp)
);

-- RLS Policies
ALTER TABLE cnae_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cnae_searches ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios dados
CREATE POLICY "Users can view own analytics"
    ON cnae_analytics FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own analytics"
    ON cnae_analytics FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own searches"
    ON cnae_searches FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own searches"
    ON cnae_searches FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- View materializada para CNAEs mais populares
CREATE MATERIALIZED VIEW IF NOT EXISTS top_cnaes AS
SELECT 
    cnae_code,
    cnae_description,
    COUNT(*) as selection_count,
    AVG(confidence) as avg_confidence,
    COUNT(DISTINCT user_id) as unique_users,
    MAX(timestamp) as last_selected
FROM cnae_analytics
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY cnae_code, cnae_description
ORDER BY selection_count DESC
LIMIT 100;

-- Index na view
CREATE UNIQUE INDEX ON top_cnaes (cnae_code);

-- Refresh automático (executar manualmente ou via cron)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY top_cnaes;

-- View para accuracy da IA
CREATE VIEW ai_accuracy AS
SELECT 
    COUNT(*) as total_selections,
    SUM(CASE WHEN is_ai_suggested THEN 1 ELSE 0 END) as ai_suggested_count,
    SUM(CASE WHEN position <= 2 THEN 1 ELSE 0 END) as top_position_count,
    ROUND(100.0 * SUM(CASE WHEN is_ai_suggested THEN 1 ELSE 0 END) / COUNT(*), 2) as ai_accuracy_pct,
    ROUND(100.0 * SUM(CASE WHEN position <= 2 THEN 1 ELSE 0 END) / COUNT(*), 2) as top_position_pct
FROM cnae_analytics
WHERE timestamp >= NOW() - INTERVAL '30 days';

-- Comentários
COMMENT ON TABLE cnae_analytics IS 'Rastreamento de seleções de CNAE pelos usuários';
COMMENT ON TABLE cnae_searches IS 'Histórico de buscas de CNAE realizadas';
COMMENT ON COLUMN cnae_analytics.position IS 'Posição do CNAE na lista de resultados (1=primeiro)';
COMMENT ON COLUMN cnae_analytics.is_ai_suggested IS 'CNAE foi sugerido pelo mapeamento semântico';
COMMENT ON COLUMN cnae_analytics.confidence IS 'Nível de confiança da IA (0.0 a 1.0)';
