# Design: Portfolio Pessoal (liy.dev)

**Data:** 2026-06-18  
**Status:** Aprovado para implementação  
**Tema:** Site de portfolio de projetos pessoais com visual Apple-like / liquid glass, sistema de login seguro com SQLite e painel administrativo para CRUD de projetos.

---

## 1. Visão geral

O objetivo é criar um site público de portfolio para exibir projetos pessoais (copper-lang, mocida, OndaEngine e futuros projetos). O design deve ser visualmente impactante, inspirado em sites da Apple, com uso forte de blur, glassmorphism e efeitos "liquid glass".

O site terá:
- **Área pública:** homepage com projetos, página de detalhes de cada projeto, página sobre.
- **Área administrativa:** login protegido, painel para criar, editar, excluir e reordenar projetos.

### Decisões de alto nível aprovadas
- **Stack:** Next.js 14 (App Router) + API Routes + SQLite.
- **Autenticação:** usuário único (admin) com email/senha, JWT assinado em cookie `httpOnly`.
- **Hospedagem:** servidor próprio (VPS/Railway/Fly.io/Hetzner) com SQLite no filesystem.
- **Visual:** liquid glass intenso, fundo escuro com gradientes, cards de vidro.
- **Homepage:** projetos em destaque primeiro, sem hero grande.
- **Identidade:** nome pessoal/dominio (ex: liy.dev).
- **Seed:** pré-cadastrar copper-lang, mocida e OndaEngine a partir dos READMEs.

---

## 2. Arquitetura

```
Browser
   │
   ▼
Next.js (App Router + API Routes)
   │
   ├── Páginas públicas (Server Components)
   │      └── buscam dados direto do SQLite
   │
   └── API Routes protegidas
          ├── POST /api/auth/login
          ├── POST /api/auth/logout
          ├── GET/POST /api/projects
          ├── GET/PUT/DELETE /api/projects/[id]
          └── POST /api/upload
                  │
                  ▼
         ┌─────────────────┐
         │   SQLite        │
         │   (better-      │
         │    sqlite3)     │
         └─────────────────┘
                  │
         ┌─────────────────┐
         │   Filesystem    │
         │   public/uploads│
         └─────────────────┘
```

### Stack detalhada
| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS + custom liquid glass |
| Banco | SQLite via `better-sqlite3` |
| ORM/Query | Queries SQL diretas (prepared statements) |
| Validação | Zod |
| Auth | JWT (jose) + bcrypt + cookie httpOnly |
| Upload | API Route + validação + filesystem |
| Testes | Vitest + React Testing Library (opcional Playwright) |

---

## 3. Modelo de dados

### Tabela `users`
| Campo | Tipo | Restrições |
|-------|------|------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| email | TEXT | UNIQUE NOT NULL |
| password_hash | TEXT | NOT NULL |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### Tabela `projects`
| Campo | Tipo | Restrições |
|-------|------|------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| title | TEXT | NOT NULL |
| slug | TEXT | UNIQUE NOT NULL |
| short_description | TEXT | NOT NULL |
| description | TEXT | NOT NULL (markdown) |
| image_path | TEXT | NOT NULL |
| github_url | TEXT | NOT NULL |
| website_url | TEXT | NULL |
| display_order | INTEGER | NOT NULL DEFAULT 0 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### Decisões
- Apenas uma conta admin existe; não há registro público.
- `slug` gera URLs amigáveis: `/projects/copper-lang`.
- `display_order` permite reordenar projetos na homepage via admin.
- `updated_at` atualizado por trigger no SQLite.

---

## 4. Autenticação e segurança

### Fluxo de login
1. Admin envia email + senha para `POST /api/auth/login`.
2. Backend busca usuário pelo email.
3. Compara senha com `bcrypt.compare`.
4. Gera JWT (`jose`) com payload `{ sub: userId }` e expiração de 7 dias.
5. Define cookie `httpOnly; Secure; SameSite=Strict; Max-Age=604800`.
6. Logout envia cookie com `Max-Age=0`.

### Medidas de segurança
- **bcrypt** com custo mínimo 12.
- **JWT secret** em variável de ambiente `JWT_SECRET`, mínimo 256 bits.
- **Cookie httpOnly** — inacessível por JavaScript.
- **Cookie Secure** — apenas HTTPS em produção.
- **SameSite=Strict** — mitiga CSRF.
- **Rate limiting** no login: 5 tentativas por IP a cada 15 minutos.
- **Validação Zod** em todas as entradas.
- **Uploads validados:** tipos permitidos (`image/jpeg`, `image/png`, `image/webp`), máximo 2MB, dimensões máximas 1920x1080.
- **Headers de segurança:** CSP básico, X-Content-Type-Options, X-Frame-Options.
- **SQL Injection:** todas as queries usam prepared statements.

---

## 5. Páginas e componentes

### Páginas públicas
| Rota | Descrição |
|------|-----------|
| `/` | Homepage com grid de projetos em ordem customizável. |
| `/projects/[slug]` | Página de detalhes do projeto. |
| `/about` | Bio breve e links de contato. |

