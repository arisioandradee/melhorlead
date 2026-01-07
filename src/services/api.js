import axios from 'axios';
import { formatDateToAPI } from '../utils/formatters';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.casadosdados.com.br';
const API_KEY = import.meta.env.VITE_API_KEY;
const N8N_WEBHOOK = 'https://webhook.dibaisales.com.br/webhook/a5fb2dac-c827-44c8-971d-439b8fe139e3';

// Envia os resultados da API para o webhook do n8n
const sendToN8nWebhook = async (data) => {
    try {
        await axios.post(N8N_WEBHOOK, {
            timestamp: new Date().toISOString(),
            totalResults: data.total || 0,
            companies: data.cnpjs || [],
            source: 'Casa dos Dados API'
        });
        console.log('✅ Dados enviados para n8n webhook com sucesso');
    } catch (error) {
        console.error('❌ Erro ao enviar para n8n webhook:', error.message);
        // Não falha a operação principal se o webhook falhar
    }
};

// Formata os dados do formulário para o formato esperado pela API
export const formatSearchPayload = (formData) => {
    const payload = {};

    // Busca textual (Razão Social / Nome Fantasia)
    if (formData.razaoSocial || formData.nomeFantasia) {
        payload.busca_textual = [{
            texto: [formData.razaoSocial || formData.nomeFantasia].filter(Boolean),
            tipo_busca: 'radical',
            razao_social: !!formData.razaoSocial,
            nome_fantasia: !!formData.nomeFantasia,
        }];
    }

    // CNAE Principal (aceita múltiplos)
    if (formData.cnae) {
        console.log('🔍 CNAE DEBUG - Valor bruto recebido:', formData.cnae, 'Tipo:', typeof formData.cnae);

        // Converte para array se for Set ou outro tipo
        const cnaeArray = Array.isArray(formData.cnae)
            ? formData.cnae
            : (formData.cnae instanceof Set ? Array.from(formData.cnae) : [formData.cnae]);

        console.log('🔍 CNAE DEBUG - Após conversão para array:', cnaeArray);

        if (cnaeArray.length > 0) {
            // Normaliza códigos CNAE para formato aceito pela API
            const normalized = cnaeArray.map(code => {
                // Remove formatação SE houver, mas aceita string limpa
                let clean = String(code).replace(/[^\d]/g, '');
                console.log(`🔍 CNAE DEBUG - Normalizando "${code}" -> "${clean}"`);

                // IMPORTANTE: Alguns CNAEs podem ter 5 ou 7 dígitos.
                // Se tiver 7, manda 7. Se tiver menos, faz padStart.
                if (clean.length > 0) {
                    const padded = clean.padEnd(7, '0').slice(0, 7);
                    console.log(`🔍 CNAE DEBUG - Após padding: "${padded}"`);
                    return padded;
                }
                return null;
            }).filter(Boolean); // Remove nulos

            console.log('🔍 CNAE DEBUG - CNAEs normalizados finais:', normalized);

            // Só adiciona se tiver CNAEs válidos
            if (normalized.length > 0) {
                payload.codigo_atividade_principal = normalized;
                console.log('✅ CNAEs adicionados ao payload:', normalized);
            } else {
                console.warn('⚠️ CNAE DEBUG - Nenhum CNAE válido após normalização!');
            }
        } else {
            console.warn('⚠️ CNAE DEBUG - Array de CNAEs vazio!');
        }
    } else {
        console.log('ℹ️ CNAE DEBUG - formData.cnae está vazio/undefined');
    }

    // Natureza Jurídica
    if (formData.naturezaJuridica) {
        payload.codigo_natureza_juridica = [formData.naturezaJuridica];
    }

    // Situação Cadastral - API espera STRING ("ATIVA"), não número!
    if (formData.situacaoCadastral) {
        const situacaoMap = {
            '1': 'ATIVA', '2': 'INAPTA', '3': 'SUSPENSA', '4': 'NULA', '5': 'BAIXADA',
            'ATIVA': 'ATIVA'
        };
        payload.situacao_cadastral = [situacaoMap[formData.situacaoCadastral] || 'ATIVA'];
        console.log('📊 Situação:', payload.situacao_cadastral[0]);
    }

    // Localização
    console.log('🏛️ [PAYLOAD DEBUG] formData.uf:', formData.uf);
    if (formData.uf && Array.isArray(formData.uf)) {
        const ufs = formData.uf.filter(u => u && typeof u === 'string' && u.trim() !== '');
        if (ufs.length > 0) {
            payload.uf = ufs.map(u => u.toUpperCase());
        }
    }
    if (formData.municipio) {
        payload.municipio = [formData.municipio.toLowerCase()];
    }
    if (formData.bairro) {
        payload.bairro = [formData.bairro.toLowerCase()];
    }
    if (formData.cep) {
        payload.cep = [formData.cep.replace(/\D/g, '')];
    }
    if (formData.ddd) {
        payload.ddd = [formData.ddd];
    }

    // Data de Abertura
    if (formData.dataAberturaInicio || formData.dataAberturaFim) {
        payload.data_abertura = {};
        if (formData.dataAberturaInicio) {
            payload.data_abertura.inicio = formatDateToAPI(formData.dataAberturaInicio);
        }
        if (formData.dataAberturaFim) {
            payload.data_abertura.fim = formatDateToAPI(formData.dataAberturaFim);
        }
    }

    // Capital Social
    if (formData.capitalSocialMin || formData.capitalSocialMax) {
        payload.capital_social = {};
        if (formData.capitalSocialMin) {
            payload.capital_social.minimo = formData.capitalSocialMin;
        }
        if (formData.capitalSocialMax) {
            payload.capital_social.maximo = formData.capitalSocialMax;
        }
    }

    // Filtros adicionais
    const maisFiltros = {};

    if (formData.somenteMatriz) maisFiltros.somente_matriz = true;
    if (formData.somenteFilial) maisFiltros.somente_filial = true;
    if (formData.comEmail) maisFiltros.com_email = true;
    if (formData.comTelefone) maisFiltros.com_telefone = true;
    if (formData.somenteFixo) maisFiltros.somente_fixo = true;
    if (formData.somenteCelular) maisFiltros.somente_celular = true;

    if (Object.keys(maisFiltros).length > 0) {
        payload.mais_filtros = maisFiltros;
    }

    // MEI
    const mei = {};
    if (formData.somenteMEI) mei.optante = true;
    if (formData.excluirMEI) mei.excluir_optante = true;

    if (Object.keys(mei).length > 0) {
        payload.mei = mei;
    }

    // Limite de resultados (API aceita no máximo 1000)
    payload.limite = Math.min(formData.limite || 50, 1000);

    // Paginação
    if (formData.pagina) {
        payload.pagina = formData.pagina;
    }

    return payload;
};

