import React, { useState, useEffect } from 'react';
import {
    Search,
    X,
    Building2,
    MapPin,
    Filter,
    Phone,
    Mail,
    Calendar,
    DollarSign,
    TrendingUp,
    Sparkles,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { ESTADOS_BR, SITUACAO_CADASTRAL, NATUREZA_JURIDICA, CNAES_COMUNS, REGIOES_BR } from '@/utils/constants';
import { maskCEP, maskDDD, parseCurrency } from '@/utils/formatters';
import { formatSearchPayload, searchCompanies } from '@/services/api';
import { SmartCNAESearch } from '@/components/SmartCNAESearch';
import { useAuth } from '@/contexts/AuthContext';
import { saveSearch } from '@/services/historyService';
import { checkAndResetQuota, incrementSearchCount } from '@/services/profileService';

export function CompanySearchForm({ onSearchResults, onSearchStart }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        razaoSocial: '',
        nomeFantasia: '',
        cnae: [], // Array para múltiplos CNAEs
        naturezaJuridica: '',
        uf: [],
        municipio: '',
        bairro: '',
        cep: '',
        ddd: '',
        situacaoCadastral: 'ATIVA',
        dataAberturaInicio: '',
        dataAberturaFim: '',
        capitalSocialMin: '',
        capitalSocialMax: '',
        limite: 50,
        somenteMEI: false,
        excluirMEI: false,
        somenteMatriz: false,
        somenteFilial: false,
        comTelefone: false,
        somenteFixo: false,
        somenteCelular: false,
        comEmail: false,
    });

    const [selectedRegions, setSelectedRegions] = useState([]); // Changed to array

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    const [success, setSuccess] = useState(false); // Added success state

    // Debugging UF changes
    useEffect(() => {
        if (formData.uf.length > 0) {
            console.log('🏛️ [UF DEBUG] formData.uf changed:', formData.uf);
        }
    }, [formData.uf]);

    // Count active filters
    useEffect(() => {
        const count = Object.entries(formData).filter(([key, value]) => {
            if (typeof value === 'boolean') return value;
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'string') return value !== '' && key !== 'situacaoCadastral' && key !== 'limite';
            return false;
        }).length;
        setActiveFiltersCount(count);
    }, [formData]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCEPChange = (e) => {
        const masked = maskCEP(e.target.value);
        handleInputChange('cep', masked);
    };

    const handleDDDChange = (e) => {
        const masked = maskDDD(e.target.value);
        handleInputChange('ddd', masked);
    };

    const handleRegionChange = (newRegions) => {
        setSelectedRegions(newRegions);

        // Calculate UFs based on selected regions
        const regionUFs = new Set();
        newRegions.forEach(regionValue => {
            if (regionValue === 'QUALQUER') return;
            const region = REGIOES_BR.find(r => r.value === regionValue);
            if (region) {
                region.estados.forEach(uf => regionUFs.add(uf));
            }
        });

        const newUFs = Array.from(regionUFs);
        handleInputChange('uf', newUFs);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        console.log('🚀 Search started! FormData:', formData);
        onSearchStart?.();

        const startTime = performance.now();

        try {
            const payload = formatSearchPayload({
                ...formData,
                capitalSocialMin: parseCurrency(formData.capitalSocialMin),
                capitalSocialMax: parseCurrency(formData.capitalSocialMax),
            });

            const result = await searchCompanies(payload);
            console.log('📥 API Result:', result);

            if (result.success) {
                // API retorna { cnpjs: [...] } não um array direto
                let companies = result.data?.cnpjs || result.data || [];
                console.log('✅ Companies found (raw):', companies.length);

                // Shuffle Logic (Pedido do usuário: Top 3 fixos + Resto aleatório)
                if (companies.length > 3) {
                    const top3 = companies.slice(0, 3);
                    const rest = companies.slice(3);

                    // Fisher-Yates Shuffle para o resto
                    for (let i = rest.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [rest[i], rest[j]] = [rest[j], rest[i]];
                    }

                    companies = [...top3, ...rest];
                }

                console.log('🔄 Companies passed to parent:', companies.length);

                const endTime = performance.now();
                const executionTime = ((endTime - startTime) / 1000).toFixed(2);

                // Pass both results AND search params to Home
                onSearchResults(companies, formData);

                // Show success state on button
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);

                // Save to history (quota increment DISABLED)
                if (user) {
                    await saveSearch(user.id, formData, companies.length, executionTime);
                    // await incrementSearchCount(user.id); // DISABLED - no quota limits
                }
            } else {
                console.error('❌ Search failed:', result.error);
                setError(result.error);
                onSearchResults([], null);
            }
        } catch (err) {
            setError('Erro inesperado ao buscar empresas');
            console.error('❌ Unexpected error:', err);
            onSearchResults([], null);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            razaoSocial: '',
            nomeFantasia: '',
            cnae: [], // Array vazio
            naturezaJuridica: '',
            uf: [],
            municipio: '',
            bairro: '',
            cep: '',
            ddd: '',
            situacaoCadastral: 'ATIVA',
            dataAberturaInicio: '',
            dataAberturaFim: '',
            capitalSocialMin: '',
            capitalSocialMax: '',
            limite: 50,
            somenteMEI: false,
            excluirMEI: false,
            somenteMatriz: false,
            somenteFilial: false,
            comTelefone: false,
            somenteFixo: false,
            somenteCelular: false,
            comEmail: false,
        });
        setSelectedRegions([]);
        setError('');
        onSearchResults([], null);
    };

    return (
        <form onSubmit={handleSubmit} className="animate-fade-in-up">
            <Card className="w-full glass border-border/50 shadow-xl shadow-primary/5">
                {/* Header Simplified */}
                <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                                <Search className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-xl font-semibold text-foreground mb-1">
                                    Busca Avançada
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Filtre empresas por múltiplos critérios
                                </p>
                                {activeFiltersCount > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                        <span className="text-xs text-primary font-medium">
                                            {activeFiltersCount} filtros ativos
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                                className="gap-2 h-10 text-muted-foreground hover:text-white hover:bg-white/5 data-[state=open]:bg-transparent"
                            >
                                <X className="h-4 w-4" />
                                Limpar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || activeFiltersCount === 0 || success}
                                className={`min-w-[140px] gap-2 font-medium transition-all duration-300 ${success ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Buscando...
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        Concluído!
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-4 w-4" />
                                        Buscar
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                {/* ... Rest of form ... */}

                <CardContent className="p-6">
                    <Tabs defaultValue="basico" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto overflow-hidden bg-white/5 border border-white/10">
                            <TabsTrigger value="basico" className="gap-2">
                                <Sparkles className="h-4 w-4" />
                                Básico
                            </TabsTrigger>
                            <TabsTrigger value="localizacao" className="gap-2">
                                <MapPin className="h-4 w-4" />
                                Localização
                            </TabsTrigger>
                            <TabsTrigger value="detalhes" className="gap-2">
                                <Building2 className="h-4 w-4" />
                                Detalhes
                            </TabsTrigger>
                            <TabsTrigger value="filtros" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filtros
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab 1: Básico */}
                        <TabsContent value="basico" className="space-y-6 overflow-visible">
                            {/* Search AI Section */}
                            <div className="space-y-4">
                                <SmartCNAESearch
                                    onCNAEsSelected={(cnaes) => {
                                        handleInputChange('cnae', cnaes);
                                    }}
                                    selectedCNAEs={Array.isArray(formData.cnae) ? formData.cnae : (formData.cnae ? [formData.cnae] : [])}
                                />
                            </div>

                            {/* Company Name */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="razaoSocial" className="text-base font-semibold flex items-center gap-2 text-white/90">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        Razão Social
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            id="razaoSocial"
                                            placeholder="Digite o nome oficial da empresa..."
                                            value={formData.razaoSocial}
                                            onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                                            className="h-12 pr-10 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                        />
                                        <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-500 group-hover:text-primary transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="naturezaJuridica" className="text-base font-semibold flex items-center gap-2 text-white/90">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        Natureza Jurídica
                                    </Label>
                                    <Select
                                        value={formData.naturezaJuridica}
                                        onValueChange={(value) => handleInputChange('naturezaJuridica', value)}
                                    >
                                        <SelectTrigger className="h-12 bg-black/20 border-white/10 text-white focus:ring-primary/20">
                                            <SelectValue placeholder="Selecione o tipo legal (MEI, LTDA...)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {NATUREZA_JURIDICA.map((item) => (
                                                <SelectItem key={item.value} value={item.value}>
                                                    {item.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Manual CNAE Input */}
                            <div className="space-y-3">
                                <Label htmlFor="cnae" className="text-base font-semibold flex items-center gap-2 text-white/90">
                                    <Filter className="h-4 w-4 text-primary" />
                                    Código CNAE (Manual)
                                </Label>
                                <Input
                                    id="cnae"
                                    list="cnae-options"
                                    placeholder="Digite o código CNAE (Preferível usar a Busca IA acima)"
                                    value={Array.isArray(formData.cnae) ? formData.cnae.join(', ') : formData.cnae}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        handleInputChange('cnae', val.includes(',') ? val.split(',').map(s => s.trim()).filter(Boolean) : val);
                                    }}
                                    className="h-12 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                />
                                <datalist id="cnae-options">
                                    {CNAES_COMUNS.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </datalist>
                            </div>
                        </TabsContent>

                        {/* Tab 2: Localização */}
                        <TabsContent value="localizacao" className="space-y-6 overflow-visible">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="regiao" className="text-base font-semibold flex items-center gap-2 text-white/90">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        Regiões
                                    </Label>
                                    <MultiSelect
                                        options={[
                                            { value: 'QUALQUER', label: 'Todas as Regiões' },
                                            ...REGIOES_BR
                                        ]}
                                        selected={selectedRegions}
                                        onChange={handleRegionChange}
                                        placeholder="Selecione as regiões..."
                                        searchPlaceholder="Buscar região..."
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="uf" className="text-base font-semibold flex items-center gap-2 text-white/90">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        Estados (UF)
                                    </Label>
                                    <MultiSelect
                                        options={[
                                            { value: 'QUALQUER', label: 'Todos os Estados' },
                                            ...ESTADOS_BR
                                        ]}
                                        selected={formData.uf}
                                        onChange={(values) => {
                                            // Handle special "All" case if likely selected
                                            if (values.includes('QUALQUER')) {
                                                handleInputChange('uf', []);
                                                return;
                                            }
                                            handleInputChange('uf', values);
                                        }}
                                        placeholder="Selecione os estados..."
                                        searchPlaceholder="Buscar estado..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="space-y-3">
                                    <Label htmlFor="municipio" className="text-base font-semibold text-white/90">
                                        Município
                                    </Label>
                                    <Input
                                        id="municipio"
                                        placeholder="Ex: São Paulo"
                                        value={formData.municipio}
                                        onChange={(e) => handleInputChange('municipio', e.target.value)}
                                        className="h-12 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="bairro" className="text-base font-semibold text-white/90">
                                        Bairro
                                    </Label>
                                    <Input
                                        id="bairro"
                                        placeholder="Ex: Centro"
                                        value={formData.bairro}
                                        onChange={(e) => handleInputChange('bairro', e.target.value)}
                                        className="h-12 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="cep" className="text-base font-semibold flex items-center gap-2 text-white/90">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        CEP
                                    </Label>
                                    <Input
                                        id="cep"
                                        placeholder="00000-000"
                                        value={formData.cep}
                                        onChange={handleCEPChange}
                                        maxLength={9}
                                        className="h-12 font-mono bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="ddd" className="text-base font-semibold flex items-center gap-2 text-white/90">
                                        <Phone className="h-4 w-4 text-primary" />
                                        DDD
                                    </Label>
                                    <Input
                                        id="ddd"
                                        placeholder="11"
                                        value={formData.ddd}
                                        onChange={handleDDDChange}
                                        maxLength={2}
                                        className="h-12 font-mono bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab 3: Detalhes */}
                        <TabsContent value="detalhes" className="space-y-6 overflow-visible">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="situacaoCadastral" className="text-base font-semibold flex items-center gap-2 text-white/90">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        Situação Cadastral
                                    </Label>
                                    <Select
                                        value={formData.situacaoCadastral}
                                        onValueChange={(value) => handleInputChange('situacaoCadastral', value)}
                                    >
                                        <SelectTrigger className="h-12 bg-black/20 border-white/10 text-white focus:ring-primary/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SITUACAO_CADASTRAL.map((item) => (
                                                <SelectItem key={item.value} value={item.value}>
                                                    {item.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="limite" className="text-base font-semibold flex items-center gap-2 text-white/90">
                                        <Filter className="h-4 w-4 text-primary" />
                                        Máximo de Resultados
                                    </Label>
                                    <Input
                                        id="limite"
                                        type="number"
                                        min="1"
                                        max="300"
                                        value={formData.limite}
                                        onChange={(e) => handleInputChange('limite', parseInt(e.target.value))}
                                        className="h-12 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="dataAberturaInicio" className="text-base font-semibold flex items-center gap-2 text-white/90">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        Abertura - De
                                    </Label>
                                    {/* [color-scheme:dark] ensures the calendar icon is white in dark mode browsers */}
                                    <Input
                                        id="dataAberturaInicio"
                                        type="date"
                                        value={formData.dataAberturaInicio}
                                        onChange={(e) => handleInputChange('dataAberturaInicio', e.target.value)}
                                        className="h-12 bg-black/20 border-white/10 text-white [color-scheme:dark] focus:border-primary/50 focus:ring-primary/20 transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="dataAberturaFim" className="text-base font-semibold flex items-center gap-2 text-white/90">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        Abertura - Até
                                    </Label>
                                    <Input
                                        id="dataAberturaFim"
                                        type="date"
                                        value={formData.dataAberturaFim}
                                        onChange={(e) => handleInputChange('dataAberturaFim', e.target.value)}
                                        className="h-12 bg-black/20 border-white/10 text-white [color-scheme:dark] focus:border-primary/50 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="capitalSocialMin" className="text-base font-semibold flex items-center gap-2 text-white/90">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        Capital Social Mínimo (R$)
                                    </Label>
                                    <Input
                                        id="capitalSocialMin"
                                        type="number"
                                        placeholder="0"
                                        value={formData.capitalSocialMin}
                                        onChange={(e) => handleInputChange('capitalSocialMin', e.target.value)}
                                        min="0"
                                        className="h-12 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="capitalSocialMax" className="text-base font-semibold flex items-center gap-2 text-white/90">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        Capital Social Máximo (R$)
                                    </Label>
                                    <Input
                                        id="capitalSocialMax"
                                        type="number"
                                        placeholder="0"
                                        value={formData.capitalSocialMax}
                                        onChange={(e) => handleInputChange('capitalSocialMax', e.target.value)}
                                        min="0"
                                        className="h-12 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>


                        </TabsContent>

                        {/* Tab 4: Filtros Avançados */}
                        <TabsContent value="filtros" className="space-y-6 overflow-visible">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* MEI Filters */}
                                <div className="glass p-4 rounded-xl space-y-4 border border-border/50">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">MEI</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                                            <Label htmlFor="somenteMEI" className="cursor-pointer flex-1 group-hover:text-foreground">
                                                Somente MEI
                                            </Label>
                                            <Switch
                                                id="somente MEI"
                                                checked={formData.somenteMEI}
                                                onCheckedChange={(checked) => handleInputChange('somenteMEI', checked)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                                            <Label htmlFor="excluirMEI" className="cursor-pointer flex-1 group-hover:text-foreground">
                                                Excluir MEI
                                            </Label>
                                            <Switch
                                                id="excluirMEI"
                                                checked={formData.excluirMEI}
                                                onCheckedChange={(checked) => handleInputChange('excluirMEI', checked)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Tipo de Estabelecimento */}
                                <div className="glass p-4 rounded-xl space-y-4 border border-border/50">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Estabelecimento</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                                            <Label htmlFor="somenteMatriz" className="cursor-pointer flex-1 group-hover:text-foreground">
                                                Somente Matriz
                                            </Label>
                                            <Switch
                                                id="somenteMatriz"
                                                checked={formData.somenteMatriz}
                                                onCheckedChange={(checked) => handleInputChange('somenteMatriz', checked)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                                            <Label htmlFor="somenteFilial" className="cursor-pointer flex-1 group-hover:text-foreground">
                                                Somente Filial
                                            </Label>
                                            <Switch
                                                id="somenteFilial"
                                                checked={formData.somenteFilial}
                                                onCheckedChange={(checked) => handleInputChange('somenteFilial', checked)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contato */}
                                <div className="glass p-4 rounded-xl space-y-4 border border-border/50">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Contato</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                                            <Label htmlFor="comTelefone" className="cursor-pointer flex-1 group-hover:text-foreground">
                                                Com Telefone
                                            </Label>
                                            <Switch
                                                id="comTelefone"
                                                checked={formData.comTelefone}
                                                onCheckedChange={(checked) => handleInputChange('comTelefone', checked)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                                            <Label htmlFor="comEmail" className="cursor-pointer flex-1 group-hover:text-foreground">
                                                Com Email
                                            </Label>
                                            <Switch
                                                id="comEmail"
                                                checked={formData.comEmail}
                                                onCheckedChange={(checked) => handleInputChange('comEmail', checked)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Tipo de Telefone */}
                                <div className="glass p-4 rounded-xl space-y-4 border border-border/50">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Tipo de Telefone</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                                            <Label htmlFor="somenteFixo" className="cursor-pointer flex-1 group-hover:text-foreground">
                                                Somente Fixo
                                            </Label>
                                            <Switch
                                                id="somenteFixo"
                                                checked={formData.somenteFixo}
                                                onCheckedChange={(checked) => handleInputChange('somenteFixo', checked)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                                            <Label htmlFor="somenteCelular" className="cursor-pointer flex-1 group-hover:text-foreground">
                                                Somente Celular
                                            </Label>
                                            <Switch
                                                id="somenteCelular"
                                                checked={formData.somenteCelular}
                                                onCheckedChange={(checked) => handleInputChange('somenteCelular', checked)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>


                    {/* Error Display */}
                    {error && (
                        <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 animate-fade-in">
                            <p className="text-sm text-destructive font-medium">{error}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </form>
    );
}
