import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function DownloadN8nReport({ searchParams }) {
    const [downloading, setDownloading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleDownload = async () => {
        setDownloading(true);
        setError('');
        setSuccess(false);

        try {
            // Envia dados da busca para o n8n
            console.log('📤 Enviando para n8n:', searchParams);

            const response = await fetch('https://webhook.dibaisales.com.br/webhook/a5fb2dac-c827-44c8-971d-439b8fe139e3', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
                body: JSON.stringify({
                    ...searchParams,
                    timestamp: new Date().toISOString()
                })
            });

            console.log('📥 Resposta n8n:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                throw new Error(`Erro no servidor: ${response.status}`);
            }

            // Recebe o blob (não valida content-type pois n8n pode não enviar)
            const blob = await response.blob();

            console.log('📦 Blob recebido:', {
                size: blob.size,
                type: blob.type
            });

            // Aviso se vazio mas continua
            if (blob.size === 0) {
                console.warn('⚠️ Arquivo vazio - pode ser que Supabase não retornou dados');
            }

            // Cria URL para download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Nome do arquivo com timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            a.download = `relatorio_empresas_${timestamp}.xlsx`;

            // Dispara download
            document.body.appendChild(a);
            a.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);

            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);

        } catch (err) {
            console.error('❌ Erro ao baixar relatório:', err);
            setError(err.message || 'Erro ao baixar arquivo');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Exportar Relatório Completo</h3>
                            <p className="text-sm text-gray-600">
                                {downloading ? 'Processando...' : 'Baixar relatório com validações de contatos'}
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={handleDownload}
                        disabled={downloading}
                        size="default"
                        className="gap-2 min-w-[140px]"
                    >
                        {downloading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processando
                            </>
                        ) : success ? (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Baixado!
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Baixar XLSX
                            </>
                        )}
                    </Button>
                </div>

                {error && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Erro:</strong> {error}
                    </div>
                )}

                {success && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                        ✅ Download concluído com sucesso!
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
