'use client'

import Link from 'next/link'
import {
  ArchivePage,
  OrnamentalRule,
  DropCap,
  ChapterHeader,
} from '@/components/archive/ArchivePage'
import { TacticalButton } from '@/components/ui'

/**
 * /almanac — The Almanac of Campaigns
 *
 * Gameplay wiki: combat rules, crew roles, building effects, loot
 * table, wave progression. All dressed as an old almanac of maritime
 * law and Admiralty edicts.
 */
export default function AlmanacPage() {
  return (
    <ArchivePage
      volumeTag="VOLUME III"
      title={<>THE <span className="text-[color:var(--teal-glow)] text-glow">ALMANAC</span> OF CAMPAIGNS</>}
      subtitle="RULES · RANKS · REWARDS · RISKS"
      folio="03 · 16"
    >
      {/* Opening */}
      <section className="relative z-10 px-6 md:px-16 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block border border-[color:var(--brass)]/40 px-4 py-1 font-hud text-xs tracking-[0.5em] text-[color:var(--brass)] mb-6">
            ✦ AN ADMIRAL'S POCKET BOOK ✦
          </div>
          <h2 className="font-display text-4xl md:text-6xl text-[color:var(--ivory)] tracking-wide leading-[1.05]">
            What the sea asks of you.
            <span className="block italic text-[color:var(--brass)] text-glow-gold">What it gives in return.</span>
          </h2>
          <p
            className="mt-8 font-im-fell text-xl leading-[1.8] text-[color:var(--parchment)]/90 max-w-2xl mx-auto"
            style={{ fontFamily: '"IM Fell English", serif' }}
          >
            <DropCap letter="T" />his almanac is the Admiralty's honest ledger. It tells you the rules before you sign the articles. It does not flatter. It does not lie. It simply records.
          </p>
        </div>
      </section>

      <OrnamentalRule />

      {/* Article I — Turn & Action */}
      <section className="relative z-10 px-6 md:px-16 py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_1.4fr] gap-12">
          <div>
            <ChapterHeader
              number="I"
              title="The Turn"
              subtitle="How a battle is fought, one move at a time."
            />
          </div>
          <div
            className="font-im-fell text-lg leading-[1.9] text-[color:var(--parchment)] space-y-4"
            style={{ fontFamily: '"IM Fell English", serif' }}
          >
            <p>
              <DropCap letter="E" />very battle unfolds upon a <em>ten-by-eight tile grid</em>. You and your enemy alternate turns. On yours, you choose exactly one action — <em>Move</em>, <em>Attack</em>, or <em>Skill</em> — and then End Turn.
            </p>
            <p>
              Enemies act deterministically, their logic seeded from the current block height. They move toward you, then strike if in range. The Leviathan, when it surfaces, may release an AoE on certain seeds.
            </p>
          </div>
        </div>

        <div className="mt-10 max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
          <ActionCard
            icon="◇"
            name="Move"
            accent="teal"
            desc="Traverse up to (engine) tiles in a cardinal or diagonal path. Flanking unlocks higher-damage angles."
          />
          <ActionCard
            icon="⚔"
            name="Attack"
            accent="blood"
            desc="Fire on any tile within (range). Damage = weapon × armor falloff, modified by crew bonuses."
          />
          <ActionCard
            icon="⚡"
            name="Skill"
            accent="gold"
            desc="Unleash a crew skill: Broadside (Gunner), Evasive Drift (Navigator), Emergency Repair (Engineer)."
          />
        </div>
      </section>

      <OrnamentalRule />

      {/* Article II — The Crew */}
      <section className="relative z-10 px-6 md:px-16 py-16">
        <div className="max-w-5xl mx-auto">
          <ChapterHeader
            number="II"
            title="The Crew"
            subtitle="Three hands, three disciplines, three doors to victory."
          />
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {CREW.map((c) => (
              <CrewSpread key={c.role} {...c} />
            ))}
          </div>
        </div>
      </section>

      <OrnamentalRule />

      {/* Article III — Buildings */}
      <section className="relative z-10 px-6 md:px-16 py-16">
        <div className="max-w-5xl mx-auto">
          <ChapterHeader
            number="III"
            title="The Port"
            subtitle="Five buildings. Five tiers. Five paths of upward."
          />
          <div className="mt-12 space-y-3">
            {BUILDINGS.map((b) => (
              <BuildingRow key={b.name} {...b} />
            ))}
          </div>
        </div>
      </section>

      <OrnamentalRule />

      {/* Article IV — Loot table */}
      <section className="relative z-10 px-6 md:px-16 py-16">
        <div className="max-w-5xl mx-auto">
          <ChapterHeader
            number="IV"
            title="The Spoils"
            subtitle="The Admiralty's drop table, honestly reproduced."
          />
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {LOOT.map((l) => (
              <LootCard key={l.title} {...l} />
            ))}
          </div>
          <p
            className="mt-8 text-center font-im-fell italic text-[color:var(--parchment)]/70"
            style={{ fontFamily: '"IM Fell English", serif' }}
          >
            « A thousand victories, a thousand rolls of the dice. Fortune favours patience. »
          </p>
        </div>
      </section>

      <OrnamentalRule />

      {/* Article V — Fatigue */}
      <section className="relative z-10 px-6 md:px-16 py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_1.2fr] gap-10">
          <div>
            <ChapterHeader
              number="V"
              title="The Mortality"
              subtitle="Wounds are not metaphors. Rest is not free."
            />
          </div>
          <div
            className="space-y-4 font-im-fell text-lg leading-[1.9] text-[color:var(--parchment)]"
            style={{ fontFamily: '"IM Fell English", serif' }}
          >
            <p>
              <DropCap letter="W" />hen a battle ends, your crew is reckoned. A sailor with more than half their strength remaining returns to <em>Ready</em>. One below that threshold is <em>Injured</em>; take them to the Barracks to rest. One who fell to zero is <em>Knocked-Out</em> — they need Provisions and time before the next engagement.
            </p>
            <p>
              Send an Injured sailor into battle without rest, and their stats are halved. The Admiralty keeps records. Decide with care.
            </p>
          </div>
        </div>
        <div className="mt-10 max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
          <StatusCard status="READY" color="#52E0C4" desc="HP &gt; 50. Fully effective." />
          <StatusCard status="INJURED" color="#F4A261" desc="HP 1—50. Requires rest in the Barracks." />
          <StatusCard status="KNOCKED OUT" color="#E63946" desc="HP 0. Costs Provisions to revive." />
        </div>
      </section>

      <OrnamentalRule glyph="✦ ⚓ ✦" />

      {/* Closing CTA */}
      <section className="relative z-10 px-6 md:px-16 py-24 text-center">
        <h3 className="font-display text-4xl md:text-5xl tracking-widest text-[color:var(--ivory)]">
          The Almanac stays open on the shelf.
          <span className="block text-[color:var(--teal-glow)] text-glow italic">But the tide does not wait.</span>
        </h3>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <Link href="/">
            <TacticalButton variant="blood" glitch>
              ◢ SET SAIL ◣
            </TacticalButton>
          </Link>
          <Link href="/codex">
            <TacticalButton variant="teal">
              ← BACK TO CODEX
            </TacticalButton>
          </Link>
        </div>
      </section>
    </ArchivePage>
  )
}

