// hooks/useProfile.ts
// Checks whether the player has a PlayerProfile resource at their address
// on the nuansa-ship-1 rollup. A successful mint_starter creates one.

import { useState, useEffect, useCallback } from 'react'
import { CONTRACT_ADDRESS } from '@/lib/contracts'

interface UseProfileResult {
  hasProfile: boolean
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!address) {
      setHasProfile(false)
      return
    }
    // If contract hasn't been deployed yet, always show MintScreen
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
      // 200 with a `resource` field = profile exists
      // 404 / 400 / any other = doesn't exist yet
      if (res.ok) {
        const j = await res.json()
        setHasProfile(Boolean(j?.resource ?? j?.data ?? j?.type))
      } else {
        setHasProfile(false)
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

  return { hasProfile, isLoading, error, refresh }
}
