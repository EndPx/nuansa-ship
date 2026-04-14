'use client'

import { useState, useEffect, useRef } from 'react'

interface BattleEvent {
  id: number
  type: 'move' | 'attack' | 'skill' | 'enemy' | 'system'
  message: string
  timestamp: number
}

export function BattleLog() {
  const [events, setEvents] = useState<BattleEvent[]>([
    { id: 0, type: 'system', message: 'Battle system initialized.', timestamp: Date.now() },
  ])
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleBattleEvent = (e: CustomEvent) => {
      const { type, message } = e.detail
      setEvents((prev) => [
        ...prev,
        {
          id: prev.length,
          type,
          message,
          timestamp: Date.now(),
        },
      ])
    }

    window.addEventListener('battle:log' as any, handleBattleEvent)
    return () => {
      window.removeEventListener('battle:log' as any, handleBattleEvent)
    }
  }, [])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [events])

  const typeColors: Record<string, string> = {
    move: 'text-blue-400',
    attack: 'text-red-400',
    skill: 'text-yellow-400',
    enemy: 'text-orange-400',
    system: 'text-stone',
  }

  return (
    <div className="bg-navy-400 border border-teal/30 rounded-lg w-64 h-[512px] flex flex-col">
      <div className="px-3 py-2 border-b border-teal/10">
        <h3 className="text-sm font-semibold text-teal">Battle Log</h3>
      </div>
      <div ref={logRef} className="flex-1 overflow-y-auto p-3 space-y-1">
        {events.map((event) => (
          <div key={event.id} className="text-xs">
            <span className={typeColors[event.type] || 'text-white'}>
              [{event.type.toUpperCase()}]
            </span>{' '}
            <span className="text-white/80">{event.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
