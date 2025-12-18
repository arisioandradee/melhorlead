import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    History,
    Download,
    Trash2,
    RefreshCw,
    Search,
    Filter,
    Calendar,
    TrendingUp,
    Loader2,
    MapPin,
    Building2
} from 'lucide-react';
import {
    getSearchHistory,
    deleteSearch,
    clearHistory,
    exportHistoryToCSV,
    getHistoryStats
} from '@/services/historyService';
import { formatSearchPayload, searchCompanies } from '@/services/api';

export default function SearchHistory() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchFilter, setSearchFilter] = useState('');

    useEffect(() => {
        loadHistory();
        loadStats();
    }, [user]);

    const loadHistory = async () => {
        if (!user) return;
        setLoading(true);

        const result = await getSearchHistory(user.id);
        if (result.success) {
            setHistory(result.data);
        }

        setLoading(false);
    };

    const loadStats = async () => {
        if (!user) return;

        const result = await getHistoryStats(user.id);
        if (result.success) {
            setStats(result.data);
        }
    };

    const handleReExecute = async (searchParams) => {
        // Redirecionar para home e preencher formulário
        navigate('/', { state: { searchParams } });
    };

    const handleDelete = async (id) => {
        if (!confirm('Deletar esta busca do histórico?')) return;

        const result = await deleteSearch(id);
        if (result.success) {
            setHistory(prev => prev.filter(item => item.id !== id));
            loadStats();
        }
    };

    const handleClearAll = async () => {
        if (!confirm('Deletar TODO o histórico? Esta ação não pode ser desfeita.')) return;

        const result = await clearHistory(user.id);
        if (result.success) {
            setHistory([]);
            loadStats();
        }
    };

    const handleExport = () => {
        exportHistoryToCSV(history);
    };

    const filteredHistory = history.filter(item => {
        if (!searchFilter) return true;

        const params = item.search_params;
        const searchLower = searchFilter.toLowerCase();

        return (
            params.cnae?.toLowerCase().includes(searchLower) ||
            params.municipio?.toLowerCase().includes(searchLower) ||
            params.uf?.some(uf => uf.toLowerCase().includes(searchLower))
        );
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getParamsDisplay = (params) => {
        const parts = [];

        if (params.cnae) parts.push(`CNAE: ${params.cnae}`);
        if (params.uf?.length > 0) parts.push(`UF: ${params.uf.join(', ')}`);
        if (params.municipio) parts.push(`Município: ${params.municipio}`);
        if (params.razaoSocial) parts.push(`Razão: ${params.razaoSocial}`);

        return parts.length > 0 ? parts.join(' | ') : 'Busca sem filtros específicos';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 space-y-6 animate-fade-in-up">
            {/* Header */}
            <Card className="glass border-border/50">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold text-gradient-primary flex items-center gap-3">
                                <History className="h-7 w-7" />
                                Histórico de Buscas
                            </CardTitle>
                            <p className="text text-muted-foreground mt-1">
                                Acompanhe e re-execute suas buscas anteriores
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleExport} className="gap-2">
                                <Download className="h-4 w-4" />
                                Exportar CSV
                            </Button>
                            <Button variant="destructive" onClick={handleClearAll} className="gap-2">
                                <Trash2 className="h-4 w-4" />
                                Limpar Tudo
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="glass border-border/50">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-primary">{stats.totalSearches}</div>
                            <div className="text-xs text-muted-foreground">Total de Buscas</div>
                        </CardContent>
                    </Card>

                    <Card className="glass border-border/50">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-secondary">{stats.thisMonth}</div>
                            <div className="text-xs text-muted-foreground">Este Mês</div>
                        </CardContent>
                    </Card>

                    <Card className="glass border-border/50">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-accent">{stats.avgResults}</div>
                            <div className="text-xs text-muted-foreground">Média Resultados</div>
                        </CardContent>
                    </Card>

                    <Card className="glass border-border/50">
                        <CardContent className="p-4">
                            <div className="text-sm font-bold truncate">{stats.topCNAE || '-'}</div>
                            <div className="text-xs text-muted-foreground">CNAE Mais Buscado</div>
                        </CardContent>
                    </Card>

                    <Card className="glass border-border/50">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-primary">{stats.topUF || '-'}</div>
                            <div className="text-xs text-muted-foreground">UF Mais Buscado</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Search Filter */}
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Filtrar por CNAE, município ou UF..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="pl-10 h-12"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    {filteredHistory.length} de {history.length} buscas
                </div>
            </div>

            {/* History List */}
            <div className="space-y-4">
                {filteredHistory.length === 0 ? (
                    <Card className="glass border-border/50">
                        <CardContent className="p-12 text-center">
                            <History className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Nenhuma busca encontrada</h3>
                            <p className="text-muted-foreground">
                                {searchFilter ? 'Tente ajustar o filtro' : 'Faça sua primeira busca!'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredHistory.map((item, index) => (
                        <Card
                            key={item.id}
                            className="glass border-border/50 hover:border-primary/50 transition-all animate-fade-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        {/* Date */}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(item.created_at)}
                                        </div>

                                        {/* Params */}
                                        <div className="flex items-start gap-2">
                                            <Filter className="h-4 w-4 text-primary mt-0.5" />
                                            <p className="text-sm flex-1">{getParamsDisplay(item.search_params)}</p>
                                        </div>

                                        {/* Results Count */}
                                        <div className="flex items-center gap-4">
                                            <Badge variant="secondary" className="gap-1.5">
                                                <Building2 className="h-3 w-3" />
                                                {item.results_count} resultados
                                            </Badge>

                                            {item.execution_time_ms && (
                                                <span className="text-xs text-muted-foreground">
                                                    {item.execution_time_ms}ms
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleReExecute(item.search_params)}
                                            className="gap-2"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            Re-executar
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(item.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
