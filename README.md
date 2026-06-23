# Finanças+

Aplicação web de gestão financeira pessoal — controle de lançamentos, contas, metas, parcelamentos, recorrências e análise de extratos bancários com IA.

**[→ Ver demo ao vivo](https://web-financas.vercel.app)**

---

## Funcionalidades

- **Dashboard** — visão geral do patrimônio líquido com histórico de 12 meses
- **Lançamentos** — registro manual de receitas e despesas com detecção de duplicatas
- **Extrato** — importação de extratos bancários via PDF com parse automático e deduplicação por FITID
- **Contas** — múltiplas contas com suporte a transferências entre elas
- **Orçamento** — definição e acompanhamento de limites por categoria
- **Metas** — metas de economia com valor-alvo, prazo e progresso visual
- **Parcelamentos** — controle de compras parceladas com geração automática de lançamentos
- **Recorrências** — contas fixas recorrentes com auto-geração de lançamentos
- **Análise IA** — categorização e insights de extratos via Groq AI
- **Relatórios** — visão consolidada de despesas e receitas por período
- **Notificações** — alertas in-app e por e-mail
- **Autenticação** — login seguro com sessão por usuário (dados isolados por conta)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| Banco de dados | PostgreSQL via Prisma ORM |
| UI | shadcn/ui + Tailwind CSS |
| Autenticação | NextAuth.js |
| IA | Groq API |
| PDF parsing | pdf-parse |
| Testes | Vitest |
| Deploy | Vercel |

---

## Arquitetura

```
src/
├── app/
│   ├── (app)/          # Rotas protegidas (dashboard, lancamentos, contas...)
│   ├── (auth)/         # Rotas de autenticação (login)
│   └── api/            # Route handlers (REST endpoints)
├── actions/            # Server Actions do Next.js
├── components/         # Componentes React reutilizáveis
├── lib/                # Utilitários, helpers, cliente Prisma
└── types/              # Tipos TypeScript compartilhados
prisma/
└── schema.prisma       # Modelos: User, Lancamento, Conta, Meta, Recorrencia...
```

---

## Como rodar localmente

**Pré-requisitos:** Node.js 18+, PostgreSQL

```bash
# 1. Clone o repositório
git clone https://github.com/TiagoVP86/web-financas.git
cd web-financas

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais (ver seção abaixo)

# 4. Execute as migrations do banco
npx prisma migrate dev

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Variáveis de ambiente

```env
DATABASE_URL=          # Connection string PostgreSQL
NEXTAUTH_SECRET=       # String aleatória para assinar sessões
NEXTAUTH_URL=          # URL base da aplicação (ex: http://localhost:3000)
GROQ_API_KEY=          # Chave da API Groq (análise de extratos com IA)
```

---

## Testes

```bash
npm run test
```

---

## Deploy

O projeto está configurado para deploy contínuo na Vercel. Cada push para `main` dispara um novo deploy automaticamente.

---

## Licença

MIT
