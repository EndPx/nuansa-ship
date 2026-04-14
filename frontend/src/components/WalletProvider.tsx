'use client'

// TODO: Uncomment once @initia/interwovenkit-react is installed
// import { InterwovenKitProvider } from '@initia/interwovenkit-react'

export function WalletProvider({ children }: { children: React.ReactNode }) {
  // TODO: Replace with InterwovenKitProvider once SDK is installed
  // return (
  //   <InterwovenKitProvider
  //     chainId="nuansa-ship-1"
  //     restUrl="https://lcd.nuansa-ship-1.initia.xyz"
  //     rpcUrl="https://rpc.nuansa-ship-1.initia.xyz"
  //   >
  //     {children}
  //   </InterwovenKitProvider>
  // )

  return <>{children}</>
}
