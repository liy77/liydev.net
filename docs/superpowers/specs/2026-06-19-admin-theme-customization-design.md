# Design: Customização de tema e imagem de fundo pelo admin + liquid glass real

## Contexto
O usuário quer personalizar cores do site e imagem de fundo diretamente pelo painel admin, com preview ao vivo, salvar e voltar ao padrão. Além disso, o site deve usar o efeito real de liquid glass da biblioteca `liquid-glass-react`, e o painel admin precisa de ajustes visuais (layout dos cards e botões no tema claro).

## Objetivo
- Permitir que o admin customize cores principais e do efeito glass.
- Permitir upload de imagem de fundo com opção de remover/voltar ao gradiente padrão.
- O site público deve ler as configurações do banco de dados.
- Substituir o glass atual pela biblioteca `liquid-glass-react`.
- Melhorar o visual do admin no tema claro.

## Escopo
- Criar tabela `site_settings` no SQLite.
- Criar data layer, validadores Zod e API routes para settings.
- Criar página `/admin/settings` com formulário, preview e botão de reset.
- Adaptar `ThemeProvider` para buscar settings da API e aplicar CSS variables.
- Adaptar `Navbar`, `GlassCard`, `Button` e demais componentes para usar `LiquidGlass`.
- Ajustar CSS do admin para melhor contraste no tema claro.

## Decisões

### Banco de dados
Tabela `site_settings` com uma única linha:

```sql
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  background_start TEXT NOT NULL DEFAULT '#0a0a0f',
  background_end TEXT NOT NULL DEFAULT '#1a1a2e',
  background_mid TEXT NOT NULL DEFAULT '#0f0f1a',
  text_primary TEXT NOT NULL DEFAULT '#f5f5f7',
  text_secondary TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.7)',
  text_muted TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.5)',
  accent_color TEXT NOT NULL DEFAULT '#38bdf8',
  glass_bg TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.08)',
  glass_border TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.18)',
  glass_border_highlight TEXT NOT NULL DEFAULT 'rgba(255, 255, 255, 0.35)',
  background_image TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### API
- `GET /api/settings` — pública, retorna as configurações atuais.
- `PUT /api/settings` — protegida (admin), recebe JSON com cores e/ou `background_image`, valida com Zod e atualiza a linha.
- DELETE da imagem: enviar `background_image: null` ou endpoint separado? Simplificar: o formulário envia `background_image: null` ao remover.

### Painel admin
Nova página `/admin/settings`:
- Link no `AdminHeader`.
- Formulário com inputs `type="color"` para cores hex e inputs text para rgba.
- Upload de imagem com preview.
- Área de preview abaixo do formulário mostrando um card e botão com as cores escolhidas.
- Botões: **Salvar**, **Voltar ao padrão** (deleta a linha ou reseta para defaults), **Cancelar**.

### Site público
- `ThemeProvider` busca `/api/settings` no `useEffect` inicial.
- Aplica as variáveis CSS no `document.documentElement`.
- Se `background_image` existir, aplica como `background-image` do `html` com `background-size: cover`; senão, usa gradiente das cores.
- Componentes glass usam `LiquidGlass` da biblioteca.

### Ajuste visual do admin
- Reduzir opacidade do glass no tema claro para não ficar branco demais.
- Botões do admin com tamanho consistente (`min-h-[44px]`).
- Cards com padding responsivo e melhor espaçamento entre ações.

## Arquivos afetados
- `src/lib/schema.sql`
- `src/lib/db.ts` (init)
- `src/lib/settings.ts` (novo)
- `src/lib/validators.ts`
- `src/app/api/settings/route.ts` (novo)
- `src/app/admin/settings/page.tsx` (novo)
- `src/components/admin/AdminHeader.tsx`
- `src/components/ui/ThemeProvider.tsx`
- `src/components/ui/GlassCard.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Navbar.tsx`
- `src/app/globals.css`
- `package.json`

## Critérios de sucesso
1. Admin consegue alterar cores, ver preview, salvar e resetar.
2. Site público reflete as cores salvas.
3. Upload/remoção de imagem de fundo funciona.
4. `LiquidGlass` é usado nos cards e navbar.
5. Admin fica visualmente melhor no tema claro.
6. Build e testes passam.
