'use client'

import { useState, useEffect, useRef } from 'react'

interface BattleEvent {
  id: number
  type: 'move' | 'attack' | 'skill' | 'enemy' | 'system' | 'reward'
  message: string
  timestamp: number
}

export function BattleLog() {
  const [events, setEvents] = useState<BattleEvent[]>([
    { id: 0, type: 'system', message: 'Link established. Fleet deployed.', timestamp: Date.now() },
    { id: 1, type: 'system', message: 'Enemy contact on grid 8,4.', timestamp: Date.now() },
  ])
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleBattleEvent = (e: CustomEvent) => {
      const { type, message } = e.detail
      setEvents((prev) => [
        ...prev,
        { id: prev.length, type, message, timestamp: Date.now() },
      ].slice(-30))
    }
    window.addEventListener('battle:log' as any, handleBattleEvent)
    return () => window.removeEventListener('battle:log' as any, handleBattleEvent)
  }, [])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [events])

  const typeColor: Record<string, string> = {
    move:   'var(--teal-glow)',
    attack: 'var(--blood)',
    skill:  'var(--gold)',
    enemy:  '#ff9f43',
    system: 'var(--teal-dim)',
    reward: 'var(--gold)',
  }

  const typeGlyph: Record<string, string> = {
    move:   '◇',
    attack: '⚔',
    skill:  '⚡',
    enemy:  '◆',
    system: '◉',
    reward: '✦',
  }

  return (
    <div
      ref={logRef}
      className="font-hud text-sm space-y-1 max-h-[440px] overflow-y-auto pr-1 leading-snug"
    >
      {events.map((event) => (
        <div key={event.id} className="flex gap-2 items-baseline">
          <span
            className="text-xs opacity-60 shrink-0"
            style={{ color: 'var(--teal-dim)' }}
          >
            {new Date(event.timestamp).toTimeString().slice(0, 8)}
          </span>
          <span
            className="shrink-0"
            style={{ color: typeColor[event.type] ?? 'var(--teal-glow)' }}
          >
            {typeGlyph[event.type]}
          </span>
          <span
            className="break-words"
            style={{ color: typeColor[event.type] ?? 'var(--parchment)' }}
          >
            {event.message}
          </span>
        </div>
      ))}
      <div className="font-hud text-xs text-[color:var(--teal-dim)] cursor-blink mt-2">
        &gt; awaiting
      </div>
    </div>
  )
}
