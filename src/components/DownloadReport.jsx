import React, { useState } from 'react';
import { Loader2, FileDown, Sparkles } from 'lucide-react';

export function DownloadReport({ companies }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDownload = async () => {
        setLoading(true);
        setError('');

        try {
            // Cria payload com lista de empresas
            const payload = {
                companies: companies.map(c => ({
                    cnpj: c.cnpj
                }))
            };

            console.log('📤 Enviando para n8n:', payload);
            console.log(`📊 Total de empresas: ${companies.length}`);

            const response = await fetch('https://webhook.dibaisales.com.br/webhook/a5fb2dac-c827-44c8-971d-439b8fe139e3', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                },
                body: JSON.stringify(payload)
            });

            console.log('📥 Resposta n8n:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const blob = await response.blob();

            console.log('📦 Blob recebido:', {
                size: blob.size,
                type: blob.type
            });

            if (blob.size === 0) {
                throw new Error('Arquivo vazio - n8n não retornou dados. Verifique se o workflow processou corretamente.');
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            console.log('✅ Download concluído!');

        } catch (err) {
            console.error('❌ Erro:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-end mb-4">
            <button
                onClick={handleDownload}
                disabled={loading}
                className="group relative px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 transform skew-y-12" />

                <div className="relative flex items-center">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Gerando Relatório...
                        </>
                    ) : (
                        <>
                            <FileDown className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                            <span className="font-semibold">Baixar Relatório</span>
                            <div className="ml-2 pl-2 border-l border-white/20 text-xs font-normal opacity-90">
                                {companies.length} empresas
                            </div>
                        </>
                    )}
                </div>
            </button>
            {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
        </div>
    );
}
