#!/usr/bin/env python3
# ezkl ZK-ML Inference Proof Demo
# Prove model inference without revealing weights.
# To run this demo:
# 1. Install dependencies: pip install -r requirements.txt
# 2. Run: python zkml/ezkl/inference_proof_demo.py

import ezkl
import numpy as np
import os
import json

# --- Configuration ---
# In a real scenario, these paths would point to your actual model and data.
model_path = 'model.onnx'
compiled_model_path = 'model.compiled'
pk_path = 'model.pk'
vk_path = 'model.vk'
proof_path = 'model.proof'
settings_path = 'settings.json'
srs_path = 'kzg.srs'
witness_path = 'witness.json'
input_path = 'input.json'

def generate_mock_model_and_data():
    """Generates a mock ONNX model and input data for demonstration."""
    import torch
    import torch.nn as nn

    # Define a simple linear model
    class SimpleModel(nn.Module):
        def __init__(self):
            super(SimpleModel, self).__init__()
            self.linear = nn.Linear(5, 1)
        def forward(self, x):
            return self.linear(x)

    model = SimpleModel()
    dummy_input = torch.randn(1, 5)

    # Export the model to ONNX
    torch.onnx.export(model, dummy_input, model_path,
                      export_params=True, opset_version=11,
                      input_names=['input'], output_names=['output'])
    print(f"Generated mock ONNX model at '{model_path}'")

    # Create mock input data
    input_data = dummy_input.numpy().reshape([-1]).tolist()
    with open(input_path, 'w') as f:
        json.dump({'input_data': [input_data]}, f)
    print(f"Generated mock input data at '{input_path}'")


def run_ezkl_demo():
    """
    Runs a simplified, mock ezkl workflow.
    This demonstrates the steps without requiring a pre-trained model.
    """
    print("--- Starting ezkl ZK-ML Demo ---")

    # 1. Generate a mock model and data if they don't exist
    if not os.path.exists(model_path):
        print("No mock model found. Generating one...")
        generate_mock_model_and_data()
    else:
        print("Using existing mock model and data.")

    # In a real workflow, you would have your own ONNX model and input.json file.
    # The following steps show how you would use ezkl with them.

    # 2. Generate cryptographic settings and SRS
    print("\n--- Step 1: Generating settings and SRS ---")
    try:
        # ezkl.gen_settings generates a configuration file for the prover and verifier.
        ezkl.gen_settings(model_path, settings_path)
        # ezkl.get_srs downloads or finds the Structured Reference String (SRS) for KZG proofs.
        ezkl.get_srs(settings_path)
        print("Settings and SRS generated successfully.")
    except Exception as e:
        print(f"Error in Step 1: {e}")
        print("This might happen if ezkl is not installed correctly or if there's a network issue.")
        return

    # 3. Compile the model
    print("\n--- Step 2: Compiling the model ---")
    try:
        ezkl.compile_model(model_path, settings_path, compiled_model_path)
        print("Model compiled successfully.")
    except Exception as e:
        print(f"Error in Step 2: {e}")
        return

    # 4. Generate Witness
    print("\n--- Step 3: Generating witness ---")
    try:
        ezkl.gen_witness(input_path, compiled_model_path, witness_path)
        print("Witness generated successfully.")
    except Exception as e:
        print(f"Error in Step 3: {e}")
        return

    # 5. Setup (generate proving and verification keys)
    print("\n--- Step 4: Setup (generating keys) ---")
    try:
        ezkl.setup(compiled_model_path, vk_path, pk_path)
        print("Proving and verification keys generated successfully.")
    except Exception as e:
        print(f"Error in Step 4: {e}")
        return

    # 6. Prove
    print("\n--- Step 5: Generating proof ---")
    try:
        ezkl.prove(witness_path, compiled_model_path, pk_path, proof_path, 'single')
        print(f"Proof generated and saved to '{proof_path}'")
    except Exception as e:
        print(f"Error in Step 5: {e}")
        return

    # 7. Verify
    print("\n--- Step 6: Verifying proof ---")
    try:
        is_verified = ezkl.verify(proof_path, settings_path, vk_path)
        assert is_verified
        print("Proof verified successfully! The computation was proven to be correct.")
    except Exception as e:
        print(f"Error in Step 6 or verification failed: {e}")
        return

    print("\n--- ezkl ZK-ML Demo Complete ---")


if __name__ == "__main__":
    # The user-provided stub was simplified. This expanded version provides a
    # more complete, runnable demonstration of the ezkl workflow.
    # It generates a dummy model so the script can run end-to-end.
    print("NOTE: This script requires PyTorch and ezkl. Please install them via pip.")
    print("You can install dependencies using: pip install -r requirements.txt\n")
    try:
        import torch
    except ImportError:
        print("PyTorch is not installed. Please run 'pip install torch'.")
        # Add torch to requirements.txt
        with open('requirements.txt', 'a') as f:
            f.write('\ntorch')
    else:
        run_ezkl_demo()
