#!/bin/bash
# Quick appchain + tool status check — run inside WSL.
set +e
export PATH=/home/albary/go/bin:/home/albary/.local/bin:/usr/local/bin:/usr/bin:/bin

echo "=== VERSION ==="
minitiad version --long 2>&1 | head -6

echo ""
echo "=== CHAIN STATUS ==="
curl -s http://localhost:26657/status 2>&1 | head -c 400
echo ""

echo ""
echo "=== GAS STATION BALANCE ==="
minitiad q bank balances init1ggjdesnxam3gd8qr6a6hkvjweanc4shdtpd73f --node http://localhost:26657 2>&1 | head -10

echo ""
echo "=== KEYS ==="
minitiad keys list --keyring-backend test 2>&1 | head -20
