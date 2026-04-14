'use client'

import './globals.css'
import { WalletProvider } from '@/components/WalletProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Nuansa Ship</title>
        <meta name="description" content="Tactical naval RPG pixel art game on Initia blockchain" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-navy text-white min-h-screen">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}
