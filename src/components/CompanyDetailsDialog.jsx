import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, MapPin, Phone, Mail, Calendar, DollarSign, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CompanyDetailsDialog({ company, open, onOpenChange, isSelected, onToggleSelection }) {
    if (!company) return null;

    const formatCurrency = (value) => {
        if (!value) return 'N/A';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-[#0a0a0a] border-white/10 text-white shadow-2xl">
                {/* Header with Glass Gradient */}
                <div className="relative bg-gradient-to-r from-gray-900 to-black p-6 border-b border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 opacity-50" />

                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-3xl font-bold flex flex-col gap-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            {company.razao_social}
                            {company.nome_fantasia && company.nome_fantasia !== company.razao_social && (
                                <span className="text-xl font-normal text-white/60">{company.nome_fantasia}</span>
                            )}
                        </DialogTitle>
                        <div className="flex items-center gap-3 mt-4">
                            <Badge variant="outline" className="h-7 border-white/20 bg-white/5 text-gray-300 font-mono tracking-wider">
                                {company.cnpj}
                            </Badge>
                            <span className="flex items-center gap-1.5 text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                <Building2 className="h-3.5 w-3.5 text-primary/70" />
                                {company.natureza_juridica?.descricao || 'Natureza não informada'}
                            </span>
                        </div>
                    </DialogHeader>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1">
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Column 1: Cadastral */}
                        <div className="space-y-8">
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Dados Cadastrais
                                </h3>
                                <div className="grid gap-3">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                            <span className="text-sm text-gray-400">Situação Cadastral</span>
                                            <Badge className={company.situacao_cadastral?.situacao_atual === 'ATIVA'
                                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/20'
                                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/20'}>
                                                {company.situacao_cadastral?.situacao_atual || 'N/A'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Data de Abertura</span>
                                            <span className="font-mono text-white">{formatDate(company.situacao_cadastral?.data)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Capital Social</span>
                                            <span className="font-medium text-white">{formatCurrency(company.capital_social)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Porte</span>
                                            <span className="text-white">{company.porte || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Localização
                                </h3>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-white/5 hover:border-white/10 transition-colors">
                                    <p className="text-base text-white font-medium">
                                        {company.endereco?.logradouro}, {company.endereco?.numero} {company.endereco?.complemento}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {company.endereco?.bairro}
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                                        <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
                                            {company.endereco?.municipio} - {company.endereco?.uf}
                                        </Badge>
                                        <span className="text-sm text-gray-500 font-mono">
                                            {company.endereco?.cep}
                                        </span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Column 2: Contato & CNAE */}
                        <div className="space-y-8">
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Canais de Contato
                                </h3>
                                <div className="space-y-3">
                                    {company.telefones?.length > 0 ? (
                                        company.telefones.map((tel, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors text-sm">
                                                <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400">
                                                    <Phone className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-gray-200">({tel.ddd}) {tel.numero}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-600 italic pl-2">Sem telefone registrado</p>
                                    )}

                                    {company.emails?.length > 0 ? (
                                        company.emails.map((email, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors text-sm">
                                                <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
                                                    <Mail className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-gray-200 truncate">{email.email}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-600 italic pl-2">Sem email registrado</p>
                                    )}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Atividade Econômica Info
                                </h3>
                                <div className="p-5 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Building2 className="h-20 w-20 text-white" />
                                    </div>
                                    <p className="text-xs font-bold text-primary/80 uppercase mb-2">CNAE Principal</p>
                                    <p className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                                        {company.atividade_principal?.codigo}
                                    </p>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        {company.atividade_principal?.descricao}
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>
                </ScrollArea>

                {/* Footer Action */}
                <DialogFooter className="p-6 border-t border-white/10 bg-black/40 shrink-0 flex-row justify-between items-center backdrop-blur-sm">
                    <div className="text-sm">
                        {isSelected ? (
                            <span className="flex items-center gap-2 text-emerald-400 font-medium animate-in fade-in slide-in-from-left-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Empresa Selecionada
                            </span>
                        ) : (
                            <span className="text-gray-500">
                                Adicione à lista para exportar os dados
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-gray-400 hover:text-white hover:bg-white/10"
                        >
                            Fechar
                        </Button>
                        <Button
                            className={`
                                gap-2 font-medium transition-all duration-300 shadow-lg
                                ${isSelected
                                    ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-500/20"
                                }
                            `}
                            onClick={() => onToggleSelection(company)}
                        >
                            {isSelected ? (
                                <>
                                    <XCircle className="h-4 w-4" />
                                    Remover
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Adicionar à Lista
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
