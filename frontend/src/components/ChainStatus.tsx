'use client'

import { useEffect, useState } from 'react'
import { useInterwovenKit } from '@initia/interwovenkit-react'
import { useBalance } from '@/hooks/useBalance'
import { NUANSA_CHAIN_ID } from '@/components/WalletProvider'

/**
 * Shows connected wallet + chain ID + NST balance. If balance is zero,
 * offers a one-click "Fund me" that calls the local faucet endpoint.
 *
 * Render at the top of Landing / MintScreen / Port so the user always
 * knows what chain they're on and whether they have gas.
 */
export function ChainStatus() {
  const { initiaAddress, address: hexAddress, openWallet, isConnected } = useInterwovenKit() as any
  const bech32 = initiaAddress ?? hexAddress
  const { nst, refresh } = useBalance(bech32)
  const [funding, setFunding] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [chainDown, setChainDown] = useState(false)

  // On mount + when wallet connects, probe the local rollup.
  // If it's down, /api/health auto-fires `weave rollup start -d`.
  useEffect(() => {
    if (!isConnected) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/health')
        const j = await res.json()
        if (cancelled) return
        setChainDown(!j.up)
        if (j.restartedJustNow) {
          setMsg('⚡ Rollup restarted — ready in a moment.')
          setTimeout(() => {
            refresh()
            setMsg(null)
          }, 3500)
        } else if (j.up) {
          refresh()
        }
      } catch {
        if (!cancelled) setChainDown(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isConnected, refresh])

  const short = (a: string | undefined) =>
    a ? `${a.slice(0, 8)}…${a.slice(-4)}` : '—'

  const handleFund = async () => {
    if (!bech32) return
    setFunding(true)
    setMsg(null)
    try {
      const res = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ address: bech32 }),
      })
      const j = await res.json()
      if (!res.ok || j.error) {
        setMsg(`⚠ ${j.error ?? 'Faucet failed'}`)
      } else {
        setMsg(`✓ +1000 NST · ${(j.txhash ?? '').slice(0, 10)}…`)
        // Refresh balance a moment after the TX
        setTimeout(refresh, 2500)
      }
    } catch (e: any) {
      setMsg(`⚠ ${String(e?.message ?? e).slice(0, 60)}`)
    } finally {
      setFunding(false)
      setTimeout(() => setMsg(null), 5000)
    }
  }

  if (!isConnected) return null

  const empty = nst !== null && nst < 1
  const balanceColor = empty ? 'var(--blood)' : nst === null ? 'var(--teal-dim)' : 'var(--teal-glow)'

  return (
    <div
      className="inline-flex items-center gap-3 px-3 py-1.5 border border-[color:var(--teal-dim)]/60 font-hud text-xs tracking-[0.15em]"
      style={{
        background:
          'linear-gradient(180deg, rgba(15,30,53,0.85) 0%, rgba(8,19,32,0.95) 100%)',
      }}
    >
      {/* Chain chip */}
      <span className="flex items-center gap-1.5" title={chainDown ? 'Rollup unreachable' : 'Rollup live'}>
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{
            background: chainDown ? 'var(--blood)' : 'var(--teal-glow)',
            boxShadow: `0 0 6px ${chainDown ? 'var(--blood)' : 'var(--teal-glow)'}`,
          }}
        />
        <span style={{ color: chainDown ? 'var(--blood)' : 'var(--teal-glow)' }}>
          {NUANSA_CHAIN_ID}
        </span>
      </span>
      <span className="opacity-40">│</span>
      {/* Address */}
      <button
        onClick={openWallet}
        className="text-[color:var(--brass)] hover:text-[color:var(--gold)] transition-colors"
        title="Click to open wallet"
      >
        {short(bech32)}
      </button>
      <span className="opacity-40">│</span>
      {/* Balance */}
      <span className="flex items-center gap-1.5" style={{ color: balanceColor }}>
        <img
          src="/assets/ui/nst_coin.png"
          alt=""
          width={16}
          height={16}
          className="pixelated inline-block"
          style={{ filter: empty ? 'grayscale(0.8) opacity(0.5)' : 'none' }}
        />
        {nst === null ? '...' : `${nst.toFixed(2)} NST`}
      </span>
      {/* Fund button */}
      {empty && (
        <>
          <span className="opacity-40">│</span>
          <button
            onClick={handleFund}
            disabled={funding}
            className="flex items-center gap-1.5 px-2 py-0.5 border border-[color:var(--gold)]/60 text-[color:var(--gold)] hover:bg-[color:var(--gold)]/10 transition-colors disabled:opacity-50"
          >
            <img
              src="/assets/ui/treasure_pouch.png"
              alt=""
              width={16}
              height={16}
              className="pixelated inline-block"
            />
            {funding ? 'FUNDING…' : 'FUND ME'}
          </button>
        </>
      )}
      {msg && (
        <span
          className="ml-2"
          style={{ color: msg.startsWith('✓') ? 'var(--teal-glow)' : 'var(--blood)' }}
        >
          {msg}
        </span>
      )}
    </div>
  )
}
