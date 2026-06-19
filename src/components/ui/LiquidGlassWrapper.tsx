'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const LiquidGlass = dynamic(() => import('liquid-glass-react'), {
  ssr: false,
})

type LiquidGlassProps = ComponentProps<typeof LiquidGlass>

export default function LiquidGlassWrapper(props: LiquidGlassProps) {
  return <LiquidGlass {...props} />
}
