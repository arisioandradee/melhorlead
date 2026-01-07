import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { findCNAEsByAI, isAIConfigured } from '@/services/aiService';
import { fetchOfficialCNAEs, getCacheInfo } from '@/services/cnaeOfficial';
import { CNAES_COMUNS } from '@/utils/constants';

export function SmartCNAESearch({ onCNAEsSelected, selectedCNAEs = [], hideSelected = false, inputHeight = "h-12" }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(new Set(selectedCNAEs));
    const [cnaeList, setCnaeList] = useState(CNAES_COMUNS);
    const [cacheInfo, setCacheInfo] = useState(null);

    // Carrega CNAEs oficiais do IBGE ao montar
    useEffect(() => {
        loadOfficialCNAEs();
    }, []);

    // Sincroniza estado interno com prop externa
    useEffect(() => {
        if (selectedCNAEs) {
            const codes = Array.isArray(selectedCNAEs) ? selectedCNAEs : [selectedCNAEs];
            setSelected(new Set(codes.filter(c => c && typeof c === 'string')));
        }
    }, [selectedCNAEs]);

    const loadOfficialCNAEs = async () => {
        try {
            console.log('📡 Carregando CNAEs oficiais do IBGE...');
            const official = await fetchOfficialCNAEs();

            if (official && official.length > 0) {
                setCnaeList(official);
                console.log(`✅ ${official.length} CNAEs oficiais carregados`);

                // NOVO: Carrega CNAEs no Web Worker para busca rápida
                try {
                    const { loadCNAEsIntoWorker } = await import('@/services/cnaeWorker');
                    await loadCNAEsIntoWorker(official);
                    console.log('⚡ CNAEs carregados no worker');
                } catch (workerErr) {
                    console.warn('Worker não disponível, usando busca síncrona:', workerErr);
                }
            }

            // Obtém info do cache
            const info = getCacheInfo();
            setCacheInfo(info);
        } catch (err) {
            console.error('❌ Erro ao carregar CNAEs oficiais:', err);
            // Usa fallback local
            setCnaeList(CNAES_COMUNS);
        }
    };

    // Debounce search
    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            await performSearch(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const performSearch = async (term) => {
        if (!isAIConfigured()) {
            setError('IA não configurada. Configure a VITE_GROQ_API_KEY');
            return;
        }

        setLoading(true);
        setError('');

        const startTime = performance.now();

        try {
            const results = await findCNAEsByAI(term, cnaeList);
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);

            setSuggestions(results);

            // Analytics: Rastreia busca
            try {
                const { trackSearch } = await import('@/services/cnaeAnalytics');
                const { expandSemanticContext, getSuggestedCNAEs } = await import('@/services/semanticExpansion');

                await trackSearch(null, {
                    term,
                    resultsCount: results.length,
                    aiUsed: true,
                    expandedTerms: expandSemanticContext(term),
                    suggestedCNAEs: getSuggestedCNAEs(term),
                    responseTime
                });
            } catch (analyticsErr) {
                console.warn('Analytics falhou:', analyticsErr);
            }

        } catch (err) {
            setError('Erro ao buscar CNAEs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleCNAE = async (code, description, position, suggestionData) => {
        const newSelected = new Set(selected);

        if (newSelected.has(code)) {
            newSelected.delete(code);
        } else {
            newSelected.add(code);

            // Analytics: Rastreia seleção
            try {
                const { trackCNAESelection } = await import('@/services/cnaeAnalytics');
                await trackCNAESelection(null, suggestionData, {
                    searchTerm,
                    position: position + 1 // 1-indexed
                });
            } catch (analyticsErr) {
                console.warn('Analytics falhou:', analyticsErr);
            }
        }

        setSelected(newSelected);
        const codesArray = Array.from(newSelected);
        console.log('📤 SmartCNAESearch enviando:', codesArray);
        onCNAEsSelected?.(codesArray);
    };

    const getRelevanceColor = (relevance) => {
        if (relevance >= 80) return 'bg-green-100 text-green-700 border-green-300';
        if (relevance >= 60) return 'bg-blue-100 text-blue-700 border-blue-300';
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    };

    return (
        <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2 text-white/90">
                <Sparkles className="h-4 w-4 text-primary" />
                Busca Inteligente de Atividades (IA)
            </Label>
            <div className="relative group">
                <Input
                    type="text"
                    placeholder='Ex: "dentista", "padaria", "desenvolvimento de software"...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`relative ${inputHeight} pl-4 pr-12 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                        <Sparkles className="h-5 w-5 text-primary/50 group-hover:text-primary transition-colors" />
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <Card className="p-4 space-y-3 border-white/10 bg-black/40 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-white">Sugestões da IA</h4>
                            {cacheInfo?.exists && (
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                                    📡 IBGE Oficial
                                </Badge>
                            )}
                        </div>
                        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                            {suggestions.length} encontrados
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        {suggestions.map((suggestion, index) => {
                            const isSelected = selected.has(suggestion.code);
                            const isTopResult = index < 2;
                            const hasSemanticBoost = suggestion.isSuggested || suggestion.hasSemanticMatch;

                            return (
                                <button
                                    key={suggestion.code}
                                    type="button"
                                    onClick={() => toggleCNAE(suggestion.code, suggestion.description, index, suggestion)}
                                    className={`
                                        w-full text-left p-3 rounded-lg border transition-all duration-300
                                        ${isSelected
                                            ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]'
                                            : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white'
                                        }
                                    `}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`font-mono text-sm font-semibold ${isSelected ? 'text-primary' : 'text-primary/80'}`}>
                                                    {suggestion.code}
                                                </span>

                                                {isTopResult && (
                                                    <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-xs px-1.5 py-0.5">
                                                        ⭐ Top {index + 1}
                                                    </Badge>
                                                )}

                                                {hasSemanticBoost && (
                                                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs px-1.5 py-0.5">
                                                        🎯 Match
                                                    </Badge>
                                                )}

                                                {suggestion.confidence >= 0.9 && (
                                                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-1.5 py-0.5">
                                                        ✓ {Math.round(suggestion.confidence * 100)}%
                                                    </Badge>
                                                )}

                                                {isSelected && (
                                                    <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                                                )}
                                            </div>

                                            <p className="text-sm font-medium opacity-90">
                                                {suggestion.description}
                                            </p>

                                            {suggestion.reasoning && (
                                                <p className="text-xs text-gray-500 mt-1 italic">
                                                    💡 {suggestion.reasoning || suggestion.reason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Info */}
                    {cacheInfo?.exists && (
                        <div className="text-xs text-muted-foreground flex items-center gap-4 pt-2 border-t border-white/10">
                            <span>📊 {cacheInfo.count} CNAEs na base</span>
                            <span>📅 Cache expira em {cacheInfo.expiresIn} dias</span>
                        </div>
                    )}
                </Card>
            )}

            {/* Selected CNAEs Display */}
            {selected.size > 0 && !hideSelected && (
                <Card className="p-3 bg-black/20 border-white/5">
                    <div className="flex flex-wrap gap-2">
                        {Array.from(selected).map(code => {
                            const cnae = cnaeList.find(c => c.value === code);
                            return (
                                <Badge
                                    key={code}
                                    variant="default"
                                    className="bg-primary/80 hover:bg-primary text-white border-none text-[10px] py-0 px-2 h-6"
                                    onClick={() => toggleCNAE(code, cnae?.label, 0, cnae)}
                                >
                                    {code}
                                    <span className="ml-1 opacity-60">×</span>
                                </Badge>
                            );
                        })}
                    </div>
                </Card>
            )}
        </div>
    );
}

