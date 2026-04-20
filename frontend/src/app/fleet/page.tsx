'use client'

import Link from 'next/link'
import { ArchivePage, OrnamentalRule, DropCap } from '@/components/archive/ArchivePage'
import { TacticalButton } from '@/components/ui'

/**
 * /fleet — Ship Compendium
 *
 * The Admiralty's registry of every hull class. Each ship gets a
 * "blueprint card": schematic silhouette, stats manifest, unlock
 * condition, and a lore excerpt signed by the Master Shipwright.
 */
export default function FleetPage() {
  return (
    <ArchivePage
      volumeTag="VOLUME II"
      title={<>THE <span className="text-[color:var(--teal-glow)] text-glow">FLEET</span> COMPENDIUM</>}
      subtitle="REGISTRY OF ALL CLASSES IN COMMISSION"
      folio="02 · 16"
    >
      {/* Preamble */}
      <section className="relative z-10 px-6 md:px-16 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block border border-[color:var(--brass)]/40 px-4 py-1 font-hud text-xs tracking-[0.5em] text-[color:var(--brass)] mb-6">
            ✦ PREAMBLE ✦
          </div>
          <h2 className="font-display text-4xl md:text-6xl text-[color:var(--ivory)] tracking-wide leading-[1.05]">
            Four hulls.
            <span className="block italic text-[color:var(--brass)] text-glow-gold">Four tempers.</span>
          </h2>
          <p
            className="mt-8 font-im-fell text-xl leading-[1.8] text-[color:var(--parchment)]/90 max-w-2xl mx-auto"
            style={{ fontFamily: '"IM Fell English", serif' }}
          >
            <DropCap letter="E" />ach class a covenant between speed and steel. The Shipwright's ledger below records every hull sanctioned by the Admiralty — from the Corvette, which answers to the first rumour of war, to the Battleship, who is the rumour.
          </p>
        </div>
      </section>

      <OrnamentalRule />

      {/* Ships — one cinematic spread each */}
      <div className="relative z-10 px-6 md:px-16 py-6 space-y-20">
        {SHIPS.map((ship, idx) => (
          <ShipSpread key={ship.name} ship={ship} flip={idx % 2 === 1} />
        ))}
      </div>

      <OrnamentalRule glyph="✦ ⚓ ✦" />

      {/* Comparison manifest */}
      <section className="relative z-10 px-6 md:px-16 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block border border-[color:var(--brass)]/40 px-4 py-1 font-hud text-xs tracking-[0.5em] text-[color:var(--brass)]">
              ✦ COMPARATIVE MANIFEST ✦
            </div>
            <h3 className="mt-4 font-display text-3xl md:text-5xl text-[color:var(--ivory)] tracking-wide">
              The Shipwright's Reckoning
            </h3>
          </div>
          <ManifestTable />
        </div>
      </section>

      <OrnamentalRule />

      {/* CTA */}
      <section className="relative z-10 px-6 md:px-16 py-24 text-center">
        <h3 className="font-display text-4xl md:text-5xl tracking-widest text-[color:var(--ivory)]">
          Choose your hull.
          <span className="block text-[color:var(--teal-glow)] text-glow italic">The Shipyard opens to those with the rank.</span>
        </h3>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <Link href="/">
            <TacticalButton variant="blood" glitch>
              ◢ REPORT FOR COMMISSION ◣
            </TacticalButton>
          </Link>
          <Link href="/almanac">
            <TacticalButton variant="teal">
              NEXT · THE ALMANAC →
            </TacticalButton>
          </Link>
        </div>
      </section>
    </ArchivePage>
  )
}

/* ─────────────────────────────────────────────────── */

interface Ship {
  name: string
  tier: number
  classIndex: 0 | 1 | 2 | 3
  role: string
  unlock: string
  hull: number
  engine: number
  weapon: number
  range: number
  armor: number
  quote: string
  inscription: string
}