/* ─────────────────────────────────────────────────── */

function ActionCard({
  icon,
  name,
  accent,
  desc,
}: {
  icon: string
  name: string
  accent: 'teal' | 'blood' | 'gold'
  desc: string
}) {
  const COLORS = {
    teal: 'var(--teal-glow)',
    blood: 'var(--blood)',
    gold: 'var(--gold)',
  } as const
  const color = COLORS[accent]
  return (
    <div
      className="p-5 border transition-all hover:-translate-y-1"
      style={{
        borderColor: `${color}55`,
        background:
          'linear-gradient(180deg, rgba(10,22,40,0.6) 0%, rgba(8,19,32,0.9) 100%)',
      }}
    >
      <div className="text-3xl leading-none" style={{ color }}>
        {icon}
      </div>
      <div
        className="mt-2 font-display text-2xl text-[color:var(--ivory)] tracking-wider"
        style={{ color }}
      >
        {name.toUpperCase()}
      </div>
      <p className="mt-3 font-mono text-sm text-[color:var(--parchment)]/80 leading-relaxed">
        {desc}
      </p>
    </div>
  )
}

interface CrewEntry {
  role: string
  icon: string
  accent: string
  tagline: string
  passive: string
  skill: string
  lore: string
}

const CREW: CrewEntry[] = [
  {
    role: 'Gunner',
    icon: '💥',
    accent: 'var(--blood)',
    tagline: 'Weapon Damage +15%',
    passive: 'All ship cannon damage increased by 15%.',
    skill: 'BROADSIDE — strike two targets in a single volley.',
    lore: 'Lives for the interval between the fuse lit and the smoke.',
  },
  {
    role: 'Navigator',
    icon: '🧭',
    accent: 'var(--teal-glow)',
    tagline: 'Engine +1 tile',
    passive: 'Movement range extended by one tile, all turns.',
    skill: 'EVASIVE DRIFT — dodge the next incoming attack outright.',
    lore: 'Reads the wind as if it were signing contracts in the air.',
  },
  {
    role: 'Engineer',
    icon: '🔧',
    accent: 'var(--gold)',
    tagline: 'Repair +50 HP (1×/battle)',
    passive: 'Heals hull by 50 once per battle, outside of skills.',
    skill: 'EMERGENCY REPAIR — instantly restore 100 HP of hull.',
    lore: 'Keeps the engine in a better mood than most captains.',
  },
]

