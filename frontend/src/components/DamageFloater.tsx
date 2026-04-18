'use client'

import { useEffect, useRef, useState } from 'react'

interface Floater {
  id: number
  amount: number
  x: number
  y: number
  color: string
  prefix: string
  crit: boolean
}

const MAX_FLOATERS = 12

/**
 * Listens to `battle:damage` events and spawns floating numbers
 * over the canvas area. Lives inside a relatively-positioned
 * parent (the canvas CornerFrame).
 *
 * Event payload: { amount, side, x, y, crit?, kind? }
 *   - side: 'player' | 'enemy' — whose ship took the hit
 *   - kind: 'damage' | 'heal'  — optional, defaults to 'damage'
 *   - x, y: pixel coords relative to the canvas (0–640, 0–512)
 */
export function DamageFloater() {
  const [floaters, setFloaters] = useState<Floater[]>([])
  const idRef = useRef(1)

  useEffect(() => {
    const onDamage = (e: Event) => {
      const d = (e as CustomEvent).detail
      if (!d || typeof d.amount !== 'number') return

      const kind = d.kind ?? 'damage'
      const crit = Boolean(d.crit)
      const color =
        kind === 'heal'
          ? 'var(--teal-glow)'
          : crit
          ? 'var(--gold)'
          : 'var(--blood)'
      const prefix = kind === 'heal' ? '+' : '-'

      const f: Floater = {
        id: idRef.current++,
        amount: Math.abs(d.amount),
        x: typeof d.x === 'number' ? d.x : 320,
        y: typeof d.y === 'number' ? d.y : 256,
        color,
        prefix,
        crit,
      }

      setFloaters((prev) => {
        const next = [...prev, f]
        // Cap concurrent floaters to prevent runaway DOM
        return next.length > MAX_FLOATERS ? next.slice(-MAX_FLOATERS) : next
      })

      setTimeout(() => {
        setFloaters((prev) => prev.filter((x) => x.id !== f.id))
      }, 900)
    }

    window.addEventListener('battle:damage', onDamage)
    return () => window.removeEventListener('battle:damage', onDamage)
  }, [])

  return (
    <div className="dmg-layer">
      {floaters.map((f) => (
        <div
          key={f.id}
          className="dmg-num damage-float"
          style={{
            left: f.x,
            top: f.y,
            color: f.color,
            fontSize: f.crit ? 36 : 28,
          }}
        >
          {f.prefix}
          {f.amount}
          {f.crit && <span className="ml-1 text-sm align-super">CRIT</span>}
        </div>
      ))}
    </div>
  )
}
