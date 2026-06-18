interface SkillIconProps {
  name: string
  className?: string
}

export default function SkillIcon({ name, className = 'w-4 h-4' }: SkillIconProps) {
  const icons: Record<string, React.ReactNode> = {
    Rust: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14.5h-9c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h9c.28 0 .5.22.5.5s-.22.5-.5.5zm0-3h-9c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h9c.28 0 .5.22.5.5s-.22.5-.5.5zm-4.5-6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
      </svg>
    ),
    C: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M9.8 17.2c-2.6 0-4.5-2-4.5-5.2 0-3.2 1.9-5.2 4.5-5.2 1.4 0 2.6.6 3.4 1.6l-1.4 1.2c-.5-.7-1.2-1-2-1-1.6 0-2.7 1.3-2.7 3.4s1.1 3.4 2.7 3.4c.8 0 1.5-.4 2-1l1.4 1.2c-.8 1-2 1.6-3.4 1.6z" />
      </svg>
    ),
    'C++': (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M9.8 16.2c-2.1 0-3.5-1.6-3.5-4.2 0-2.6 1.4-4.2 3.5-4.2 1.1 0 2 .4 2.7 1.2l-1.1 1.1c-.4-.5-.9-.7-1.5-.7-1.2 0-2 1-2 2.6s.8 2.6 2 2.6c.6 0 1.1-.2 1.5-.7l1.1 1.1c-.7.8-1.6 1.2-2.7 1.2zM17 9h1.5v1.5H20V9h1.5v1.5h1.5V12h-1.5v1.5H20V12h-1.5v1.5H17V12h1.5v-1.5H17V9z" />
      </svg>
    ),
    TypeScript: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3 3h18v18H3V3zm10.5 13.5v-1.8h-3v1.8h3zm2.1-5.4c-.9-.5-2.1-.4-2.8.3-.5.5-.6 1.3-.1 1.8.4.4 1 .5 1.8.7.4.1.6.2.6.4 0 .3-.3.5-.8.5-.6 0-1.2-.2-1.8-.6l-.9 1.3c.8.6 1.8.9 2.8.9 1.5 0 2.5-.7 2.5-2 0-.9-.6-1.4-1.7-1.7-.5-.1-.8-.2-.8-.4 0-.2.2-.3.6-.3.5 0 1.1.2 1.6.5l.8-1.3c-.7-.5-1.5-.7-2.3-.7-.1 0-.2 0-.3.1z" />
      </svg>
    ),
    Compilers: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
    SDL3: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 11h.01M10 11h4M8 15h8" />
      </svg>
    ),
    'Game Engines': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 12h.01M18 12h.01M8 15l2-6 2 6" />
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
