/**
 * Serviço para adicionar variabilidade aos resultados de CNAE
 * Mantém relevância mas diversifica resultados entre buscas
 */

/**
 * Diversifica resultados mantendo os mais relevantes
 * @param {Array} results - Array de resultados com score
 * @param {Object} options - Opções de diversificação
 * @returns {Array} Resultados diversificados
 */
export function diversifyResults(results, options = {}) {
    const {
        topFixed = 3,        // Top N sempre fixos (mais relevantes)
        randomizeCount = 7,  // Próximos N randomizados
        totalReturn = 10,    // Total de resultados a retornar
        seed = Date.now()    // Seed para randomização
    } = options;

    if (!results || results.length === 0) {
        return [];
    }

    if (results.length <= topFixed) {
        return results;
    }

    // Top resultados (sempre aparecem na mesma ordem)
    const topResults = results.slice(0, topFixed);

    // Pool de resultados variáveis (próximos melhores)
    const variablePool = results.slice(topFixed, Math.min(results.length, topFixed + randomizeCount * 2));

    // Seleciona randomicamente do pool com peso por score
    const selectedVariable = weightedRandomSelection(variablePool, randomizeCount, seed);

    // Combina fixos + variáveis
    const combined = [...topResults, ...selectedVariable];

    return combined.slice(0, totalReturn);
}

/**
 * Seleção aleatória ponderada por score/weight
 */
function weightedRandomSelection(items, count, seed = Date.now()) {
    if (!items || items.length === 0) return [];
    if (items.length <= count) return items;

    const selected = [];
    const pool = items.map((item, index) => ({
        ...item,
        weight: item.score || item.weight || (items.length - index) // Peso decrescente
    }));

    // Seeded random para reprodutibilidade
    let random = seededRandom(seed);

    for (let i = 0; i < count && pool.length > 0; i++) {
        const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
        let randomValue = random() * totalWeight;

        for (let j = 0; j < pool.length; j++) {
            randomValue -= pool[j].weight;
            if (randomValue <= 0) {
                selected.push(pool[j]);
                pool.splice(j, 1);
                break;
            }
        }
    }

    return selected;
}

/**
 * Gerador de números aleatórios com seed (LCG)
 */
function seededRandom(seed) {
    let state = seed;
    return function () {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

/**
 * Cache com rotação de variantes
 */
const CACHE_VARIANTS = 3; // Número de variações em cache

export function getCachedWithVariation(key, results, diversifyOptions = {}) {
    const cacheKey = `cnae_variant_${key}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
        try {
            const { variants, lastIndex, timestamp } = JSON.parse(cached);

            // Verifica se cache ainda é válido (5 minutos)
            if (Date.now() - timestamp < 5 * 60 * 1000) {
                // Rotaciona entre variantes a cada busca
                const nextIndex = (lastIndex + 1) % variants.length;

                sessionStorage.setItem(cacheKey, JSON.stringify({
                    variants,
                    lastIndex: nextIndex,
                    timestamp
                }));

                console.log(`🔄 Usando variante ${nextIndex + 1}/${variants.length}`);
                return variants[nextIndex];
            }
        } catch (e) {
            console.warn('Cache de variantes corrompido');
        }
    }

    // Cria novas variantes
    const variants = [];
    for (let i = 0; i < CACHE_VARIANTS; i++) {
        const seed = Date.now() + i * 1000; // Seeds diferentes
        variants.push(diversifyResults(results, { ...diversifyOptions, seed }));
    }

    sessionStorage.setItem(cacheKey, JSON.stringify({
        variants,
        lastIndex: 0,
        timestamp: Date.now()
    }));

    console.log(`✨ Criadas ${CACHE_VARIANTS} variantes de resultados`);
    return variants[0];
}

/**
 * Limpa cache de variantes
 */
export function clearVariantCache() {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
        if (key.startsWith('cnae_variant_')) {
            sessionStorage.removeItem(key);
        }
    });
    console.log('🗑️ Cache de variantes limpo');
}

/**
 * Embaralha array mantendo os primeiros N fixos
 */
export function shuffleKeepingTop(array, keepTop = 3) {
    if (!array || array.length <= keepTop) return array;

    const fixed = array.slice(0, keepTop);
    const toShuffle = array.slice(keepTop);

    // Fisher-Yates shuffle
    for (let i = toShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [toShuffle[i], toShuffle[j]] = [toShuffle[j], toShuffle[i]];
    }

    return [...fixed, ...toShuffle];
}

/**
 * Calcula hash simples de string para usar como seed
 */
export function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}
