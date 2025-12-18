/**
 * Web Worker para busca de CNAEs
 * Executa em thread separado para não travar a UI
 */

let cnaeDatabase = [];
let isLoaded = false;

// Recebe mensagens do thread principal
self.onmessage = async (e) => {
    const { type, payload, id } = e.data;

    try {
        switch (type) {
            case 'LOAD_CNAES':
                cnaeDatabase = payload;
                isLoaded = true;
                self.postMessage({
                    type: 'CNAES_LOADED',
                    count: cnaeDatabase.length,
                    id
                });
                break;

            case 'SEARCH':
                if (!isLoaded) {
                    self.postMessage({
                        type: 'ERROR',
                        error: 'Database not loaded',
                        id
                    });
                    return;
                }
                const results = performSearch(payload.query, payload.options);
                self.postMessage({
                    type: 'SEARCH_RESULTS',
                    results,
                    id
                });
                break;

            case 'FUZZY_SEARCH':
                if (!isLoaded) {
                    self.postMessage({
                        type: 'ERROR',
                        error: 'Database not loaded',
                        id
                    });
                    return;
                }
                const fuzzyResults = fuzzySearch(payload.term, payload.maxResults);
                self.postMessage({
                    type: 'FUZZY_RESULTS',
                    results: fuzzyResults,
                    id
                });
                break;

            case 'GET_STATUS':
                self.postMessage({
                    type: 'STATUS',
                    isLoaded,
                    count: cnaeDatabase.length,
                    id
                });
                break;

            case 'CLEAR':
                cnaeDatabase = [];
                isLoaded = false;
                self.postMessage({ type: 'CLEARED', id });
                break;

            default:
                self.postMessage({
                    type: 'ERROR',
                    error: `Unknown message type: ${type}`,
                    id
                });
        }
    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            error: error.message,
            id
        });
    }
};

/**
 * Busca principal com scoring
 */
function performSearch(query, options = {}) {
    const startTime = performance.now();
    const {
        maxResults = 50,
        minScore = 0.3,
        boostSemantic = true
    } = options;

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    const scored = cnaeDatabase.map(cnae => {
        const score = calculateScore(queryLower, queryWords, cnae, boostSemantic);
        return { ...cnae, score };
    })
        .filter(c => c.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);

    const endTime = performance.now();

    console.log(`⚡ Worker: Busca completada em ${Math.round(endTime - startTime)}ms - ${scored.length} resultados`);

    return scored;
}

/**
 * Calcula score de relevância
 */
function calculateScore(queryLower, queryWords, cnae, boostSemantic) {
    const descLower = (cnae.description || cnae.label || '').toLowerCase();
    const codeLower = (cnae.code || cnae.value || '').toLowerCase();

    let score = 0;

    // 1. Match exato na descrição
    if (descLower === queryLower) {
        score += 1.0;
    }

    // 2. Descrição começa com query
    if (descLower.startsWith(queryLower)) {
        score += 0.8;
    }

    // 3. Contém query completa
    if (descLower.includes(queryLower)) {
        score += 0.6;
    }

    // 4. Match no código
    if (codeLower.includes(queryLower.replace(/\D/g, ''))) {
        score += 0.7;
    }

    // 5. Match de palavras individuais
    const wordMatches = queryWords.filter(word => descLower.includes(word)).length;
    if (queryWords.length > 0) {
        score += (wordMatches / queryWords.length) * 0.5;
    }

    // 6. Boost semântico (se disponível)
    if (boostSemantic && cnae.semanticBoost) {
        score += cnae.semanticBoost;
    }

    // 7. Penalidade por CNAEs genéricos
    if (descLower.includes('não especificado') || descLower.includes('outras atividades')) {
        score *= 0.7;
    }

    // 8. Boost para CNAEs sugeridos
    if (cnae.isSuggested) {
        score += 0.2;
    }

    return Math.min(score, 1.0);
}

/**
 * Busca fuzzy simplificada
 */
function fuzzySearch(term, maxResults = 5) {
    return performSearch(term, {
        maxResults,
        minScore: 0.2,
        boostSemantic: true
    });
}

/**
 * Busca por código específico
 */
function searchByCode(code) {
    const normalizedCode = code.replace(/\D/g, '');
    return cnaeDatabase.find(c =>
        (c.code || c.value || '').replace(/\D/g, '') === normalizedCode
    );
}

/**
 * Busca por seção
 */
function searchBySection(section) {
    return cnaeDatabase.filter(c =>
        (c.section || '').toLowerCase().includes(section.toLowerCase())
    );
}

// Log de inicialização
console.log('⚡ CNAE Search Worker inicializado');
