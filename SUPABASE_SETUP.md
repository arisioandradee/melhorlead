# Guia Rápido - Configuração do Supabase

## Passo 1: Executar SQL no Supabase

1. Acesse seu projeto Supabase: https://supabase2.dibaisales.com.br
2. Vá em **SQL Editor** no menu lateral
3. Crie uma nova query
4. Copie e cole todo o conteúdo do arquivo `supabase-setup.sql`
5. Clique em **Run** para executar

## Passo 2: Verificar Criação da Tabela

Após executar o SQL, verifique:
1. Vá em **Table Editor**
2. Você deve ver a tabela `search_history`
3. Verifique os índices em **Database** > **Indexes**
4. Verifique as políticas RLS em **Authentication** > **Policies**

## Passo 3: Testar a Aplicação

### 3.1 Criar uma Conta
1. Acesse http://localhost:5174/register
2. Preencha email e senha
3. Clique em "Criar conta"
4. Será redirecionado para o login

### 3.2 Fazer Login
1. Em http://localhost:5174/login
2. Entre com suas credenciais
3. Será redirecionado para a página principal

### 3.3 Fazer uma Pesquisa
1. Na página principal, preencha os filtros
2. Clique em "Buscar Empresas"
3. Os resultados aparecerão na tela
4. **Automaticamente**, a pesquisa será salva no histórico

### 3.4 Ver Histórico
1. Clique no botão "Histórico" no header
2. Você verá todas as suas pesquisas anteriores
3. Pode deletar itens clicando no ícone de lixeira

## Estrutura Completa do Sistema

### Autenticação
- ✅ Sistema de login/registro
- ✅ Sessão persistente (mantém login após refresh)
- ✅ Proteção de rotas (redireciona para login se não autenticado)
- ✅ Logout com limpeza de sessão

### Histórico de Pesquisas
- ✅ Salvamento automático após cada busca
- ✅ Armazena filtros aplicados e quantidade de resultados
- ✅ Página dedicada para visualização
- ✅ Opção de deletar histórico individual
- ✅ Ordenação por data (mais recentes primeiro)

### Integração n8n
- ✅ Continua enviando resultados para webhook
- ✅ Envia dados de: timestamp, totalResults, companies, source

## Verificar no Supabase Dashboard

### Ver Usuários Criados
1. Acesse **Authentication** > **Users**
2. Você verá todos os usuários registrados

### Ver Histórico de Pesquisas
1. Acesse **Table Editor** > **search_history**
2. Você verá todas as pesquisas salvas
3. Cada linha terá:
   - `id`: ID único da pesquisa
   - `user_id`: ID do usuário
   - `search_params`: JSON com os filtros
   - `results_count`: Quantidade de resultados
   - `created_at`: Data/hora da pesquisa

## Solução de Problemas

### Erro: "relation search_history does not exist"
- **Causa**: Tabela não foi criada no Supabase
- **Solução**: Execute o SQL do arquivo `supabase-setup.sql`

### Erro ao fazer login
- **Causa**: Usuário não existe
- **Solução**: Registre-se primeiro em `/register`

### Histórico não aparece
- **Causa**: Políticas RLS não configuradas
- **Solução**: Execute novamente a parte de policies do SQL

### Erro de CORS no Supabase
- **Causa**: URL não está nas configurações do Supabase
- **Solução**: Adicione `http://localhost:5174` nas configurações de CORS do projeto

## Exemplo de Dados Salvos

Quando você faz uma busca por:
- **UF**: SP
- **Situação**: ATIVA
- **CNAE**: 6201501

O JSON salvo será:
```json
{
  "uf": ["SP"],
  "situacaoCadastral": "ATIVA",
  "cnae": "6201501",
  "razaoSocial": "",
  "municipio": "",
  "limite": 50,
  ...
}
```

E `results_count` terá o número de empresas encontradas (ex: 150).
