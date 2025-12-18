/**
 * Serviço de Analytics para rastrear uso de CNAEs
 * Suporte: Supabase + localStorage fallback
 */

import { supabase } from '../lib/supabase';

const ANALYTICS_TABLE = 'cnae_analytics';
const LOCAL_QUEUE_KEY = 'cnae_analytics_queue';

/**
 * Registra seleção de CNAE
 */
export async function trackCNAESelection(userId, cnaeData, searchContext) {
    const event = {
        user_id: userId || 'anonymous',
        cnae_code: cnaeData.code || cnaeData.value,
        cnae_description: cnaeData.description || cnaeData.label,
        search_term: searchContext.searchTerm,
        position: searchContext.position, // Posição na lista (1-5)
        is_ai_suggested: cnaeData.isSuggested || false,
        has_semantic_match: cnaeData.hasSemanticMatch || false,
        confidence: cnaeData.confidence || cnaeData.relevance || 0,
        timestamp: new Date().toISOString()
    };

    try {
        // Tenta enviar para Supabase
        const { error } = await supabase
            .from(ANALYTICS_TABLE)
            .insert(event);

        if (error) {
            console.warn('Analytics: Falha ao enviar, salvando localmente');
            queueEventLocally(event);
        } else {
            console.log('📊 Analytics: CNAE selecionado rastreado');
        }

        // Processa fila local se houver
        await processLocalQueue();

    } catch (err) {
        console.warn('Analytics: Erro, salvando localmente', err);
        queueEventLocally(event);
    }
}

/**
 * Registra busca realizada
 */
export async function trackSearch(userId, searchData) {
    const event = {
        user_id: userId || 'anonymous',
        search_term: searchData.term,
        results_count: searchData.resultsCount,
        ai_used: searchData.aiUsed,
        expanded_terms: searchData.expandedTerms?.join(', '),
        suggested_cnaes: searchData.suggestedCNAEs?.join(', '),
        response_time_ms: searchData.responseTime,
        timestamp: new Date().toISOString()
    };

    try {
        const { error } = await supabase
            .from('cnae_searches')
            .insert(event);

        if (!error) {
            console.log('📊 Analytics: Busca rastreada');
        }
    } catch (err) {
        console.warn('Analytics: Erro ao rastrear busca', err);
    }
}

/**
 * Obtém CNAEs mais selecionados
 */
export async function getTopCNAEs(limit = 10, days = 30) {
    try {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        const { data, error } = await supabase
            .from(ANALYTICS_TABLE)
            .select('cnae_code, cnae_description, count')
            .gte('timestamp', dateLimit.toISOString())
            .order('count', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return data || [];
    } catch (err) {
        console.error('Analytics: Erro ao buscar top CNAEs', err);
        return [];
    }
}

/**
 * Calcula taxa de acurácia da IA
 */
export async function getAIAccuracy(days = 30) {
    try {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        const { data, error } = await supabase
            .from(ANALYTICS_TABLE)
            .select('is_ai_suggested, position')
            .gte('timestamp', dateLimit.toISOString());

        if (error) throw error;

        const total = data.length;
        const suggested = data.filter(d => d.is_ai_suggested).length;
        const topPosition = data.filter(d => d.position <= 2).length;

        return {
            total,
            aiSuggestedRate: total > 0 ? (suggested / total * 100).toFixed(1) : 0,
            topPositionRate: total > 0 ? (topPosition / total * 100).toFixed(1) : 0
        };
    } catch (err) {
        console.error('Analytics: Erro ao calcular acurácia', err);
        return { total: 0, aiSuggestedRate: 0, topPositionRate: 0 };
    }
}

/**
 * Obtém estatísticas de busca
 */
export async function getSearchStats(days = 30) {
    try {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        const { data, error } = await supabase
            .from('cnae_searches')
            .select('search_term, results_count, response_time_ms')
            .gte('timestamp', dateLimit.toISOString());

        if (error) throw error;

        const avgResponseTime = data.reduce((sum, d) => sum + (d.response_time_ms || 0), 0) / data.length;
        const avgResults = data.reduce((sum, d) => sum + (d.results_count || 0), 0) / data.length;

        return {
            totalSearches: data.length,
            avgResponseTime: Math.round(avgResponseTime),
            avgResults: Math.round(avgResults)
        };
    } catch (err) {
        console.error('Analytics: Erro ao buscar estatísticas', err);
        return { totalSearches: 0, avgResponseTime: 0, avgResults: 0 };
    }
}

/**
 * Salva evento na fila local
 */
function queueEventLocally(event) {
    try {
        const queue = JSON.parse(localStorage.getItem(LOCAL_QUEUE_KEY) || '[]');
        queue.push(event);

        // Limita fila a 100 eventos
        if (queue.length > 100) {
            queue.shift();
        }

        localStorage.setItem(LOCAL_QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
        console.error('Analytics: Erro ao salvar na fila local', err);
    }
}

/**
 * Processa eventos da fila local
 */
async function processLocalQueue() {
    try {
        const queue = JSON.parse(localStorage.getItem(LOCAL_QUEUE_KEY) || '[]');

        if (queue.length === 0) return;

        console.log(`📊 Analytics: Processando ${queue.length} eventos da fila`);

        const { error } = await supabase
            .from(ANALYTICS_TABLE)
            .insert(queue);

        if (!error) {
            localStorage.removeItem(LOCAL_QUEUE_KEY);
            console.log('✅ Analytics: Fila processada com sucesso');
        }
    } catch (err) {
        console.warn('Analytics: Erro ao processar fila', err);
    }
}

/**
 * Exporta dados de analytics (CSV)
 */
export async function exportAnalytics(days = 30) {
    try {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        const { data, error } = await supabase
            .from(ANALYTICS_TABLE)
            .select('*')
            .gte('timestamp', dateLimit.toISOString())
            .order('timestamp', { ascending: false });

        if (error) throw error;

        // Converte para CSV
        const headers = Object.keys(data[0] || {}).join(',');
        const rows = data.map(row =>
            Object.values(row).map(v => `"${v}"`).join(',')
        );

        const csv = [headers, ...rows].join('\n');

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cnae_analytics_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        console.log('✅ Analytics exportado');
    } catch (err) {
        console.error('Analytics: Erro ao exportar', err);
    }
}
