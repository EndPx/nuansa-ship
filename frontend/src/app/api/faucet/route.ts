import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Local-dev faucet. POST { address: "init1..." } → funds 1000 NST via gas-station.
 *
 * Only enabled on localhost. Calls `minitiad tx bank send` inside WSL using
 * the pre-configured `gas-station` test key. Do NOT deploy this to production.
 */
export async function POST(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
    return NextResponse.json({ error: 'Faucet only available on localhost' }, { status: 403 })
  }

  let body: { address?: string; amount?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const address = (body.address ?? '').trim()
  if (!/^init1[a-z0-9]{38,}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid init1 address' }, { status: 400 })
  }

  // Default: 1000 NST = 1000 x 10^6 umin
  const amount = body.amount ?? '1000000000umin'

  // Ensure rollup is up; auto-restart if it napped out (WSL idle-kill, etc.)
  const probe = async () => {
    try {
      const r = await fetch('http://localhost:26657/status', {
        signal: AbortSignal.timeout(2500),
      })
      return r.ok
    } catch {
      return false
    }
  }

  if (!(await probe())) {
    try {
      const bootCmd = `wsl -e bash -c ${JSON.stringify(
        'export PATH=/home/albary/go/bin:/home/albary/.local/bin:/usr/local/bin:/usr/bin:/bin && weave rollup start -d',
      )}`
      await execAsync(bootCmd, {
        timeout: 20_000,
        env: { ...process.env, MSYS_NO_PATHCONV: '1' },
        windowsHide: true,
      })
    } catch {
      // swallow — we'll surface the real error from the send tx below
    }
    // Wait up to 10s for the chain to come up
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      if (await probe()) break
    }
  }

  // Build the bash command that runs inside WSL
  const bashCmd = [
    'export PATH=/home/albary/go/bin:/home/albary/.local/bin:/usr/local/bin:/usr/bin:/bin',
    `minitiad tx bank send gas-station ${address} ${amount} ` +
      `--from gas-station --keyring-backend test ` +
      `--chain-id nuansa-ship-1 --node http://localhost:26657 ` +
      `--fees 300000umin --gas 500000 --broadcast-mode sync -y -o json`,
  ].join(' && ')

  // Spawn via cmd.exe → wsl -e bash -c "<bashCmd>"
  const fullCmd = `wsl -e bash -c ${JSON.stringify(bashCmd)}`

  try {
    const { stdout, stderr } = await execAsync(fullCmd, {
      timeout: 30_000,
      env: { ...process.env, MSYS_NO_PATHCONV: '1' },
      windowsHide: true,
      maxBuffer: 2 * 1024 * 1024,
    })

    // Parse minitiad JSON output to extract txhash (last JSON line of stdout)
    const last = stdout.trim().split('\n').pop() ?? ''
    let txhash: string | null = null
    try {
      const j = JSON.parse(last)
      txhash = j.txhash ?? null
    } catch {
      // return raw stdout if not parseable
    }

    return NextResponse.json({
      ok: true,
      txhash,
      address,
      amount,
      raw: txhash ? undefined : last.slice(0, 400),
      stderr: stderr ? stderr.slice(0, 400) : undefined,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Faucet call failed', detail: String(err?.message ?? err).slice(0, 600) },
      { status: 500 }
    )
  }
}
