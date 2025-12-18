/**
 * Expansão semântica para melhorar busca de CNAEs
 * Mapeia termos para contextos, sinônimos e CNAEs relacionados
 */

export const SEMANTIC_CONTEXT = {
    // === ALIMENTAÇÃO ===
    'padaria': {
        synonyms: ['panificadora', 'confeitaria', 'pão', 'panificação', 'padeiro'],
        related: ['alimentos', 'fabricação', 'comércio', 'varejo', 'panificados'],
        cnaes_suggested: ['4721102', '1091101', '4712100']
    },
    'restaurante': {
        synonyms: ['alimentação', 'comida', 'gastronomia', 'refeição', 'restauração'],
        related: ['serviços', 'preparo', 'culinária', 'food'],
        cnaes_suggested: ['5611201', '5611203', '5620101']
    },
    'lanchonete': {
        synonyms: ['lanche', 'fast food', 'snack bar', 'lanches'],
        related: ['alimentação', 'serviços', 'rápida'],
        cnaes_suggested: ['5611204', '5611205']
    },
    'bar': {
        synonyms: ['boteco', 'cervejaria', 'pub', 'bebida', 'bebidas'],
        related: ['serviços', 'lazer', 'entretenimento'],
        cnaes_suggested: ['5611203', '5611205']
    },
    'açougue': {
        synonyms: ['carne', 'açougueiro', 'frigorífico', 'carnes'],
        related: ['comércio', 'alimentos', 'varejo'],
        cnaes_suggested: ['4722901', '1011201']
    },
    'supermercado': {
        synonyms: ['mercado', 'mercearia', 'minimercado', 'varejo'],
        related: ['comércio', 'alimentos', 'produtos'],
        cnaes_suggested: ['4711301', '4711302']
    },

    // === SAÚDE ===
    'dentista': {
        synonyms: ['odontologia', 'odontológica', 'consultório dentário', 'dente', 'dental', 'ortodontia'],
        related: ['saúde', 'clínica', 'consultório', 'médico'],
        cnaes_suggested: ['8630503', '8630504']
    },
    'médico': {
        synonyms: ['consultório médico', 'clínica médica', 'medicina', 'consulta', 'saúde'],
        related: ['saúde', 'clínica', 'ambulatório', 'hospital'],
        cnaes_suggested: ['8630501', '8630502', '8610101']
    },
    'fisioterapia': {
        synonyms: ['fisioterapeuta', 'reabilitação', 'fisio'],
        related: ['saúde', 'terapia', 'tratamento'],
        cnaes_suggested: ['8650001', '8650002']
    },
    'psicólogo': {
        synonyms: ['psicologia', 'psicanálise', 'terapia', 'psicoterapia'],
        related: ['saúde', 'mental', 'consultório'],
        cnaes_suggested: ['8650003']
    },
    'farmácia': {
        synonyms: ['drogaria', 'medicamento', 'remédio', 'medicamentos'],
        related: ['saúde', 'comércio', 'varejo'],
        cnaes_suggested: ['4771701', '4771702']
    },
    'laboratório': {
        synonyms: ['lab', 'exame', 'análise', 'clínico', 'laboratorial'],
        related: ['saúde', 'diagnóstico', 'análises'],
        cnaes_suggested: ['8640201', '8640202']
    },

    // === TECNOLOGIA ===
    'desenvolvedor': {
        synonyms: ['dev', 'programador', 'software', 'ti', 'programação', 'desenvolvimento'],
        related: ['tecnologia', 'informática', 'sistemas', 'web'],
        cnaes_suggested: ['6201501', '6202300', '6203100']
    },
    'site': {
        synonyms: ['website', 'web', 'internet', 'página', 'portal'],
        related: ['tecnologia', 'desenvolvimento', 'digital'],
        cnaes_suggested: ['6201501', '7319002']
    },
    'app': {
        synonyms: ['aplicativo', 'mobile', 'celular', 'aplicação'],
        related: ['tecnologia', 'desenvolvimento', 'software'],
        cnaes_suggested: ['6201501', '6202300']
    },
    'consultoria': {
        synonyms: ['consultor', 'assessoria', 'serviços', 'consultoria'],
        related: ['serviços', 'empresarial', 'gestão'],
        cnaes_suggested: ['7020400', '6209100']
    },

    // === SERVIÇOS PROFISSIONAIS ===
    'advogado': {
        synonyms: ['advocacia', 'jurídico', 'direito', 'lei'],
        related: ['serviços', 'judicial', 'legal'],
        cnaes_suggested: ['6911701', '6911702']
    },
    'contador': {
        synonyms: ['contabilidade', 'contábil', 'contabilista'],
        related: ['serviços', 'financeiro', 'fiscal'],
        cnaes_suggested: ['6920601', '6920602']
    },
    'engenheiro': {
        synonyms: ['engenharia', 'projeto', 'construção'],
        related: ['serviços', 'técnico', 'consultoria'],
        cnaes_suggested: ['7112000', '7119701']
    },
    'arquiteto': {
        synonyms: ['arquitetura', 'projeto', 'design'],
        related: ['serviços', 'construção', 'planejamento'],
        cnaes_suggested: ['7111100']
    },

    // === EDUCAÇÃO ===
    'escola': {
        synonyms: ['ensino', 'educação', 'colégio', 'educacional'],
        related: ['educação', 'ensino', 'aprendizagem'],
        cnaes_suggested: ['8511200', '8512100', '8513900']
    },
    'curso': {
        synonyms: ['treinamento', 'formação', 'aula', 'cursos'],
        related: ['educação', 'ensino', 'capacitação'],
        cnaes_suggested: ['8599603', '8599604']
    },
    'idioma': {
        synonyms: ['língua', 'inglês', 'espanhol', 'idiomas'],
        related: ['educação', 'ensino', 'curso'],
        cnaes_suggested: ['8593700']
    },

    // === COMÉRCIO ===
    'loja': {
        synonyms: ['comércio', 'varejo', 'vendas', 'comercial'],
        related: ['varejo', 'comercial', 'produtos'],
        cnaes_suggested: ['4781400', '4789005']
    },
    'vestuário': {
        synonyms: ['roupa', 'roupas', 'moda', 'boutique'],
        related: ['comércio', 'varejo', 'confecção'],
        cnaes_suggested: ['4781400', '4782201']
    },

    // === SERVIÇOS PESSOAIS ===
    'salão': {
        synonyms: ['beleza', 'cabelo', 'estética', 'cabeleireiro'],
        related: ['serviços', 'beleza', 'estética'],
        cnaes_suggested: ['9602501', '9602502']
    },
    'academia': {
        synonyms: ['ginástica', 'fitness', 'musculação'],
        related: ['esportes', 'saúde', 'atividade física'],
        cnaes_suggested: ['9313100']
    },

    // === OUTROS ===
    'hotel': {
        synonyms: ['hotelaria', 'hospedagem', 'pousada'],
        related: ['turismo', 'serviços', 'acomodação'],
        cnaes_suggested: ['5510801', '5590601']
    },
    'transporte': {
        synonyms: ['frete', 'logística', 'transportadora'],
        related: ['logística', 'movimentação', 'entrega'],
        cnaes_suggested: ['4930201', '4930202']
    }
};

