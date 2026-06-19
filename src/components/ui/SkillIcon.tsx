interface SkillIconProps {
  name: string
  className?: string
}

const officialIcons: Record<string, string> = {
  Rust: '/icons/rust.svg',
  C: '/icons/c.svg',
  'C++': '/icons/cpp.svg',
  TypeScript: '/icons/typescript.svg',
  SDL3: '/icons/sdl.svg',
}

export default function SkillIcon({ name, className = 'w-5 h-5' }: SkillIconProps) {
  const src = officialIcons[name]

  if (src) {
    return <img src={src} alt={`${name} logo`} className={`${className} object-contain`} />
  }

  const icons: Record<string, React.ReactNode> = {
    Compilers: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
    'Game Engines': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 11h.01M10 11h4M8 15h8" />
      </svg>
    ),
    'UI Toolkits': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  }

  return <>{icons[name] || null}</>
}
