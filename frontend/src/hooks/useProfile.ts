// hooks/useProfile.ts
// Check if player has a PlayerProfile on-chain
// TODO: Replace with real on-chain query once contracts are deployed

import { useState, useEffect } from 'react'

interface UseProfileResult {
  hasProfile: boolean
  isLoading: boolean
  error: string | null
}

export function useProfile(address: string | null): UseProfileResult {
  const [hasProfile, setHasProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setHasProfile(false)
      setIsLoading(false)
      return
    }

    const checkProfile = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // TODO: Query on-chain PlayerProfile resource
        // const res = await fetch(`${REST_URL}/initia/move/v1/accounts/${address}/resources`)
        // const data = await res.json()
        // const profile = data.resources.find(r => r.type.includes('PlayerProfile'))
        // setHasProfile(!!profile)

        // Stub: always return false (forces MintScreen)
        setHasProfile(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check profile')
        setHasProfile(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkProfile()
  }, [address])

  return { hasProfile, isLoading, error }
}
