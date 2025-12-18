import { supabase } from '@/lib/supabase';

// Salvar pesquisa no histórico
export const saveSearchHistory = async (userId, searchParams, resultsCount) => {
    try {
        const { data, error } = await supabase
            .from('search_history')
            .insert([
                {
                    user_id: userId,
                    search_params: searchParams,
                    results_count: resultsCount,
                }
            ])
            .select();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Erro ao salvar histórico:', error);
        return { data: null, error };
    }
};

// Buscar histórico do usuário
export const getUserSearchHistory = async (userId, limit = 50) => {
    try {
        const { data, error } = await supabase
            .from('search_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        return { data: null, error };
    }
};

// Deletar item do histórico
export const deleteSearchHistory = async (id) => {
    try {
        const { error } = await supabase
            .from('search_history')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Erro ao deletar histórico:', error);
        return { error };
    }
};
