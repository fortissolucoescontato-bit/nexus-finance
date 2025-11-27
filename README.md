# 💰 Nexus Finance

Sistema de gestão financeira pessoal e empresarial com suporte multi-tenant, construído com Next.js 15, React 19, TypeScript, Supabase e Tailwind CSS.

## ✨ Funcionalidades

### ✅ Implementado
- 🔐 **Autenticação completa** (Login e Registro)
- 🏢 **Gestão de Organizações** (Pessoal e Empresarial)
- 👥 **Multi-tenancy** com Row Level Security (RLS)
- 🎨 **Interface moderna** com Shadcn UI e Tailwind CSS
- 📱 **Responsivo** e acessível
- 🔒 **Segurança** com validação Zod e políticas RLS

### 🚧 Em desenvolvimento (MVP)
- 💳 **Gestão de Contas** (Bancárias, Dinheiro, Cartões)
- 📊 **Gestão de Categorias** (Receitas e Despesas)
- 💸 **Gestão de Transações** (CRUD completo)
- 📈 **Dashboard Financeiro** (Resumos e gráficos)

## 🚀 Tecnologias

- **Framework:** Next.js 15 (App Router)
- **React:** 19.0.0-rc
- **TypeScript:** 5.7.2
- **Banco de Dados:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **Estilização:** Tailwind CSS + Shadcn UI
- **Validação:** Zod
- **Deploy:** Vercel

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase (gratuita)
- Git

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/fortissolucoescontato-bit/nexus-finance.git
cd nexus-finance
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key
```

**Como obter as credenciais:**
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto (ou use um existente)
3. Vá em **Settings** → **API**
4. Copie a **URL** e a **anon/public key**

### 4. Configure o banco de dados

Execute as migrações SQL no Supabase:

1. Acesse o **SQL Editor** no painel do Supabase
2. Execute os arquivos em ordem (por número):
   - `supabase/migrations/000_initial_schema.sql`
   - `supabase/migrations/001_...`
   - `supabase/migrations/002_...`
   - (e assim por diante)

**Importante:** Execute as migrações na ordem numérica!

### 5. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
nexus-finance/
├── app/                    # Next.js App Router
│   ├── (app)/             # Rotas protegidas (requerem autenticação)
│   │   └── dashboard/     # Dashboard principal
│   ├── (auth)/            # Rotas de autenticação
│   │   ├── login/        # Página de login
│   │   └── register/     # Página de registro
│   ├── layout.tsx        # Layout raiz
│   └── page.tsx          # Página inicial
├── components/            # Componentes React reutilizáveis
│   ├── ui/               # Componentes Shadcn UI
│   └── error-boundary.tsx # Error Boundary global
├── lib/                   # Utilitários e helpers
│   ├── validations.ts    # Schemas Zod
│   ├── logger.ts         # Sistema de logging
│   └── slug.ts           # Geração de slugs
├── hooks/                 # Custom React Hooks
│   └── use-async-action.ts
├── utils/                 # Utilitários gerais
│   └── supabase/         # Clientes Supabase
│       ├── client.ts     # Cliente para Client Components
│       ├── server.ts     # Cliente para Server Components/Actions
│       └── middleware.ts # Middleware de autenticação
├── supabase/
│   └── migrations/       # Migrações SQL do banco
├── docs/                  # Documentação do projeto
├── public/                # Arquivos estáticos
└── package.json
```

## 🛠️ Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Cria build de produção
npm run start    # Inicia servidor de produção
npm run lint     # Executa ESLint
```

## 🔐 Autenticação

O projeto usa **Supabase Auth** com:
- Email e senha
- Sessões gerenciadas via cookies
- Proteção de rotas via middleware
- Row Level Security (RLS) no banco

## 🏗️ Arquitetura

### Multi-tenancy
- Cada usuário pode criar/participar de múltiplas organizações
- Dados isolados por organização via RLS
- Suporte para organizações pessoais e empresariais

### Server Components vs Client Components
- **Server Components** (padrão): Renderização no servidor, melhor performance
- **Client Components** (`'use client'`): Interatividade, hooks, estado

### Server Actions
- Ações do servidor para mutations (criar, atualizar, deletar)
- Validação com Zod
- Logging centralizado

## 📦 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático a cada push na branch `main`

**Nota:** O Vercel faz o build automaticamente. Não é necessário fazer build local.

## 🐛 Troubleshooting

### Erro: "Variáveis de ambiente não configuradas"
- Verifique se o arquivo `.env.local` existe
- Confirme que as variáveis começam com `NEXT_PUBLIC_`
- Reinicie o servidor de desenvolvimento após alterar `.env.local`

### Erro: "RLS policy violation"
- Verifique se as migrações foram executadas corretamente
- Confirme que as políticas RLS estão ativas no Supabase
- Veja `docs/` para mais detalhes sobre RLS

### Build falha na Vercel
- Verifique se todas as dependências estão em `package.json`
- Confirme que as variáveis de ambiente estão configuradas
- Veja os logs de build na Vercel para mais detalhes

## 📚 Documentação Adicional

- [Análise Completa do Projeto](docs/ANALISE_COMPLETA_PROJETO.md)
- [Estrutura do Projeto](docs/ESTRUTURA_PROJETO.md)
- [Melhorias Implementadas](docs/MELHORIAS_IMPLEMENTADAS.md)
- [Relatório Completo](docs/RELATORIO_COMPLETO_APP.md)

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é privado e proprietário.

## 👨‍💻 Autor

Desenvolvido por Fortis Soluções

---

**Status do Projeto:** 🚧 Em desenvolvimento ativo

Para mais informações, consulte a [documentação completa](docs/).

