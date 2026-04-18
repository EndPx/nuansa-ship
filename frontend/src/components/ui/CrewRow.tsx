interface CrewRowProps {
  role: number // 0=Gunner 1=Navigator 2=Engineer
  hp: number   // 0..100
  status: number // 0=Ready 1=Injured 2=KO
  compact?: boolean
}

const ROLES = ['Gunner', 'Navigator', 'Engineer']
const ICONS = ['💥', '🧭', '🔧']
const STATUS_COLORS = ['#52E0C4', '#F4A261', '#E63946']
const STATUS_TEXT = ['READY', 'INJURED', 'KO']

/**
 * Crew member row: role icon, name, hp bar, status chip.
 * Used in Port dossier and Battle crew panels.
 */
export function CrewRow({ role, hp, status, compact = false }: CrewRowProps) {
  const safeRole = Math.max(0, Math.min(2, role))
  const safeStatus = Math.max(0, Math.min(2, status))
  const hpColor = hp > 50 ? '#52E0C4' : hp > 0 ? '#F4A261' : '#E63946'

  if (compact) {
    return (
      <div className="flex items-center justify-between font-mono text-sm py-1 border-b border-[color:var(--teal-dim)]/20 last:border-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">{ICONS[safeRole]}</span>
          <span className="text-[color:var(--parchment)]">{ROLES[safeRole]}</span>
        </div>
        <span
          className="font-hud text-xs tracking-wider"
          style={{ color: STATUS_COLORS[safeStatus] }}
        >
          {STATUS_TEXT[safeStatus]}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 border-b border-[color:var(--teal-dim)]/20 pb-2 last:border-b-0 last:pb-0">
      <div className="text-2xl">{ICONS[safeRole]}</div>
      <div className="flex-1">
        <div className="font-display text-sm text-[color:var(--parchment)]">
          {ROLES[safeRole]}
        </div>
        <div className="h-1 bg-[color:var(--abyss)] mt-1 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 transition-all"
            style={{ width: `${Math.max(0, Math.min(100, hp))}%`, background: hpColor }}
          />
        </div>
      </div>
      <div
        className="font-hud text-xs tracking-wider"
        style={{ color: STATUS_COLORS[safeStatus] }}
      >
        {STATUS_TEXT[safeStatus]}
      </div>
    </div>
  )
}
