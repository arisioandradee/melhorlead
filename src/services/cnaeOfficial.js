/**
 * Serviço para buscar e cachear CNAEs oficiais do IBGE
 * Base oficial: CNAE 2.3 - CONCLA/IBGE
 */

const IBGE_CNAE_API = 'https://servicodados.ibge.gov.br/api/v2/cnae/classes';
const CACHE_KEY = 'cnae_oficial_cache';
const CACHE_VERSION = '1.0';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

/**
 * Busca CNAEs oficiais do IBGE com cache
 */
export async function fetchOfficialCNAEs() {
    try {
        // Verifica cache válido
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const { data, timestamp, version } = JSON.parse(cached);

                // Valida versão e timestamp
                if (version === CACHE_VERSION && Date.now() - timestamp < CACHE_DURATION) {
                    console.log('✅ Usando CNAEs do cache local');
                    return data;
                }
            } catch (e) {
                console.warn('Cache corrompido, removendo...');
                localStorage.removeItem(CACHE_KEY);
            }
        }

        console.log('📡 Buscando CNAEs oficiais do IBGE...');
        const response = await fetch(IBGE_CNAE_API);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Normaliza formato para compatibilidade com sistema existente
        const normalized = data.map(item => ({
            value: formatCNAECode(item.id),
            label: `${item.id} - ${item.descricao}`,
            description: item.descricao,
            code: item.id,
            section: item.secao?.descricao || '',
            division: item.divisao?.id || '',
            group: item.grupo?.id || '',
            official: true
        }));

        // Salva no cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: normalized,
            timestamp: Date.now(),
            version: CACHE_VERSION
        }));

        console.log(`✅ ${normalized.length} CNAEs oficiais carregados do IBGE`);
        return normalized;

    } catch (error) {
        console.error('❌ Erro ao buscar CNAEs oficiais do IBGE:', error);

        // Fallback para base local
        console.log('⚠️ Usando base local como fallback');
        return import('../utils/cnaes_completos')
            .then(m => m.CNAES_COMPLETOS)
            .catch(() => []);
    }
}

/**
 * Normaliza código CNAE para formato padrão
 * Entrada: "4711-3/01" ou "4711301"
 * Saída: "4711301" (7 dígitos sem formatação)
 */
export function formatCNAECode(code) {
    if (!code) return '';

    // Remove todos os caracteres não numéricos
    let clean = code.replace(/\D/g, '');

    // Garante 7 dígitos (completa com zeros à direita se necessário)
    return clean.padEnd(7, '0').slice(0, 7);
}

/**
 * Formata código CNAE para formato legível
 * Entrada: "4711301"
 * Saída: "4711-3/01"
 */
export function formatCNAEDisplay(code) {
    if (!code || code.length !== 7) return code;

    return `${code.slice(0, 4)}-${code.slice(4, 5)}/${code.slice(5, 7)}`;
}

/**
 * Força atualização manual da base de CNAEs
 */
export async function forceUpdateCNAEs() {
    localStorage.removeItem(CACHE_KEY);
    console.log('🔄 Forçando atualização dos CNAEs...');
    return fetchOfficialCNAEs();
}

/**
 * Busca CNAE específico por código
 */
export async function getCNAEByCode(code) {
    const cnaes = await fetchOfficialCNAEs();
    const normalized = formatCNAECode(code);
    return cnaes.find(c => formatCNAECode(c.value) === normalized);
}

/**
 * Obtém informações do cache
 */
export function getCacheInfo() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
        return { exists: false };
    }

    try {
        const { timestamp, version, data } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        const daysOld = Math.floor(age / (24 * 60 * 60 * 1000));

        return {
            exists: true,
            version,
            count: data?.length || 0,
            daysOld,
            expiresIn: Math.max(0, 7 - daysOld)
        };
    } catch {
        return { exists: false, error: true };
    }
}
