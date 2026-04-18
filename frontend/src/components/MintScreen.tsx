'use client'

import { useState } from 'react'
import { buildMintStarterPackTx } from '@/lib/contracts'
import { useInterwovenKit } from '@initia/interwovenkit-react'
import { CompassWatermark, TacticalButton, WaxSeal } from '@/components/ui'

export function MintScreen() {
  const [captainName, setCaptainName] = useState('')
  const [minting, setMinting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { address, requestTxBlock, isConnected } = useInterwovenKit()

  const handleMint = async () => {
    if (!captainName.trim()) return
    if (!isConnected || !address) {
      setError('Wallet not connected')
      return
    }
    setMinting(true)
    setError(null)
    try {
      const messages = buildMintStarterPackTx(address, captainName)
      const res = await requestTxBlock({ messages })
      console.log('Mint TX hash:', res.transactionHash)
      window.location.href = '/port'
    } catch (e: any) {
      console.error('Mint failed:', e)
      setError(e?.message ?? 'Commission failed')
      setMinting(false)
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Warm candlelight glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(244,162,97,0.18) 0%, transparent 55%), radial-gradient(ellipse at 50% 90%, rgba(42,157,143,0.1) 0%, transparent 60%)',
        }}
      />

      {/* Slow rotating compass watermark (huge, low opacity) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="slow-rotate">
          <CompassWatermark size={900} opacity={0.04} rings={3} />
        </div>
      </div>

      {/* Top admiralty strip */}
      <div className="absolute top-0 inset-x-0 font-hud text-[10px] text-[color:var(--brass)] tracking-[0.5em] py-3 flex justify-between px-8 border-b border-[color:var(--brass)]/20 opacity-80">
        <span>◉ ADMIRALTY ARCHIVE · NUANSA-SHIP-1</span>
        <span>WRIT № {new Date().getFullYear()}-{Math.floor(Math.random() * 9000 + 1000)}</span>
      </div>

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
          <div className="mt-4 flex items-center justify-center gap-3 font-hud text-xs text-[color:var(--teal-dim)] tracking-[0.3em]">
            <span>◈</span>
            <span>LET IT BE ENTERED INTO THE FLEET LEDGER</span>
            <span>◈</span>
          </div>
        </div>

        {/* Parchment writ */}
        <div className="relative fade-up delay-1">
          <div className="panel-parchment ink-wash p-8 md:p-10 relative">
            <WaxSeal className="absolute -top-4 -left-4 seal-press" />
            <WaxSeal className="absolute -top-4 -right-4 seal-press" />
            <WaxSeal className="absolute -bottom-4 -left-4 seal-press" />
            <WaxSeal className="absolute -bottom-4 -right-4 seal-press" />

            {/* Captain portrait silhouette */}
            <div className="flex justify-center mb-4">
              <CaptainPortrait name={captainName} />
            </div>

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
              <div className="mt-1 flex justify-between text-xs font-mono opacity-60">
                <span>◊ as to be inscribed upon the vessel ◊</span>
                <span>{captainName.length} / 32</span>
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

            {/* Inscription line */}
            <div
              className="mt-6 pt-4 border-t border-[#6b4e20]/40 text-center text-xs opacity-70"
              style={{ fontFamily: '"IM Fell English", serif' }}
            >
              Signed ·{' '}
              <span className="font-semibold">
                {new Date().toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>{' '}
              · The Nuansa Admiralty
            </div>
          </div>
        </div>

        {/* Commission button */}
        <div className="mt-8 flex flex-col items-center gap-3 fade-up delay-2">
          <TacticalButton
            variant="teal"
            glitch
            onClick={handleMint}
            disabled={!captainName.trim() || minting}
            className="min-w-[280px]"
          >
            {minting ? '◇ COMMISSIONING... ◇' : '◢ SEAL COMMISSION ◣'}
          </TacticalButton>
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

/* Portrait: a stylized silhouette that glows around the input name */
function CaptainPortrait({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div className="relative">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <defs>
          <radialGradient id="portraitBg">
            <stop offset="0%" stopColor="#6b4e20" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6b4e20" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="70" cy="70" r="68" fill="url(#portraitBg)" />
        <circle cx="70" cy="70" r="62" fill="none" stroke="#6b4e20" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />
        <circle cx="70" cy="70" r="56" fill="#2a1b08" opacity="0.1" />
        {/* Shoulders silhouette */}
        <path
          d="M 22 130 Q 40 90 70 88 Q 100 90 118 130 Z"
          fill="#2a1b08"
          opacity="0.65"
        />
        {/* Head silhouette */}
        <circle cx="70" cy="64" r="22" fill="#2a1b08" opacity="0.75" />
        {/* Bicorne hat */}
        <path
          d="M 38 52 Q 70 30 102 52 Q 92 44 70 42 Q 48 44 38 52 Z"
          fill="#1a0f05"
        />
        {/* Hat cockade */}
        <circle cx="70" cy="44" r="3" fill="#C8A255" />
        {/* Initial inscribed */}
        <text
          x="70"
          y="72"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Cinzel, serif"
          fontSize="22"
          fontWeight="700"
          fill="#F4A261"
          opacity="0.9"
        >
          {initial}
        </text>
        {/* Rank bars */}
        <g opacity="0.6">
          <rect x="58" y="108" width="24" height="1.5" fill="#C8A255" />
          <rect x="62" y="112" width="16" height="1.5" fill="#C8A255" />
        </g>
      </svg>
      {/* Pulse ring when user types */}
      {name.trim().length > 0 && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: '0 0 30px rgba(244,162,97,0.3), inset 0 0 20px rgba(244,162,97,0.15)',
          }}
        />
      )}
    </div>
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

