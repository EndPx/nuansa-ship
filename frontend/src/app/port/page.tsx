'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useFleet } from '@/hooks/useFleet'
import { usePort } from '@/hooks/usePort'
import { useProfile } from '@/hooks/useProfile'
import { useInterwovenKit } from '@initia/interwovenkit-react'
import { useAutoSign } from '@/hooks/useAutoSign'
import { useBattleStats } from '@/hooks/useBattleStats'
import {
  Panel,
  StatBar,
  CornerFrame,
  TacticalButton,
  CrewRow,
  CompassWatermark,
} from '@/components/ui'

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center gap-4 w-[640px] h-[512px] box-console">
      <img
        src="/assets/ui/nuansa_logo_emblem.png"
        alt=""
        width={160}
        height={160}
        className="slow-rotate drop-shadow-[0_0_20px_rgba(82,224,196,0.35)]"
      />
      <div className="font-hud text-[color:var(--teal-glow)] text-xl tracking-[0.3em] cursor-blink">
        MAKING LANDFALL
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
  const { stats: battleStats } = useBattleStats(address || null)
  const { captainName: chainCaptainName } = useProfile(address || null)

  const shipClasses = ['Corvette', 'Frigate', 'Destroyer', 'Battleship']
  // Resolution order: on-chain captain_token_id (the name they typed at
  // mint) > Initia username > shortened bech32 > em-dash fallback.
  const captainName =
    chainCaptainName ??
    username ??
    (address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '—')
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
      {/* Ambient backdrop — compass watermark */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 slow-rotate">
          <CompassWatermark size={820} opacity={0.05} />
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
          <img
            src="/assets/ui/nuansa_logo_app.png"
            alt="Nuansa Ship"
            width={36}
            height={36}
            className="rounded-md"
            style={{ filter: 'drop-shadow(0 0 6px rgba(82,224,196,0.4))' }}
          />
          <div>
            <div className="font-hud text-xs tracking-[0.3em] text-[color:var(--teal-dim)]">
              SECTOR / COMMAND
            </div>
            <h1 className="font-display text-2xl md:text-3xl text-[color:var(--ivory)] tracking-widest">
              PORT <span className="text-[color:var(--teal-glow)]">NUANSA</span>
            </h1>
            <div className="font-hud text-[10px] tracking-[0.3em] text-[color:var(--brass)] mt-0.5">
              CAPTAIN <span className="text-[color:var(--gold)]">{captainName.toUpperCase()}</span>
            </div>
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
          <Panel iconSrc="/assets/ui/icon_anchor.png" title="FLEET DOSSIER">
            <DossierRow label="CAPTAIN" value={captainName} accent="gold" />
            <StatBar label="LEADERSHIP" current={fleet.captain?.leadership ?? 50} max={100} />
            <StatBar label="TACTICS" current={fleet.captain?.tactics ?? 50} max={100} />
            <StatBar label="XP / LVL" current={`${fleet.captain?.xp ?? 0} / LV ${fleet.captain?.level ?? 1}`} />
            <div className="pt-2 mt-2 border-t border-[color:var(--teal-dim)]/20">
              <div className="font-hud text-[10px] tracking-[0.3em] text-[color:var(--brass)] mb-1.5">
                ◈ BATTLE RECORD
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <div className="text-center">
                  <div className="font-display text-lg text-[color:var(--teal-glow)] leading-none">
                    {battleStats.wins}
                  </div>
                  <div className="text-[9px] tracking-[0.2em] text-[color:var(--teal-dim)] mt-0.5">
                    WINS
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-display text-lg text-[color:var(--blood)] leading-none">
                    {battleStats.losses}
                  </div>
                  <div className="text-[9px] tracking-[0.2em] text-[color:var(--teal-dim)] mt-0.5">
                    LOSSES
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-display text-lg text-[color:var(--gold)] leading-none">
                    {battleStats.highestWave}
                  </div>
                  <div className="text-[9px] tracking-[0.2em] text-[color:var(--teal-dim)] mt-0.5">
                    HIGH WAVE
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel iconSrc="/assets/ui/icon_navigator.png" title="FLAGSHIP">
            <DossierRow label="CLASS" value={shipClassName} accent="teal" />
            <StatBar label="HULL" current={fleet.ship?.hull ?? 500} max={fleet.ship?.maxHull ?? 500} variant="blood" />
            <StatBar label="WEAPON" current={fleet.ship?.weaponDamage ?? 60} max={200} />
            <StatBar label="ENGINE" current={fleet.ship?.engine ?? 4} max={5} />
            <StatBar label="ARMOR" current={fleet.ship?.armor ?? 5} max={100} />
          </Panel>

          <Panel iconSrc="/assets/ui/icon_gunner.png" title="CREW ROSTER">
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
          <CornerFrame className="mx-auto" style={{ width: 640 }}>
            <GameCanvas initialScene="PortScene" />
          </CornerFrame>

          {/* Action bar under canvas */}
          <div className="flex items-center justify-between gap-4 max-w-[640px] mx-auto font-hud text-xs text-[color:var(--teal-dim)]">
            <span>◊ CLICK BUILDING TO UPGRADE</span>
            <TacticalButton variant="blood" glitch onClick={handleSetSail}>
              ◢ SET SAIL ◣
            </TacticalButton>
            <span>TURN · SAFE HARBOR ◊</span>
          </div>
        </section>

        {/* ───── Right: Resources + buildings ───── */}
        <aside className="space-y-4 fade-up delay-2">
          <Panel iconSrc="/assets/ui/icon_chest.png" title="INVENTORY">
            <Resource iconSrc="/assets/ui/res_iron.png" label="Iron Planks" amount={resourceCount(port.inventory, 0)} />
            <Resource iconSrc="/assets/ui/res_steel.png" label="Steel Parts" amount={resourceCount(port.inventory, 1)} />
            <Resource iconSrc="/assets/ui/res_provisions.png" label="Provisions" amount={resourceCount(port.inventory, 2)} />
            <Resource iconSrc="/assets/ui/res_tome.png" label="Commander Tome" amount={resourceCount(port.inventory, 3)} />
            <Resource iconSrc="/assets/ui/res_timber.png" label="Timber" amount={resourceCount(port.inventory, 4)} />
          </Panel>

          <Panel iconSrc="/assets/ui/icon_tower.png" title="FACILITIES">
            <BuildingRow name="Shipyard" iconSrc="/assets/ui/icon_shipyard.png" level={port.port?.shipyardLevel ?? 0} />
            <BuildingRow name="Armory" iconSrc="/assets/ui/icon_armory.png" level={port.port?.armoryLevel ?? 0} />
            <BuildingRow name="Barracks" iconSrc="/assets/ui/icon_barracks.png" level={port.port?.barracksLevel ?? 0} />
            <BuildingRow name="Admiral's Hall" iconSrc="/assets/ui/icon_admirals_hall.png" level={port.port?.admiralsHallLevel ?? 0} />
            <BuildingRow name="Warehouse" iconSrc="/assets/ui/icon_warehouse.png" level={port.port?.warehouseLevel ?? 0} />
          </Panel>
        </aside>
      </div>

      {/* Bottom ticker */}
      <footer className="mt-6 pt-4 border-t border-[color:var(--teal-dim)]/30 font-hud text-xs text-[color:var(--teal-dim)] flex items-center justify-between gap-4">
        <span>◉ PORT.MOVE · SHIP.MOVE · CAPTAIN.MOVE · CREW.MOVE</span>
        <img
          src="/assets/ui/nuansa_logo_wordmark.png"
          alt="Nuansa Ship"
          width={120}
          height={66}
          className="opacity-60 hover:opacity-100 transition-opacity hidden md:block"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}
        />
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

