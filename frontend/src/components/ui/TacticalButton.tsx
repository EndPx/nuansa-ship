import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'teal' | 'blood' | 'gold'

interface TacticalButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  variant?: Variant
  /** Apply `glitch-hover` micro-shake animation on hover. */
  glitch?: boolean
  /** Render as a rectangular action rail button (battle page) rather than the diagonal tactical button. */
  rail?: boolean
}

const BORDER: Record<Variant, string> = {
  teal: 'var(--teal)',
  blood: 'var(--blood)',
  gold: 'var(--gold)',
}
const COLOR: Record<Variant, string> = {
  teal: 'var(--teal-glow)',
  blood: '#ffb3b8',
  gold: 'var(--gold)',
}

/**
 * Unified tactical button. Replaces the scattered `btn-tactical` CSS class
 * usage and the per-page `ActionBtn` component.
 *
 * - `variant="teal"` default (commission, navigate)
 * - `variant="blood"` destructive/combat (set sail, attack)
 * - `variant="gold"` skill/special
 * - `rail` disables diagonal clip-path for action-rail style buttons
 */
export function TacticalButton({
  children,
  variant = 'teal',
  glitch = false,
  rail = false,
  className = '',
  ...rest
}: TacticalButtonProps) {
  const base = rail
    ? 'flex-1 font-hud tracking-[0.2em] text-base py-3 border transition-all hover:bg-[color:var(--teal-dim)]/20 disabled:opacity-40 disabled:cursor-not-allowed'
    : `btn-tactical ${variant === 'blood' ? 'variant-blood' : variant === 'gold' ? 'variant-gold' : ''} ${glitch ? 'glitch-hover' : ''}`

  const style = rail
    ? { borderColor: BORDER[variant], color: COLOR[variant] }
    : undefined

  return (
    <button
      {...rest}
      className={`${base} ${className}`.trim()}
      style={style}
    >
      {children}
    </button>
  )
}