function CrewSpread({ role, icon, accent, tagline, passive, skill, lore }: CrewEntry) {
  return (
    <article
      className="relative p-6 border transition-all hover:-translate-y-1 hover:shadow-2xl"
      style={{
        borderColor: `${accent}55`,
        background:
          'linear-gradient(180deg, rgba(10,22,40,0.7) 0%, rgba(8,19,32,0.95) 100%)',
        boxShadow: `inset 0 0 32px ${accent}10`,
      }}
    >
      <div className="text-5xl leading-none mb-3">{icon}</div>
      <h4
        className="font-display text-3xl tracking-wider"
        style={{ color: accent }}
      >
        {role.toUpperCase()}
      </h4>
      <p className="mt-1 font-hud text-xs tracking-[0.3em] text-[color:var(--brass)]">
        {tagline}
      </p>

      <div className="mt-5 space-y-3 font-mono text-sm text-[color:var(--parchment)]/90">
        <div>
          <div className="font-hud text-[10px] tracking-[0.3em] text-[color:var(--teal-dim)]">
            PASSIVE
          </div>
          <p className="mt-0.5">{passive}</p>
        </div>
        <div>
          <div className="font-hud text-[10px] tracking-[0.3em] text-[color:var(--teal-dim)]">
            SKILL
          </div>
          <p className="mt-0.5" style={{ color: accent }}>
            {skill}
          </p>
        </div>
      </div>

      <blockquote
        className="mt-6 pl-3 border-l-2 font-im-fell italic text-[color:var(--parchment)]/80"
        style={{ fontFamily: '"IM Fell English", serif', borderColor: `${accent}66` }}
      >
        « {lore} »
      </blockquote>
    </article>
  )
}

interface BuildingEntry {
  name: string
  icon: string
  material: string
  costFormula: string
  effects: string
  tierCap: number
}

const BUILDINGS: BuildingEntry[] = [
  {
    name: 'Shipyard',
    icon: '⚓',
    material: 'Iron Planks',
    costFormula: 'level × 3',
    effects: 'I → Corvette · II → Frigate · III → Destroyer · V → Battleship',
    tierCap: 5,
  },
  {
    name: 'Armory',
    icon: '⚔',
    material: 'Steel Parts',
    costFormula: 'level × 2',
    effects: '+10% weapon damage per tier · +1 range at III and V',
    tierCap: 5,
  },
  {
    name: 'Barracks',
    icon: '🏘',
    material: 'Provisions',
    costFormula: 'level × 3',
    effects: 'Crew slots: I=1 · III=2 · V=3 · Recovery +50% at III+',
    tierCap: 5,
  },
  {
    name: "Admiral's Hall",
    icon: '🏛',
    material: 'Commander Tome',
    costFormula: 'level × 1',
    effects: 'XP multiplier ×1.0 → ×2.5 across tiers',
    tierCap: 5,
  },
  {
    name: 'Warehouse',
    icon: '📦',
    material: 'Timber',
    costFormula: 'level × 4',
    effects: 'Inventory slots: 10 + (level × 5)',
    tierCap: 5,
  },
]