/**
 * Busca empresas com paginação automática para superar o limite de 1000 resultados.
 * Otimizado para consumir o mínimo de créditos possível.
 * 
 * @param {Object} searchData - Payload formatado da busca
 * @param {number} totalDesired - Quantidade total de resultados desejada
 * @param {Function} onProgress - Callback para atualizar progresso (currentPage, totalPages, fetchedCount)
 */
export const searchCompaniesWithPagination = async (searchData, totalDesired, onProgress) => {
    // 1. Primeira requisição rápida para descobrir o total disponível (limite 1 economiza tempo/dados)
    const probeResponse = await searchCompanies({
        ...searchData,
        limite: 1,
        pagina: 1
    });

    if (!probeResponse.success) return probeResponse;

    const totalAvailable = probeResponse.data?.total || 0;
    const finalTotalToFetch = Math.min(totalDesired, totalAvailable);

    if (finalTotalToFetch <= 0) {
        return { success: true, data: { total: totalAvailable, cnpjs: [] } };
    }

    // 2. Cálculo de eficiência (EX: 1200 resultados -> 2 páginas de 600 cada = 1200 créditos consumidos)
    const numPages = Math.ceil(finalTotalToFetch / 1000);
    const resultsPerPage = Math.ceil(finalTotalToFetch / numPages);

    const allCompanies = [];
    console.log(`📊 Otimização: Buscando ${finalTotalToFetch} empresas em ${numPages} páginas de ${resultsPerPage} cada.`);

    // 3. Loop de busca
    for (let currentPagina = 1; currentPagina <= numPages; currentPagina++) {
        // Na última página, pode ser que precisemos de menos para bater o total exato
        const remaining = finalTotalToFetch - allCompanies.length;
        const currentLimite = Math.min(resultsPerPage, remaining);

        if (currentLimite <= 0) break;

        const result = await searchCompanies({
            ...searchData,
            limite: currentLimite,
            pagina: currentPagina
        });

        if (result.success) {
            const pageCNPJs = result.data?.cnpjs || [];
            allCompanies.push(...pageCNPJs);
            onProgress?.(currentPagina, numPages, allCompanies.length);

            if (allCompanies.length >= finalTotalToFetch) break;
        } else {
            console.warn(`⚠️ Erro ao buscar página ${currentPagina}:`, result.error);
            // Se falhou a primeira página, retorna o erro. Se falhou no meio, retorna o que tem.
            if (allCompanies.length === 0) return result;
            break;
        }
    }

    return {
        success: true,
        data: {
            total: totalAvailable,
            cnpjs: allCompanies.slice(0, finalTotalToFetch)
        }
    };
};

