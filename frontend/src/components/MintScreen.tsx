'use client'

import { useState } from 'react'
import { buildMintStarterPackTx } from '@/lib/contracts'

export function MintScreen() {
  const [captainName, setCaptainName] = useState('')
  const [minting, setMinting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMint = async () => {
    if (!captainName.trim()) return
    setMinting(true)
    setError(null)
    try {
      // TODO: wire real signAndBroadcast
      console.log('TX:', buildMintStarterPackTx(captainName))
      await new Promise((r) => setTimeout(r, 1600))
      window.location.href = '/port'
    } catch (e: any) {
      setError(e?.message ?? 'Commission failed')
      setMinting(false)
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Warm parchment light */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(244,162,97,0.12) 0%, transparent 50%)',
        }}
      />

      <div className="relative w-full max-w-2xl">
        {/* Banner */}
        <div className="text-center mb-8 fade-up">
          <div className="inline-block font-hud text-xs tracking-[0.5em] text-[color:var(--brass)] border border-[color:var(--brass)]/40 px-4 py-1">
            ✦ ADMIRALTY COMMISSION ✦
          </div>
          <h1 className="mt-6 font-display text-5xl md:text-6xl text-[color:var(--ivory)] tracking-widest">
            NAME YOUR
            <span className="block text-[color:var(--teal-glow)] text-glow mt-1">
              CAPTAIN
            </span>
          </h1>
        </div>

        {/* Parchment writ */}
        <div className="relative fade-up delay-1">
          <div className="panel-parchment p-8 md:p-10 relative">
            <WaxSeal className="absolute -top-4 -left-4" />
            <WaxSeal className="absolute -top-4 -right-4" />
            <WaxSeal className="absolute -bottom-4 -left-4" />
            <WaxSeal className="absolute -bottom-4 -right-4" />

            <div
              className="text-center mb-6"
              style={{ fontFamily: '"IM Fell English", serif' }}
            >
              <p className="text-2xl italic leading-relaxed">
                Let it be known, on this day,
                <br />
                a Captain of the Nuansa Fleet is commissioned
              </p>
              <div className="mt-2 text-sm tracking-[0.3em] uppercase opacity-70">
                ◊ by order of the Admiralty ◊
              </div>
            </div>

            {/* Name input */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-[0.3em] mb-2 font-mono opacity-70">
                Captain's Name
              </label>
              <input
                type="text"
                placeholder="e.g. albary.init"
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                disabled={minting}
                maxLength={32}
                className="w-full bg-transparent border-0 border-b-2 border-[#6b4e20] focus:outline-none focus:border-[#2A9D8F] text-3xl py-2 placeholder-[#6b4e20]/40 text-[#2a1b08] transition-colors"
                style={{ fontFamily: '"IM Fell English", serif' }}
              />
              <div className="mt-1 text-xs font-mono opacity-60">
                {captainName.length} / 32 characters
              </div>
            </div>

            {/* Starter pack */}
            <div className="border-t-2 border-dashed border-[#6b4e20]/50 pt-5">
              <div className="text-xs uppercase tracking-[0.3em] mb-3 font-mono opacity-70">
                ◊ Starter Commission Includes ◊
              </div>
              <div className="grid grid-cols-3 gap-3">
                <StarterItem icon="⚔" label="Captain NFT" sub="Lv. 1" />
                <StarterItem icon="⛵" label="Corvette" sub="500 HULL" />
                <StarterItem icon="💥" label="Gunner" sub="+15% DMG" />
              </div>
            </div>
          </div>
        </div>

        {/* Commission button */}
        <div className="mt-8 flex flex-col items-center gap-3 fade-up delay-2">
          <button
            onClick={handleMint}
            disabled={!captainName.trim() || minting}
            className="btn-tactical glitch-hover min-w-[280px]"
          >
            {minting ? '◇ COMMISSIONING... ◇' : '◢ SEAL COMMISSION ◣'}
          </button>
          {error && (
            <p className="font-hud text-[color:var(--blood)] text-sm">
              ⚠ {error}
            </p>
          )}
          <p className="font-mono text-xs text-[color:var(--teal-dim)] tracking-widest max-w-sm text-center">
            Single transaction · mints Captain + Ship + Crew NFTs and initializes your Port
          </p>
        </div>
      </div>
    </main>
  )
}

function StarterItem({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <div
      className="relative border border-[#6b4e20]/60 bg-[#dfc699]/60 py-4 text-center"
      style={{ fontFamily: '"IM Fell English", serif' }}
    >
      <div className="text-4xl mb-1 leading-none">{icon}</div>
      <div className="font-semibold text-base">{label}</div>
      <div className="text-xs font-mono opacity-70 mt-0.5 tracking-wider">
        {sub}
      </div>
    </div>
  )
}

function WaxSeal({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-10 h-10 rounded-full pointer-events-none ${className}`}
      style={{
        background:
          'radial-gradient(circle at 35% 35%, #a21a26 0%, #6b0d15 70%, #3d060a 100%)',
        boxShadow:
          'inset 0 2px 4px rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.5)',
      }}
    >
      <div
        className="w-full h-full flex items-center justify-center text-[#f7d98e] text-lg"
        style={{ fontFamily: 'Cinzel, serif', textShadow: '0 1px 1px rgba(0,0,0,0.5)' }}
      >
        ⚓
      </div>
    </div>
  )
}
