'use client'

import { useEffect, useState } from 'react'

/**
 * Persists per-wallet battle records in localStorage. Keyed by the
 * connected bech32 address so different captains keep separate logs.
 *
 * Tracks: wins, losses, highestWave, totalBattles. Increments are
 * driven by listening to `battle:outcome` window events.
 */
export interface BattleStats {
  wins: number
  losses: number
  highestWave: number
  totalBattles: number
}

const EMPTY: BattleStats = { wins: 0, losses: 0, highestWave: 0, totalBattles: 0 }

function storageKey(address: string | null): string | null {
  if (!address) return null
  return `nuansa-ship:battlestats:${address}`
}

function read(address: string | null): BattleStats {
  const key = storageKey(address)
  if (!key || typeof window === 'undefined') return EMPTY
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    return {
      wins: Number(parsed.wins) || 0,
      losses: Number(parsed.losses) || 0,
      highestWave: Number(parsed.highestWave) || 0,
      totalBattles: Number(parsed.totalBattles) || 0,
    }
  } catch {
    return EMPTY
  }
}

function write(address: string | null, stats: BattleStats) {
  const key = storageKey(address)
  if (!key || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(stats))
  } catch {
    // localStorage quota or disabled — silent
  }
}

export function useBattleStats(address: string | null | undefined) {
  const [stats, setStats] = useState<BattleStats>(EMPTY)

  // Hydrate on mount + on wallet change
  useEffect(() => {
    setStats(read(address ?? null))
  }, [address])

  // Subscribe to battle:outcome so stats auto-update while user plays
  useEffect(() => {
    if (!address) return
    const onOutcome = (e: Event) => {
      const d = (e as CustomEvent).detail
      if (!d) return
      const next = { ...read(address) }
      if (d.status === 'won') {
        next.wins += 1
        next.totalBattles += 1
      } else if (d.status === 'lost') {
        next.losses += 1
        next.totalBattles += 1
      }
      if (typeof d.wave === 'number' && d.wave > next.highestWave) {
        next.highestWave = d.wave
      }
      write(address, next)
      setStats(next)
    }
    window.addEventListener('battle:outcome', onOutcome)
    return () => window.removeEventListener('battle:outcome', onOutcome)
  }, [address])

  const reset = () => {
    write(address ?? null, EMPTY)
    setStats(EMPTY)
  }

  return { stats, reset }
}
