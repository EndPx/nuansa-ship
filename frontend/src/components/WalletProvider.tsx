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

// Rollup chain id for Nuansa Ship on Initia testnet
export const NUANSA_CHAIN_ID = 'nuansa-ship-1'

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
