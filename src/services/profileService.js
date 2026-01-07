import { supabase } from '@/lib/supabase';

/**
 * Profile Service - Gerenciamento de perfil do usuário
 */

/**
 * Busca perfil do usuário
 */
export async function getProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching profile:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Atualiza perfil do usuário
 */
export async function updateProfile(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Upload de avatar
 */
export async function uploadAvatar(userId, file) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        // Upload do arquivo
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) throw uploadError;

        // Pegar URL pública
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Atualizar perfil com URL
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', userId);

        if (updateError) throw updateError;

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error('Error uploading avatar:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Verifica e reseta quota se necessário
 */
export async function checkAndResetQuota(userId) {
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('plan, search_quota, searches_used, quota_reset_date')
            .eq('id', userId)
            .single();

        if (!profile) throw new Error('Profile not found');

        // Mapeamento de Planos -> Quotas
        const PLAN_QUOTAS = {
            'demo': 10,
            'free': 100,
            'interno': 100000
        };

        const expectedQuota = PLAN_QUOTAS[profile.plan?.toLowerCase()] || 10;
        let currentQuota = profile.search_quota;

        // Auto-correção: Se a quota no banco estiver errada para o plano atual, corrige
        if (currentQuota !== expectedQuota) {
            console.log(`🔧 Corrigindo quota para o plano ${profile.plan}: ${currentQuota} -> ${expectedQuota}`);
            await supabase
                .from('profiles')
                .update({ search_quota: expectedQuota })
                .eq('id', userId);
            currentQuota = expectedQuota;
        }

        // Verificar se passou da data de reset
        const resetDate = profile.quota_reset_date ? new Date(profile.quota_reset_date) : null;
        const now = new Date();

        if (resetDate && now > resetDate) {
            // Reset searches_used e define próxima data de reset (30 dias)
            const nextReset = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
            await supabase
                .from('profiles')
                .update({
                    searches_used: 0,
                    quota_reset_date: nextReset
                })
                .eq('id', userId);

            return {
                allowed: true,
                remaining: expectedQuota,
                total: expectedQuota,
                plan: profile.plan
            };
        }

        const remaining = currentQuota - (profile.searches_used || 0);

        return {
            allowed: remaining > 0,
            remaining: Math.max(0, remaining),
            total: currentQuota,
            resetDate: profile.quota_reset_date,
            plan: profile.plan
        };
    } catch (error) {
        console.error('Error checking quota:', error);
        return { allowed: false, error: error.message };
    }
}

/**
 * Incrementa contador de buscas
 */
export async function incrementSearchCount(userId, count = 1) {
    console.log(`🔄 Iniciando incremento de cota (${count}) para:`, userId);
    try {
        // 1. Tenta via RPC (Ideal: a função RPC deve ser atualizada para aceitar count)
        const { error: rpcError } = await supabase.rpc('increment_searches', {
            user_id: userId,
            amount: count // Passando amount para o RPC caso ele seja atualizado
        });

        if (!rpcError) {
            console.log(`✅ Incremento via RPC (${count}) concluído`);
            return { success: true };
        }

        console.warn('⚠️ RPC falhou ou não suporta parâmetros, tentando fallback manual...');

        // 2. Fallback: busca atual e incrementa
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('searches_used')
            .eq('id', userId)
            .single();

        if (fetchError) {
            console.error('❌ Erro ao buscar perfil para incremento:', fetchError);
            throw fetchError;
        }

        const currentUsed = profile.searches_used || 0;
        const newUsed = currentUsed + count;
        console.log(`📊 Valor atual de searches_used: ${currentUsed}. Incrementando +${count} para ${newUsed}...`);

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                searches_used: newUsed,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) {
            console.error('❌ Erro no update manual de cota:', updateError);
            throw updateError;
        }

        console.log(`✅ Incremento manual (${count}) concluído com sucesso`);
        return { success: true };
    } catch (error) {
        console.error('❌ Falha crítica no incremento de cota:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Busca estatísticas do usuário
 */
export async function getUserStats(userId) {
    try {
        // Buscar total de buscas
        const { count: totalSearches } = await supabase
            .from('search_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // Buscar buscas deste mês
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count: monthSearches } = await supabase
            .from('search_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', thirtyDaysAgo.toISOString());

        // Buscar empresas salvas
        const { count: savedCompanies } = await supabase
            .from('saved_companies')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        return {
            success: true,
            data: {
                totalSearches: totalSearches || 0,
                monthSearches: monthSearches || 0,
                savedCompanies: savedCompanies || 0
            }
        };
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Alterar senha
 */
export async function changePassword(newPassword) {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error changing password:', error);
        return { success: false, error: error.message };
    }
}
