/**
 * Wrapper para Web Worker de busca de CNAEs
 * Fornece interface Promise-based para o worker
 */

let worker = null;
let isReady = false;
let messageId = 0;
const pendingMessages = new Map();

/**
 * Inicializa o worker
 */
export function initCNAEWorker() {
    if (worker) return worker;

    try {
        worker = new Worker(
            new URL('../workers/cnaeSearchWorker.js', import.meta.url),
            { type: 'module' }
        );

        worker.onmessage = handleWorkerMessage;
        worker.onerror = handleWorkerError;

        console.log('✅ CNAE Worker inicializado');
    } catch (error) {
        console.error('❌ Erro ao inicializar worker:', error);
        worker = null;
    }

    return worker;
}

/**
 * Gerencia mensagens recebidas do worker
 */
function handleWorkerMessage(e) {
    const { type, id, ...payload } = e.data;

    // Resolve promise pendente
    if (id && pendingMessages.has(id)) {
        const { resolve, reject } = pendingMessages.get(id);
        pendingMessages.delete(id);

        if (type === 'ERROR') {
            reject(new Error(payload.error));
        } else {
            resolve(payload);
        }
    }

    // Handlers especiais
    if (type === 'CNAES_LOADED') {
        isReady = true;
        console.log(`✅ ${payload.count} CNAEs carregados no worker`);
    }
}

/**
 * Gerencia erros do worker
 */
function handleWorkerError(error) {
    console.error('❌ Worker error:', error);

    // Rejeita todas as promises pendentes
    pendingMessages.forEach(({ reject }) => {
        reject(new Error('Worker error'));
    });
    pendingMessages.clear();
}

/**
 * Envia mensagem e retorna Promise
 */
function sendMessage(type, payload) {
    return new Promise((resolve, reject) => {
        if (!worker) {
            reject(new Error('Worker not initialized'));
            return;
        }

        const id = ++messageId;
        pendingMessages.set(id, { resolve, reject });

        // Timeout de 10s
        setTimeout(() => {
            if (pendingMessages.has(id)) {
                pendingMessages.delete(id);
                reject(new Error('Worker timeout'));
            }
        }, 10000);

        worker.postMessage({ type, payload, id });
    });
}

/**
 * Carrega CNAEs no worker
 */
export async function loadCNAEsIntoWorker(cnaes) {
    const w = initCNAEWorker();
    if (!w) {
        throw new Error('Worker not available');
    }

    const result = await sendMessage('LOAD_CNAES', cnaes);
    console.log(`📊 ${result.count} CNAEs carregados no worker`);
    return result;
}

/**
 * Busca CNAEs com options
 */
export async function searchCNAEs(query, options = {}) {
    if (!worker || !isReady) {
        throw new Error('Worker not ready');
    }

    const result = await sendMessage('SEARCH', { query, options });
    return result.results;
}

/**
 * Busca fuzzy
 */
export async function fuzzySearchCNAEs(term, maxResults = 5) {
    if (!worker || !isReady) {
        throw new Error('Worker not ready');
    }

    const result = await sendMessage('FUZZY_SEARCH', { term, maxResults });
    return result.results;
}

/**
 * Verifica status do worker
 */
export async function getWorkerStatus() {
    if (!worker) {
        return { isLoaded: false, count: 0, available: false };
    }

    try {
        const result = await sendMessage('GET_STATUS', {});
        return { ...result, available: true };
    } catch (error) {
        return { isLoaded: false, count: 0, available: false };
    }
}

/**
 * Limpa dados do worker
 */
export async function clearWorker() {
    if (!worker) return;

    await sendMessage('CLEAR', {});
    isReady = false;
    console.log('🗑️ Worker limpo');
}

/**
 * Termina o worker
 */
export function terminateWorker() {
    if (worker) {
        worker.terminate();
        worker = null;
        isReady = false;
        pendingMessages.clear();
        console.log('⏹️ Worker terminado');
    }
}

/**
 * Verifica se worker está disponível
 */
export function isWorkerAvailable() {
    return worker !== null && isReady;
}

/**
 * Auto-inicializa quando módulo é importado
 */
if (typeof window !== 'undefined' && window.Worker) {
    initCNAEWorker();
} else {
    console.warn('⚠️ Web Workers não suportados neste ambiente');
}
