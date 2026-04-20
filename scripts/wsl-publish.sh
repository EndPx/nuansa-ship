#!/bin/bash
# Publish the compiled nuansa_ship Move modules to the nuansa-ship-1 rollup.
set -e
export PATH=/home/albary/go/bin:/home/albary/.local/bin:/usr/local/bin:/usr/bin:/bin

DST="$HOME/nuansa-ship-contracts"
KEY="gas-station"
CHAIN_ID="nuansa-ship-1"
NODE="http://localhost:26657"
FEES="500000umin"
GAS="30000000"

MODDIR="$DST/build/nuansa_ship/bytecode_modules"

cd "$DST"
echo "=== MODULES ==="
ls "$MODDIR"/*.mv

echo ""
echo "=== PUBLISHING ==="
# Pass all .mv files positionally (order matters: dependencies first — but here everything is in one package so order-within-package is fine)
minitiad tx move publish \
  "$MODDIR/captain.mv" \
  "$MODDIR/ship.mv" \
  "$MODDIR/crew.mv" \
  "$MODDIR/port.mv" \
  "$MODDIR/loot.mv" \
  "$MODDIR/battle.mv" \
  "$MODDIR/mint_starter.mv" \
  --upgrade-policy COMPATIBLE \
  --from "$KEY" --keyring-backend test \
  --chain-id "$CHAIN_ID" --node "$NODE" \
  --fees "$FEES" --gas "$GAS" \
  --broadcast-mode sync -y 2>&1 | tail -40

echo ""
echo "=== WAIT 6s FOR INCLUSION ==="
sleep 6

echo ""
echo "=== MODULE CHECK ==="
BECH=$(minitiad keys show "$KEY" -a --keyring-backend test)
echo "Deployer bech32: $BECH"
echo "Modules at this address should now be visible in the chain state."
minitiad q move modules "$BECH" --node "$NODE" -o json 2>&1 | head -c 1200
echo ""
echo "... (truncated)"
