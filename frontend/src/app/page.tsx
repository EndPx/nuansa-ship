'use client'

import { useProfile } from '@/hooks/useProfile'
import { useRouter } from 'next/navigation'
import { MintScreen } from '@/components/MintScreen'
import { useEffect } from 'react'

export default function LandingPage() {
  // TODO: Replace with real InterwovenKit hook once wallet SDK is installed
  // const { address, openWallet } = useInterwovenKit()
  const address: string | null = null
  const openWallet = () => {
    console.log('Wallet connect not yet configured')
  }

  const { hasProfile, isLoading } = useProfile(address)
  const router = useRouter()

  useEffect(() => {
    if (address && hasProfile) {
      router.push('/port')
    }
  }, [address, hasProfile, router])

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-2">
            <span className="text-teal">Nuansa</span> Ship
          </h1>
          <p className="text-stone text-lg">Tactical Naval RPG on Initia</p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-64 h-64 bg-navy-400 rounded-lg border border-teal/30 flex items-center justify-center">
            <span className="text-6xl">&#9875;</span>
          </div>

          <button
            onClick={openWallet}
            className="bg-teal hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Connect Wallet
          </button>

          <p className="text-stone text-sm">
            Connect your Initia wallet to begin your voyage
          </p>
        </div>

        <div className="absolute bottom-4 text-stone text-xs">
          Part of the Nuansa Universe
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin" />
        <p className="text-stone">Loading profile...</p>
      </div>
    )
  }

  if (!hasProfile) {
    return <MintScreen />
  }

  return null
}
