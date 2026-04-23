'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BattleLog } from '@/components/BattleLog'
import { DamageFloater } from '@/components/DamageFloater'
import { useBattle } from '@/hooks/useBattle'
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
    <div className="flex items-center justify-center w-[640px] h-[512px] box-console">
      <div className="font-hud text-[color:var(--teal-glow)] text-xl">
        [ DEPLOYING FLEET... ]
      </div>
    </div>
  ),
})

type ActionMode = 'move' | 'attack' | 'skill' | null

export default function BattlePage() {
  const router = useRouter()
  const [wave, setWave] = useState(1)
  const [turn, setTurn] = useState<'player' | 'enemy'>('player')
  const [hp, setHp] = useState({ current: 500, max: 500 })
  const [actionMode, setActionMode] = useState<ActionMode>(null)
  const [chainReady, setChainReady] = useState(false)
  const [bootStatus, setBootStatus] = useState<string | null>('◇ Deploying fleet on-chain...')
  const [skillCd, setSkillCd] = useState(0)
  const [turnAnnounce, setTurnAnnounce] = useState<{ key: number; turn: 'player' | 'enemy' } | null>(null)
  const canvasFrameRef = useRef<HTMLDivElement>(null)
  const { startBattle } = useBattle()

  // Kick off the on-chain battle the moment /battle mounts so subsequent
  // move/attack/skill broadcasts don't abort with E_BATTLE_NOT_ACTIVE (0x6).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await startBattle(1)
        if (cancelled) return
        setChainReady(true)
        setBootStatus('✓ Battle live — you may engage.')
        setTimeout(() => !cancelled && setBootStatus(null), 3000)
      } catch (e: any) {
        if (cancelled) return
        // Start might fail if a battle is already active for this player —
        // treat that as "ready to play" rather than a hard block.
        setChainReady(true)
        setBootStatus(
          `◈ Chain battle already in progress — resuming. (${String(e?.message ?? e).slice(0, 60)})`,
        )
        setTimeout(() => !cancelled && setBootStatus(null), 4500)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [startBattle])

  // ── Wire Phaser → React events ────────────────────────────
  useEffect(() => {
    const onTurn = (e: Event) => {
      const next = (e as CustomEvent).detail?.turn as 'player' | 'enemy'
      setTurn(next)
      setTurnAnnounce({ key: Date.now(), turn: next })
      // Toggle body class to escalate the global CRT / red vignette
      if (next === 'enemy') document.body.classList.add('enemy-turn')
      else document.body.classList.remove('enemy-turn')
    }
    const onHp = (e: Event) => setHp((e as CustomEvent).detail)
    const onWave = (e: Event) => setWave((e as CustomEvent).detail?.wave ?? 1)
    const onShake = () => {
      const el = canvasFrameRef.current
      if (!el) return
      el.classList.remove('shake-hit')
      // force reflow to restart animation
      void el.offsetWidth
      el.classList.add('shake-hit')
      setTimeout(() => el.classList.remove('shake-hit'), 450)
    }
    const onSkillCd = (e: Event) => {
      const cd = (e as CustomEvent).detail?.cd ?? 0
      setSkillCd(Math.max(0, cd))
    }
    window.addEventListener('battle:turn', onTurn)
    window.addEventListener('battle:hp', onHp)
    window.addEventListener('battle:wave', onWave)
    window.addEventListener('battle:shake', onShake)
    window.addEventListener('battle:skillCd', onSkillCd)
    return () => {
      window.removeEventListener('battle:turn', onTurn)
      window.removeEventListener('battle:hp', onHp)
      window.removeEventListener('battle:wave', onWave)
      window.removeEventListener('battle:shake', onShake)
      window.removeEventListener('battle:skillCd', onSkillCd)
      document.body.classList.remove('enemy-turn')
    }
  }, [])

  // ── Dispatch action mode to Phaser ────────────────────────
  const setAction = (mode: Exclude<ActionMode, null>) => {
    setActionMode(mode)
    window.dispatchEvent(new CustomEvent('ui:setAction', { detail: { mode } }))
  }
  const endTurn = () => {
    setActionMode(null)
    window.dispatchEvent(new CustomEvent('ui:endTurn'))
  }

  // Keyboard shortcuts: M=move, A=attack, S=skill, Space/Enter=end turn, Esc=cancel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Skip when user is typing in an input
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      if (turn !== 'player' || !chainReady) return
      const k = e.key.toLowerCase()
      if (k === 'm') {
        e.preventDefault()
        setAction('move')
      } else if (k === 'a') {
        e.preventDefault()
        setAction('attack')
      } else if (k === 's') {
        if (skillCd > 0) return
        e.preventDefault()
        setAction('skill')
      } else if (k === ' ' || e.key === 'Enter') {
        e.preventDefault()
        endTurn()
      } else if (e.key === 'Escape') {
        setActionMode(null)
        window.dispatchEvent(new CustomEvent('ui:setAction', { detail: { mode: null } }))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [turn, chainReady, skillCd])

  const hpPct = Math.round((hp.current / hp.max) * 100)
  const isEnemy = turn === 'enemy'

  return (
    <main className="relative min-h-screen px-4 py-6">
      {/* Global red-alert vignette (toggled by body.enemy-turn) */}
      <div className="red-vignette" aria-hidden />

      {/* Turn announcement banner — slides across on every turn flip */}
      {turnAnnounce && (
        <div
          key={turnAnnounce.key}
          className="turn-announce fixed top-[38vh] left-0 right-0 z-[9996] pointer-events-none flex justify-center"
          aria-live="polite"
        >
          <div
            className="px-16 py-4 font-display tracking-[0.3em] text-4xl md:text-6xl"
            style={{
              color: turnAnnounce.turn === 'enemy' ? 'var(--blood)' : 'var(--teal-glow)',
              background:
                turnAnnounce.turn === 'enemy'
                  ? 'linear-gradient(90deg, transparent 0%, rgba(230,57,70,0.85) 20%, rgba(230,57,70,0.85) 80%, transparent 100%)'
                  : 'linear-gradient(90deg, transparent 0%, rgba(10,22,40,0.9) 20%, rgba(10,22,40,0.9) 80%, transparent 100%)',
              borderTop: `1px solid ${turnAnnounce.turn === 'enemy' ? 'var(--blood)' : 'var(--teal-glow)'}`,
              borderBottom: `1px solid ${turnAnnounce.turn === 'enemy' ? 'var(--blood)' : 'var(--teal-glow)'}`,
              textShadow:
                turnAnnounce.turn === 'enemy'
                  ? '0 0 12px rgba(230,57,70,0.9)'
                  : '0 0 12px rgba(82,224,196,0.8)',
              boxShadow:
                turnAnnounce.turn === 'enemy'
                  ? '0 0 48px rgba(230,57,70,0.5)'
                  : '0 0 48px rgba(82,224,196,0.4)',
            }}
          >
            {turnAnnounce.turn === 'enemy' ? '◈ ENEMY TURN ◈' : '◉ YOUR TURN ◉'}
          </div>
        </div>
      )}

      {/* Ambient rhumb watermark — tone flips to blood during enemy turn */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 slow-rotate">
          <CompassWatermark
            size={720}
            opacity={isEnemy ? 0.07 : 0.04}
            tone={isEnemy ? 'brass' : 'teal'}
          />
        </div>
      </div>

      {/* Boot/chain status banner */}
      {bootStatus && (
        <div
          className="relative z-10 mb-3 px-4 py-2 font-hud text-xs tracking-[0.25em] text-center border transition-colors"
          style={{
            color: chainReady ? 'var(--teal-glow)' : 'var(--gold)',
            borderColor: chainReady ? 'var(--teal-glow)' : 'var(--gold)',
            background: chainReady
              ? 'rgba(82,224,196,0.06)'
              : 'rgba(244,162,97,0.06)',
          }}
        >
          {bootStatus}
        </div>
      )}

      {/* Top command bar */}
      <header
        className="relative flex items-center justify-between mb-4 pb-3 border-b transition-colors"
        style={{ borderColor: isEnemy ? 'rgba(230,57,70,0.6)' : 'rgba(230,57,70,0.25)' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ background: isEnemy ? 'var(--blood)' : 'var(--teal-glow)' }}
          />
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
          <TacticalButton variant="teal" onClick={() => router.push('/port')}>
            ← RETREAT
          </TacticalButton>
        </div>
      </header>

      <div className="relative grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-5">
        {/* Left: Player status */}
        <aside className="space-y-4 fade-up">
          <Panel iconSrc="/assets/ui/icon_anchor.png" title="YOUR FLEET">
            <StatBar
              label="HULL INTEGRITY"
              current={hp.current}
              max={hp.max}
              variant="auto"
              flash
            />
            <div className="mt-3 font-hud text-xs text-[color:var(--teal-dim)]">
              {hpPct > 50 ? '◉ SYSTEMS NOMINAL' : hpPct > 20 ? '◈ HULL STRESS' : '⚠ CRITICAL'}
            </div>
          </Panel>

          <Panel iconSrc="/assets/ui/icon_gunner.png" title="CREW">
            <CrewRow role={0} hp={100} status={0} compact />
            <CrewRow role={1} hp={100} status={0} compact />
            <CrewRow role={2} hp={100} status={0} compact />
          </Panel>

          <Panel iconSrc="/assets/ui/icon_lightning.png" title="SPECIAL">
            <SkillSlot name="Broadside" cd={skillCd > 0 ? `CD ${skillCd}` : 'READY'} />
            <SkillSlot name="Evasive Drift" cd="—" />
            <SkillSlot name="Emergency Repair" cd="—" />
          </Panel>
        </aside>

        {/* Center: Battle canvas */}
        <section className="space-y-4 fade-up delay-1">
          <CornerFrame
            className="mx-auto"
            tone={isEnemy ? 'blood' : 'teal'}
            style={{ width: 640 }}
          >
            <div ref={canvasFrameRef} className="relative">
              <GameCanvas initialScene="BattleScene" />
              {/* Damage floaters layer */}
              <DamageFloater />
              {/* Targeting reticle overlay when attack mode active */}
              {actionMode === 'attack' && turn === 'player' && (
                <div className="reticle">
                  <div className="reticle-ticks">
                    <span className="t" />
                    <span className="b" />
                    <span className="l" />
                    <span className="r" />
                  </div>
                </div>
              )}
            </div>
          </CornerFrame>

          {/* Action rail */}
          <div className="flex items-center justify-center gap-3 max-w-[640px] mx-auto">
            <TacticalButton
              rail
              variant="teal"
              disabled={turn !== 'player' || !chainReady}
              onClick={() => setAction('move')}
              className={actionMode === 'move' ? 'ring-1 ring-[color:var(--teal-glow)]' : ''}
            >
              ◇ MOVE <KeyHint>M</KeyHint>
            </TacticalButton>
            <TacticalButton
              rail
              variant="blood"
              disabled={turn !== 'player' || !chainReady}
              onClick={() => setAction('attack')}
              className={actionMode === 'attack' ? 'ring-1 ring-[color:var(--blood)]' : ''}
            >
              ⚔ ATTACK <KeyHint>A</KeyHint>
            </TacticalButton>
            <TacticalButton
              rail
              variant="gold"
              disabled={turn !== 'player' || !chainReady || skillCd > 0}
              onClick={() => setAction('skill')}
              className={actionMode === 'skill' ? 'ring-1 ring-[color:var(--gold)]' : ''}
            >
              ⚡ SKILL{skillCd > 0 ? ` · CD ${skillCd}` : ''} <KeyHint>S</KeyHint>
            </TacticalButton>
            <TacticalButton
              rail
              variant="teal"
              disabled={turn !== 'player' || !chainReady}
              onClick={endTurn}
            >
              ⏭ END TURN <KeyHint>␣</KeyHint>
            </TacticalButton>
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
      <footer className="relative mt-6 pt-3 border-t border-[color:var(--blood)]/30 font-hud text-xs text-[color:var(--teal-dim)] flex items-center justify-between gap-4">
        <span>◉ BATTLE.MOVE · SESSION KEY ACTIVE ◊ AUTO-SIGN</span>
        <img
          src="/assets/ui/nuansa_logo_wordmark.png"
          alt="Nuansa Ship"
          width={110}
          height={60}
          className="opacity-55 hover:opacity-100 transition-opacity"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}
        />
        <span className="text-[color:var(--gold)]">
          ◊ CLICK TILE TO MOVE · RIGHT-CLICK ENEMY TO ATTACK
        </span>
      </footer>
    </main>
  )
}

