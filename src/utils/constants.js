// Estados brasileiros
export const ESTADOS_BR = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' },
];

// Situação Cadastral
export const SITUACAO_CADASTRAL = [
    { value: 'ATIVA', label: 'Ativa' },
    { value: 'BAIXADA', label: 'Baixada' },
    { value: 'INAPTA', label: 'Inapta' },
    { value: 'SUSPENSA', label: 'Suspensa' },
    { value: 'NULA', label: 'Nula' },
];

// Natureza Jurídica (principais)
export const NATUREZA_JURIDICA = [
    { value: '2062', label: 'Sociedade Empresária Limitada' },
    { value: '2011', label: 'Empresa Individual de Responsabilidade Limitada (EIRELI)' },
    { value: '2135', label: 'Empresário (Individual)' },
    { value: '2054', label: 'Sociedade Limitada Unipessoal' },
    { value: '2232', label: 'Sociedade Anônima Fechada' },
    { value: '2240', label: 'Sociedade Anônima Aberta' },
    { value: '3999', label: 'Associação Privada' },
    { value: '3069', label: 'Fundação Privada' },
    { value: '1074', label: 'Órgão Público Autônomo' },
];

// Importar lista completa de CNAEs (600+ códigos)
export { CNAES_COMPLETOS as CNAES_COMUNS } from './cnaes_completos';

// Regiões brasileiras e seus estados
export const REGIOES_BR = [
    { value: 'NORTE', label: 'Norte', estados: ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'] },
    { value: 'NORDESTE', label: 'Nordeste', estados: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'] },
    { value: 'CENTRO-OESTE', label: 'Centro-Oeste', estados: ['DF', 'GO', 'MT', 'MS'] },
    { value: 'SUDESTE', label: 'Sudeste', estados: ['ES', 'MG', 'RJ', 'SP'] },
    { value: 'SUL', label: 'Sul', estados: ['PR', 'RS', 'SC'] },
];
