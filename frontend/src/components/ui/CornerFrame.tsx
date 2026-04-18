import type { ReactNode, CSSProperties } from 'react'

type Tone = 'teal' | 'blood'

interface CornerFrameProps {
  children: ReactNode
  tone?: Tone
  style?: CSSProperties
  className?: string
}

/**
 * Wraps children with 4 tactical corner brackets.
 * Use around the Phaser canvas or any "active display" frame.
 */
export function CornerFrame({ children, tone = 'teal', style, className = '' }: CornerFrameProps) {
  const color = tone === 'blood' ? 'var(--blood)' : 'var(--teal-glow)'
  return (
    <div className={`relative ${className}`} style={{ ...style, ['--corner-color' as string]: color }}>
      <span className="corner-bracket tl" />
      <span className="corner-bracket tr" />
      <span className="corner-bracket bl" />
      <span className="corner-bracket br" />
      {children}
    </div>
  )
}
