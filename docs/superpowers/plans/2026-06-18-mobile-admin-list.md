# Mobile admin list implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar a lista de projetos da área admin usável em telas pequenas sem alterar a experiência desktop.

**Architecture:** Usar breakpoints responsivos do Tailwind para alternar entre o layout de linha horizontal no desktop e cards verticais no mobile. Ajustar componentes secundários (header, layout, formulário) para manter consistência visual em telas pequenas.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS.

---

## Files

- `src/components/projects/SortableProjectList.tsx` — componente principal; recebe layout responsivo.
- `src/components/admin/AdminHeader.tsx` — ajustar para não quebrar no mobile.
- `src/app/admin/(protected)/layout.tsx` — padding responsivo.
- `src/components/projects/ProjectForm.tsx` — botões empilhados no mobile.

---

### Task 1: Layout responsivo na lista de projetos

**Files:**
- Modify: `src/components/projects/SortableProjectList.tsx`

- [ ] **Step 1: Read current file**

Read: `src/components/projects/SortableProjectList.tsx`

- [ ] **Step 2: Rewrite component with responsive layout**

Replace the component so that:
- Desktop (`md+`) keeps the current horizontal row layout.
- Mobile (`< md`) renders each project as a vertical card using `GlassCard`.
- Mobile card shows order badge, title, slug, and a 2-column grid of action buttons.
- Reorder buttons show text labels "Subir"/"Descer" on mobile and arrows on desktop.
- All action buttons have `min-h-[44px]` for touch targets.

Final code:

```tsx
'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import GlassCard from '@/components/ui/GlassCard'
import type { Project } from '@/types'

interface SortableProjectListProps {
  projects: Project[]
  onReorder: (projects: Project[]) => void
  onDelete: (id: number) => void
}

export default function SortableProjectList({
  projects,
  onReorder,
  onDelete,
}: SortableProjectListProps) {
  const move = (index: number, direction: number) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= projects.length) return

    const newProjects = [...projects]
    const [moved] = newProjects.splice(index, 1)
    newProjects.splice(newIndex, 0, moved)

    onReorder(newProjects)
  }

  return (
    <ul className="space-y-3">
      {projects.map((project, index) => (
        <GlassCard
          as="li"
          key={project.id}
          className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-4"
        >
          <div className="flex items-start md:items-center gap-3">
            <span className="text-theme-secondary text-sm min-w-[2rem]">
              #{project.display_order}
            </span>
            <div>
              <h3 className="font-medium text-theme-primary text-base">
                {project.title}
              </h3>
              <p className="text-theme-secondary text-sm">/{project.slug}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:flex md:flex-row gap-2">
            <div className="grid grid-cols-2 gap-2 md:flex md:flex-col">
              <Button
                type="button"
                variant="secondary"
                className="min-h-[44px] text-sm md:px-2 md:py-1"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Mover ${project.title} para cima`}
              >
                <span className="md:hidden">Subir</span>
                <span className="hidden md:inline">↑</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="min-h-[44px] text-sm md:px-2 md:py-1"
                onClick={() => move(index, 1)}
                disabled={index === projects.length - 1}
                aria-label={`Mover ${project.title} para baixo`}
              >
                <span className="md:hidden">Descer</span>
                <span className="hidden md:inline">↓</span>
              </Button>
            </div>
            <Button
              asChild
              variant="secondary"
              className="min-h-[44px] text-sm"
            >
              <Link href={`/admin/projects/${project.id}/edit`}>Editar</Link>
            </Button>
            <Button
              variant="danger"
              className="min-h-[44px] text-sm"
              onClick={() => onDelete(project.id)}
            >
              Excluir
            </Button>
          </div>
        </GlassCard>
      ))}
    </ul>
  )
}
```

- [ ] **Step 3: Verify visually**

Run dev server: `npm run dev -- -p 3002`
Open: http://localhost:3002/admin/projects
Resize browser to < 768 px width.
Expected: each project renders as a vertical card with order badge, title, slug, and four action buttons in a 2x2 grid.

- [ ] **Step 4: Run tests**

Run: `npm test -- --run`
Expected: all 47 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/projects/SortableProjectList.tsx
git commit -m "feat(admin): responsive mobile layout for project list"
```

