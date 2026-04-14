// hooks/usePort.ts
// Fetch and mutate port state from on-chain data
// TODO: Replace stubs with real on-chain queries once contracts are deployed

import { useState } from 'react'
import type { Port, Inventory, Item } from '@/lib/types'

interface UsePortResult {
  port: Port | null
  inventory: Inventory | null
  isLoading: boolean
  error: string | null
  refreshPort: () => Promise<void>
}

export function usePort(address: string | null): UsePortResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stub port data
  const port: Port | null = address
    ? {
        owner: address,
        shipyardLevel: 0,
        armoryLevel: 0,
        barracksLevel: 0,
        admiralsHallLevel: 0,
        warehouseLevel: 0,
      }
    : null

  const inventory: Inventory | null = address
    ? {
        items: [
          { itemType: 0, amount: 5 },  // Iron Planks
          { itemType: 2, amount: 3 },  // Provisions
        ],
      }
    : null

  const refreshPort = async () => {
    setIsLoading(true)
    try {
      // TODO: Fetch port state from chain
      console.log('Refreshing port state for', address)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch port')
    } finally {
      setIsLoading(false)
    }
  }

  return { port, inventory, isLoading, error, refreshPort }
}
