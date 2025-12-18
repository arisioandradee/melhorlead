# Solução: Problema ao Criar Conta

## Problema Comum: Confirmação de Email

O Supabase por padrão **REQUER confirmação de email** para novos usuários. Isso significa que:
- O usuário é criado no banco
- MAS fica com status "não confirmado"
- Precisa clicar em um link enviado por email
- Sem servidor de email configurado, o link nunca chega

## Solução 1: Desabilitar Confirmação de Email (Recomendado para desenvolvimento)

### Passos no Supabase Dashboard:

1. Acesse: https://supabase2.dibaisales.com.br
2. Vá para **Authentication** > **Providers**
3. Clique em **Email**
4. Desça até **Email Confirmations**
5. **DESMARQUE** a opção "Enable email confirmations"
6. Clique em **Save**

---

## Solução 2: Verificar Usuários Criados

Mesmo que não consiga fazer login, o usuário pode ter sido criado:

1. Vá em **Authentication** > **Users**
2. Procure por seu email
3. Se estiver lá, verifique a coluna **Email Confirmed**
4. Se estiver como `false`, você pode:
   - Clicar no usuário
   - Marcar manualmente como confirmado
   - Ou usar a Solução 1

---

## Solução 3: Verificar Erros no Console

1. Abra o navegador em http://localhost:5174/register
2. Pressione F12 para abrir o DevTools
3. Vá na aba **Console**
4. Tente criar uma conta
5. Veja se há erros em vermelho

### Erros Comuns:

#### Erro: "User already registered"
- **Causa**: Email já foi usado antes
- **Solução**: Use outro email ou delete o usuário no Dashboard

#### Erro: "Invalid API key"
- **Causa**: Chave do Supabase incorreta
- **Solução**: Verifique o arquivo `.env`

#### Erro: "CORS"
- **Causa**: URL não autorizada
- **Solução**: Vá em **Project Settings** > **API** > Add allowed origins

---

## Solução 4: Atualizar Página de Registro para Mostrar Erros

Vou atualizar o código para mostrar erros mais claros...