const SHIPS: Ship[] = [
  {
    name: 'Corvette',
    tier: 1,
    classIndex: 0,
    role: 'Scout · First Blood',
    unlock: 'Commissioned at Shipyard I',
    hull: 500,
    engine: 4,
    weapon: 60,
    range: 2,
    armor: 5,
    quote: 'She is the smallest knife in the Admiralty\'s drawer, but she draws first blood.',
    inscription: '— Master Shipwright, to the Admiralty, 1st draft',
  },
  {
    name: 'Frigate',
    tier: 2,
    classIndex: 1,
    role: 'Line · Sustained Fire',
    unlock: 'Shipyard II unlocks her blueprint',
    hull: 800,
    engine: 3,
    weapon: 90,
    range: 3,
    armor: 15,
    quote: 'A Frigate is patience with three decks of powder. She fights until the horizon yields.',
    inscription: '— Naval Proverb, collected at Port Nuansa',
  },
  {
    name: 'Destroyer',
    tier: 3,
    classIndex: 2,
    role: 'Breaker · Heavy Ordnance',
    unlock: 'Shipyard III draws her keel',
    hull: 1200,
    engine: 2,
    weapon: 130,
    range: 4,
    armor: 25,
    quote: 'When a Destroyer arrives, the battle is no longer an argument — it is a conclusion.',
    inscription: '— Captain-Commander, Third Nuansa Campaign',
  },
  {
    name: 'Battleship',
    tier: 4,
    classIndex: 3,
    role: 'Dreadnought · Capital Ship',
    unlock: 'Shipyard V — the final seal',
    hull: 2000,
    engine: 1,
    weapon: 180,
    range: 5,
    armor: 40,
    quote: 'She does not sail. She proceeds. And the sea arranges itself to make room.',
    inscription: '— Admiralty Charter, §VII',
  },
]

function ShipSpread({ ship, flip }: { ship: Ship; flip: boolean }) {
  return (
    <article className="max-w-6xl mx-auto">
      <div
        className={`grid md:grid-cols-2 gap-10 items-center ${
          flip ? 'md:[&>*:first-child]:order-2' : ''
        }`}
      >
        {/* Schematic side */}
        <div className="relative">
          <ShipSchematic tier={ship.tier} classIndex={ship.classIndex} />
          <div className="absolute top-4 left-4 font-hud text-[10px] tracking-[0.5em] text-[color:var(--teal-dim)]">
            CLASS·{String(ship.tier).padStart(2, '0')} · PLATE {String(ship.tier + 100)}
          </div>
          <div className="absolute bottom-4 right-4 font-hud text-[10px] tracking-[0.5em] text-[color:var(--brass)]/60">
            DRAWN · MASTER SHIPWRIGHT
          </div>
        </div>

        {/* Dossier side */}
        <div>
          <div className="flex items-baseline gap-4 mb-2">
            <span className="font-display text-6xl md:text-7xl text-[color:var(--brass)] text-glow-gold leading-none italic">
              {String(ship.tier).padStart(2, '0')}
            </span>
            <span className="font-hud text-xs tracking-[0.4em] text-[color:var(--brass)]">
              TIER {ship.tier}
            </span>
          </div>
          <h3 className="font-display text-4xl md:text-6xl text-[color:var(--ivory)] tracking-wide">
            {ship.name}
          </h3>
          <p className="mt-1 font-hud text-sm text-[color:var(--teal-glow)] tracking-[0.3em]">
            {ship.role.toUpperCase()}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <StatCell label="HULL" value={ship.hull} max={2000} variant="blood" />
            <StatCell label="ENGINE" value={ship.engine} max={5} variant="teal" />
            <StatCell label="WEAPON" value={ship.weapon} max={200} variant="gold" />
            <StatCell label="RANGE" value={ship.range} max={5} variant="teal" />
            <StatCell label="ARMOR" value={ship.armor} max={50} variant="gold" />
            <StatCell label="TIER" value={ship.tier} max={4} variant="teal" />
          </div>

          <div className="mt-6 pl-4 border-l-2 border-[color:var(--brass)]/50">
            <p
              className="font-im-fell italic text-xl text-[color:var(--parchment)] leading-relaxed"
              style={{ fontFamily: '"IM Fell English", serif' }}
            >
              « {ship.quote} »
            </p>
            <p className="mt-2 font-hud text-[10px] tracking-[0.4em] text-[color:var(--brass)]/80">
              {ship.inscription}
            </p>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 border border-[color:var(--teal-dim)]/50 font-hud text-xs tracking-[0.3em] text-[color:var(--teal-glow)]">
            ◈ UNLOCK · {ship.unlock}
          </div>
        </div>
      </div>
    </article>
  )
}