/* ─── Battle-specific helpers ──────────────────────────────── */

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
      className="px-4 py-2 border font-hud tracking-[0.3em] text-sm transition-all"
      style={{
        color: isP ? 'var(--teal-glow)' : 'var(--blood)',
        borderColor: isP ? 'var(--teal-glow)' : 'var(--blood)',
        boxShadow: isP
          ? '0 0 20px rgba(82,224,196,0.4)'
          : '0 0 28px rgba(230,57,70,0.6), inset 0 0 12px rgba(230,57,70,0.2)',
      }}
    >
      {isP ? '◉ YOUR TURN' : '◈ ENEMY TURN'}
    </div>
  )
}

function SkillSlot({ name, cd }: { name: string; cd: string }) {
  const ready = cd === 'READY'
  return (
    <button
      className="w-full flex items-center justify-between font-mono text-sm py-1.5 px-2 border-b border-[color:var(--teal-dim)]/20 last:border-0 hover:bg-[color:var(--teal-dim)]/10 transition-colors disabled:opacity-50"
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

function KeyHint({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="ml-1.5 inline-block px-1.5 py-[1px] font-mono text-[10px] tracking-normal border rounded-sm"
      style={{
        color: 'var(--teal-glow)',
        borderColor: 'var(--teal-dim)',
        background: 'rgba(8,19,32,0.6)',
      }}
    >
      {children}
    </span>
  )
}