---

### Task 2: Admin header mobile-friendly

**Files:**
- Modify: `src/components/admin/AdminHeader.tsx`

- [ ] **Step 1: Read current file**

Read: `src/components/admin/AdminHeader.tsx`

- [ ] **Step 2: Hide user email on small screens**

Replace the email `span` with a version that is hidden on mobile:

```tsx
<span className="hidden md:inline text-theme-muted text-sm">{email}</span>
```

Also reduce gap on mobile and keep on desktop:

```tsx
<div className="flex items-center gap-3 md:gap-6">
```

Final full component:

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

interface AdminHeaderProps {
  email: string
}

export default function AdminHeader({ email }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        router.push('/admin/login')
        router.refresh()
      } else {
        alert('Falha ao sair. Tente novamente.')
      }
    } catch {
      alert('Erro de rede ao sair.')
    }
  }

  return (
    <header className="flex justify-between items-center mb-8 pb-4 border-b border-theme-border gap-4">
      <div className="flex items-center gap-3 md:gap-6 min-w-0">
        <Link href="/admin/projects" className="text-xl font-bold text-gradient shrink-0">
          Admin
        </Link>
        <span className="hidden md:inline text-theme-muted text-sm truncate">
          {email}
        </span>
      </div>
      <Button variant="secondary" onClick={handleLogout}>
        Sair
      </Button>
    </header>
  )
}
```

- [ ] **Step 3: Verify visually**

Open http://localhost:3002/admin/projects on mobile viewport.
Expected: header shows "Admin" and "Sair"; email is hidden.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/AdminHeader.tsx
git commit -m "feat(admin): hide user email on mobile header"
```

---

### Task 3: Responsive padding in admin layout

**Files:**
- Modify: `src/app/admin/(protected)/layout.tsx`

- [ ] **Step 1: Read current file**

Read: `src/app/admin/(protected)/layout.tsx`

- [ ] **Step 2: Reduce horizontal padding on mobile**

Change:

```tsx
<div className="min-h-screen px-4 md:px-6 py-8 max-w-5xl mx-auto">
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/(protected)/layout.tsx
git commit -m "feat(admin): responsive padding in admin layout"
```

---

### Task 4: Mobile-friendly form buttons

**Files:**
- Modify: `src/components/projects/ProjectForm.tsx`

- [ ] **Step 1: Read current file**

Read: `src/components/projects/ProjectForm.tsx`

- [ ] **Step 2: Stack action buttons on mobile**

Locate the flex container with Salvar/Cancelar buttons and change it to:

```tsx
<div className="flex flex-col sm:flex-row gap-4">
```

- [ ] **Step 3: Verify visually**

Open http://localhost:3002/admin/projects/new on mobile viewport.
Expected: "Salvar" and "Cancelar" are stacked vertically; on desktop they are side by side.

- [ ] **Step 4: Commit**

```bash
git add src/components/projects/ProjectForm.tsx
git commit -m "feat(admin): stack form action buttons on mobile"
```

---

### Task 5: Final verification

**Files:** all of the above.

- [ ] **Step 1: Run full test suite**

Run: `npm test -- --run`
Expected: 47 tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: build succeeds with no errors.

- [ ] **Step 3: Manual mobile checks**

Open these URLs at viewport width < 768 px:
- http://localhost:3002/admin/projects
- http://localhost:3002/admin/projects/new
- http://localhost:3002/admin/projects/1/edit

Expected:
- Project list shows vertical cards.
- Header does not break.
- Form buttons stack.
- Theme toggle still works.

- [ ] **Step 4: Commit final verification log (optional)**

No file changes needed; if any fixes were required, commit them.

---

## Self-review

- **Spec coverage:**
  - Card vertical no mobile → Task 1.
  - Botões grandes/área de toque → Task 1 (`min-h-[44px]`).
  - Desktop inalterado → Task 1 mantém layout `md:flex-row`.
  - Ajustes de header/layout/form → Tasks 2, 3, 4.
  - Build/testes → Task 5.
- **Placeholder scan:** no TBD/TODO; todos os passos têm código ou comando concreto.
- **Type consistency:** nenhuma nova interface foi introduzida; props existentes preservadas.
