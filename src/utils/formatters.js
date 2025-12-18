// Formata CNPJ: 12345678000195 -> 12.345.678/0001-95
export const formatCNPJ = (cnpj) => {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return cnpj;
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

// Formata CEP: 12345678 -> 12345-678
export const formatCEP = (cep) => {
    if (!cep) return '';
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) return cep;
    return cleaned.replace(/^(\d{5})(\d{3})$/, '$1-$2');
};

// Máscara de CEP para input
export const maskCEP = (value) => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '').slice(0, 8);
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
};

// Máscara de DDD para input
export const maskDDD = (value) => {
    if (!value) return '';
    return value.replace(/\D/g, '').slice(0, 2);
};

// Formata moeda brasileira
export const formatCurrency = (value) => {
    if (!value && value !== 0) return '';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

// Remove formatação de moeda para número
export const parseCurrency = (value) => {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    return cleaned ? parseInt(cleaned, 10) : null;
};

// Formata data para YYYY-MM-DD
export const formatDateToAPI = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
