import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { reportService } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';

export default function ReportsPage() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadReports = async () => {
        if (!user) return;
        const result = await reportService.listReports(user.id);
        if (result.success) {
            setReports(result.reports);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadReports();
        const interval = setInterval(loadReports, 5000); // Poll a cada 5s
        return () => clearInterval(interval);
    }, [user]);

    const handleDownload = async (report) => {
        const result = await reportService.downloadReport(report.id, report.nome);
        if (!result.success) {
            alert(`Erro: ${result.error}`);
        }
    };

    const handleDelete = async (reportId) => {
        if (!confirm('Deletar este relatório?')) return;
        const result = await reportService.deleteReport(reportId);
        if (result.success) {
            setReports(prev => prev.filter(r => r.id !== reportId));
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <main className="p-6">
                    <p className="text-center text-gray-600">Carregando...</p>
                </main>
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Relatórios</h1>
                    <p className="text-gray-600">Gerencie seus relatórios exportados</p>
                </div>

                {reports.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <p className="text-gray-600">Nenhum relatório ainda</p>
                        <p className="text-sm text-gray-500">Faça uma busca e clique em "Gerar Relatório"</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {reports.map((report) => (
                            <div key={report.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold">{report.nome}</h3>
                                    <span className={`px-2 py-1 text-xs rounded ${report.status === 'concluido' ? 'bg-green-100 text-green-800' :
                                            report.status === 'processando' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {report.status === 'concluido' ? '✅ Concluído' :
                                            report.status === 'processando' ? '⏳ Processando' :
                                                '❌ Erro'}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-3">
                                    {reportService.formatRelativeTime(report.created_at)}
                                </p>

                                {report.status === 'concluido' && (
                                    <p className="text-sm text-gray-600 mb-3">
                                        {report.total_registros || 0} registros
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    {report.status === 'concluido' && (
                                        <button
                                            onClick={() => handleDownload(report)}
                                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                        >
                                            ⬇️ Download
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(report.id)}
                                        disabled={report.status === 'processando'}
                                        className="px-3 py-2 border rounded hover:bg-gray-50 text-sm disabled:opacity-50"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
