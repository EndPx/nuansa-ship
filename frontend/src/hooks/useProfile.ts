// hooks/useProfile.ts
// Checks whether the player has a PlayerProfile resource at their address
// on the nuansa-ship-1 rollup. A successful mint_starter creates one.

import { useState, useEffect, useCallback } from 'react'
import { CONTRACT_ADDRESS } from '@/lib/contracts'

interface UseProfileResult {
  hasProfile: boolean
  /** Captain name the player chose at mint — from PlayerProfile.captain_token_id */
  captainName: string | null
  /** Player's flagship NFT id — from PlayerProfile.ship_token_id */
  shipTokenId: string | null
  /** Crew NFT ids — from PlayerProfile.crew_token_ids */
  crewTokenIds: string[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

// Module hex address (struct tag requires HEX per Initia skill rules).
// Derived from the deployer bech32 once at module load.
const MODULE_HEX = '0x4224dcc266eee2869c03d7757b324ecf678ac2ed'
const STRUCT_TAG = `${MODULE_HEX}::mint_starter::PlayerProfile`

const REST = 'http://localhost:1317'

export function useProfile(address: string | null): UseProfileResult {
  const [hasProfile, setHasProfile] = useState(false)
  const [captainName, setCaptainName] = useState<string | null>(null)
  const [shipTokenId, setShipTokenId] = useState<string | null>(null)
  const [crewTokenIds, setCrewTokenIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!address) {
      setHasProfile(false)
      setCaptainName(null)
      setShipTokenId(null)
      setCrewTokenIds([])
      return
    }
    if (!CONTRACT_ADDRESS) {
      setHasProfile(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const url = `${REST}/initia/move/v1/accounts/${address}/resources/by_struct_tag?struct_tag=${encodeURIComponent(
        STRUCT_TAG,
      )}`
      const res = await fetch(url)
      if (!res.ok) {
        setHasProfile(false)
        setCaptainName(null)
        setShipTokenId(null)
        setCrewTokenIds([])
        return
      }
      const j = await res.json()
      // Resource payload comes back as { resource: { type, move_resource: "..." } }
      // where move_resource is a JSON string with the struct fields. Parse it.
      const moveResourceRaw =
        j?.resource?.move_resource ?? j?.move_resource ?? null
      if (moveResourceRaw) {
        let parsed: any = null
        try {
          parsed = typeof moveResourceRaw === 'string'
            ? JSON.parse(moveResourceRaw)
            : moveResourceRaw
        } catch {
          parsed = null
        }
        // Accept either flat fields or nested under .data
        const data = parsed?.data ?? parsed ?? {}
        const cap = data.captain_token_id ?? null
        const ship = data.ship_token_id ?? null
        const crew = Array.isArray(data.crew_token_ids) ? data.crew_token_ids : []
        setHasProfile(true)
        setCaptainName(typeof cap === 'string' && cap.length > 0 ? cap : null)
        setShipTokenId(typeof ship === 'string' && ship.length > 0 ? ship : null)
        setCrewTokenIds(crew.filter((s: any) => typeof s === 'string'))
      } else {
        // Resource exists but in unexpected shape — treat as profile present
        // without details so the gate still opens to /port.
        setHasProfile(Boolean(j?.resource ?? j?.data ?? j?.type))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check profile')
      setHasProfile(false)
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { hasProfile, captainName, shipTokenId, crewTokenIds, isLoading, error, refresh }
}
