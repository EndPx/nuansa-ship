'use client'

import Link from 'next/link'
import { CompassWatermark, TacticalButton } from '@/components/ui'
import {
  ArchivePage,
  OrnamentalRule,
  DropCap,
  ChapterHeader,
} from '@/components/archive/ArchivePage'

/**
 * /codex — The Admiralty Archive
 *
 * Public-facing lore page. No wallet required. Visitors learn the
 * Nuansa Universe narrative before the wallet gate at /.
 */
export default function CodexPage() {
  return (
    <ArchivePage
      volumeTag="VOLUME I"
      title={<>THE <span className="text-[color:var(--teal-glow)] text-glow">ADMIRALTY</span> ARCHIVE</>}
      subtitle="BEING A TRUE ACCOUNT OF THE NUANSA FLEET"
      folio="01 · 16"
    >
      {/* Hero — cinematic title spread */}
      <section className="relative z-10 px-6 md:px-16 py-24 md:py-32 min-h-[80vh] flex items-center">
        <div className="w-full grid md:grid-cols-[1.2fr_1fr] gap-16 items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-4 font-hud text-xs tracking-[0.5em] text-[color:var(--brass)]">
              <span className="h-px w-12 bg-[color:var(--brass)]" />
              <span>CHAPTER I</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-wide text-[color:var(--ivory)]">
              Of the
              <span className="block italic text-[color:var(--brass)] text-glow-gold">Windless Sea</span>
              and the Captains who crossed it.
            </h2>
            <p
              className="font-im-fell text-xl md:text-2xl leading-relaxed text-[color:var(--parchment)] max-w-xl"
              style={{ fontFamily: '"IM Fell English", serif' }}
            >
              <DropCap letter="L" />
              et it be recorded: in the year the stars forgot their course, the first ironclad rose from the harbor of Nuansa, her sails sewn from storm-silk, her hull inlaid with Initia's seal.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <TacticalButton
                variant="teal"
                glitch
                onClick={() =>
                  document.getElementById('chapter-1')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                ◢ BEGIN THE READING ◣
              </TacticalButton>
              <Link
                href="/"
                className="font-hud text-sm tracking-[0.3em] text-[color:var(--teal-dim)] hover:text-[color:var(--teal-glow)] transition-colors"
              >
                OR · SKIP TO WALLET →
              </Link>
            </div>
          </div>

          {/* Admiralty seal — rotating compass with center sigil */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center slow-rotate">
              <CompassWatermark size={520} opacity={0.25} tone="brass" rays={48} rings={5} />
            </div>
            <AdmiraltySeal />
          </div>
        </div>
      </section>

      <OrnamentalRule />

      {/* Chapter 1 */}
      <Chapter
        id="chapter-1"
        number="I"
        title="The Four Pillars"
        subtitle="Of Captain, Ship, Crew, and Port"
        body={
          <>
            <p>
              <DropCap letter="E" />
              very vessel of the fleet is an alliance of four. The <em>Captain</em> — bound by oath and rank, leader of the deck. The <em>Ship</em> — her hull the bargain, her guns the argument. The <em>Crew</em> — men and women of skill: gunner, navigator, engineer. And the <em>Port</em>, where all return, where steel is forged and charts are drawn.
            </p>
            <p>
              No Captain sails alone. No Ship fires without a crew. No crew survives without a port to mend them. This is the First Law of the Nuansa Fleet.
            </p>
          </>
        }
        pillars={[
          { icon: '⚓', label: 'Captain', sub: 'Leadership · Tactics · XP' },
          { icon: '⛵', label: 'Ship', sub: 'Hull · Weapon · Engine' },
          { icon: '💥', label: 'Crew', sub: 'Gunner · Navigator · Engineer' },
          { icon: '🏛', label: 'Port', sub: '5 Buildings · 5 Tiers' },
        ]}
      />

      <OrnamentalRule />

      {/* Chapter 2 */}
      <Chapter
        number="II"
        title="The Three Hulls"
        subtitle="Corvette · Frigate · Destroyer · Battleship"
        body={
          <>
            <p>
              <DropCap letter="F" />
              rom the Shipyard's smallest keel grows the Fleet's largest thunder. Each class a progression — the nimble <em>Corvette</em> for first blood, the <em>Frigate</em> for the middle seas, the <em>Destroyer</em> for the hard engagements, and the <em>Battleship</em> — slow, inevitable, supreme.
            </p>
            <p>
              The Shipyard must be raised to the fifth tier before the Battleship's blueprint will surrender itself. Patience, then, is the Admiral's first weapon.
            </p>
            <p className="pt-2">
              <Link
                href="/fleet"
                className="inline-flex items-center gap-2 font-hud text-sm tracking-[0.3em] text-[color:var(--teal-glow)] hover:text-[color:var(--gold)] transition-colors"
              >
                ◈ SEE THE FULL COMPENDIUM →
              </Link>
            </p>
          </>
        }
        pillars={[
          { icon: '◆', label: 'Corvette', sub: '500 HULL · Engine 4' },
          { icon: '◈', label: 'Frigate', sub: '800 HULL · Engine 3' },
          { icon: '◇', label: 'Destroyer', sub: '1200 HULL · Engine 2' },
          { icon: '✦', label: 'Battleship', sub: '2000 HULL · Engine 1' },
        ]}
      />

      <OrnamentalRule />

      {/* Chapter 3 — The Waves */}
      <section className="relative z-10 px-6 md:px-16 py-20">
        <div className="max-w-5xl mx-auto">
          <ChapterHeader
            number="III"
            title="The Waves"
            subtitle="Each engagement a trial, each trial a choice."
          />
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {WAVES.map((w) => (
              <WaveCard key={w.range} {...w} />
            ))}
          </div>
          <p
            className="mt-10 text-center font-im-fell text-lg italic text-[color:var(--parchment)]/80 max-w-2xl mx-auto"
            style={{ fontFamily: '"IM Fell English", serif' }}
          >
            «&nbsp;The sea does not grow gentler with victory. It grows hungrier.&nbsp;»
          </p>
          <div className="mt-6 text-center">
            <Link
              href="/almanac"
              className="inline-flex items-center gap-2 font-hud text-sm tracking-[0.3em] text-[color:var(--teal-glow)] hover:text-[color:var(--gold)] transition-colors"
            >
              ◈ CONSULT THE ALMANAC →
            </Link>
          </div>
        </div>
      </section>

      <OrnamentalRule />

      {/* Chapter 4 — The Chain */}
      <Chapter
        number="IV"
        title="Of the Chain beneath the Waves"
        subtitle="Why every manifest is indelible, why every loss is real."
        body={
          <>
            <p>
              <DropCap letter="B" />
              eneath every hull, the chain. Beneath every chain, Initia — she who does not forget. Your Captain is not a number in a ledger she might lose; she is an <em>NFT</em>, etched in stone that no tide can wash. Your Ship is not inventory; she is property, tradeable, inheritable, mourning-able.
            </p>
            <p>
              And when a battle begins, the Admiralty lends you a signet — a <em>session key</em> — so your blade swings without pausing to ask. Speed with provenance. Autonomy with receipts.
            </p>
          </>
        }
        pillars={[
          { icon: '⬡', label: 'NFT Fleet', sub: 'Captain · Ship · Crew' },
          { icon: '⎔', label: 'Move VM', sub: 'Aptos-style resources' },
          { icon: '◐', label: 'Session Keys', sub: 'Auto-sign battles' },
          { icon: '✦', label: 'Initia L1', sub: 'Testnet · initiation-2' },
        ]}
      />

      <OrnamentalRule />

      {/* Call to action */}
      <section className="relative z-10 px-6 md:px-16 py-24 text-center">
        <div className="inline-block border border-[color:var(--brass)]/40 px-6 py-2 font-hud text-xs tracking-[0.5em] text-[color:var(--brass)] mb-6">
          ✦ THE COMMISSION AWAITS ✦
        </div>
        <h3 className="font-display text-4xl md:text-6xl tracking-widest text-[color:var(--ivory)]">
          Name your Captain.
          <span className="block text-[color:var(--teal-glow)] text-glow italic">Claim your Fleet.</span>
        </h3>
        <p
          className="mt-6 font-im-fell text-xl italic text-[color:var(--parchment)]/80 max-w-xl mx-auto"
          style={{ fontFamily: '"IM Fell English", serif' }}
        >
          The sea is open. The Admiralty is waiting. Your Ship has no hull yet — go and give her one.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link href="/">
            <TacticalButton variant="blood" glitch>
              ◢ REPORT FOR COMMISSION ◣
            </TacticalButton>
          </Link>
          <Link href="/fleet">
            <TacticalButton variant="teal">
              NEXT · THE FLEET →
            </TacticalButton>
          </Link>
        </div>
      </section>
    </ArchivePage>
  )
}

/* ───────────────────────────────────────────────────────────── */

function Chapter({
  id,
  number,
  title,
  subtitle,
  body,
  pillars,
}: {
  id?: string
  number: string
  title: string
  subtitle: string
  body: React.ReactNode
  pillars: { icon: string; label: string; sub: string }[]
}) {
  return (
    <section id={id} className="relative z-10 px-6 md:px-16 py-20">
      <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_1.4fr] gap-12">
        <div>
          <ChapterHeader number={number} title={title} subtitle={subtitle} />
          <div className="mt-8 grid grid-cols-2 gap-3">
            {pillars.map((p) => (
              <PillarCard key={p.label} {...p} />
            ))}
          </div>
        </div>
        <div
          className="font-im-fell text-xl leading-[1.85] text-[color:var(--parchment)] space-y-6"
          style={{ fontFamily: '"IM Fell English", serif' }}
        >
          {body}
        </div>
      </div>
    </section>
  )
}

function PillarCard({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <div
      className="relative border border-[color:var(--brass)]/30 p-3 transition-all hover:border-[color:var(--brass)] hover:-translate-y-1"
      style={{
        background:
          'linear-gradient(180deg, rgba(200,162,85,0.05) 0%, rgba(10,22,40,0.4) 100%)',
      }}
    >
      <div className="text-2xl text-[color:var(--brass)] leading-none">{icon}</div>
      <div className="mt-1 font-display text-base text-[color:var(--ivory)] tracking-wider">
        {label}
      </div>
      <div className="font-mono text-[10px] tracking-wider text-[color:var(--teal-dim)]">
        {sub}
      </div>
    </div>
  )
}

function AdmiraltySeal() {
  return (
    <div className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px]">
      <svg viewBox="0 0 360 360" className="w-full h-full">
        <defs>
          <radialGradient id="seal-g">
            <stop offset="0%" stopColor="#2A9D8F" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#0A1628" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0A1628" stopOpacity="0.95" />
          </radialGradient>
        </defs>
        <circle cx="180" cy="180" r="176" fill="url(#seal-g)" stroke="#C8A255" strokeWidth="1.5" />
        <circle cx="180" cy="180" r="160" fill="none" stroke="#C8A255" strokeWidth="0.5" strokeDasharray="2 6" />
        <circle cx="180" cy="180" r="130" fill="none" stroke="#52E0C4" strokeWidth="0.5" opacity="0.5" />
        {['N', 'E', 'S', 'W'].map((c, i) => {
          const a = (i * Math.PI) / 2 - Math.PI / 2
          const x = 180 + Math.cos(a) * 148
          const y = 180 + Math.sin(a) * 148
          return (
            <text
              key={c}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Cinzel, serif"
              fontSize="14"
              fill="#C8A255"
              fontWeight="600"
            >
              {c}
            </text>
          )
        })}
        <polygon points="180,60 188,180 180,300 172,180" fill="#52E0C4" opacity="0.9" />
        <polygon points="60,180 180,172 300,180 180,188" fill="#52E0C4" opacity="0.7" />
        <polygon points="180,90 184,180 180,270 176,180" fill="#F4A261" />
        <polygon points="90,180 180,176 270,180 180,184" fill="#F4A261" opacity="0.85" />
        <g transform="translate(180 180)">
          <circle r="18" fill="#0A1628" stroke="#C8A255" strokeWidth="2" />
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="22"
            fill="#F4A261"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            ⚓
          </text>
        </g>
      </svg>
    </div>
  )
}

