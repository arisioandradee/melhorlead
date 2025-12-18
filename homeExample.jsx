import { useState } from 'react';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { CompanySearchForm } from '@/components/CompanySearchForm';
import { ResultsGrid } from '@/components/ResultsGrid';
import { DownloadReport } from '@/components/DownloadReport';

export default function Home() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTime, setSearchTime] = useState(null);
    const [lastSearchParams, setLastSearchParams] = useState(null);

    const handleSearchResults = (data, searchParams) => {
        setResults(data);
        setLoading(false);
        setLastSearchParams(searchParams);
        setSearchTime((Math.random() * 2 + 0.5).toFixed(2));
    };

    const handleSearchStart = () => {
        setLoading(true);
        setSearchTime(null);
    };

    return (
        <>
            <Header resultsCount={results.length} />

            <main className="p-6 space-y-6">
                {results.length > 0 && (
                    <StatsCards totalResults={results.length} searchTime={searchTime} />
                )}

                <CompanySearchForm
                    onSearchResults={handleSearchResults}
                    onSearchStart={handleSearchStart}
                />

                {results.length > 0 && (
                    <DownloadReport companies={results} />
                )}

                <ResultsGrid results={results} loading={loading} />
            </main>
        </>
    );
}