function BuildingRow({ name, icon, material, costFormula, effects, tierCap }: BuildingEntry) {
  return (
    <div
      className="grid grid-cols-[auto_1.2fr_1fr_2fr_auto] items-center gap-4 px-4 py-3 border border-[color:var(--brass)]/30 hover:border-[color:var(--brass)]/60 transition-all"
      style={{
        background:
          'linear-gradient(180deg, rgba(10,22,40,0.6) 0%, rgba(8,19,32,0.9) 100%)',
      }}
    >
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="font-display text-xl text-[color:var(--ivory)] tracking-wide">
          {name}
        </div>
        <div className="font-hud text-[10px] tracking-[0.3em] text-[color:var(--brass)]">
          MAX · {tierCap}
        </div>
      </div>
      <div className="font-mono text-sm text-[color:var(--parchment)]">
        <div className="font-hud text-[10px] text-[color:var(--teal-dim)] tracking-widest">
          COST
        </div>
        {costFormula}×{' '}
        <span className="text-[color:var(--gold)]">{material}</span>
      </div>
      <div className="font-mono text-sm text-[color:var(--parchment)]/90">
        <div className="font-hud text-[10px] text-[color:var(--teal-dim)] tracking-widest">
          EFFECTS
        </div>
        {effects}
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className="w-2 h-6 border border-[color:var(--brass)]/40"
          />
        ))}
      </div>
    </div>
  )
}

function LootCard({
  title,
  rarity,
  pool,
  accent,
}: {
  title: string
  rarity: string
  pool: { label: string; pct: string; color: string }[]
  accent: string
}) {
  return (
    <div
      className="p-5 border"
      style={{
        borderColor: `${accent}55`,
        background:
          'linear-gradient(180deg, rgba(10,22,40,0.65) 0%, rgba(8,19,32,0.9) 100%)',
      }}
    >
      <div
        className="font-hud text-[10px] tracking-[0.3em] mb-1"
        style={{ color: accent }}
      >
        {rarity}
      </div>
      <h4 className="font-display text-2xl text-[color:var(--ivory)] tracking-wide">
        {title}
      </h4>
      <ul className="mt-4 space-y-1.5 font-mono text-sm">
        {pool.map((p) => (
          <li key={p.label} className="flex justify-between items-baseline">
            <span className="text-[color:var(--parchment)]">{p.label}</span>
            <span style={{ color: p.color }}>{p.pct}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const LOOT = [
  {
    title: 'Waves I—III',
    rarity: 'GENTLE FORTUNE',
    accent: 'var(--teal-glow)',
    pool: [
      { label: 'Iron Planks ×2', pct: '50%', color: 'var(--teal-glow)' },
      { label: 'Provisions ×2', pct: '50%', color: 'var(--teal-glow)' },
    ],
  },
  {
    title: 'Waves IV—VI',
    rarity: 'REEF REWARD',
    accent: 'var(--gold)',
    pool: [
      { label: 'Iron Planks ×3', pct: '30%', color: 'var(--teal-glow)' },
      { label: 'Provisions ×3', pct: '30%', color: 'var(--teal-glow)' },
      { label: 'Steel Parts ×2', pct: '30%', color: 'var(--gold)' },
      { label: 'Timber ×2', pct: '10%', color: 'var(--gold)' },
    ],
  },
  {
    title: 'Waves VII+',
    rarity: 'LEVIATHAN SPOILS',
    accent: 'var(--blood)',
    pool: [
      { label: 'Steel Parts ×3', pct: '25%', color: 'var(--gold)' },
      { label: 'Timber ×3', pct: '25%', color: 'var(--gold)' },
      { label: 'Commander Tome ×1', pct: '25%', color: 'var(--blood)' },
      { label: 'Steel Parts ×5 (rare)', pct: '25%', color: 'var(--blood)' },
    ],
  },
]

function StatusCard({
  status,
  color,
  desc,
}: {
  status: string
  color: string
  desc: string
}) {
  return (
    <div
      className="p-5 border"
      style={{
        borderColor: `${color}55`,
        background:
          'linear-gradient(180deg, rgba(10,22,40,0.6) 0%, rgba(8,19,32,0.9) 100%)',
      }}
    >
      <div
        className="font-display text-2xl tracking-[0.2em] leading-none"
        style={{ color }}
      >
        {status}
      </div>
      <p
        className="mt-3 font-mono text-sm text-[color:var(--parchment)]/90 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: desc }}
      />
    </div>
  )
}
