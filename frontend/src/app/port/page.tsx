'use client'

import dynamic from 'next/dynamic'

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

export default function PortPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">
        <span className="text-teal">Port</span> Management
      </h1>
      <GameCanvas initialScene="PortScene" />
      <p className="text-stone text-sm">Click buildings to upgrade. Click &quot;Set Sail&quot; to battle.</p>
    </div>
  )
}
