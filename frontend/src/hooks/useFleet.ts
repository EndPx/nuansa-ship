// hooks/useFleet.ts
// Live on-chain captain + ship + crew state for the connected wallet.

'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CaptainStats, ShipStats, CrewStats } from '@/lib/types'
import { fetchMoveResource } from '@/lib/rest'

interface UseFleetResult {
  captain: CaptainStats | null
  ship: ShipStats | null
  crew: CrewStats[]
  isLoading: boolean
  error: string | null
  refreshFleet: () => Promise<void>
}

interface CaptainRaw {
  leadership: number
  tactics: number
  special_skill_id: number
  xp: number | string
  level: number
}

interface ShipRaw {
  ship_class: number
  hull: number | string
  max_hull: number | string
  engine: number
  weapon_damage: number | string
  weapon_range: number
  armor: number
  captain_token_id: string
  crew_token_ids: string[]
}

interface CrewMemberRaw {
  role: number
  skill_id: number
  morale: number
  hp: number
  status: number
}

interface CrewRosterRaw {
  members: CrewMemberRaw[]
}

export function useFleet(address: string | null): UseFleetResult {
  const [captain, setCaptain] = useState<CaptainStats | null>(null)
  const [ship, setShip] = useState<ShipStats | null>(null)
  const [crew, setCrew] = useState<CrewStats[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshFleet = useCallback(async () => {
    if (!address) {
      setCaptain(null)
      setShip(null)
      setCrew([])
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const [capRaw, shipRaw, crewRaw] = await Promise.all([
        fetchMoveResource<CaptainRaw>(address, 'captain', 'CaptainStats'),
        fetchMoveResource<ShipRaw>(address, 'ship', 'ShipStats'),
        fetchMoveResource<CrewRosterRaw>(address, 'crew', 'CrewRoster'),
      ])

      setCaptain(
        capRaw
          ? {
              leadership: Number(capRaw.leadership) || 0,
              tactics: Number(capRaw.tactics) || 0,
              specialSkillId: Number(capRaw.special_skill_id) || 0,
              xp: Number(capRaw.xp) || 0,
              level: Number(capRaw.level) || 1,
            }
          : null,
      )

      setShip(
        shipRaw
          ? {
              shipClass: Number(shipRaw.ship_class) || 0,
              hull: Number(shipRaw.hull) || 0,
              maxHull: Number(shipRaw.max_hull) || 0,
              engine: Number(shipRaw.engine) || 0,
              weaponDamage: Number(shipRaw.weapon_damage) || 0,
              weaponRange: Number(shipRaw.weapon_range) || 0,
              armor: Number(shipRaw.armor) || 0,
              captainTokenId: shipRaw.captain_token_id ?? '',
              crewTokenIds: Array.isArray(shipRaw.crew_token_ids)
                ? shipRaw.crew_token_ids
                : [],
            }
          : null,
      )

      const members = crewRaw?.members ?? []
      setCrew(
        members.map((m) => ({
          role: Number(m.role) || 0,
          skillId: Number(m.skill_id) || 0,
          morale: Number(m.morale) || 0,
          hp: Number(m.hp) || 0,
          status: Number(m.status) || 0,
        })),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch fleet')
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    refreshFleet()
  }, [refreshFleet])

  // Refresh when battle outcomes / claim_reward fire — XP and crew HP
  // both change as a result.
  useEffect(() => {
    const onConfirmed = (e: Event) => {
      const tag = (e as CustomEvent).detail?.tag ?? ''
      if (typeof tag === 'string' && (tag.includes('claim_reward') || tag.includes('rest_crew'))) {
        refreshFleet()
      }
    }
    const onOutcome = () => {
      // Battle outcome → crew/captain may have shifted
      refreshFleet()
    }
    window.addEventListener('chain:confirmed', onConfirmed)
    window.addEventListener('battle:outcome', onOutcome)
    return () => {
      window.removeEventListener('chain:confirmed', onConfirmed)
      window.removeEventListener('battle:outcome', onOutcome)
    }
  }, [refreshFleet])

  return { captain, ship, crew, isLoading, error, refreshFleet }
}
