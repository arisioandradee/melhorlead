export const translateAuthError = (errorMessage) => {
    if (!errorMessage) return '';

    // Normalize error message for case-insensitive matching
    const msg = errorMessage.toLowerCase();

    if (msg.includes('invalid login credentials')) {
        return 'E-mail ou senha incorretos.';
    }

    if (msg.includes('user already registered')) {
        return 'Este e-mail já está cadastrado.';
    }

    if (msg.includes('password should be at least')) {
        return 'A senha deve ter pelo menos 6 caracteres.';
    }

    if (msg.includes('email not confirmed')) {
        return 'E-mail não confirmado. Verifique sua caixa de entrada.';
    }

    if (msg.includes('invalid_grant')) {
        return 'Credenciais inválidas ou expiradas.';
    }

    if (msg.includes('rate limit exceeded')) {
        return 'Muitas tentativas. Tente novamente mais tarde.';
    }

    if (msg.includes('missing email or contact')) {
        return 'E-mail é obrigatório.';
    }

    // Default: return the original message or a generic one
    return errorMessage;
};

