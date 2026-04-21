import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Health probe for the nuansa-ship-1 rollup.
 *
 * GET  → returns `{ up, height, restartedJustNow? }`. If the chain is down,
 *        fires `weave rollup start -d` inside WSL and waits a few seconds.
 *
 * Intended as a dev-only convenience so users don't manually restart after
 * WSL idles out.
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
    return NextResponse.json({ error: 'Health probe only available on localhost' }, { status: 403 })
  }

  const probe = async () => {
    try {
      const r = await fetch('http://localhost:26657/status', {
        signal: AbortSignal.timeout(2500),
      })
      if (!r.ok) return null
      const j = await r.json()
      return j?.result?.sync_info?.latest_block_height ?? null
    } catch {
      return null
    }
  }

  let height = await probe()
  let restartedJustNow = false

  if (!height) {
    // Kick off weave rollup start -d inside WSL
    restartedJustNow = true
    try {
      const cmd = `wsl -e bash -c ${JSON.stringify(
        'export PATH=/home/albary/go/bin:/home/albary/.local/bin:/usr/local/bin:/usr/bin:/bin && weave rollup start -d',
      )}`
      await execAsync(cmd, {
        timeout: 20_000,
        env: { ...process.env, MSYS_NO_PATHCONV: '1' },
        windowsHide: true,
      })
    } catch (e: any) {
      return NextResponse.json(
        { up: false, restartedJustNow: true, error: String(e?.message ?? e).slice(0, 200) },
        { status: 503 },
      )
    }

    // Poll for up to 12s for the chain to come up
    for (let i = 0; i < 6; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      height = await probe()
      if (height) break
    }
  }

  return NextResponse.json({
    up: Boolean(height),
    height: height ?? null,
    chainId: 'nuansa-ship-1',
    restartedJustNow,
  })
}
