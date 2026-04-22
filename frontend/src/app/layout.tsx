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
        <title>Nuansa Ship — Tactical Naval Command</title>
        <meta name="description" content="Tactical naval RPG on Initia blockchain. Captain. Ship. Crew. Command." />
        <link rel="icon" type="image/png" href="/assets/ui/nuansa_logo_app.png" />
        <link rel="apple-touch-icon" href="/assets/ui/nuansa_logo_app.png" />
        <meta property="og:title" content="Nuansa Ship — Tactical Naval Command" />
        <meta property="og:description" content="Tactical naval RPG on Initia blockchain. Captain. Ship. Crew. Command." />
        <meta property="og:image" content="/assets/ui/nuansa_logo_emblem.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/assets/ui/nuansa_logo_emblem.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;900&family=VT323&family=JetBrains+Mono:wght@300;400;500;700&family=IM+Fell+English:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}
