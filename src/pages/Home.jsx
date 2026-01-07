import { useState } from 'react';
import { StatsCards } from '@/components/StatsCards';
import { CompanySearchForm } from '@/components/CompanySearchForm';
import { ResultsGrid } from '@/components/ResultsGrid';
import { DownloadReport } from '@/components/DownloadReport';
import { CompanyDetailsDialog } from '@/components/CompanyDetailsDialog';
import { ResultsPagination } from '@/components/ResultsPagination';
import { Button } from '@/components/ui/button';
import { CheckSquare, Square } from 'lucide-react';

export default function Home() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTime, setSearchTime] = useState(null);
    const [lastSearchParams, setLastSearchParams] = useState(null);

    // Novo Estado para Seleção Manual
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [viewingCompany, setViewingCompany] = useState(null);

    // Client-Side Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [resultsPerPage, setResultsPerPage] = useState(10);

    const toggleSelection = (company) => {
        setSelectedCompanies(prev => {
            const exists = prev.some(c => c.cnpj === company.cnpj);
            if (exists) {
                return prev.filter(c => c.cnpj !== company.cnpj);
            }
            return [...prev, company];
        });
    };

    const selectAllResults = () => {
        setSelectedCompanies(results);
    };

    const deselectAll = () => {
        setSelectedCompanies([]);
    };

    const handleSearchResults = (data, searchParams) => {
        setResults(data);
        setLoading(false);
        setLastSearchParams(searchParams);
        setSearchTime((Math.random() * 2 + 0.5).toFixed(2));
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleSearchStart = () => {
        setLoading(true);
        setSearchTime(null);
    };

    // Calculate paginated results
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const paginatedResults = results.slice(startIndex, endIndex);

    return (
        <div className="flex flex-col min-h-screen">
            <main className="p-6 space-y-6 animate-fade-in">
                {results.length > 0 && (
                    <StatsCards totalResults={results.length} searchTime={searchTime} />
                )}

                <CompanySearchForm
                    onSearchResults={handleSearchResults}
                    onSearchStart={handleSearchStart}
                />

                {/* Bulk selection and download buttons */}
                {(results.length > 0 || selectedCompanies.length > 0) && (
                    <div className="flex items-center justify-between gap-4">
                        {/* Bulk Selection Buttons */}
                        {results.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={selectAllResults}
                                    disabled={selectedCompanies.length === results.length}
                                    className="gap-2"
                                >
                                    <CheckSquare className="h-4 w-4" />
                                    Selecionar Todos ({results.length})
                                </Button>
                                {selectedCompanies.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={deselectAll}
                                        className="gap-2"
                                    >
                                        <Square className="h-4 w-4" />
                                        Desmarcar Todos
                                    </Button>
                                )}
                                {selectedCompanies.length > 0 && (
                                    <span className="text-sm text-muted-foreground">
                                        {selectedCompanies.length} selecionada{selectedCompanies.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Download Button */}
                        <DownloadReport
                            companies={selectedCompanies.length > 0 ? selectedCompanies : results}
                            isSelectionMode={selectedCompanies.length > 0}
                        />
                    </div>
                )}

                <ResultsGrid
                    results={paginatedResults}
                    loading={loading}
                    selectedCompanies={selectedCompanies}
                    onToggleSelection={toggleSelection}
                    onViewDetails={(company) => setViewingCompany(company)}
                />

                {/* Client-Side Pagination */}
                {results.length > 0 && (
                    <ResultsPagination
                        totalResults={results.length}
                        resultsPerPage={resultsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        onResultsPerPageChange={setResultsPerPage}
                    />
                )}

                <CompanyDetailsDialog
                    company={viewingCompany}
                    open={!!viewingCompany}
                    onOpenChange={(open) => !open && setViewingCompany(null)}
                    isSelected={viewingCompany && selectedCompanies.some(c => c.cnpj === viewingCompany.cnpj)}
                    onToggleSelection={toggleSelection}
                />
            </main>
        </div>
    );
}
