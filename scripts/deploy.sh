#!/bin/bash
# Deploy script for Nuansa Ship contracts
# Usage: ./scripts/deploy.sh

set -e

echo "Building Move contracts..."
minitiad move build --named-addresses nuansa_ship=gas-station

echo "Publishing Move contracts..."
minitiad tx move publish contracts/build/nuansa_ship/bytecode_modules/*.mv \
  --from gas-station \
  --keyring-backend test \
  --node http://localhost:26657 \
  --chain-id nuansa-ship-1 \
  --gas auto \
  --gas-adjustment 1.5 \
  -y

echo "Deploy complete!"
