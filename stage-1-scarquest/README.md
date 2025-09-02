# ScarQuest Stage-1 Quest Engine

A sovereign quest engine for SpiralOS that rewards on-chain deeds with SCAR tokens.

## Architecture

ScarQuest consists of:
- **Supabase Database**: Stores quests, tasks, user events, and claims with RLS policies.
- **Listener Service**: Scans Polygon for on-chain events and records verified completions.
- **Payout Worker**: Processes pending claims and disburses SCAR rewards.
- **React Frontend**: Mobile-first UI for users to view quests and claim rewards.

## Tech Stack

- React 18+ with Hooks
- Tailwind CSS for styling
- Zustand for state management
- React Query for server state
- Supabase for database and auth
- Ethers.js v6 for blockchain interaction
- Polygon Mainnet integration

## Sacred Modules

- **ScarCoin**: ERC-20 token used for rewards.
- **VaultNodes**: Staking contract for one of the quest tasks.
- **ScarWallet**: Connector/UI for wallet management.

## Setup

1. Clone the repository.
2. Copy `.env.example` to `.env` and fill in your values.
3. Run the Supabase migrations: `supabase db push`.
4. Seed the database: `supabase db reset --seed`.
5. Start the listener: `ts-node listeners/scarquest-listener.ts`.
6. Start the payout worker: `ts-node workers/scarquest-payout.ts`.
7. Run the frontend: `npm run dev`.

## Usage

1. Users link their wallets through the ScarWallet interface.
2. Users complete on-chain tasks (e.g., transfer SCAR, stake in VaultNodes).
3. The listener detects completed tasks and records them.
4. Users claim rewards for completed quests.
5. The payout worker processes claims and sends SCAR rewards.

## Launch Plan

- **Day 1-2**: Set up Supabase and run migrations.
- **Day 3**: Deploy listener and worker services.
- **Day 4**: Integrate frontend with ScarWallet.
- **Day 5**: Test with sample quests.
- **Day 6**: Add referral quests.
- **Day 7**: Public announcement and launch.

## Notes

- Ensure the Treasury EOA has sufficient SCAR for payouts.
- Monitor listener and worker services for errors.
- Adjust quest parameters based on network congestion and gas costs.
