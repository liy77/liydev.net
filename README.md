# liy.dev Portfolio

Site de portfolio pessoal com visual liquid glass, admin protegido e CRUD de projetos.

## Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- SQLite (better-sqlite3)
- JWT em cookie httpOnly
- sharp (conversão de imagens)

## Setup local

```bash
# 1. Clone o repositório e entre na pasta
# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com seus valores

# 4. Copie os assets dos projetos (opcional, para seed)
npx tsx scripts/copy-project-assets.ts

# 5. Crie o banco de dados e o usuário admin
npm run seed

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse http://localhost:3000 para o site público e http://localhost:3000/admin para o painel admin.

## Deploy em servidor próprio

1. Clone o repositório no servidor
2. Instale dependências: `npm install`
3. Configure as variáveis de ambiente em `.env.local`
4. Rode `npm run seed` uma vez
5. Faça o build: `npm run build`
6. Sirva com `npm start` atrás de um reverse proxy (Nginx/Caddy) com HTTPS

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Caminho absoluto para o arquivo SQLite (ex: `/app/data/portfolio.db`) |
| `JWT_SECRET` | Chave secreta aleatória de pelo menos 32 caracteres |
| `ADMIN_EMAIL` | Email da conta admin |
| `ADMIN_PASSWORD` | Senha inicial da conta admin (será hasheada) |
| `NODE_ENV` | `development` ou `production` |

## Estrutura

- `src/app/` — páginas públicas e admin
- `src/components/` — componentes reutilizáveis
- `src/lib/` — banco de dados, auth, validators, upload
- `scripts/` — seed e cópia de assets
- `public/uploads/` — imagens dos projetos

## Comandos úteis

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm start        # servidor de produção
npm run test:run # rodar testes
npm run seed     # criar admin e projetos iniciais
```

## Backup

Faça backup regular do arquivo SQLite (`DATABASE_URL`) e da pasta `public/uploads/`.
