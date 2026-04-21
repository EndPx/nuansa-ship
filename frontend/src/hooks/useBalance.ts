'use client'

import { useCallback, useEffect, useState } from 'react'

/** Queries umin balance of an address via the rollup REST (localhost:1317). */
export function useBalance(address: string | null | undefined, pollMs = 12_000) {
  const [umin, setUmin] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!address) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `http://localhost:1317/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=umin`,
      )
      if (!res.ok) throw new Error(`REST ${res.status}`)
      const j = await res.json()
      const amt = Number(j?.balance?.amount ?? 0)
      setUmin(Number.isFinite(amt) ? amt : 0)
    } catch (e: any) {
      setError(String(e?.message ?? e).slice(0, 120))
      setUmin(null)
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    if (!address) {
      setUmin(null)
      return
    }
    refresh()
    const t = setInterval(refresh, pollMs)
    return () => clearInterval(t)
  }, [address, pollMs, refresh])

  return {
    umin,
    nst: umin === null ? null : umin / 1_000_000,
    error,
    isLoading,
    refresh,
  }
}
