#!/bin/bash
set -e
echo "=== PatentWorld Data Pipeline ==="
cd "$(dirname "$0")"
for i in 01 02 03 04 05 06 07 14; do
    script=$(ls ${i}_*.py)
    echo "--- Running $script ---"
    time python "$script"
    echo ""
done
echo "=== Pipeline Complete ==="