function StatCell({
  label,
  value,
  max,
  variant,
}: {
  label: string
  value: number
  max: number
  variant: 'teal' | 'blood' | 'gold'
}) {
  const COLORS = {
    teal: '#52E0C4',
    blood: '#E63946',
    gold: '#F4A261',
  } as const
  const color = COLORS[variant]
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div
      className="p-3 border border-[color:var(--brass)]/30"
      style={{
        background:
          'linear-gradient(180deg, rgba(10,22,40,0.6) 0%, rgba(8,19,32,0.9) 100%)',
      }}
    >
      <div className="flex justify-between items-baseline">
        <span className="font-hud text-[10px] tracking-[0.3em] text-[color:var(--teal-dim)]">
          {label}
        </span>
        <span
          className="font-display text-xl leading-none"
          style={{ color }}
        >
          {value}
        </span>
      </div>
      <div className="mt-2 h-1 bg-[color:var(--abyss)] overflow-hidden">
        <div
          className="h-full transition-all"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}55 0%, ${color} 100%)`,
            boxShadow: `0 0 8px ${color}aa`,
          }}
        />
      </div>
    </div>
  )
}

/* Pure-SVG schematic — each tier gets a differentiated silhouette */
function ShipSchematic({ tier, classIndex }: { tier: number; classIndex: 0 | 1 | 2 | 3 }) {
  // Shape scales with class
  const scale = 1 + classIndex * 0.15
  const deckCount = classIndex + 1
  const cannonCount = (classIndex + 1) * 2

  return (
    <div
      className="relative aspect-[4/3] border border-[color:var(--brass)]/40 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, rgba(10,22,40,0.8) 0%, rgba(15,30,53,0.95) 100%), radial-gradient(ellipse at center, rgba(42,157,143,0.08) 0%, transparent 70%)',
      }}
    >
      {/* Blueprint grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(82,224,196,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(82,224,196,0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Center rule */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-[color:var(--teal-glow)]/20" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[color:var(--teal-glow)]/20" />

      {/* Ship silhouette */}
      <svg
        viewBox="0 0 400 300"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id={`hull-${tier}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#52E0C4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#2A9D8F" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        <g transform={`translate(200 170) scale(${scale})`}>
          {/* Hull */}
          <path
            d="M -140 0 Q -130 30 -100 40 L 100 40 Q 130 30 140 0 L 120 -10 L -120 -10 Z"
            fill={`url(#hull-${tier})`}
            stroke="#52E0C4"
            strokeWidth="1.5"
          />
          {/* Deck layers */}
          {Array.from({ length: deckCount }, (_, i) => (
            <rect
              key={i}
              x={-100 + i * 15}
              y={-25 - i * 18}
              width={200 - i * 30}
              height={18}
              fill="none"
              stroke="#52E0C4"
              strokeWidth="1"
              opacity={0.8 - i * 0.15}
            />
          ))}
          {/* Mast */}
          <line x1="0" y1="-25 - deckCount * 18" x2="0" y2="-25" stroke="#C8A255" strokeWidth="1.5" />
          <line
            x1="0"
            y1={-25 - deckCount * 18 - 50}
            x2="0"
            y2={-25 - deckCount * 18}
            stroke="#C8A255"
            strokeWidth="1.5"
          />
          {/* Cannons along bottom edge */}
          {Array.from({ length: cannonCount }, (_, i) => {
            const x = -90 + (i * 180) / Math.max(1, cannonCount - 1)
            return (
              <g key={i} transform={`translate(${x} 28)`}>
                <rect x="-4" y="-3" width="8" height="6" fill="#C8A255" />
                <circle cx="0" cy="0" r="2" fill="#E63946" />
              </g>
            )
          })}
          {/* Flag */}
          <path d="M 0 -85 L 18 -80 L 0 -75 Z" fill="#F4A261" transform={`translate(0 ${-deckCount * 18})`} />
        </g>

        {/* Dimension brackets */}
        <g stroke="#C8A255" strokeWidth="0.8" opacity="0.7" fill="none">
          <path d="M 50 250 L 50 240 L 350 240 L 350 250" />
          <text
            x="200"
            y="236"
            textAnchor="middle"
            fontFamily="VT323, monospace"
            fontSize="11"
            fill="#C8A255"
          >
            {`◄ ${30 + tier * 8}m ►`}
          </text>
        </g>

        {/* Class label */}
        <text
          x="20"
          y="40"
          fontFamily="Cinzel, serif"
          fontSize="16"
          fontWeight="700"
          fill="#52E0C4"
          opacity="0.85"
        >
          CLASS · {'I'.repeat(tier)}
        </text>
      </svg>
    </div>
  )
}

