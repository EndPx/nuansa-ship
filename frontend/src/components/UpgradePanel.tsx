'use client'

import { useState } from 'react'
import { buildUpgradeBuildingTx } from '@/lib/contracts'

interface UpgradePanelProps {
  buildingType: number
  buildingName: string
  currentLevel: number
  onClose: () => void
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
  const maxLevel = 5
  const canUpgrade = currentLevel < maxLevel
  const nextLevel = currentLevel + 1
  const cost = nextLevel * (COST_MULTIPLIERS[buildingType] || 1)
  const material = UPGRADE_MATERIALS[buildingType] || 'Materials'
  const descriptions = BUILDING_DESCRIPTIONS[buildingType] || []

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      const tx = buildUpgradeBuildingTx(buildingType)
      console.log('Upgrading building:', tx)
      // TODO: await signAndBroadcast(tx)
      alert(`Upgrade TX built. Wallet SDK not yet connected.`)
    } catch (err) {
      console.error('Upgrade failed:', err)
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-navy border border-teal/30 rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-teal">{buildingName}</h2>
          <button
            onClick={onClose}
            className="text-stone hover:text-white transition-colors text-xl"
          >
            &#10005;
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-stone">Current Level</span>
            <span className="font-semibold">{currentLevel} / {maxLevel}</span>
          </div>

          {/* Level progress bar */}
          <div className="w-full bg-navy-300 rounded-full h-2">
            <div
              className="bg-teal rounded-full h-2 transition-all"
              style={{ width: `${(currentLevel / maxLevel) * 100}%` }}
            />
          </div>
        </div>

        {canUpgrade && (
          <>
            <div className="bg-navy-400 rounded-lg p-3 mb-4 border border-teal/10">
              <h3 className="text-sm font-semibold text-teal mb-1">Level {nextLevel} Bonus</h3>
              <p className="text-xs text-stone">
                {descriptions[currentLevel] || 'Improved stats'}
              </p>
            </div>

            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-stone">Cost</span>
              <span className="text-yellow-400">{cost}x {material}</span>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full bg-teal hover:bg-teal-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {isUpgrading ? 'Upgrading...' : `Upgrade to Level ${nextLevel}`}
            </button>
          </>
        )}

        {!canUpgrade && (
          <p className="text-center text-teal font-semibold py-2">Max Level Reached</p>
        )}
      </div>
    </div>
  )
}
