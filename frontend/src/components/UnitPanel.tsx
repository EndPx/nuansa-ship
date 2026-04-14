'use client'

import type { CaptainStats, ShipStats, CrewStats } from '@/lib/types'

interface UnitPanelProps {
  captain?: CaptainStats
  ship?: ShipStats
  crew?: CrewStats[]
}

export function UnitPanel({ captain, ship, crew }: UnitPanelProps) {
  // Placeholder data when no real data is provided
  const displayCaptain = captain || {
    leadership: 50,
    tactics: 50,
    specialSkillId: 0,
    xp: 0,
    level: 1,
  }

  const displayShip = ship || {
    shipClass: 0,
    hull: 500,
    maxHull: 500,
    engine: 4,
    weaponDamage: 60,
    weaponRange: 2,
    armor: 5,
    captainTokenId: '',
    crewTokenIds: [],
  }

  const shipClassNames = ['Corvette', 'Frigate', 'Destroyer', 'Battleship']
  const roleNames = ['Gunner', 'Navigator', 'Engineer']

  return (
    <div className="bg-navy-400 border border-teal/30 rounded-lg p-4 w-72">
      <h2 className="text-lg font-bold text-teal mb-3">Fleet Unit</h2>

      {/* Captain */}
      <div className="mb-3 pb-3 border-b border-teal/10">
        <h3 className="text-sm font-semibold mb-1">Captain (Lv.{displayCaptain.level})</h3>
        <div className="text-xs text-stone space-y-1">
          <div className="flex justify-between">
            <span>Leadership</span>
            <span className="text-white">{displayCaptain.leadership}</span>
          </div>
          <div className="flex justify-between">
            <span>Tactics</span>
            <span className="text-white">{displayCaptain.tactics}</span>
          </div>
          <div className="flex justify-between">
            <span>XP</span>
            <span className="text-white">{displayCaptain.xp}</span>
          </div>
        </div>
      </div>

      {/* Ship */}
      <div className="mb-3 pb-3 border-b border-teal/10">
        <h3 className="text-sm font-semibold mb-1">
          {shipClassNames[displayShip.shipClass] || 'Unknown'}
        </h3>
        <div className="text-xs text-stone space-y-1">
          <div className="flex justify-between">
            <span>Hull</span>
            <span className="text-white">{displayShip.hull}/{displayShip.maxHull}</span>
          </div>
          <div className="flex justify-between">
            <span>Engine</span>
            <span className="text-white">{displayShip.engine}</span>
          </div>
          <div className="flex justify-between">
            <span>Damage</span>
            <span className="text-white">{displayShip.weaponDamage}</span>
          </div>
          <div className="flex justify-between">
            <span>Range</span>
            <span className="text-white">{displayShip.weaponRange}</span>
          </div>
          <div className="flex justify-between">
            <span>Armor</span>
            <span className="text-white">{displayShip.armor}</span>
          </div>
        </div>
      </div>

      {/* Crew */}
      <div>
        <h3 className="text-sm font-semibold mb-1">Crew</h3>
        {(crew && crew.length > 0) ? (
          <div className="space-y-1">
            {crew.map((c, i) => (
              <div key={i} className="text-xs flex justify-between text-stone">
                <span>{roleNames[c.role] || 'Unknown'}</span>
                <span className={
                  c.status === 0 ? 'text-green-400' :
                  c.status === 1 ? 'text-yellow-400' :
                  'text-red-400'
                }>
                  {c.status === 0 ? 'Ready' : c.status === 1 ? 'Injured' : 'KO'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone">1x Gunner (Ready)</p>
        )}
      </div>
    </div>
  )
}
