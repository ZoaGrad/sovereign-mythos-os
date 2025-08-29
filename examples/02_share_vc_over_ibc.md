# Sharing Verifiable Credentials over IBC

In MythOS, DIDs and VCs (via Veramo/AnonCreds) can be shared across sovereign zones using IBC for interoperability.

## Steps:
1. Issue VC: Use DID method for personhood attestation.
2. Export via IBC Light-Client: Proof path via ICS-23.
3. Verify on remote chain: IBC verifies zk without trust.

## Code Stub (pseudocode):
// Run CometBFT + IBC
ibc_channel = createChannel('vc-export');
vc_hash = zkHash('vc:consent...');
ibc.sendPacket(vc_hash);

Proclaim sovereignty!
