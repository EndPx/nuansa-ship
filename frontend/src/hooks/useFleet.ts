// hooks/useFleet.ts
// Fetch captain + ship + crew NFT data from on-chain
// TODO: Replace stubs with real on-chain queries once contracts are deployed

import { useState } from 'react'
import type { CaptainStats, ShipStats, CrewStats } from '@/lib/types'

interface UseFleetResult {
  captain: CaptainStats | null
  ship: ShipStats | null
  crew: CrewStats[]
  isLoading: boolean
  error: string | null
  refreshFleet: () => Promise<void>
}

export function useFleet(address: string | null): UseFleetResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stub fleet data
  const captain: CaptainStats | null = address
    ? {
        leadership: 50,
        tactics: 50,
        specialSkillId: 0,
        xp: 0,
        level: 1,
      }
    : null

  const ship: ShipStats | null = address
    ? {
        shipClass: 0,
        hull: 500,
        maxHull: 500,
        engine: 4,
        weaponDamage: 60,
        weaponRange: 2,
        armor: 5,
        captainTokenId: '',
        crewTokenIds: [],
      }
    : null

  const crew: CrewStats[] = address
    ? [
        {
          role: 0,
          skillId: 0,
          morale: 50,
          hp: 100,
          status: 0,
        },
      ]
    : []

  const refreshFleet = async () => {
    setIsLoading(true)
    try {
      // TODO: Fetch fleet NFT data from chain
      console.log('Refreshing fleet data for', address)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch fleet')
    } finally {
      setIsLoading(false)
    }
  }

  return { captain, ship, crew, isLoading, error, refreshFleet }
}
