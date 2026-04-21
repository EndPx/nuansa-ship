'use client'

import { useEffect, useState, type PropsWithChildren } from 'react'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  initiaPrivyWalletConnector,
  injectStyles,
  InterwovenKitProvider,
  TESTNET,
} from '@initia/interwovenkit-react'
import InterwovenKitStyles from '@initia/interwovenkit-react/styles.js'

const wagmiConfig = createConfig({
  connectors: [initiaPrivyWalletConnector],
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
})

// Rollup chain id for Nuansa Ship
export const NUANSA_CHAIN_ID = 'nuansa-ship-1'

/**
 * Local-rollup chain metadata. Satisfies InterwovenKit's discovery logic
 * (rpc + rest + indexer + bech32_prefix + staking + fees + native_assets +
 * metadata.minitia.type all required — "Chain not found" otherwise).
 */
const NUANSA_CHAIN = {
  chain_id: NUANSA_CHAIN_ID,
  chain_name: 'Nuansa Ship',
  network_type: 'testnet' as const,
  bech32_prefix: 'init',
  apis: {
    rpc: [{ address: 'http://localhost:26657' }],
    rest: [{ address: 'http://localhost:1317' }],
    indexer: [{ address: 'http://localhost:8080' }],
    'json-rpc': [{ address: 'http://localhost:8545' }],
  },
  fees: {
    fee_tokens: [
      {
        denom: 'umin',
        fixed_min_gas_price: 0,
        low_gas_price: 0,
        average_gas_price: 0,
        high_gas_price: 0,
      },
    ],
  },
  staking: { staking_tokens: [{ denom: 'umin' }] },
  native_assets: [
    { denom: 'umin', name: 'Nuansa Ship Token', symbol: 'NST', decimals: 6 },
  ],
  metadata: {
    is_l1: false,
    minitia: { type: 'minimove' },
  },
} as const

export function WalletProvider({ children }: PropsWithChildren) {
  // Per-session QueryClient — don't share across SSR renders
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    // InterwovenKit UI uses a shadow DOM; inject its stylesheet once
    injectStyles(InterwovenKitStyles)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <InterwovenKitProvider
          {...TESTNET}
          // Local rollup registration (customChain is the only supported prop
          // in this SDK version; it injects our local nuansa-ship-1 chain)
          customChain={NUANSA_CHAIN as any}
          defaultChainId={NUANSA_CHAIN_ID}
          theme="dark"
          // Session-key allow-list: only MsgExecute on our chain
          enableAutoSign={{
            [NUANSA_CHAIN_ID]: ['/initia.move.v1.MsgExecute'],
          }}
        >
          {children}
        </InterwovenKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
