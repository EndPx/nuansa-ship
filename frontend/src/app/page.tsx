'use client'

import { useProfile } from '@/hooks/useProfile'
import { useRouter } from 'next/navigation'
import { MintScreen } from '@/components/MintScreen'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useInterwovenKit } from '@initia/interwovenkit-react'
import { TacticalButton } from '@/components/ui'
import { ChainStatus } from '@/components/ChainStatus'

export default function LandingPage() {
  const { address, openConnect } = useInterwovenKit()
  const openWallet = openConnect

  const { hasProfile, isLoading } = useProfile(address || null)
  const router = useRouter()

  useEffect(() => {
    if (address && hasProfile) router.push('/port')
  }, [address, hasProfile, router])

  if (!address) return <LandingCinematic onConnect={openWallet} />

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <img
          src="/assets/ui/nuansa_logo_emblem.png"
          alt=""
          width={180}
          height={180}
          className="slow-rotate drop-shadow-[0_0_24px_rgba(82,224,196,0.5)]"
        />
        <p className="font-hud text-xl text-[color:var(--teal-glow)] text-glow tracking-[0.3em] cursor-blink">
          SYNCHRONIZING WITH CHAIN
        </p>
      </div>
    )
  }

  if (!hasProfile) return <MintScreen />

  return null
}

/* ─── Cinematic landing ─────────────────────────────────────────────── */

