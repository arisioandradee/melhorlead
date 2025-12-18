import { supabase } from '@/lib/supabase';

/**
 * History Service - Gerenciamento de histórico de buscas
 */

/**
 * Salva uma busca no histórico
 */
export async function saveSearch(userId, searchParams, resultsCount, executionTime) {
    try {
        const { data, error } = await supabase
            .from('search_history')
            .insert({
                user_id: userId,
                search_params: searchParams,
                results_count: resultsCount
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error saving search:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Busca histórico do usuário
 */
export async function getSearchHistory(userId, { limit = 50, offset = 0 } = {}) {
    try {
        const { data, error, count } = await supabase
            .from('search_history')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return {
            success: true,
            data,
            total: count
        };
    } catch (error) {
        console.error('Error fetching search history:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Busca uma pesquisa específica
 */
export async function getSearchById(searchId) {
    try {
        const { data, error } = await supabase
            .from('search_history')
            .select('*')
            .eq('id', searchId)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching search:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Deleta uma busca do histórico
 */
export async function deleteSearch(searchId) {
    try {
        const { error } = await supabase
            .from('search_history')
            .delete()
            .eq('id', searchId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting search:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Limpa todo histórico do usuário
 */
export async function clearHistory(userId) {
    try {
        const { error } = await supabase
            .from('search_history')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error clearing history:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Exporta histórico para CSV
 */
export function exportHistoryToCSV(history) {
    try {
        const headers = ['Data', 'CNAE', 'UF', 'Município', 'Resultados'];

        const rows = history.map(item => {
            const params = item.search_params;
            return [
                new Date(item.created_at).toLocaleString('pt-BR'),
                params.cnae || '-',
                params.uf?.join(', ') || '-',
                params.municipio || '-',
                item.results_count
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `historico_buscas_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return { success: true };
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Busca estatísticas do histórico
 */
export async function getHistoryStats(userId) {
    try {
        const { data: history } = await supabase
            .from('search_history')
            .select('search_params, results_count, created_at')
            .eq('user_id', userId);

        if (!history) return { success: true, data: {} };

        // Total de buscas
        const totalSearches = history.length;

        // Buscas este mês
        const thisMonth = history.filter(item => {
            const date = new Date(item.created_at);
            const now = new Date();
            return date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear();
        }).length;

        // CNAE mais buscado
        const cnaeCounts = {};
        history.forEach(item => {
            const cnae = item.search_params.cnae;
            if (cnae) {
                cnaeCounts[cnae] = (cnaeCounts[cnae] || 0) + 1;
            }
        });

        const topCNAE = Object.entries(cnaeCounts)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

        // UF mais buscado
        const ufCounts = {};
        history.forEach(item => {
            const uf = item.search_params.uf?.[0];
            if (uf) {
                ufCounts[uf] = (ufCounts[uf] || 0) + 1;
            }
        });

        const topUF = Object.entries(ufCounts)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

        // Média de resultados
        const avgResults = history.length > 0
            ? Math.round(history.reduce((sum, item) => sum + item.results_count, 0) / history.length)
            : 0;

        return {
            success: true,
            data: {
                totalSearches,
                thisMonth,
                topCNAE,
                topUF,
                avgResults
            }
        };
    } catch (error) {
        console.error('Error fetching history stats:', error);
        return { success: false, error: error.message };
    }
}
