'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useFleet } from '@/hooks/useFleet'
import { usePort } from '@/hooks/usePort'
import { useInterwovenKit } from '@initia/interwovenkit-react'
import { useAutoSign } from '@/hooks/useAutoSign'

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-[640px] h-[512px] box-console">
      <div className="font-hud text-[color:var(--teal-glow)] text-xl">
        [ LOADING PORT... ]
      </div>
    </div>
  ),
})

export default function PortPage() {
  const router = useRouter()
  const { address, username } = useInterwovenKit()
  const fleet = useFleet(address || null)
  const port = usePort(address || null)
  const { startBattleSession, isEnabled: autoSignActive } = useAutoSign()

  const shipClasses = ['Corvette', 'Frigate', 'Destroyer', 'Battleship']
  const captainName = username ?? (address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '—')
  const shipClassName = fleet.ship ? shipClasses[fleet.ship.shipClass] ?? 'Corvette' : 'Corvette'

  const handleSetSail = async () => {
    try {
      await startBattleSession()
    } catch (err) {
      console.warn('Auto-sign session denied or unavailable:', err)
    }
    router.push('/battle')
  }

  return (
    <main className="relative min-h-screen px-4 py-6 md:px-8 md:py-10 overflow-hidden">
      {/* Ambient backdrop — rhumb lines + compass watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 slow-rotate">
          <svg width={820} height={820} viewBox="0 0 820 820">
            <circle cx="410" cy="410" r="408" fill="none" stroke="#C8A255" strokeWidth="1" />
            <circle cx="410" cy="410" r="320" fill="none" stroke="#C8A255" strokeWidth="0.5" />
            <circle cx="410" cy="410" r="220" fill="none" stroke="#C8A255" strokeWidth="0.5" />
            <circle cx="410" cy="410" r="120" fill="none" stroke="#C8A255" strokeWidth="0.5" />
            {Array.from({ length: 32 }, (_, i) => {
              const a = (i * Math.PI) / 16
              return (
                <line
                  key={i}
                  x1="410"
                  y1="410"
                  x2={410 + Math.cos(a) * 408}
                  y2={410 + Math.sin(a) * 408}
                  stroke="#C8A255"
                  strokeWidth="0.4"
                />
              )
            })}
          </svg>
        </div>
      </div>

      {/* Ambient lantern glows drifting */}
      <div
        className="absolute top-10 right-10 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(244,162,97,0.12) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      <div
        className="absolute bottom-10 left-10 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(82,224,196,0.1) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Top bar */}
      <header className="flex items-center justify-between mb-6 pb-4 border-b border-[color:var(--teal-dim)]/30">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-[color:var(--teal-glow)] animate-pulse" />
          <div>
            <div className="font-hud text-xs tracking-[0.3em] text-[color:var(--teal-dim)]">
              SECTOR / COMMAND
            </div>
            <h1 className="font-display text-2xl md:text-3xl text-[color:var(--ivory)] tracking-widest">
              PORT <span className="text-[color:var(--teal-glow)]">NUANSA</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-6 font-hud text-sm text-[color:var(--teal-dim)]">
          <span>LAT -04.2°S</span>
          <span>LON 119.5°E</span>
          <span className="text-[color:var(--gold)]">SAFE ZONE</span>
        </div>
      </header>

      {/* Three-column tactical layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-5">
        {/* ───── Left: Fleet dossier ───── */}
        <aside className="space-y-4 fade-up">
          <Panel title="◉ FLEET DOSSIER">
            <DossierRow label="CAPTAIN" value={captainName} accent="gold" />
            <Stat label="LEADERSHIP" value={fleet.captain?.leadership ?? 50} max={100} />
            <Stat label="TACTICS" value={fleet.captain?.tactics ?? 50} max={100} />
            <Stat label="XP / LVL" value={`${fleet.captain?.xp ?? 0} / LV ${fleet.captain?.level ?? 1}`} />
          </Panel>

          <Panel title="⛵ FLAGSHIP">
            <DossierRow label="CLASS" value={shipClassName} accent="teal" />
            <Stat label="HULL" value={fleet.ship?.hull ?? 500} max={fleet.ship?.maxHull ?? 500} bar="blood" />
            <Stat label="WEAPON" value={fleet.ship?.weaponDamage ?? 60} max={200} />
            <Stat label="ENGINE" value={fleet.ship?.engine ?? 4} max={5} />
            <Stat label="ARMOR" value={fleet.ship?.armor ?? 5} max={100} />
          </Panel>

          <Panel title="👥 CREW ROSTER">
            <div className="space-y-2">
              {(fleet.crew.length > 0
                ? fleet.crew
                : [{ role: 0, skillId: 0, morale: 50, hp: 100, status: 0 }]
              ).map((c, i) => (
                <CrewRow key={i} role={c.role} hp={c.hp} status={c.status} />
              ))}
            </div>
          </Panel>
        </aside>

        {/* ───── Center: Game canvas ───── */}
        <section className="space-y-4 fade-up delay-1">
          <div className="corner-frame relative mx-auto" style={{ width: 640 }}>
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />
            <GameCanvas initialScene="PortScene" />
          </div>

          {/* Action bar under canvas */}
          <div className="flex items-center justify-between gap-4 max-w-[640px] mx-auto font-hud text-xs text-[color:var(--teal-dim)]">
            <span>◊ CLICK BUILDING TO UPGRADE</span>
            <button
              onClick={handleSetSail}
              className="btn-tactical variant-blood glitch-hover"
            >
              ◢ SET SAIL ◣
            </button>
            <span>TURN · SAFE HARBOR ◊</span>
          </div>
        </section>

        {/* ───── Right: Resources + buildings ───── */}
        <aside className="space-y-4 fade-up delay-2">
          <Panel title="📜 INVENTORY">
            <Resource icon="▬" label="Iron Planks" amount={port.inventory?.items?.find(i => i.itemType === 0)?.amount ?? 4} />
            <Resource icon="◆" label="Steel Parts" amount={port.inventory?.items?.find(i => i.itemType === 1)?.amount ?? 2} />
            <Resource icon="●" label="Provisions" amount={port.inventory?.items?.find(i => i.itemType === 2)?.amount ?? 6} />
            <Resource icon="✦" label="Commander Tome" amount={port.inventory?.items?.find(i => i.itemType === 3)?.amount ?? 0} />
            <Resource icon="▲" label="Timber" amount={port.inventory?.items?.find(i => i.itemType === 4)?.amount ?? 3} />
          </Panel>

          <Panel title="🏛 FACILITIES">
            <BuildingRow name="Shipyard" level={port.port?.shipyardLevel ?? 0} />
            <BuildingRow name="Armory" level={port.port?.armoryLevel ?? 0} />
            <BuildingRow name="Barracks" level={port.port?.barracksLevel ?? 0} />
            <BuildingRow name="Admiral's Hall" level={port.port?.admiralsHallLevel ?? 0} />
            <BuildingRow name="Warehouse" level={port.port?.warehouseLevel ?? 0} />
          </Panel>
        </aside>
      </div>

      {/* Bottom ticker */}
      <footer className="mt-6 pt-4 border-t border-[color:var(--teal-dim)]/30 font-hud text-xs text-[color:var(--teal-dim)] flex justify-between">
        <span>◉ PORT.MOVE · SHIP.MOVE · CAPTAIN.MOVE · CREW.MOVE</span>
        <span className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              background: autoSignActive ? 'var(--teal-glow)' : 'var(--gold)',
              boxShadow: autoSignActive
                ? '0 0 6px rgba(82,224,196,0.7)'
                : '0 0 6px rgba(244,162,97,0.6)',
            }}
          />
          <span style={{ color: autoSignActive ? 'var(--teal-glow)' : 'var(--gold)' }}>
            {autoSignActive ? 'AUTO-SIGN: SESSION ACTIVE' : 'AUTO-SIGN: PENDING SESSION KEY'}
          </span>
        </span>
      </footer>
    </main>
  )
}

