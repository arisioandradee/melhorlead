import React, { useState } from 'react';
import { reportService } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';

export function CreateReportModal({ open, onClose, searchParams }) {
    const { user } = useAuth();
    const [nome, setNome] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nome.trim()) {
            setError('Digite um nome para o relatório');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await reportService.createReport(
                user.id,
                nome.trim(),
                searchParams
            );

            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    setNome('');
                    setSuccess(false);
                    onClose();
                }, 2000);
            } else {
                setError(result.error || 'Erro ao criar relatório');
            }
        } catch (err) {
            setError('Erro inesperado ao criar relatório');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setNome('');
            setError('');
            setSuccess(false);
            onClose();
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-10">
                <h2 className="text-lg font-semibold mb-4">Gerar Relatório</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Nome do Relatório</label>
                        <input
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: Empresas SP - Padarias"
                            disabled={loading || success}
                            maxLength={100}
                            className="w-full px-3 py-2 border rounded-lg"
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">{nome.length}/100 caracteres</p>
                    </div>

                    {success && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                            ✅ Relatório criado!
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading || success}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || success || !nome.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Criando...' : success ? 'Criado!' : 'Gerar Relatório'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
