import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

// Mapeamento EXPLÍCITO: termo → CNAEs corretos com descrição
// ISSO EVITA ALUCINAÇÕES DA IA (ex: sugerir UTI móvel para dentista)
const EXPLICIT_CNAE_MAP = {
    'dentista': [
        { code: '8630503', description: 'Atividade de atenção ambulatorial executada por odontólogos' },
        { code: '8630504', description: 'Atividade odontológica' },
        { code: '3250702', description: 'Fabricação de próteses dentárias' }
    ],
    'odontologia': [
        { code: '8630503', description: 'Atividade de atenção ambulatorial executada por odontólogos' },
        { code: '8630504', description: 'Atividade odontológica' },
        { code: '3250702', description: 'Fabricação de próteses dentárias' }
    ],
    'médico': [
        { code: '8630501', description: 'Atividade médica ambulatorial com recursos para realização de procedimentos cirúrgicos' },
        { code: '8630502', description: 'Atividade médica ambulatorial com recursos para realização de exames complementares' },
        { code: '8630503', description: 'Atividade de atenção ambulatorial executada por médicos e odontólogos' }
    ],
    'advogado': [
        { code: '6911701', description: 'Serviços advocatícios' }
    ],
    'contador': [
        { code: '6920601', description: 'Atividades de contabilidade' }
    ],
    'comercio': [
        { code: '4712100', description: 'Comércio varejista de mercadorias em geral (minimercados, mercearias)' }
    ],
    'ótica': [
        { code: '4774100', description: 'Comércio varejista de artigos de óptica' }
    ],
    'otica': [
        { code: '4774100', description: 'Comércio varejista de artigos de óptica' }
    ]
};

// ... (SYNONYM_DICT mantido igual se necessário, ou removido se não usado) ...
const SYNONYM_DICT = {
    'dentista': ['odontologia', 'dental'],
    'médico': ['medicina'],
    'advogado': ['advocacia'],
};

function expandWithSynonyms(searchTerm) {
    // ... mantido ...
    const term = searchTerm.toLowerCase().trim();
    return [term];
}

export async function findCNAEsByAI(description, cnaeList) {
    if (!description || description.length < 2) return [];

    try {
        console.log(`🤖 Processando: "${description}"`);

        const descLower = description.toLowerCase().trim();

        // 1. VERIFICA MATCH EXPLÍCITO (SEM IA)
        // Se o usuário digitou algo exato, retornamos a resposta exata.
        for (const [term, results] of Object.entries(EXPLICIT_CNAE_MAP)) {
            if (descLower.includes(term)) {
                console.log(`✨ Match EXPLÍCITO encontrado para: "${term}"`);
                console.log(`🎯 Retornando ${results.length} CNAEs blindados (sem IA)`);

                // Formata para o padrão esperado pelo front
                return results.map(r => ({
                    code: r.code,
                    description: r.description,
                    relevance: 100, // Máxima relevância
                    rawScore: 100,
                    source: 'explicit'
                }));
            }
        }

        // 2. Se não achou explícito, usa a IA normalmente...
        // ... (código existente de fuzzy + AI) ...

        // Fallback: busca fuzzy inicial se não for explícito
        let localResults = fuzzySearchCNAEs(description, cnaeList, 50);


        // Se não achou explícito, continua com o fuzzy search
        console.log(`🔍 Buscando fuzzy para: "${description}"`);

        // IA analisa
        const cnaeListText = localResults
            .slice(0, 30)
            .map(cnae => `${cnae.code} - ${cnae.description}`)
            .join('\n');

        const prompt = `Expert CNAE do IBGE brasileiro.

TAREFA: Classificar "${description}" nos CNAEs corretos.

CNAEs PRÉ-SELECIONADOS:
${cnaeListText}

⚠️ VALIDAÇÃO OBRIGATÓRIA:
1. A CATEGORIA (saúde/comércio/TI) corresponde a "${description}"?
2. Este CNAE descreve EXATAMENTE o que foi pedido?

EXEMPLOS:
✅ "dentista" → 8630503 (SAÚDE) - CORRETO
❌ "dentista" → 6920601 (CONTABILIDADE) - ERRADO!
❌ "dentista" → 4645100 (COMÉRCIO) - ERRADO!

Priorize CNAEs ESPECÍFICOS. Evite "não especificadas".

JSON (sem markdown):
[{"code":"1234567","description":"...","confidence":0.95,"reason":"..."}]

Retorne 5 CNAEs. Seja criterioso!`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'Expert CNAE. SEMPRE valide categoria. NUNCA sugira categoria errada!' },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',  // ATUALIZADO: Mixtral descontinuado
            temperature: 0.05,
            max_tokens: 1500,
            top_p: 0.8
        });

        const responseText = chatCompletion.choices[0]?.message?.content || '[]';
        let jsonText = responseText;
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) jsonText = jsonMatch[0];

        const aiResults = JSON.parse(jsonText);
        console.log(`✅ IA: ${aiResults.length} CNAEs`, aiResults.map(r => r.code));

        // VALIDAÇÃO DESABILITADA - estava rejeitando CNAEs corretos!
        // const searchLower = description.toLowerCase();
        // const validated = aiResults.filter(r => {
        //     const fullDesc = (r.description || '').toLowerCase();
        //     if (searchLower.includes('dentist') || searchLower.includes('odonto')) {
        //         const isValid = fullDesc.includes('odonto') || fullDesc.includes('dental');
        //         if (!isValid) console.warn(`❌ REJEITADO: ${r.code} - ${fullDesc.substr(0, 50)}...`);
        //         return isValid;
        //     }
        //     return true;
        // });
        // console.log(`✅ ${validated.length} CNAEs validados`);
        // return validated.length > 0 ? validated : aiResults;

        return aiResults;

    } catch (error) {
        console.error('❌ Erro:', error);
        return fuzzySearchCNAEs(description, cnaeList, 5).map(c => ({
            code: c.code,
            description: c.description,
            confidence: 0.5,
            reason: 'Fallback'
        }));
    }
}

function fuzzySearchCNAEs(description, cnaeList, maxResults = 5) {
    const searchTermsOriginal = description.toLowerCase().split(/[^a-záàâãéêíóôõúç]+/).filter(t => t.length > 2);
    const expandedTerms = [];
    searchTermsOriginal.forEach(term => expandedTerms.push(...expandWithSynonyms(term)));
    const searchTerms = [...new Set(expandedTerms)];

    const scored = cnaeList.map(cnae => {
        const cnaeDescription = (cnae.label || cnae.description || '').toLowerCase();
        let score = 0;

        searchTerms.forEach(term => {
            const words = cnaeDescription.split(/\s+/);
            words.forEach(word => {
                if (word === term) score += 10;
                else if (word.startsWith(term)) score += 7;
                else if (word.includes(term)) score += 5;
                else if (term.length > 3 && word.substring(0, 3) === term.substring(0, 3)) score += 3;
            });
        });

        return {
            code: cnae.value || cnae.code,
            description: cnae.label || cnae.description,
            relevance: Math.min(score * 5, 100),
            rawScore: score
        };
    });

    return scored
        .filter(item => item.rawScore >= 1)
        .sort((a, b) => b.rawScore - a.rawScore)
        .slice(0, maxResults);
}

export function isAIConfigured() {
    return !!import.meta.env.VITE_GROQ_API_KEY;
}
