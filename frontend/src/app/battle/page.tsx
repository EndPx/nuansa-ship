'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BattleLog } from '@/components/BattleLog'

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-[640px] h-[512px] box-console">
      <div className="font-hud text-[color:var(--teal-glow)] text-xl">
        [ DEPLOYING FLEET... ]
      </div>
    </div>
  ),
})

export default function BattlePage() {
  const router = useRouter()
  const [wave, setWave] = useState(1)
  const [turn, setTurn] = useState<'player' | 'enemy'>('player')
  const [hp, setHp] = useState({ current: 500, max: 500 })

  useEffect(() => {
    const onTurn = (e: any) => setTurn(e.detail.turn)
    const onHp = (e: any) => setHp(e.detail)
    const onWave = (e: any) => setWave(e.detail.wave)
    window.addEventListener('battle:turn', onTurn as any)
    window.addEventListener('battle:hp', onHp as any)
    window.addEventListener('battle:wave', onWave as any)
    return () => {
      window.removeEventListener('battle:turn', onTurn as any)
      window.removeEventListener('battle:hp', onHp as any)
      window.removeEventListener('battle:wave', onWave as any)
    }
  }, [])

  const hpPct = Math.round((hp.current / hp.max) * 100)

  return (
    <main className="relative min-h-screen px-4 py-6">
      {/* Top command bar */}
      <header className="flex items-center justify-between mb-4 pb-3 border-b border-[color:var(--blood)]/40">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-[color:var(--blood)] animate-pulse" />
          <div>
            <div className="font-hud text-xs tracking-[0.3em] text-[color:var(--blood)]">
              COMBAT SECTOR / ENGAGEMENT
            </div>
            <h1 className="font-display text-2xl md:text-3xl text-[color:var(--ivory)] tracking-widest">
              NAVAL <span className="text-[color:var(--blood)] text-glow">BATTLE</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <WaveBadge wave={wave} />
          <TurnBadge turn={turn} />
          <button
            onClick={() => router.push('/port')}
            className="btn-tactical"
          >
            ← RETREAT
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-5">
        {/* Left: Player status */}
        <aside className="space-y-4 fade-up">
          <Panel title="⚓ YOUR FLEET">
            <HpBar label="HULL INTEGRITY" current={hp.current} max={hp.max} />
            <div className="mt-3 font-hud text-xs text-[color:var(--teal-dim)]">
              {hpPct > 50 ? '◉ SYSTEMS NOMINAL' : hpPct > 20 ? '◈ HULL STRESS' : '⚠ CRITICAL'}
            </div>
          </Panel>

          <Panel title="👥 CREW">
            <CrewChip role={0} status="READY" />
            <CrewChip role={1} status="READY" />
            <CrewChip role={2} status="READY" />
          </Panel>

          <Panel title="⚡ SPECIAL">
            <SkillSlot name="Broadside" cd="READY" />
            <SkillSlot name="Evasive Drift" cd="CD 2" />
            <SkillSlot name="Emergency Repair" cd="READY" />
          </Panel>
        </aside>

        {/* Center: Battle canvas */}
        <section className="space-y-4 fade-up delay-1">
          <div className="corner-frame relative mx-auto" style={{ width: 640 }}>
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />
            <GameCanvas initialScene="BattleScene" />
          </div>

          {/* Action rail */}
          <div className="flex items-center justify-center gap-3 max-w-[640px] mx-auto">
            <ActionBtn
              label="◇ MOVE"
              accent="teal"
              disabled={turn !== 'player'}
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('ui:setAction', { detail: { mode: 'move' } })
                )
              }
            />
            <ActionBtn
              label="⚔ ATTACK"
              accent="blood"
              disabled={turn !== 'player'}
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('ui:setAction', { detail: { mode: 'attack' } })
                )
              }
            />
            <ActionBtn
              label="⚡ SKILL"
              accent="gold"
              disabled={turn !== 'player'}
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('ui:setAction', { detail: { mode: 'skill' } })
                )
              }
            />
            <ActionBtn
              label="⏭ END TURN"
              accent="teal"
              disabled={turn !== 'player'}
              onClick={() =>
                window.dispatchEvent(new CustomEvent('ui:endTurn'))
              }
            />
          </div>
        </section>

        {/* Right: Battle log */}
        <aside className="space-y-4 fade-up delay-2">
          <Panel title="📡 BATTLE TELEMETRY">
            <BattleLog />
          </Panel>
        </aside>
      </div>

      {/* Bottom tactical strip */}
      <footer className="mt-6 pt-3 border-t border-[color:var(--blood)]/30 font-hud text-xs text-[color:var(--teal-dim)] flex justify-between">
        <span>◉ BATTLE.MOVE · SESSION KEY ACTIVE ◊ AUTO-SIGN</span>
        <span className="text-[color:var(--gold)]">◊ CLICK TILE TO MOVE · RIGHT-CLICK ENEMY TO ATTACK</span>
      </footer>
    </main>
  )
}

