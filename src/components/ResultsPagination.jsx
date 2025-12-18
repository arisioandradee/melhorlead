import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ResultsPagination({
    totalResults,
    resultsPerPage,
    currentPage,
    onPageChange,
    onResultsPerPageChange
}) {
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    const startIndex = (currentPage - 1) * resultsPerPage + 1;
    const endIndex = Math.min(currentPage * resultsPerPage, totalResults);

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    if (totalResults === 0) {
        return null;
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-border/50">
            {/* Results Info */}
            <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                    Mostrando <span className="font-medium text-foreground">{startIndex}</span> a{' '}
                    <span className="font-medium text-foreground">{endIndex}</span> de{' '}
                    <span className="font-medium text-foreground">{totalResults}</span> resultados
                </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                {/* Results Per Page Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Por página:</span>
                    <Select
                        value={resultsPerPage.toString()}
                        onValueChange={(value) => {
                            onResultsPerPageChange(parseInt(value));
                            onPageChange(1); // Reset to first page when changing per-page
                        }}
                    >
                        <SelectTrigger className="w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="h-8"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Anterior</span>
                    </Button>

                    <span className="text-sm text-muted-foreground">
                        Página <span className="font-medium text-foreground">{currentPage}</span> de{' '}
                        <span className="font-medium text-foreground">{totalPages}</span>
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="h-8"
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Próxima</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
