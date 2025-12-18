#!/bin/bash
# Script para testar conexão com Supabase

echo "🔍 Testando conexão com Supabase..."
echo ""

# Verifica se as variáveis de ambiente estão configuradas
if [ -f ".env" ]; then
    echo "✅ Arquivo .env encontrado"
    echo ""
    echo "Conteúdo do .env:"
    cat .env | grep SUPABASE
    echo ""
else
    echo "❌ Arquivo .env não encontrado!"
    exit 1
fi

# Teste de conectividade
SUPABASE_URL=$(grep VITE_SUPABASE_URL .env | cut -d '=' -f2)
echo "🌐 Testando conexão com: $SUPABASE_URL"
echo ""

# Ping básico (Windows)
ping -n 1 supabase2.dibaisales.com.br

echo ""
echo "📋 Próximos passos:"
echo "1. Abra http://localhost:5174/register no navegador"
echo "2. Abra o Console (F12)"
echo "3. Tente criar uma conta"
echo "4. Veja os logs no console"