// Busca empresas na API (usando tipo_resultado=completo para obter TODOS os dados)
export const searchCompanies = async (searchData, tipoResultado = 'completo') => {
    try {
        const url = `${API_URL}/v5/cnpj/pesquisa?tipo_resultado=${tipoResultado}`;
        console.log('🔍 API Request:', {
            url,
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY ? '***' + API_KEY.slice(-10) : 'NOT_SET',
            },
            payload: searchData,
        });

        const response = await axios.post(
            url,
            searchData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': API_KEY,
                },
            }
        );

        console.log('🎯 RESPOSTA Casa dos Dados:', JSON.stringify(response.data, null, 2));

        // Envia para n8n em BACKGROUND (não bloqueia)
        // DESABILITADO: Só envia quando clica em baixar relatório (pedido do usuário)
        /* sendToN8nWebhook(response.data).catch(err =>
            console.warn('⚠️ N8n webhook falhou (não crítico):', err.message)
        ); */

        // Retorna SEMPRE os dados para o front (mesmo se n8n falhar)
        const empresasCount = response.data?.total || response.data?.cnpjs?.length || 0;
        console.log('✅ Casa dos Dados retornou:', empresasCount, 'empresas');
        const ufStatus = searchData.uf ? `[${searchData.uf.length} UFs: ${searchData.uf.join(', ')}]` : '[BRASIL TODO]';
        console.log(`📊 Payload enviado foi ${ufStatus}:`, JSON.stringify(searchData, null, 2));
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error('❌ Erro na busca:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: {
                url: error.config?.url,
                method: error.config?.method,
            },
        });

        let errorMessage = 'Erro ao buscar empresas';

        if (error.response) {
            switch (error.response.status) {
                case 400:
                    errorMessage = 'Dados inválidos. Verifique os filtros aplicados.';
                    break;
                case 401:
                    errorMessage = 'API key inválida';
                    break;
                case 403:
                    errorMessage = 'Sem saldo para realizar a operação';
                    break;
                case 404:
                    errorMessage = 'Endpoint não encontrado. Verifique a URL da API.';
                    break;
                default:
                    errorMessage = error.response.data?.message || errorMessage;
            }
        } else if (error.request) {
            errorMessage = 'Sem resposta do servidor. Verifique sua conexão.';
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
};
