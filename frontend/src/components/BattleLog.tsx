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

  const typeLabel: Record<string, string> = {
    move:   'MOV',
    attack: 'ATK',
    skill:  'SKL',
    enemy:  'ENM',
    system: 'SYS',
    reward: 'RWD',
  }

  return (
    <div
      ref={logRef}
      className="font-hud text-sm space-y-1.5 max-h-[440px] overflow-y-auto pr-1 leading-snug"
    >
      {events.map((event) => {
        const color = typeColor[event.type] ?? 'var(--teal-glow)'
        return (
          <div
            key={event.id}
            className="flex gap-2 items-start pl-2 py-0.5 border-l-2 transition-colors hover:bg-[color:var(--teal-dim)]/5"
            style={{ borderColor: color }}
          >
            <span
              className="text-[10px] opacity-55 shrink-0 mt-0.5 tracking-wider"
              style={{ color: 'var(--teal-dim)' }}
            >
              {new Date(event.timestamp).toTimeString().slice(0, 8)}
            </span>
            <span
              className="shrink-0 flex items-center gap-1 text-[10px] tracking-[0.2em] mt-0.5 px-1.5 border"
              style={{
                color,
                borderColor: `${color}55`,
                background: `${color}10`,
              }}
            >
              <span>{typeGlyph[event.type]}</span>
              <span>{typeLabel[event.type] ?? 'LOG'}</span>
            </span>
            <span
              className="break-words flex-1"
              style={{ color: event.type === 'system' ? 'var(--parchment)' : color }}
            >
              {event.message}
            </span>
          </div>
        )
      })}
      <div className="font-hud text-xs text-[color:var(--teal-dim)] cursor-blink mt-2 pl-2">
        &gt; awaiting
      </div>
    </div>
  )
}
