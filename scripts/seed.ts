import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function seed() {
  const { getDatabase, initializeDatabase } = await import('../src/lib/db')
  const { hashPassword } = await import('../src/lib/auth')
  const { createProject } = await import('../src/lib/projects')

  // Initialize database schema
  initializeDatabase()
  const db = getDatabase()

  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set')
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (!existing) {
    const hash = await hashPassword(password)
    db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, hash)
    console.log('Admin user created')
  }

  const existingProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }
  if (existingProjects.count > 0) {
    console.log('Projects already seeded')
    process.exit(0)
  }

  const projects = [
    {
      title: 'Copper Lang',
      slug: 'copper-lang',
      short_description: 'Uma linguagem de alto nível que transpila para Rust, mantendo performance com sintaxe moderna.',
      description: `Copper é uma linguagem de alto nível que transpila para Rust. Ela combina a performance do Rust com uma sintaxe que parece uma linguagem de script moderna: interpolação de strings, optional chaining, ternários, e formas de loop/match/closure no estilo JavaScript.

O toolchain "cforge" cuida da compilação, instalação e execução de projetos Copper. A linguagem suporta classes, imports, e uma std crescente.`,
      image_path: '/uploads/copper-lang.png',
      github_url: 'https://github.com/liy77/copper-lang',
      website_url: '',
      display_order: 0,
    },
    {
      title: 'Mocida',
      slug: 'mocida',
      short_description: 'Toolkit de UI modular em C sobre SDL3, com bindings idiomáticos em Rust.',
      description: `Mocida é um toolkit de UI modular escrito em C sobre SDL3. O monorepo inclui a biblioteca C, bindings Rust (mocida-sys + mocida idiomático), e um build orchestrator em Python que compila tudo em um único comando cross-platform.

Foi projetada para ser leve, nativa e sem depender de stacks web.`,
      image_path: '/uploads/mocida.svg',
      github_url: 'https://github.com/liy77/mocida',
      website_url: '',
      display_order: 1,
    },
    {
      title: 'OndaEngine',
      slug: 'ondaengine',
      short_description: 'Engine de jogos 2D + editor, construída com Mocida e a linguagem Copper.',
      description: `OndaEngine é uma engine de jogos 2D com editor completo. O editor tem visual VSCode — file tree, editor com syntax highlighting, inspector, scene view e play mode — e é escrito inteiramente em MUI, o sistema declarativo de UI do Mocida.

O host é Rust, a engine é Copper, e a renderização é SDL3 nativa, sem Electron, sem web stack.`,
      image_path: '/uploads/ondaengine.png',
      github_url: 'https://github.com/liy77/OndaEngine',
      website_url: '',
      display_order: 2,
    },
  ]

  for (const project of projects) {
    createProject(project)
  }

  console.log('Projects seeded')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
