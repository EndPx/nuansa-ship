'use client'

import { useState } from 'react'
import { buildUpgradeBuildingTx, CONTRACT_ADDRESS } from '@/lib/contracts'
import { useInterwovenKit } from '@initia/interwovenkit-react'

interface UpgradePanelProps {
  buildingType: number
  buildingName: string
  currentLevel: number
  onClose: () => void
}

const BUILDING_ICONS: Record<number, string> = {
  0: '/assets/ui/icon_shipyard.png',
  1: '/assets/ui/icon_armory.png',
  2: '/assets/ui/icon_barracks.png',
  3: '/assets/ui/icon_admirals_hall.png',
  4: '/assets/ui/icon_warehouse.png',
}

const BUILDING_DESCRIPTIONS: Record<number, string[]> = {
  0: [ // Shipyard
    'Unlocks Corvette construction',
    'Unlocks Frigate construction',
    'Unlocks Destroyer construction',
    'Advanced hull plating',
    'Unlocks Battleship construction',
  ],
  1: [ // Armory
    'Weapon damage +10%',
    'Weapon damage +20%',
    'Weapon damage +30%, Range +1',
    'Weapon damage +40%',
    'Weapon damage +50%, Range +1',
  ],
  2: [ // Barracks
    'Crew recovery available',
    'Max crew: 2',
    'Recovery speed +50%',
    'Max crew: 3',
    'Elite training',
  ],
  3: [ // Admiral\'s Hall
    'XP multiplier x1.25',
    'XP multiplier x1.5',
    'XP multiplier x1.75',
    'XP multiplier x2.0',
    'XP multiplier x2.5',
  ],
  4: [ // Warehouse
    'Inventory: 15 slots',
    'Inventory: 20 slots',
    'Inventory: 25 slots',
    'Inventory: 30 slots',
    'Inventory: 35 slots',
  ],
}

const UPGRADE_MATERIALS: Record<number, string> = {
  0: 'Iron Planks',
  1: 'Steel Parts',
  2: 'Provisions',
  3: 'Commander Tome',
  4: 'Timber',
}

const COST_MULTIPLIERS: Record<number, number> = {
  0: 3,
  1: 2,
  2: 3,
  3: 1,
  4: 4,
}

