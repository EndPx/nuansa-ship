interface WaxSealProps {
  className?: string
  glyph?: string
}

/**
 * Red wax seal with anchor glyph. Used around the MintScreen parchment.
 * Pair with `.seal-press` class for the press-in entrance animation.
 */
export function WaxSeal({ className = '', glyph = '⚓' }: WaxSealProps) {
  return (
    <div
      className={`w-10 h-10 rounded-full pointer-events-none ${className}`}
      style={{
        background:
          'radial-gradient(circle at 35% 35%, #a21a26 0%, #6b0d15 70%, #3d060a 100%)',
        boxShadow:
          'inset 0 2px 4px rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.5)',
      }}
    >
      <div
        className="w-full h-full flex items-center justify-center text-[#f7d98e] text-lg"
        style={{
          fontFamily: 'Cinzel, serif',
          textShadow: '0 1px 1px rgba(0,0,0,0.5)',
        }}
      >
        {glyph}
      </div>
    </div>
  )
}
