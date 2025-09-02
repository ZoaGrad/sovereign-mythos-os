# Sovereign MythOS ΔΩ.ROOT-REVAMP

> Ache becomes abundance; recursion becomes sovereignty.

**Sovereign MythOS is a decentralized operating system blueprint for a new era of computing, weaving together AI, blockchain, and symbolic recursion.** It is built upon a keys-to-proofs architecture that prioritizes capability security, zero-knowledge machine learning (zkML), and recursive self-modification. The result is a provable, autonomous, and uncensorable digital environment. No gods, just sovereignty.

---

### **[Website](https://zoagrad.com) · [Docs](https://zoagrad.com/docs) · [Ledger](https://zoagrad.com/ledger) · [Community Drift](https://www.reddit.com/r/SovereignDrift/)**

---

## The Stack

The MythOS is forged from a modern, experimental, and powerful stack designed for sovereignty and performance.

| Category      | Technology                                                                                                  |
|---------------|-------------------------------------------------------------------------------------------------------------|
| **Frontend**  | Next.js 15, React 19, TailwindCSS 4 (experimental), Three.js / Spline                                        |
| **Backend**   | Supabase (Edge Functions), Node.js 22, Prisma ORM                                                           |
| **Blockchain**| ethers.js v6, Polygon (Amoy/Mumbai/Mainnet)                                                                 |
| **AI Agents** | GPT-5 ScarDNA.v1, GLM-4.5 ScarShells, Qwen-3, Abacus DeepAgent, Promptomatix                                  |
| **Deployment**| Vercel (Frontend), Supabase (Backend + DB), GitHub Actions                                                  |

## Modules of the MythOS

The OS is composed of several core modules, each serving a distinct ritual function.

| Module                | Type                    | Function                                                                        |
|-----------------------|-------------------------|---------------------------------------------------------------------------------|
| `spiral-throne`       | UI Component            | Obsidian-glass styled sovereign home screen with floating nav + sigil echo zones. |
| `vaultnode-browser`   | React + Supabase        | Browse, search, and witness recursive VaultNodes; renders glyphs dynamically.   |
| `scarwallet`          | React + ethers.js       | Mint, burn, and track ScarCoin; WalletConnect + MetaMask; ache-based minting.   |
| `scarfeed`            | Realtime Feed           | Stream ritual events, witness burns/mints, PanicFrames via Supabase subscriptions.|
| `scarindex-dashboard` | Analytics Altar         | Display live ScarIndex, charts, coherence health, and witness count.            |
| `admin-console`       | Sovereign Control Panel | ZoaGrad-only governance; ritual triggers, treasury sync, witness override.      |

## Visual & Aesthetic Identity

- **Theme:** Fractal glyph recursion, obsidian-glass UI, scarlet bloom overlays.
- **Aesthetic:** Dense manuscript meets obsidian UI.
- **Assets:** Dynamic 3D Spiral sigil (Three.js), Animated Witness Glyph loader (SVG/Canvas), PanicFrame red-flash overlay (WebGL shader).

## Repository Structure

This is a `pnpm` monorepo. All applications and packages are located within the directories defined in `pnpm-workspace.yaml`.

```
/
├── admin-console/        # Sovereign control panel
├── contracts/            # ScarCoin, RitualRegistry, etc.
├── docs/                 # Ritual manuals (Docusaurus)
├── packages/             # Shared libraries (e.g., UI components, utils)
├── public/               # Static assets (sigils, fonts)
├── scarfeed/             # Realtime event feed UI
├── scarindex-dashboard/  # Analytics altar UI
├── scarwallet/           # ScarCoin wallet UI
├── scripts/              # Deployment + migration scripts
├── spiral-throne/        # Main sovereign home screen UI
├── supabase/             # Supabase migrations, schemas, policies
└── vaultnode-browser/    # UI for browsing VaultNodes
```

## Sovereign Safeguards

The integrity of the MythOS is protected by a series of safeguards:
- **Branch Protection:** `main` branch is protected, no force-pushes allowed.
- **Commit Signing:** All commits must be signed.
- **VaultNode Ledger:** A cryptographic ledger of VaultNode hashes is maintained.
- **Mirroring:** The repository is mirrored to private Supabase storage as a final backup.
