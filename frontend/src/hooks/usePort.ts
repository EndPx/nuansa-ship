// hooks/usePort.ts
// Live on-chain Port + Inventory state for the connected wallet.

'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Port, Inventory } from '@/lib/types'
import { fetchMoveResource } from '@/lib/rest'

interface UsePortResult {
  port: Port | null
  inventory: Inventory | null
  isLoading: boolean
  error: string | null
  refreshPort: () => Promise<void>
}

interface PortRaw {
  owner: string
  shipyard_level: number
  armory_level: number
  barracks_level: number
  admirals_hall_level: number
  warehouse_level: number
}

interface InventoryRaw {
  items: Array<{ item_type: number; amount: number | string }>
}

export function usePort(address: string | null): UsePortResult {
  const [port, setPort] = useState<Port | null>(null)
  const [inventory, setInventory] = useState<Inventory | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshPort = useCallback(async () => {
    if (!address) {
      setPort(null)
      setInventory(null)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const [portRaw, invRaw] = await Promise.all([
        fetchMoveResource<PortRaw>(address, 'port', 'Port'),
        fetchMoveResource<InventoryRaw>(address, 'port', 'Inventory'),
      ])

      if (portRaw) {
        setPort({
          owner: portRaw.owner,
          shipyardLevel: Number(portRaw.shipyard_level) || 0,
          armoryLevel: Number(portRaw.armory_level) || 0,
          barracksLevel: Number(portRaw.barracks_level) || 0,
          admiralsHallLevel: Number(portRaw.admirals_hall_level) || 0,
          warehouseLevel: Number(portRaw.warehouse_level) || 0,
        })
      } else {
        setPort(null)
      }

      if (invRaw) {
        setInventory({
          items: (invRaw.items ?? []).map((it) => ({
            itemType: Number(it.item_type),
            amount: Number(it.amount),
          })),
        })
      } else {
        setInventory({ items: [] })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch port')
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    refreshPort()
  }, [refreshPort])

  // Re-pull port state when an upgrade tx confirms (simple polling avoidance)
  useEffect(() => {
    const onConfirmed = (e: Event) => {
      const tag = (e as CustomEvent).detail?.tag ?? ''
      if (typeof tag === 'string' && tag.startsWith('upgrade')) {
        refreshPort()
      }
    }
    window.addEventListener('chain:confirmed', onConfirmed)
    return () => window.removeEventListener('chain:confirmed', onConfirmed)
  }, [refreshPort])

  return { port, inventory, isLoading, error, refreshPort }
}
