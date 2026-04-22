'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'

/**
 * Shared chrome for the Admiralty Archive routes (/codex, /fleet, /almanac).
 * Provides the masthead, parallax starfield, ambient glow, and footer colophon.
 */
export function ArchivePage({
  volumeTag,
  title,
  subtitle,
  folio,
  children,
}: {
  volumeTag: string
  title: ReactNode
  subtitle: string
  folio: string
  children: ReactNode
}) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <StarField />
      <AmbientGlow />

      <header className="relative z-10 px-6 md:px-16 pt-10 pb-6 border-b border-[color:var(--brass)]/20">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex items-center gap-3 font-hud text-xs tracking-[0.4em] text-[color:var(--teal-dim)] hover:text-[color:var(--teal-glow)] transition-colors"
          >
            <img
              src="/assets/ui/nuansa_logo_app.png"
              alt="Nuansa Ship"
              width={28}
              height={28}
              className="rounded-md transition-transform group-hover:scale-110"
              style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}
            />
            <span>← RETURN TO HELM</span>
          </Link>
          <div className="text-center">
            <div className="font-hud text-[10px] tracking-[0.5em] text-[color:var(--brass)]">
              ✦ {volumeTag} ✦
            </div>
            <h1 className="mt-1 font-display text-2xl md:text-4xl tracking-[0.25em] text-[color:var(--ivory)]">
              {title}
            </h1>
            <div className="mt-1 font-hud text-[10px] tracking-[0.4em] text-[color:var(--brass)]">
              ⟡ {subtitle} ⟡
            </div>
          </div>
          <div className="flex items-center gap-3 font-hud text-xs tracking-[0.4em] text-[color:var(--teal-dim)]">
            <ArchiveNav />
            <span className="opacity-40">│</span>
            <span>FOLIO {folio}</span>
          </div>
        </div>
      </header>

      {children}

      <footer className="relative z-10 px-6 md:px-16 py-10 border-t border-[color:var(--brass)]/20 font-hud text-xs tracking-[0.3em] text-[color:var(--teal-dim)] flex flex-col md:flex-row items-center justify-between gap-4">
        <span>◉ NUANSA SHIP · INITIA HACKATHON SEASON 1</span>
        <span className="font-im-fell italic" style={{ fontFamily: '"IM Fell English", serif' }}>
          bound in teal & brass · 2026
        </span>
        <span>PART OF THE NUANSA UNIVERSE</span>
      </footer>
    </main>
  )
}

function ArchiveNav() {
  return (
    <nav className="flex items-center gap-3">
      <Link
        href="/codex"
        className="hover:text-[color:var(--gold)] transition-colors"
      >
        CODEX
      </Link>
      <span className="opacity-40">·</span>
      <Link
        href="/fleet"
        className="hover:text-[color:var(--gold)] transition-colors"
      >
        FLEET
      </Link>
      <span className="opacity-40">·</span>
      <Link
        href="/almanac"
        className="hover:text-[color:var(--gold)] transition-colors"
      >
        ALMANAC
      </Link>
    </nav>
  )
}

export function OrnamentalRule({ glyph = '◆ ⚓ ◆' }: { glyph?: string }) {
  return (
    <div className="relative z-10 flex items-center justify-center py-6 px-6">
      <div className="flex items-center gap-4 text-[color:var(--brass)]/60">
        <span className="h-px w-16 md:w-32 bg-[color:var(--brass)]/30" />
        <span className="text-xl tracking-[0.3em]">{glyph}</span>
        <span className="h-px w-16 md:w-32 bg-[color:var(--brass)]/30" />
      </div>
    </div>
  )
}

export function DropCap({ letter }: { letter: string }) {
  return (
    <span
      className="float-left font-display text-6xl md:text-7xl leading-[0.8] mr-2 mt-1 text-[color:var(--brass)] text-glow-gold"
      style={{ fontFamily: 'Cinzel, serif' }}
    >
      {letter}
    </span>
  )
}

export function ChapterHeader({
  number,
  title,
  subtitle,
}: {
  number: string
  title: string
  subtitle: string
}) {
  return (
    <>
      <div className="flex items-baseline gap-4">
        <span className="font-display text-7xl md:text-8xl leading-none text-[color:var(--brass)] text-glow-gold italic">
          {number}
        </span>
        <span className="font-hud text-xs tracking-[0.4em] text-[color:var(--brass)]">
          CHAPTER {number}
        </span>
      </div>
      <h3 className="mt-2 font-display text-3xl md:text-5xl text-[color:var(--ivory)] tracking-wide">
        {title}
      </h3>
      <p
        className="mt-3 font-im-fell italic text-lg text-[color:var(--parchment)]/80"
        style={{ fontFamily: '"IM Fell English", serif' }}
      >
        {subtitle}
      </p>
    </>
  )
}

/* ────── Backdrop ────── */

function StarField() {
  const [stars, setStars] = useState<{ x: number; y: number; s: number; d: number }[]>([])
  useEffect(() => {
    const arr = Array.from({ length: 140 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: Math.random() * 1.5 + 0.4,
      d: Math.random() * 6,
    }))
    setStars(arr)
  }, [])
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {stars.map((st, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: `${st.s}px`,
            height: `${st.s}px`,
            background: i % 9 === 0 ? '#F4A261' : '#E8D5B7',
            boxShadow: i % 9 === 0 ? '0 0 6px #F4A261' : '0 0 4px #E8D5B7',
            opacity: 0.35 + (i % 5) * 0.1,
            animation: `blink ${3 + (i % 5)}s ${st.d}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

function AmbientGlow() {
  return (
    <>
      <div
        className="fixed top-0 left-0 w-[60vw] h-[60vh] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top left, rgba(200,162,85,0.09) 0%, transparent 55%)',
          zIndex: 0,
        }}
      />
      <div
        className="fixed bottom-0 right-0 w-[60vw] h-[60vh] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at bottom right, rgba(42,157,143,0.08) 0%, transparent 55%)',
          zIndex: 0,
        }}
      />
    </>
  )
}