### Páginas administrativas
| Rota | Descrição |
|------|-----------|
| `/admin/login` | Formulário de login. |
| `/admin/projects` | Lista de projetos com editar/excluir/reordenar. |
| `/admin/projects/new` | Formulário de criação de projeto. |
| `/admin/projects/[id]/edit` | Formulário de edição de projeto. |

### Componentes principais
- `GlassCard` — card com efeito liquid glass.
- `Button` — botões primário/secundário com estados.
- `Input` / `Textarea` — campos de formulário.
- `ImageUpload` — preview, validação e upload.
- `ProjectForm` — formulário reutilizável de criação/edição.
- `ProtectedRoute` — HOC/guarda para rotas admin.
- `SortableProjectList` — lista com drag-and-drop para reordenar.

### Visual
- Fundo escuro (`#0a0a0f` → `#1a1a2e`) com gradientes fluidos.
- Cards com `backdrop-filter: blur()`, bordas semitransparentes e reflexos sutis.
- Tipografia clean (Inter ou SF Pro-like).
- Animações suaves de entrada e hover.

---

## 6. Fluxo de dados

### Páginas públicas
1. Server Component renderiza no servidor.
2. Chama função `getProjects()` que executa query SQL.
3. Dados passados para componentes filhos.
4. Cache estático revalidado após mutações via `revalidatePath`.

### Mutações protegidas
1. Client Component coleta dados do formulário.
2. Validação local com Zod.
3. Requisição para API Route com cookie automaticamente anexado.
4. API Route:
   - Verifica JWT no cookie.
   - Valida payload com Zod.
   - Executa INSERT/UPDATE/DELETE no SQLite.
   - Salva upload no filesystem (se houver).
5. Frontend redireciona para `/admin/projects` em caso de sucesso.

### Upload de imagens
1. Formulário envia `multipart/form-data`.
2. API Route valida tipo/tamanho.
3. Gera nome aleatório (`crypto.randomUUID`).
4. Salva em `public/uploads/`.
5. Converte para WebP quando possível e guarda caminho relativo no banco (`/uploads/<nome>.webp`).

---

## 7. Error handling e validação

### Validação
- **Schemas Zod** para login, projeto e upload.
- **Slug automático:** gerado a partir do título e normalizado.
- **URLs:** validação de formato para GitHub e website.

### Erros
- API retorna JSON padronizado: `{ success: false, error: string }`.
- HTTP status adequados: 400 (validação), 401 (não autenticado), 403 (proibido), 404, 500.
- Frontend exibe mensagens amigáveis em toasts ou inline.
- Erros 500 logados no servidor sem expor detalhes ao usuário.

---

## 8. Testes

| Tipo | Escopo |
|------|--------|
| Unitários | Helpers (slugify, JWT, validação Zod). |
| Integração | Rotas de auth e CRUD com SQLite em memória. |
| E2E (opcional) | Login → criar projeto → visualizar na homepage. |

### CI
- GitHub Actions executa lint, testes e build a cada push.

---

## 9. Deploy e operações

### Build e execução
```bash
npm run build
npm start
```

### Infraestrutura
- Servidor próprio com Node.js.
- Reverse proxy (Nginx/Caddy) servindo HTTPS.
- SQLite em `data/portfolio.db` (fora de `public/`).
- Uploads em `public/uploads/` ou volume persistente.

### Variáveis de ambiente
| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Caminho para o arquivo SQLite. |
| `JWT_SECRET` | Chave secreta para assinar JWTs. |
| `ADMIN_EMAIL` | Email da conta admin (seed). |
| `ADMIN_PASSWORD` | Senha inicial da conta admin (seed). |
| `NODE_ENV` | `development` ou `production`. |

### Backup
- Backup diário do arquivo SQLite.
- Backup das imagens em `public/uploads/`.

---

## 10. Seed inicial

Script `scripts/seed.ts` executado manualmente após deploy inicial:
1. Cria tabelas se não existirem.
2. Cria conta admin a partir de `ADMIN_EMAIL` / `ADMIN_PASSWORD` (apenas se não existir).
3. Insere 3 projetos iniciais:
   - **Copper Lang** — linguagem de alto nível que transpila para Rust.
   - **Mocida** — toolkit de UI modular em C com bindings Rust.
   - **OndaEngine** — engine de jogos 2D + editor.

Dados extraídos dos READMEs. Imagens dos assets existentes são copiadas para `public/uploads/`.

---

## 11. Escopo fora desta versão

Não está incluído no escopo inicial:
- Múltiplos usuários / registro público.
- Analytics.
- Blog / posts.
- Comentários.
- Internacionalização.
- Notificações por email.

---

## 12. Critérios de sucesso

- [ ] Site público carrega com visual liquid glass e lista os projetos.
- [ ] Cada projeto tem página de detalhes com todos os campos.
- [ ] Login admin funciona com email/senha seguro.
- [ ] É possível criar, editar, excluir e reordenar projetos no admin.
- [ ] Upload de imagem funciona e valida tipo/tamanho.
- [ ] Seed inicial cria admin e 3 projetos.
- [ ] Testes de integração passam.
- [ ] Deploy funciona em servidor próprio com HTTPS.
