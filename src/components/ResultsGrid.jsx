import React from 'react';
import { CompanyCard } from './CompanyCard';
import { GridSkeleton } from './ui/skeleton';

export function ResultsGrid({ results, loading, selectedCompanies, onToggleSelection, onViewDetails }) {
    if (loading) {
        return (
            <div className="mt-8 space-y-4">
                <div className="animate-fade-in">
                    <h2 className="text-xl font-semibold text-gradient-primary animate-pulse">
                        Buscando empresas...
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Aguarde enquanto processamos sua busca
                    </p>
                </div>
                <GridSkeleton count={6} />
            </div>
        );
    }

    if (!results || results.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 space-y-6 animate-fade-in-up">
            <div className="animate-fade-in-down">
                <h2 className="text-xl font-semibold text-gradient-primary">
                    Resultados da Busca
                </h2>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                    {results.length} {results.length === 1 ? 'empresa encontrada' : 'empresas encontradas'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((company, index) => (
                    <div
                        key={company.cnpj}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <CompanyCard
                            company={company}
                            isSelected={selectedCompanies?.some(c => c.cnpj === company.cnpj)}
                            onSelect={onToggleSelection}
                            onClick={() => onViewDetails && onViewDetails(company)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