function LandingCinematic({ onConnect }: { onConnect: () => void }) {
  const [lines, setLines] = useState<string[]>([])
  const script = [
    '> ESTABLISHING ENCRYPTED LINK...',
    '> INITIA TESTNET :: NUANSA-SHIP-1',
    '> ADMIRALTY BROADCAST // CODE BLACK',
    '> ALL CAPTAINS: PRESENT FOR COMMISSION',
  ]

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i >= script.length) return clearInterval(timer)
      setLines((prev) => [...prev, script[i]])
      i++
    }, 450)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Background horizon */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 140%, rgba(42,157,143,0.18) 0%, transparent 50%), radial-gradient(ellipse at 50% -20%, rgba(15,30,53,1) 0%, transparent 60%)',
        }}
      />

      {/* Ambient rhumb lines radiating from center (old nautical chart) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08]"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {Array.from({ length: 16 }, (_, i) => {
          const angle = (i * Math.PI) / 8
          const x2 = 50 + Math.cos(angle) * 120
          const y2 = 50 + Math.sin(angle) * 120
          return (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={x2}
              y2={y2}
              stroke="#C8A255"
              strokeWidth="0.08"
            />
          )
        })}
      </svg>

      {/* Drifting grid horizon */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 wave-drift"
          style={{
            backgroundImage:
              'linear-gradient(rgba(42,157,143,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(42,157,143,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            transform: 'perspective(400px) rotateX(60deg)',
            transformOrigin: 'center bottom',
            maskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
          }}
        />
      </div>

      {/* Distant horizon ship silhouettes drifting */}
      <div className="absolute inset-x-0 top-[34%] h-8 pointer-events-none overflow-hidden opacity-60">
        <div className="absolute whitespace-nowrap ship-drift font-display text-[color:var(--teal-dim)] text-sm tracking-[0.4em]">
          ◥◣&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;◣◢&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;◢◤&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;◥◣
        </div>
      </div>

      {/* Distant harbor lights pulse */}
      <div className="absolute inset-x-0 bottom-16 h-16 pointer-events-none flex items-center justify-around px-20 opacity-40">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full"
            style={{
              background: i % 2 ? 'var(--gold)' : 'var(--teal-glow)',
              boxShadow: `0 0 8px ${i % 2 ? '#F4A261' : '#52E0C4'}`,
              animation: `blink ${2 + (i % 3)}s ${i * 0.4}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Top tactical bar */}
      <header className="absolute top-0 inset-x-0 px-8 py-4 flex items-center justify-between font-hud text-sm text-[color:var(--teal-dim)] border-b border-[color:var(--teal-dim)]/20">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[color:var(--teal-glow)] animate-pulse" />
          <span>SIGNAL · 7.2 GHz</span>
          <span className="opacity-40">│</span>
          <span>LAT -04.2°S · LON 119.5°E</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/codex"
            className="text-[color:var(--brass)] hover:text-[color:var(--gold)] transition-colors tracking-[0.3em]"
          >
            CODEX
          </Link>
          <span className="opacity-40">·</span>
          <Link
            href="/fleet"
            className="text-[color:var(--brass)] hover:text-[color:var(--gold)] transition-colors tracking-[0.3em]"
          >
            FLEET
          </Link>
          <span className="opacity-40">·</span>
          <Link
            href="/almanac"
            className="text-[color:var(--brass)] hover:text-[color:var(--gold)] transition-colors tracking-[0.3em]"
          >
            ALMANAC
          </Link>
          <span className="opacity-40">│</span>
          <span>CH //NUANSA-SHIP-1</span>
          <span className="opacity-40">│</span>
          <span>{new Date().toISOString().split('T')[0]}</span>
        </nav>
      </header>

      {/* Main hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-32">
        {/* Emblem + radar pulse rings */}
        <div className="relative mb-8 fade-up">
          <div className="relative w-[320px] h-[320px] md:w-[380px] md:h-[380px] flex items-center justify-center">
            <div className="absolute inset-0 radar-pulse rounded-full opacity-70" />
            <div className="absolute inset-4 border border-[color:var(--teal-dim)]/40 rounded-full" />
            <div className="absolute inset-10 border border-[color:var(--teal-dim)]/30 rounded-full" />
            <img
              src="/assets/ui/nuansa_logo_emblem.png"
              alt="Nuansa Ship Admiralty Emblem"
              width={380}
              height={380}
              className="relative drop-shadow-[0_0_24px_rgba(82,224,196,0.35)]"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </div>

        {/* Wordmark */}
        <div className="fade-up delay-1 w-full max-w-xl">
          <img
            src="/assets/ui/nuansa_logo_wordmark.png"
            alt="NUANSA SHIP"
            width={580}
            height={316}
            className="w-full h-auto drop-shadow-[0_0_12px_rgba(82,224,196,0.2)]"
          />
        </div>

        {/* Tagline — text overlaid on pixel-art scroll */}
        <div className="mt-8 text-center fade-up delay-2 relative w-full max-w-xl">
          <div className="relative">
            <img
              src="/assets/ui/scroll_banner.png"
              alt=""
              width={520}
              height={130}
              className="mx-auto w-full max-w-lg h-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-display text-lg md:text-2xl text-[#3a1f0a] tracking-[0.25em] font-bold">
                CAPTAIN · SHIP · CREW
              </p>
            </div>
          </div>
          <p className="mt-3 font-mono text-xs md:text-sm text-[color:var(--teal-dim)] tracking-widest uppercase">
            Tactical naval warfare on Initia
          </p>
        </div>

        {/* Typewriter terminal — framed with pixel-art corner filigrees */}
        <div className="mt-12 w-full max-w-xl fade-up delay-3 relative">
          {/* Four brass filigree corners */}
          <img
            src="/assets/ui/corner_filigree.png"
            alt=""
            width={44}
            height={44}
            className="absolute -top-4 -left-4 pixelated z-10"
          />
          <img
            src="/assets/ui/corner_filigree.png"
            alt=""
            width={44}
            height={44}
            className="absolute -top-4 -right-4 pixelated z-10"
            style={{ transform: 'scaleX(-1)' }}
          />
          <img
            src="/assets/ui/corner_filigree.png"
            alt=""
            width={44}
            height={44}
            className="absolute -bottom-4 -left-4 pixelated z-10"
            style={{ transform: 'scaleY(-1)' }}
          />
          <img
            src="/assets/ui/corner_filigree.png"
            alt=""
            width={44}
            height={44}
            className="absolute -bottom-4 -right-4 pixelated z-10"
            style={{ transform: 'scale(-1,-1)' }}
          />
          <div className="box-console px-6 py-4 font-hud text-base md:text-lg text-[color:var(--teal-glow)] min-h-[140px]">
            {lines.map((l, i) => (
              <div key={i} className="leading-tight">
                {l}
              </div>
            ))}
            {lines.length < 4 && <span className="cursor-blink" />}
            {lines.length >= 4 && (
              <div className="mt-2 text-[color:var(--gold)] cursor-blink">
                &gt; AWAITING AUTH...
              </div>
            )}
          </div>
        </div>

        {/* Connect button */}
        <div className="mt-10 fade-up delay-4 flex flex-col items-center">
          <TacticalButton variant="teal" glitch onClick={onConnect}>
            <span className="inline-flex items-center gap-3">
              <img
                src="/assets/ui/anchor_emblem.png"
                alt=""
                width={22}
                height={22}
                className="pixelated"
              />
              COMMISSION WALLET
              <img
                src="/assets/ui/anchor_emblem.png"
                alt=""
                width={22}
                height={22}
                className="pixelated"
                style={{ transform: 'scaleX(-1)' }}
              />
            </span>
          </TacticalButton>
          <p className="mt-4 text-center font-mono text-xs text-[color:var(--teal-dim)] tracking-widest">
            REQUIRES INITIA TESTNET · INTERWOVENKIT
          </p>
        </div>
      </section>

      {/* Hero harbor panorama — cinematic glimpse between hero and features */}
      <section className="relative z-10 px-0 pt-4 pb-8">
        <div className="mx-auto max-w-6xl relative">
          <div
            className="relative overflow-hidden border-y border-[color:var(--brass)]/30"
            style={{
              boxShadow:
                'inset 0 40px 80px rgba(5,12,24,0.9), inset 0 -40px 80px rgba(5,12,24,0.9)',
            }}
          >
            <img
              src="/assets/ui/hero_harbor.png"
              alt="A cinematic dawn harbor with warships at anchor"
              width={1200}
              height={720}
              className="w-full h-auto pixelated"
              style={{
                maskImage:
                  'linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%)',
              }}
            />
            {/* Tagline over scene */}
            <div className="absolute inset-x-0 top-4 text-center font-hud text-xs tracking-[0.5em] text-[color:var(--brass)]">
              ✦ PORT NUANSA · DAWN LIGHT ✦
            </div>
            <div className="absolute inset-x-0 bottom-4 text-center font-im-fell italic text-sm md:text-base text-[color:var(--parchment)]/90" style={{ fontFamily: '"IM Fell English", serif' }}>
              « Every sail carries a contract, every contract a captain. »
            </div>
          </div>
        </div>
      </section>

      {/* Divider rule between hero scene and feature tape */}
      <div className="relative z-10 flex justify-center py-2">
        <img
          src="/assets/ui/divider_rule.png"
          alt=""
          width={480}
          height={40}
          className="pixelated opacity-80"
        />
      </div>

      {/* Feature tape — primitives at a glance */}
      <section className="relative z-10 px-6 md:px-16 py-20 border-t border-[color:var(--brass)]/15">
        <div className="max-w-6xl mx-auto text-center mb-10">
          <div className="inline-block border border-[color:var(--brass)]/40 px-4 py-1 font-hud text-xs tracking-[0.5em] text-[color:var(--brass)]">
            ✦ THE FLEET ON INITIA ✦
          </div>
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-5">
          <FeatureCard
            icon="/assets/ui/anchor_emblem.png"
            tag="ON-CHAIN"
            title="Captain · Ship · Crew"
            desc="Every fleet asset is an NFT on Initia Move VM. Yours to trade, inherit, or lose in battle."
          />
          <FeatureCard
            icon="/assets/ui/nst_coin.png"
            tag="SESSION KEYS"
            title="Fast combat, verified"
            desc="One-click auto-sign. Every move is on-chain. No popups between broadsides."
          />
          <FeatureCard
            icon="/assets/ui/treasure_pouch.png"
            tag="ROGUELITE"
            title="Waves · Loot · Upgrade"
            desc="Survive PvE waves, roll the drop table, forge better hulls back at port."
          />
          <FeatureCard
            tag="NUANSA UNIVERSE"
            title="A shared lore"
            desc="Three games, three chains. Nuansa Land on Base, Nuansa FC on 0G, and us — at sea."
          />
        </div>

        {/* Lower call-out strip */}
        <div className="max-w-6xl mx-auto mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--brass)]/20 pt-6 font-hud text-xs tracking-[0.3em] text-[color:var(--teal-dim)]">
          <span>READ THE ARCHIVE:</span>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/codex" className="hover:text-[color:var(--gold)] transition-colors">
              ✦ VOLUME I · CODEX
            </Link>
            <span className="opacity-40">·</span>
            <Link href="/fleet" className="hover:text-[color:var(--gold)] transition-colors">
              VOLUME II · FLEET
            </Link>
            <span className="opacity-40">·</span>
            <Link href="/almanac" className="hover:text-[color:var(--gold)] transition-colors">
              VOLUME III · ALMANAC ✦
            </Link>
          </div>
          <span>✦ SEASON 1 · INITIA HACKATHON</span>
        </div>
      </section>

      {/* Bottom tactical readout */}
      <footer className="absolute bottom-0 inset-x-0 px-8 py-4 flex items-center justify-between font-hud text-xs text-[color:var(--teal-dim)] border-t border-[color:var(--teal-dim)]/20">
        <div className="flex items-center gap-6">
          <span>◉ PART OF THE NUANSA UNIVERSE</span>
        </div>
        <div className="flex items-center gap-6">
          <span>NL · BASE</span>
          <span className="text-[color:var(--teal-glow)]">NS · INITIA ◢◣</span>
          <span>NFC · 0G</span>
        </div>
      </footer>
    </main>
  )
}

/* ─── Feature tape card ────────────────────────────────────────────── */
function FeatureCard({
  icon,
  tag,
  title,
  desc,
}: {
  icon?: string
  tag: string
  title: string
  desc: string
}) {
  return (
    <div
      className="relative p-5 border border-[color:var(--brass)]/30 transition-all hover:-translate-y-1 hover:border-[color:var(--brass)]/70"
      style={{
        background:
          'linear-gradient(180deg, rgba(15,30,53,0.8) 0%, rgba(8,19,32,0.95) 100%)',
        boxShadow: 'inset 0 0 24px rgba(200,162,85,0.04)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        {icon ? (
          <img
            src={icon}
            alt=""
            width={40}
            height={40}
            className="pixelated"
            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}
          />
        ) : (
          <div className="w-10 h-10 border border-[color:var(--brass)]/50 flex items-center justify-center text-[color:var(--brass)] text-xl font-display">
            ✦
          </div>
        )}
        <div className="font-hud text-[10px] tracking-[0.4em] text-[color:var(--brass)]">
          {tag}
        </div>
      </div>
      <h4 className="font-display text-lg text-[color:var(--ivory)] tracking-wide mb-2">
        {title}
      </h4>
      <p className="font-mono text-sm text-[color:var(--parchment)]/75 leading-relaxed">
        {desc}
      </p>
    </div>
  )
}

/* CompassRose SVG removed — replaced everywhere by the pixellab/Gemini
   emblem PNG. Kept in git history if we ever need the vector version. */
