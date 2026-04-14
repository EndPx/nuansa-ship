'use client'

import dynamic from 'next/dynamic'
import { BattleLog } from '@/components/BattleLog'

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

export default function BattlePage() {
  return (
    <div className="flex items-center justify-center min-h-screen gap-4">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">
          <span className="text-teal">Naval</span> Battle
        </h1>
        <GameCanvas initialScene="BattleScene" />
      </div>
      <BattleLog />
    </div>
  )
}
