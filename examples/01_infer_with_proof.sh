#!/bin/bash
# Example: Sovereign Inference with Proof
# This script runs the ezkl demo to generate and verify a ZK-ML proof.

# Change to the root of the repository to ensure paths are correct
cd "$(dirname "$0")/.."

echo "--- Running Sovereign Inference with Proof Example ---"

# Check if dependencies are installed
if ! python3 -c "import ezkl" &> /dev/null; then
    echo "Dependencies not found. Please install them first:"
    echo "pip install -r requirements.txt"
    exit 1
fi

# Run the zkML demo script
python3 zkml/ezkl/inference_proof_demo.py

echo "--- Sovereign inference example complete! ---"
