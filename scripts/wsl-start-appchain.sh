#!/bin/bash
# Start the nuansa-ship-1 rollup in detached mode.
set +e
export PATH=/home/albary/go/bin:/home/albary/.local/bin:/usr/local/bin:/usr/bin:/bin

echo "=== STARTING ROLLUP ==="
weave rollup start -d 2>&1 | tail -20
echo ""
echo "=== WAITING 8s FOR BOOT ==="
sleep 8
echo ""
echo "=== POLLING STATUS ==="
for i in 1 2 3 4 5; do
  s=$(curl -s --max-time 3 http://localhost:26657/status 2>/dev/null)
  if [ -n "$s" ]; then
    echo "up on attempt $i"
    echo "$s" | head -c 400
    echo ""
    break
  fi
  echo "attempt $i: not ready, waiting 3s..."
  sleep 3
done

echo ""
echo "=== FINAL BALANCE CHECK ==="
minitiad q bank balances init1ggjdesnxam3gd8qr6a6hkvjweanc4shdtpd73f --node http://localhost:26657 2>&1 | head -10