/**
 * Expande termo de busca com contexto semântico
 */
export function expandSemanticContext(description) {
    if (!description) return [];

    const terms = description.toLowerCase()
        .split(/\s+/)
        .filter(t => t.length > 2); // Ignora palavras muito curtas

    const expanded = new Set(terms);

    terms.forEach(term => {
        // Busca match exato
        const context = SEMANTIC_CONTEXT[term];
        if (context) {
            context.synonyms?.forEach(s => expanded.add(s));
            context.related?.forEach(r => expanded.add(r));
            return;
        }

        // Busca match parcial
        Object.entries(SEMANTIC_CONTEXT).forEach(([key, ctx]) => {
            if (term.includes(key) || key.includes(term)) {
                ctx.synonyms?.forEach(s => expanded.add(s));
                ctx.related?.forEach(r => expanded.add(r));
            }
        });
    });

    return Array.from(expanded);
}

/**
 * Obtém CNAEs sugeridos baseado no contexto
 */
export function getSuggestedCNAEs(description) {
    if (!description) return [];

    const terms = description.toLowerCase().split(/\s+/);
    const suggested = new Set();

    terms.forEach(term => {
        const context = SEMANTIC_CONTEXT[term];
        if (context?.cnaes_suggested) {
            context.cnaes_suggested.forEach(c => suggested.add(c));
        }

        // Match parcial
        Object.entries(SEMANTIC_CONTEXT).forEach(([key, ctx]) => {
            if (term.includes(key) || key.includes(term)) {
                ctx.cnaes_suggested?.forEach(c => suggested.add(c));
            }
        });
    });

    return Array.from(suggested);
}

/**
 * Enriquece resultados com informações semânticas
 */
export function enrichResultsWithContext(results, searchTerm) {
    const suggested = getSuggestedCNAEs(searchTerm);
    const expandedTerms = expandSemanticContext(searchTerm);

    return results.map(result => {
        const isSuggested = suggested.includes(result.value) || suggested.includes(result.code);
        const hasSemanticMatch = expandedTerms.some(term =>
            result.description?.toLowerCase().includes(term) ||
            result.label?.toLowerCase().includes(term)
        );

        return {
            ...result,
            semanticBoost: isSuggested ? 0.2 : (hasSemanticMatch ? 0.1 : 0),
            isSuggested,
            hasSemanticMatch
        };
    });
}
