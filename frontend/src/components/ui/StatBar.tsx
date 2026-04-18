import { useEffect, useRef, useState } from 'react'

type Variant = 'teal' | 'blood' | 'gold' | 'auto'

interface StatBarProps {
  label: string
  /** Numeric value drives the bar; string values render label-only (no bar). */
  current: number | string
  max?: number
  variant?: Variant
  /** When true, flash white briefly each time `current` decreases. */
  flash?: boolean
  className?: string
}

const COLORS: Record<Exclude<Variant, 'auto'>, string> = {
  teal: '#52E0C4',
  blood: '#E63946',
  gold: '#F4A261',
}

function autoColor(pct: number): string {
  if (pct > 60) return COLORS.teal
  if (pct > 25) return COLORS.gold
  return COLORS.blood
}

/**
 * Labeled progress bar. Drives HP, XP, material percentages, etc.
 * With `flash` enabled, it emits a brief white overlay when the value drops —
 * used for damage feedback on HP bars.
 */
export function StatBar({
  label,
  current,
  max,
  variant = 'teal',
  flash = false,
  className = '',
}: StatBarProps) {
  const numeric = typeof current === 'number' ? current : null
  const pct = numeric !== null && max ? Math.min(100, (numeric / max) * 100) : null
  const color = variant === 'auto' && pct !== null ? autoColor(pct) : COLORS[variant === 'auto' ? 'teal' : variant]

  const prev = useRef(numeric ?? 0)
  const [flashing, setFlashing] = useState(false)
  useEffect(() => {
    if (flash && numeric !== null && numeric < prev.current) {
      setFlashing(true)
      const t = setTimeout(() => setFlashing(false), 160)
      prev.current = numeric
      return () => clearTimeout(t)
    }
    if (numeric !== null) prev.current = numeric
  }, [numeric, flash])

  return (
    <div className={className}>
      <div className="flex justify-between font-hud text-xs mb-1">
        <span className="text-[color:var(--teal-dim)] tracking-wider">{label}</span>
        <span style={{ color }}>
          {current}
          {numeric !== null && max ? ` / ${max}` : ''}
        </span>
      </div>
      {pct !== null && (
        <div className="h-2 bg-[color:var(--abyss)] border border-[color:var(--teal-dim)]/30 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${color}55 0%, ${color} 100%)`,
              boxShadow: `0 0 10px ${color}aa`,
            }}
          />
          {flashing && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'rgba(255,255,255,0.75)', mixBlendMode: 'screen' }}
            />
          )}
        </div>
      )}
    </div>
  )
}
