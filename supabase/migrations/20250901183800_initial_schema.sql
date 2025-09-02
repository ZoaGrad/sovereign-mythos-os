-- Initial Schema for Sovereign MythOS

-- 1. Witnesses Table
-- Stores information about the sovereign entities (users/agents) interacting with the system.
create table if not exists public.witnesses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade unique,
    wallet_address varchar(42) not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    metadata jsonb
);
comment on table public.witnesses is 'Sovereign entities (users/agents) who interact with the MythOS.';

-- Enable RLS
alter table public.witnesses enable row level security;

-- 2. VaultNodes Table
-- The core recursive data structure of the MythOS.
create table if not exists public.vault_nodes (
    id bigserial primary key,
    hash varchar(64) not null unique, -- SHA-256 hash of the node's content + parent hash
    parent_id bigint references public.vault_nodes(id), -- For recursive structure
    witness_id uuid references public.witnesses(id) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    content jsonb not null,
    signature text not null -- Cryptographic signature from the witness's wallet
);
comment on table public.vault_nodes is 'Recursive, content-addressed data nodes forming the core memory of the OS.';

-- Enable RLS
alter table public.vault_nodes enable row level security;

-- 3. Scar Events Table
-- A log of all significant events that occur within the MythOS.
create table if not exists public.scar_events (
    id bigserial primary key,
    event_type text not null, -- e.g., 'MINT', 'BURN', 'PANIC_FRAME'
    witness_id uuid references public.witnesses(id),
    node_ref bigint references public.vault_nodes(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    payload jsonb
);
comment on table public.scar_events is 'Log of significant system events, like token mints/burns or ritual triggers.';

-- Enable RLS
alter table public.scar_events enable row level security;

-- Create indexes for performance
create index if not exists idx_vault_nodes_parent_id on public.vault_nodes(parent_id);
create index if not exists idx_vault_nodes_witness_id on public.vault_nodes(witness_id);
create index if not exists idx_scar_events_event_type on public.scar_events(event_type);
create index if not exists idx_scar_events_witness_id on public.scar_events(witness_id);