function ManifestTable() {
  return (
    <div
      className="border border-[color:var(--brass)]/40 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, rgba(10,22,40,0.6) 0%, rgba(8,19,32,0.9) 100%)',
      }}
    >
      <table className="w-full font-mono text-sm">
        <thead>
          <tr
            className="font-hud text-[10px] tracking-[0.3em] text-[color:var(--brass)]"
            style={{ background: 'rgba(200,162,85,0.05)' }}
          >
            <th className="text-left px-4 py-3 border-b border-[color:var(--brass)]/30">CLASS</th>
            <th className="text-right px-4 py-3 border-b border-[color:var(--brass)]/30">HULL</th>
            <th className="text-right px-4 py-3 border-b border-[color:var(--brass)]/30">ENGINE</th>
            <th className="text-right px-4 py-3 border-b border-[color:var(--brass)]/30">WEAPON</th>
            <th className="text-right px-4 py-3 border-b border-[color:var(--brass)]/30">RANGE</th>
            <th className="text-right px-4 py-3 border-b border-[color:var(--brass)]/30">ARMOR</th>
            <th className="text-right px-4 py-3 border-b border-[color:var(--brass)]/30">UNLOCK</th>
          </tr>
        </thead>
        <tbody>
          {SHIPS.map((s) => (
            <tr
              key={s.name}
              className="hover:bg-[color:var(--teal-dim)]/10 transition-colors"
            >
              <td className="px-4 py-3 border-b border-[color:var(--teal-dim)]/20">
                <div className="font-display text-lg text-[color:var(--ivory)] tracking-wide">
                  {s.name}
                </div>
                <div className="text-[10px] font-hud tracking-[0.3em] text-[color:var(--teal-dim)]">
                  TIER · {s.tier}
                </div>
              </td>
              <td className="text-right px-4 py-3 border-b border-[color:var(--teal-dim)]/20 text-[color:var(--blood)]">
                {s.hull}
              </td>
              <td className="text-right px-4 py-3 border-b border-[color:var(--teal-dim)]/20 text-[color:var(--teal-glow)]">
                {s.engine}
              </td>
              <td className="text-right px-4 py-3 border-b border-[color:var(--teal-dim)]/20 text-[color:var(--gold)]">
                {s.weapon}
              </td>
              <td className="text-right px-4 py-3 border-b border-[color:var(--teal-dim)]/20">
                {s.range}
              </td>
              <td className="text-right px-4 py-3 border-b border-[color:var(--teal-dim)]/20 text-[color:var(--gold)]">
                {s.armor}
              </td>
              <td className="text-right px-4 py-3 border-b border-[color:var(--teal-dim)]/20 text-[10px] text-[color:var(--teal-dim)] tracking-[0.2em]">
                SHIPYARD·{['I', 'II', 'III', 'V'][s.classIndex]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