/* Wave card */
function WaveCard({
  range,
  enemies,
  hp,
  damage,
  tag,
  tone,
}: {
  range: string
  enemies: string
  hp: string
  damage: string
  tag: string
  tone: 'teal' | 'gold' | 'blood'
}) {
  const accentMap = {
    teal: 'var(--teal-glow)',
    gold: 'var(--gold)',
    blood: 'var(--blood)',
  } as const
  const accent = accentMap[tone]
  return (
    <div
      className="relative border p-6 transition-all hover:-translate-y-1"
      style={{
        borderColor: `${accent}55`,
        background:
          'linear-gradient(180deg, rgba(10,22,40,0.6) 0%, rgba(8,19,32,0.9) 100%)',
        boxShadow: `inset 0 0 24px ${accent}10`,
      }}
    >
      <div className="font-hud text-xs tracking-[0.3em]" style={{ color: accent }}>
        {range}
      </div>
      <div className="mt-2 font-display text-2xl text-[color:var(--ivory)] tracking-wide">
        {tag}
      </div>
      <ul className="mt-5 space-y-2 font-mono text-sm text-[color:var(--parchment)]">
        <li className="flex justify-between">
          <span className="text-[color:var(--teal-dim)]">Enemies</span>
          <span>{enemies}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-[color:var(--teal-dim)]">HP</span>
          <span>{hp}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-[color:var(--teal-dim)]">Damage</span>
          <span style={{ color: accent }}>{damage}</span>
        </li>
      </ul>
    </div>
  )
}

const WAVES = [
  {
    range: 'WAVES 01 — 03',
    tag: 'The Gentle Sea',
    enemies: '1 Patrol',
    hp: '300',
    damage: '40',
    tone: 'teal' as const,
  },
  {
    range: 'WAVES 04 — 06',
    tag: 'The Reefs',
    enemies: '2 Raiders',
    hp: '500',
    damage: '70',
    tone: 'gold' as const,
  },
  {
    range: 'WAVES 07 +',
    tag: 'The Leviathan',
    enemies: '1 Boss',
    hp: '2000',
    damage: '150',
    tone: 'blood' as const,
  },
]
