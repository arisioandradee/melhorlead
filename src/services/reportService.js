import { supabase } from '../lib/supabase';

const N8N_WEBHOOK = 'https://webhook.dibaisales.com.br/webhook/a5fb2dac-c827-44c8-971d-439b8fe139e3';

export const reportService = {
    /**
     * Criar novo relatório (dispara n8n workflow)
     */
    async createReport(userId, nome, parametros) {
        try {
            const response = await fetch(N8N_WEBHOOK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    nomeRelatorio: nome,
                    ...parametros
                })
            });

            if (!response.ok) {
                throw new Error(`Erro ao criar relatório: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                reportId: result.reportId
            };
        } catch (error) {
            console.error('❌ Erro ao criar relatório:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Listar todos os relatórios do usuário
     */
    async listReports(userId) {
        try {
            const { data, error } = await supabase
                .from('relatorios')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return {
                success: true,
                reports: data || []
            };
        } catch (error) {
            console.error('❌ Erro ao listar relatórios:', error);
            return {
                success: false,
                error: error.message,
                reports: []
            };
        }
    },

    /**
     * Buscar relatório específico
     */
    async getReport(reportId) {
        try {
            const { data, error } = await supabase
                .from('relatorios')
                .select('*')
                .eq('id', reportId)
                .single();

            if (error) throw error;

            return {
                success: true,
                report: data
            };
        } catch (error) {
            console.error('❌ Erro ao buscar relatório:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Download de arquivo (Base64 do banco)
     */
    async downloadReport(reportId, fileName) {
        try {
            // Busca o relatório com o base64
            const { data: report, error } = await supabase
                .from('relatorios')
                .select('arquivo_url')
                .eq('id', reportId)
                .single();

            if (error) throw error;
            if (!report.arquivo_url) throw new Error('Arquivo não encontrado');

            // Converte Base64 para Blob
            const base64 = report.arquivo_url;
            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // Criar URL e disparar download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('❌ Erro ao baixar relatório:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Deletar relatório
     */
    async deleteReport(reportId) {
        try {
            const { error } = await supabase
                .from('relatorios')
                .delete()
                .eq('id', reportId);

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('❌ Erro ao deletar relatório:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Formatar bytes para leitura humana
     */
    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Formatar data relativa (há X minutos)
     */
    formatRelativeTime(date) {
        const now = new Date();
        const then = new Date(date);
        const diff = now - then;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `há ${days} dia${days > 1 ? 's' : ''}`;
        if (hours > 0) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        return 'agora mesmo';
    }
};