/* ─── Components ──────────────────────────────────────────────────── */

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="box-console p-4">
      <div className="font-hud text-sm tracking-[0.25em] text-[color:var(--teal-glow)] mb-3 pb-2 border-b border-[color:var(--teal-dim)]/30">
        {title}
      </div>
      {children}
    </div>
  )
}

function WaveBadge({ wave }: { wave: number }) {
  return (
    <div className="text-right">
      <div className="font-hud text-xs text-[color:var(--teal-dim)] tracking-[0.3em]">
        WAVE
      </div>
      <div className="font-display text-3xl text-[color:var(--gold)] text-glow-gold leading-none">
        {String(wave).padStart(2, '0')}
      </div>
    </div>
  )
}

function TurnBadge({ turn }: { turn: 'player' | 'enemy' }) {
  const isP = turn === 'player'
  return (
    <div
      className="px-4 py-2 border font-hud tracking-[0.3em] text-sm"
      style={{
        color: isP ? 'var(--teal-glow)' : 'var(--blood)',
        borderColor: isP ? 'var(--teal-glow)' : 'var(--blood)',
        boxShadow: isP
          ? '0 0 20px rgba(82,224,196,0.4)'
          : '0 0 20px rgba(230,57,70,0.4)',
      }}
    >
      {isP ? '◉ YOUR TURN' : '◈ ENEMY TURN'}
    </div>
  )
}

function HpBar({ label, current, max }: { label: string; current: number; max: number }) {
  const pct = Math.min(100, (current / max) * 100)
  const color = pct > 60 ? '#52E0C4' : pct > 25 ? '#F4A261' : '#E63946'
  return (
    <div>
      <div className="flex justify-between font-hud text-xs mb-1">
        <span className="text-[color:var(--teal-dim)] tracking-wider">{label}</span>
        <span style={{ color }}>{current}/{max}</span>
      </div>
      <div className="h-2 bg-[color:var(--abyss)] border border-[color:var(--teal-dim)]/30 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}55, ${color})`,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
      </div>
    </div>
  )
}

function CrewChip({ role, status }: { role: number; status: string }) {
  const roles = ['Gunner', 'Navigator', 'Engineer']
  const icons = ['💥', '🧭', '🔧']
  return (
    <div className="flex items-center justify-between font-mono text-sm py-1 border-b border-[color:var(--teal-dim)]/20 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icons[role]}</span>
        <span className="text-[color:var(--parchment)]">{roles[role]}</span>
      </div>
      <span className="font-hud text-xs text-[color:var(--teal-glow)] tracking-wider">
        {status}
      </span>
    </div>
  )
}

function SkillSlot({ name, cd }: { name: string; cd: string }) {
  const ready = cd === 'READY'
  return (
    <button
      className="w-full flex items-center justify-between font-mono text-sm py-1.5 px-2 border-b border-[color:var(--teal-dim)]/20 last:border-0 hover:bg-[color:var(--teal-dim)]/10 transition-colors"
      disabled={!ready}
    >
      <span className="text-[color:var(--parchment)]">{name}</span>
      <span
        className="font-hud text-xs tracking-wider"
        style={{ color: ready ? 'var(--teal-glow)' : 'var(--teal-dim)' }}
      >
        {cd}
      </span>
    </button>
  )
}

function ActionBtn({
  label,
  accent,
  onClick,
  disabled = false,
}: {
  label: string
  accent: 'teal' | 'blood' | 'gold'
  onClick?: () => void
  disabled?: boolean
}) {
  const borderMap: Record<string, string> = {
    teal: 'var(--teal)',
    blood: 'var(--blood)',
    gold: 'var(--gold)',
  }
  const colorMap: Record<string, string> = {
    teal: 'var(--teal-glow)',
    blood: '#ffb3b8',
    gold: 'var(--gold)',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 font-hud tracking-[0.2em] text-base py-3 border transition-all hover:bg-[color:var(--teal-dim)]/20 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        borderColor: borderMap[accent],
        color: colorMap[accent],
      }}
    >
      {label}
    </button>
  )
}
