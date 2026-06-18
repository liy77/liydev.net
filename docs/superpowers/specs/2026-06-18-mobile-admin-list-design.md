# Design: Melhoria mobile na área admin — lista de projetos

## Contexto
O usuário reportou que a área admin do portfolio fica ruim no celular. A tela mais problemática é a **lista de projetos** (`/admin/projects`), onde cada projeto é exibido como uma linha horizontal com título/slug à esquerda e botões de reordenar, editar e excluir à direita. No mobile, essa linha fica espremida e os botões ficam difíceis de acertar.

## Objetivo
Tornar a lista de projetos do admin usável e visualmente confortável em telas pequenas, mantendo a experiência de desktop intacta.

## Decisões tomadas

### Escopo
- Foco principal: `SortableProjectList.tsx`.
- Ajustes secundários: `AdminHeader.tsx`, `AdminLayout` e formulário de projetos para garantir consistência mobile.
- Não mexer na arquitetura de dados ou nas rotas da API.

### Abordagem escolhida
**Cards verticais com ações empilhadas** (opção A).

Motivos:
- Botões grandes e ações visíveis — melhor para toque.
- Mais fácil de implementar do que um menu dropdown.
- Escaneabilidade boa: cada projeto ocupa seu próprio card.

### Estrutura do card mobile

```
┌─────────────────────────────┐
│ #3  Título do projeto       │
│     /slug-do-projeto        │
│                             │
│  [Subir]  [Descer]          │
│  [Editar] [Excluir]         │
└─────────────────────────────┘
```

- **Ordem:** badge pequeno no canto superior esquerdo (`#1`, `#2`, ...).
- **Título:** `text-base font-semibold`.
- **Slug:** `text-sm text-theme-muted` abaixo do título.
- **Ações:** grid de 2 colunas com botões de altura mínima `44px`.
  - `Subir` e `Descer` como texto no mobile (área de toque maior); no desktop continuam apenas como setas `↑`/`↓`.
  - `Editar` e `Excluir` com as variantes existentes.

### Desktop
Mantém o layout atual de linha horizontal:

```
#3  Título do projeto    ↑ ↓  Editar  Excluir
    /slug-do-projeto
```

### Ajustes gerais de mobile na admin
- Reduzir padding horizontal da página admin de `px-6` para `px-4` em telas pequenas.
- `AdminHeader`: truncar ou ocultar o e-mail do usuário no mobile para evitar quebra de layout; manter título "Admin" e botão "Sair".
- Formulário de criar/editar projeto:
  - Botões "Salvar" e "Cancelar" empilhados em coluna no mobile.
  - Upload de imagem mantém `aspect-video` e largura total.

### Tecnologia
- Tailwind CSS responsivo (`md:` breakpoints).
- Componentes existentes: `GlassCard`, `Button`.
- Sem adição de bibliotecas.

## Arquivos afetados
- `src/components/projects/SortableProjectList.tsx` (principal)
- `src/components/admin/AdminHeader.tsx`
- `src/app/admin/(protected)/layout.tsx`
- `src/components/projects/ProjectForm.tsx` (ajuste nos botões)

## Critérios de sucesso
1. Em telas < 768 px, cada projeto aparece como card vertical com ações empilhadas.
2. Botões de ação têm área de toque mínima de 44 px.
3. Layout de desktop continua igual ao atual.
4. Build e testes continuam passando.
5. Tema claro/escuro continua respeitado.
