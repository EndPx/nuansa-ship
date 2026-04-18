interface CompassWatermarkProps {
  size?: number
  opacity?: number
  tone?: 'brass' | 'teal'
  rings?: number
  rays?: number
  className?: string
}

const TONE_COLOR: Record<NonNullable<CompassWatermarkProps['tone']>, string> = {
  brass: '#C8A255',
  teal: '#2A9D8F',
}

/**
 * Slow-rotating rhumb / compass SVG used as ambient backdrop on
 * Landing, Mint, Port. Pure decorative — no interactivity.
 *
 * Wrap in a `<div className="slow-rotate">…</div>` to animate.
 */
export function CompassWatermark({
  size = 820,
  opacity = 0.05,
  tone = 'brass',
  rings = 4,
  rays = 32,
  className = '',
}: CompassWatermarkProps) {
  const c = size / 2
  const color = TONE_COLOR[tone]
  const ringRadii = Array.from({ length: rings }, (_, i) =>
    c - 2 - i * ((c - 40) / rings),
  )
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ opacity }}
    >
      {ringRadii.map((r, i) => (
        <circle
          key={i}
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={i === 0 ? 1 : 0.5}
        />
      ))}
      {Array.from({ length: rays }, (_, i) => {
        const a = (i * Math.PI * 2) / rays
        return (
          <line
            key={i}
            x1={c}
            y1={c}
            x2={c + Math.cos(a) * (c - 2)}
            y2={c + Math.sin(a) * (c - 2)}
            stroke={color}
            strokeWidth={0.4}
          />
        )
      })}
    </svg>
  )
}