/* ─── Port-specific helpers ──────────────────────────────────────── */

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

// Sum every entry of the given itemType in the inventory. Defends against
// the chain returning multiple ledger rows of the same resource type
// (e.g. two separate "Iron Planks ×2" drops not yet coalesced).
function resourceCount(
  inventory: { items?: Array<{ itemType: number; amount: number }> } | null | undefined,
  itemType: number,
): number {
  if (!inventory?.items) return 0
  return inventory.items.reduce(
    (sum, it) => (it.itemType === itemType ? sum + (Number(it.amount) || 0) : sum),
    0,
  )
}

function Resource({ iconSrc, label, amount }: { iconSrc: string; label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between font-mono text-sm border-b border-[color:var(--teal-dim)]/20 pb-1 last:border-0">
      <div className="flex items-center gap-2">
        <img
          src={iconSrc}
          alt=""
          width={22}
          height={22}
          className="pixelated"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
        />
        <span className="text-[color:var(--parchment)]">{label}</span>
      </div>
      <span className="font-hud text-base text-[color:var(--teal-glow)]">
        × {amount}
      </span>
    </div>
  )
}

function BuildingRow({ name, iconSrc, level }: { name: string; iconSrc?: string; level: number }) {
  const pips = Array.from({ length: 5 }, (_, i) => i < level)
  return (
    <div className="flex items-center justify-between font-mono text-sm">
      <span className="flex items-center gap-2 text-[color:var(--parchment)]">
        {iconSrc && (
          <img
            src={iconSrc}
            alt=""
            width={20}
            height={20}
            className="pixelated"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}
          />
        )}
        {name}
      </span>
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
