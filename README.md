# Busca Avançada de Empresas - Prospecção B2B

Uma aplicação web moderna para busca avançada de empresas brasileiras, desenvolvida com React, Tailwind CSS e Shadcn UI, integrada com a API CNPJA.

## 🚀 Características

- **Interface Moderna**: Design limpo e profissional com Shadcn UI
- **Filtros Avançados**: 4 seções completas de filtros
  - Identificação e Atividade (Razão Social, CNAE, Natureza Jurídica)
  - Localização e Contato (UF, Município, Bairro, CEP, DDD)
  - Detalhes da Empresa (Situação Cadastral, Data de Abertura, Capital Social)
  - Filtros de Qualidade (MEI, Matriz/Filial, Telefone, Email)
- **Busca Inteligente**: Combobox com busca para CNAEs
- **Resultados Visuais**: Cards responsivos com badges e informações organizadas
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile

## 📋 Pré-requisitos

- Node.js 16+ instalado
- NPM ou Yarn
- API Key da CNPJA (https://api.cnpja.com)

## 🔧 Instalação

1. **Instalar dependências**:
```bash
npm install
```

2. **Configurar variáveis de ambiente**:

Já existe um arquivo `.env` configurado com sua API key. Se precisar alterar, edite o arquivo:

```env
VITE_API_KEY=sua-api-key-aqui
VITE_API_URL=https://api.cnpja.com
```

## 🎮 Como Executar

**Modo de desenvolvimento**:
```bash
npm run dev
```

Acesse: `http://localhost:5173`

**Build para produção**:
```bash
npm run build
```

**Preview da build**:
```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/                    # Componentes Shadcn UI
│   │   ├── card.jsx
│   │   ├── button.jsx
│   │   ├── input.jsx
│   │   ├── label.jsx
│   │   ├── select.jsx
│   │   ├── switch.jsx
│   │   ├── badge.jsx
│   │   └── combobox.jsx
│   ├── CompanySearchForm.jsx  # Formulário principal
│   ├── CompanyCard.jsx        # Card de empresa
│   └── ResultsGrid.jsx        # Grid de resultados
├── services/
│   └── api.js                 # Integração com API
├── utils/
│   ├── constants.js           # Constantes (UFs, CNAEs, etc)
│   └── formatters.js          # Funções de formatação
├── lib/
│   └── utils.js               # Utilitários gerais
├── App.jsx                    # Componente principal
├── main.jsx                   # Entry point
└── index.css                  # Estilos globais
```

## 🔍 Como Usar

1. **Preencha os filtros desejados** em uma ou mais seções
2. **Clique em "Buscar Empresas"** para executar a pesquisa
3. **Visualize os resultados** em cards organizados
4. **Use "Limpar Filtros"** para resetar o formulário

### Dicas de Uso

- Você não precisa preencher todos os campos
- Use a busca do CNAE para encontrar atividades específicas
- A situação cadastral padrão é "Ativa"
- Combine múltiplos filtros para refinar sua busca

## 🎨 Tecnologias

- **React 18** - Framework JavaScript
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **Shadcn UI** - Componentes UI
- **Radix UI** - Primitivos acessíveis
- **Lucide React** - Ícones
- **Axios** - Cliente HTTP

## 📡 API

Esta aplicação consome a API CNPJA v5:
- **Endpoint**: `POST /v5/cnpj/pesquisa`
- **Documentação**: https://api.cnpja.com

## 🤝 Contribuindo

Este é um projeto de demonstração. Sinta-se livre para customizar e adaptar conforme suas necessidades.

## 📝 Licença

MIT
