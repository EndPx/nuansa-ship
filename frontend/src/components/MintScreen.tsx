'use client'

import { useState } from 'react'
// import { useInterwovenKit } from '@initia/interwovenkit-react'
import { buildMintStarterPackTx } from '@/lib/contracts'

export function MintScreen() {
  const [captainName, setCaptainName] = useState('')
  const [isMinting, setIsMinting] = useState(false)

  // TODO: Replace with real InterwovenKit hook
  // const { signAndBroadcast } = useInterwovenKit()

  const handleMint = async () => {
    if (!captainName.trim()) return

    setIsMinting(true)
    try {
      const tx = buildMintStarterPackTx(captainName)
      console.log('Minting starter pack:', tx)
      // TODO: await signAndBroadcast(tx)
      // window.location.href = '/port'
      alert('Mint TX built successfully. Wallet SDK not yet connected.')
    } catch (err) {
      console.error('Mint failed:', err)
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-teal">Welcome</span>, Captain
        </h1>
        <p className="text-stone">Name your captain and receive your starter fleet</p>
      </div>

      <div className="bg-navy-400 border border-teal/30 rounded-lg p-8 max-w-md w-full">
        <div className="flex flex-col gap-6">
          <div>
            <label htmlFor="captain-name" className="block text-sm font-medium text-stone mb-2">
              Captain Name
            </label>
            <input
              id="captain-name"
              type="text"
              className="w-full bg-navy border border-teal/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-teal transition-colors"
              placeholder="e.g. albary.init"
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              maxLength={32}
            />
          </div>

          <div className="bg-navy/50 rounded-lg p-4 border border-teal/10">
            <h3 className="text-sm font-semibold text-teal mb-3">Starter Pack Contents</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-teal">&#9876;</span>
                <span>1 Captain NFT &mdash; Your fleet commander</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-teal">&#9875;</span>
                <span>1 Corvette NFT &mdash; Starting warship</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-teal">&#9899;</span>
                <span>1 Gunner NFT &mdash; First crew member</span>
              </li>
            </ul>
          </div>

          <button
            className="bg-teal hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleMint}
            disabled={!captainName.trim() || isMinting}
          >
            {isMinting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Minting...
              </span>
            ) : (
              'Mint Starter Pack'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