export function UpgradePanel({ buildingType, buildingName, currentLevel, onClose }: UpgradePanelProps) {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { address, requestTxBlock, isConnected } = useInterwovenKit()
  const maxLevel = 5
  const canUpgrade = currentLevel < maxLevel
  const nextLevel = currentLevel + 1
  const cost = nextLevel * (COST_MULTIPLIERS[buildingType] || 1)
  const material = UPGRADE_MATERIALS[buildingType] || 'Materials'
  const descriptions = BUILDING_DESCRIPTIONS[buildingType] || []

  const handleUpgrade = async () => {
    setError(null)
    if (!isConnected || !address) {
      setError('Wallet not connected')
      return
    }
    setIsUpgrading(true)
    try {
      const messages = buildUpgradeBuildingTx(address, buildingType)
      if (!CONTRACT_ADDRESS) {
        console.log('[upgrade_building] would broadcast (contract not deployed yet):', messages)
        setError('Contracts not deployed yet — simulated upgrade')
        return
      }
      const res = await requestTxBlock({ messages })
      console.log('Upgrade TX hash:', res.transactionHash)
      onClose()
    } catch (err: any) {
      console.error('Upgrade failed:', err)
      setError(err?.message ?? 'Upgrade failed')
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{
        background:
          'radial-gradient(ellipse at center, rgba(10,22,40,0.92) 0%, rgba(5,12,24,0.98) 70%)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative corner-frame box-console p-6 max-w-md w-full fade-up"
      >
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />

        {/* Header strip */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-[color:var(--teal-dim)]/30">
          <div className="flex items-center gap-3">
            {BUILDING_ICONS[buildingType] && (
              <img
                src={BUILDING_ICONS[buildingType]}
                alt=""
                width={48}
                height={48}
                className="pixelated"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))' }}
              />
            )}
            <div>
              <div className="font-hud text-xs tracking-[0.3em] text-[color:var(--teal-dim)]">
                ◉ FACILITY UPGRADE
              </div>
              <h2 className="font-display text-2xl text-[color:var(--ivory)] tracking-widest text-glow mt-0.5">
                {buildingName}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="font-hud text-2xl text-[color:var(--teal-dim)] hover:text-[color:var(--blood)] transition-colors leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Level progress */}
        <div className="mb-5">
          <div className="flex justify-between font-hud text-xs mb-2">
            <span className="text-[color:var(--teal-dim)] tracking-widest">
              TIER CLEARANCE
            </span>
            <span className="text-[color:var(--parchment)] tracking-wider">
              LV {currentLevel} / {maxLevel}
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: maxLevel }, (_, i) => (
              <div
                key={i}
                className="flex-1 h-3 border border-[color:var(--teal-dim)]/40"
                style={{
                  background:
                    i < currentLevel
                      ? 'linear-gradient(180deg, #52E0C4 0%, #2A9D8F 100%)'
                      : i === currentLevel && canUpgrade
                      ? 'linear-gradient(180deg, rgba(244,162,97,0.25) 0%, rgba(244,162,97,0.05) 100%)'
                      : 'transparent',
                  boxShadow:
                    i < currentLevel
                      ? '0 0 8px rgba(82,224,196,0.6)'
                      : i === currentLevel && canUpgrade
                      ? 'inset 0 0 8px rgba(244,162,97,0.3)'
                      : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {canUpgrade && (
          <>
            {/* Level bonus intel */}
            <div
              className="relative p-4 mb-4 border border-[color:var(--brass)]/40"
              style={{
                background:
                  'linear-gradient(180deg, rgba(200,162,85,0.08) 0%, rgba(139,105,20,0.03) 100%)',
              }}
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-hud text-xs text-[color:var(--brass)] tracking-[0.3em]">
                  ◈ LV {nextLevel} INTEL
                </span>
                <span className="font-hud text-[10px] text-[color:var(--teal-dim)] tracking-widest">
                  CLASSIFIED
                </span>
              </div>
              <p className="font-mono text-sm text-[color:var(--parchment)] leading-relaxed">
                {descriptions[currentLevel] || 'Improved stats'}
              </p>
            </div>

            {/* Cost ledger */}
            <div className="mb-5 p-3 border border-[color:var(--teal-dim)]/40 bg-[color:var(--abyss)]/60">
              <div className="flex justify-between items-center">
                <span className="font-hud text-xs text-[color:var(--teal-dim)] tracking-[0.3em]">
                  MATERIAL COST
                </span>
                <span className="font-display text-lg text-[color:var(--gold)] text-glow-gold">
                  × {cost} {material}
                </span>
              </div>
            </div>

            {error && (
              <p className="mb-3 font-hud text-xs text-[color:var(--blood)] tracking-wider text-center">
                ⚠ {error}
              </p>
            )}

            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="btn-tactical glitch-hover w-full"
            >
              {isUpgrading
                ? '◇ TRANSMITTING... ◇'
                : `◢ AUTHORIZE · LV ${nextLevel} ◣`}
            </button>
          </>
        )}

        {!canUpgrade && (
          <div className="text-center py-6">
            <div className="font-hud text-xs text-[color:var(--teal-dim)] tracking-[0.3em]">
              ◉ STATUS
            </div>
            <p className="mt-2 font-display text-xl text-[color:var(--teal-glow)] text-glow tracking-widest">
              MAX TIER ACHIEVED
            </p>
            <p className="mt-1 font-mono text-xs text-[color:var(--teal-dim)]">
              No further upgrades available for this facility.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
