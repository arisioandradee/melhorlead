import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Phone, Mail, Calendar, DollarSign, Users } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export function CompanyCard({ company, isSelected, onSelect, onClick }) {
    const formatCNPJ = (cnpj) => {
        if (!cnpj) return 'N/A';
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    };

    // ... formatting functions ...

    const getStatusColor = (status) => {
        const statusColors = {
            'ATIVA': 'bg-green-500/20 text-green-400 border-green-500/30',
            'BAIXADA': 'bg-red-500/20 text-red-400 border-red-500/30',
            'SUSPENSA': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            'INAPTA': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            'NULA': 'bg-muted text-muted-foreground border-border'
        };
        return statusColors[status] || 'bg-muted text-muted-foreground border-border';
    };

    return (
        <Card
            className={`group relative overflow-hidden border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 cursor-pointer h-[240px] flex flex-col ${isSelected ? 'ring-2 ring-primary border-primary/50 bg-primary/5' : ''}`}
            onClick={onClick}
        >
            {/* Selection Indicator */}
            <div className="absolute top-3 right-3 z-10">
                <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected
                        ? 'bg-primary border-primary shadow-[0_0_15px_rgba(var(--primary),0.6)] scale-110'
                        : 'border-white/20 bg-black/40 group-hover:border-white/60 hover:scale-110'
                        }`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(company);
                    }}
                >
                    {isSelected && <Users className="h-3.5 w-3.5 text-white" />}
                </div>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Header */}
            <div className="relative p-5 border-b border-white/5 bg-white/5">
                <div className="flex items-start justify-between pr-8">
                    <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="text-lg font-bold text-white truncate group-hover:text-primary transition-colors duration-300">
                            {company.razao_social || company.nome_fantasia || 'Empresa Sem Nome'}
                        </h3>
                        {company.nome_fantasia && company.razao_social !== company.nome_fantasia && (
                            <p className="text-sm text-gray-400 truncate group-hover:text-gray-300 transition-colors">
                                {company.nome_fantasia}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-3">
                    <Badge className={`
                        ${getStatusColor(
                        typeof company.situacao_cadastral === 'object'
                            ? company.situacao_cadastral?.situacao_atual
                            : company.situacao_cadastral
                    )} border-0 backdrop-blur-md px-2.5 py-0.5 text-xs font-semibold
                    `}>
                        {typeof company.situacao_cadastral === 'object'
                            ? company.situacao_cadastral?.situacao_atual || 'N/A'
                            : company.situacao_cadastral || 'N/A'}
                    </Badge>
                    <span className="font-mono text-xs text-gray-500">
                        {formatCNPJ(company.cnpj)}
                    </span>
                </div>
            </div>

            <CardContent className="p-5 space-y-2 flex-1 flex flex-col">
                {/* CNAE */}
                {company.cnae_fiscal_descricao && (
                    <div className="group/cnae relative p-2 rounded-lg bg-white/5 border border-white/5 transition-colors hover:bg-white/10 hover:border-white/10">
                        <div className="flex items-start gap-3">
                            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                <Users className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mb-0.5">Atividade Principal</p>
                                <p className="text-xs text-gray-200 line-clamp-1">
                                    {company.cnae_fiscal_descricao}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Location */}
                {(company.municipio || company.uf) && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                        <MapPin className="h-3.5 w-3.5 text-primary/50" />
                        <span className="truncate">
                            {[company.bairro, company.municipio, company.uf]
                                .filter(Boolean)
                                .join(', ') || 'Endereço não informado'}
                        </span>
                    </div>
                )}

                {/* Contact Info */}
                <div className="grid grid-cols-1 gap-1">
                    {company.ddd_telefone_1 && (
                        <div className="flex items-center gap-2 text-xs p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                            <Phone className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                            <span className="text-blue-100 font-medium">({company.ddd_telefone_1}) {company.telefone_1}</span>
                        </div>
                    )}
                    {company.email && (
                        <div className="flex items-center gap-2 text-xs p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                            <Mail className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                            <span className="text-purple-100 truncate">{company.email}</span>
                        </div>
                    )}
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                    {company.data_inicio_atividade && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-300">
                            <Calendar className="h-4 w-4 text-primary/50" />
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Início</p>
                                <p className="font-medium">
                                    {new Date(company.data_inicio_atividade).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    )}
                    {company.capital_social && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-300">
                            <DollarSign className="h-4 w-4 text-primary/50" />
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Capital</p>
                                <p className="font-medium">
                                    {formatCurrency(company.capital_social)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {company.opcao_pelo_mei && (
                        <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20 px-2 py-0.5">
                            MEI
                        </Badge>
                    )}
                    {company.identificador_matriz_filial && (
                        <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20 px-2 py-0.5">
                            {company.identificador_matriz_filial === '1' ? 'Matriz' : 'Filial'}
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