/* ─── Components ─────────────────────────────────────────────────── */

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="box-console p-4 relative">
      <div className="font-hud text-sm tracking-[0.25em] text-[color:var(--teal-glow)] mb-3 pb-2 border-b border-[color:var(--teal-dim)]/30">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function DossierRow({
  label,
  value,
  accent = 'teal',
}: {
  label: string
  value: string | number
  accent?: 'teal' | 'gold'
}) {
  const color = accent === 'gold' ? 'var(--gold)' : 'var(--teal-glow)'
  return (
    <div className="flex justify-between items-baseline border-b border-[color:var(--teal-dim)]/20 pb-1">
      <span className="font-hud text-xs text-[color:var(--teal-dim)] tracking-wider">
        {label}
      </span>
      <span className="font-display text-base" style={{ color }}>
        {value}
      </span>
    </div>
  )
}

function Stat({
  label,
  value,
  max,
  bar = 'teal',
}: {
  label: string
  value: number | string
  max?: number
  bar?: 'teal' | 'blood' | 'gold'
}) {
  const pct =
    typeof value === 'number' && max ? Math.min(100, (value / max) * 100) : null
  const color =
    bar === 'blood' ? '#e63946' : bar === 'gold' ? '#F4A261' : '#52E0C4'
  return (
    <div>
      <div className="flex justify-between font-hud text-xs">
        <span className="text-[color:var(--teal-dim)] tracking-wider">{label}</span>
        <span className="text-[color:var(--parchment)]">
          {value}
          {max && typeof value === 'number' ? ` / ${max}` : ''}
        </span>
      </div>
      {pct !== null && (
        <div className="mt-1 h-[5px] bg-[color:var(--abyss)] border border-[color:var(--teal-dim)]/30 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 transition-all"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${color}55 0%, ${color} 100%)`,
              boxShadow: `0 0 8px ${color}aa`,
            }}
          />
        </div>
      )}
    </div>
  )
}

function CrewRow({ role, hp, status }: { role: number; hp: number; status: number }) {
  const roles = ['Gunner', 'Navigator', 'Engineer']
  const icons = ['💥', '🧭', '🔧']
  const statusColors = ['#52E0C4', '#F4A261', '#E63946']
  const statusText = ['READY', 'INJURED', 'KO']
  return (
    <div className="flex items-center gap-3 border-b border-[color:var(--teal-dim)]/20 pb-2 last:border-b-0 last:pb-0">
      <div className="text-2xl">{icons[role]}</div>
      <div className="flex-1">
        <div className="font-display text-sm text-[color:var(--parchment)]">
          {roles[role]}
        </div>
        <div className="h-1 bg-[color:var(--abyss)] mt-1 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0"
            style={{
              width: `${hp}%`,
              background: hp > 50 ? '#52E0C4' : hp > 0 ? '#F4A261' : '#E63946',
            }}
          />
        </div>
      </div>
      <div
        className="font-hud text-xs tracking-wider"
        style={{ color: statusColors[status] }}
      >
        {statusText[status]}
      </div>
    </div>
  )
}

function Resource({ icon, label, amount }: { icon: string; label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between font-mono text-sm border-b border-[color:var(--teal-dim)]/20 pb-1 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-[color:var(--gold)] text-lg leading-none">{icon}</span>
        <span className="text-[color:var(--parchment)]">{label}</span>
      </div>
      <span className="font-hud text-base text-[color:var(--teal-glow)]">
        × {amount}
      </span>
    </div>
  )
}

function BuildingRow({ name, level }: { name: string; level: number }) {
  const pips = Array.from({ length: 5 }, (_, i) => i < level)
  return (
    <div className="flex items-center justify-between font-mono text-sm">
      <span className="text-[color:var(--parchment)]">{name}</span>
      <div className="flex gap-0.5">
        {pips.map((on, i) => (
          <span
            key={i}
            className="w-2 h-4 border border-[color:var(--teal-dim)]/40"
            style={{
              background: on
                ? 'linear-gradient(180deg, #52E0C4 0%, #2A9D8F 100%)'
                : 'transparent',
              boxShadow: on ? '0 0 6px rgba(82,224,196,0.5)' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  )
}
