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
            .select('search_quota, searches_used, quota_reset_date')
            .eq('id', userId)
            .single();

        if (!profile) throw new Error('Profile not found');

        // Verificar se passou da data de reset
        const resetDate = new Date(profile.quota_reset_date);
        const now = new Date();

        if (now > resetDate) {
            // Reset quota
            await supabase
                .from('profiles')
                .update({
                    searches_used: 0,
                    quota_reset_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
                })
                .eq('id', userId);

            return {
                allowed: true,
                remaining: profile.search_quota,
                total: profile.search_quota
            };
        }

        const remaining = profile.search_quota - profile.searches_used;

        return {
            allowed: remaining > 0,
            remaining: Math.max(0, remaining),
            total: profile.search_quota,
            resetDate: profile.quota_reset_date
        };
    } catch (error) {
        console.error('Error checking quota:', error);
        return { allowed: false, error: error.message };
    }
}

/**
 * Incrementa contador de buscas
 */
export async function incrementSearchCount(userId) {
    try {
        const { error } = await supabase.rpc('increment_searches', {
            user_id: userId
        });

        // Se a função RPC não existir, fazer update manual
        if (error && error.message.includes('function')) {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    searches_used: supabase.raw('searches_used + 1')
                })
                .eq('id', userId);

            if (updateError) throw updateError;
        } else if (error) {
            throw error;
        }

        return { success: true };
    } catch (error) {
        console.error('Error incrementing search count:', error);
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
