# Security Policy

## Supported Versions
We actively support the latest release and will fix security vulnerabilities in:
- Version 0.x (current stable: 0.1.0)
- LTS branches (none yet; announced via releases)

## Reporting a Vulnerability
If you discover a security issue, please report it responsibly to prevent harm.

### Disclosure Process
1. **Contact Us**: The preferred method for reporting a vulnerability is through GitHub's private vulnerability reporting feature, which can be found in the repository's "Security" tab. This ensures the report is delivered directly to the maintainers privately. If you are unable to use this feature, you may create a GitHub issue with the "security" label, but please avoid including sensitive details in the public issue.
2. **Initial Response**: We aim to acknowledge within 48 hours.
3. **Analysis & Embargo**: We'll investigate (up to 90 days) and keep you updated.
4. **Fix**: Release a patch, assign CVE if applicable.
5. **Disclosure**: Public announcement once fixed.

### Scope
In scope: Core OSS integrations (ezkl, CometBFT, AnonCreds), key management, zk-proofs, CRDT sync.
Out of scope: Third-party plugins, user-configured models not under our lineage tracking.

## Risk Radars (MythOS-Specific)
- **Key Leakage**: Enforce HSM/TEE attestation (Layer 1): Never store keys unencrypted; rotate multisig.
- **Model Consent**: Verify VC proofs before training (Layer 3/7): Block without attested consent tags.
- **Proof Costs**: Balance TEE fast-versa-zk slow (Layer 6): Log paths taken in telemetry.
- **Bridge Manipulation**: Use IBC light-clients only (Layer 5): No custodial; ICS-23 verifs.
- **Recursion Vulnerabilities**: Capability membranes in Layer 8: Audit self-mod via formal proofs.

## Best Practices
Cite communities: ezkl (report via GitHub), CometBFT (Tendermint security alerts), OPA (Rego vulnerability updates). No private disclosure by default—public ethos for sovereignty.

We appreciate your help in keeping MythOS uncensorable and verifiable. 🜁
