import type { ReactNode } from 'react'

type Accent = 'teal' | 'blood' | 'gold'

interface PanelProps {
  title: string
  children: ReactNode
  accent?: Accent
  className?: string
}

const ACCENT_MAP: Record<Accent, string> = {
  teal: 'var(--teal-glow)',
  blood: 'var(--blood)',
  gold: 'var(--gold)',
}

/**
 * Console-styled card with title strip and corner brackets.
 * Use for all dossier / telemetry / inventory panels across the app.
 */
export function Panel({ title, children, accent = 'teal', className = '' }: PanelProps) {
  const color = ACCENT_MAP[accent]
  return (
    <div className={`box-console p-4 relative ${className}`}>
      <div
        className="font-hud text-sm tracking-[0.25em] mb-3 pb-2 border-b border-[color:var(--teal-dim)]/30"
        style={{ color }}
      >
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
