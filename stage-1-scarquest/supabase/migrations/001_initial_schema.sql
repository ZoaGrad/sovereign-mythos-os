-- TECH: Initial schema for ScarQuest with tables, functions, and RLS policies.
-- MYTHOS: The foundation of the Quest Board—where deeds are recorded and rewarded.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Wallets table to link user identities with on-chain addresses
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    address TEXT NOT NULL CHECK (length(address) >= 42),
    chain_id INTEGER NOT NULL DEFAULT 137, -- Polygon mainnet
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_sig TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (address, chain_id)
);

-- Quests table to define available quests
CREATE TABLE public.quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    reward_wei BIGINT NOT NULL CHECK (reward_wei > 0),
    max_claims INTEGER, -- Optional claim cap
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active quests
CREATE INDEX quests_active_idx ON public.quests (is_active, starts_at);

-- Task types enumeration
CREATE TYPE task_type AS ENUM ('onchain_event', 'offchain');

-- Quest tasks table to define individual tasks within a quest
CREATE TABLE public.quest_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
    type task_type NOT NULL DEFAULT 'onchain_event',
    chain_id INTEGER NOT NULL DEFAULT 137,
    contract_address TEXT NOT NULL,
    event_sig TEXT, -- e.g., "Transfer(address,address,uint256)"
    topic0 TEXT, -- Keccak-256 hash of event signature (cached)
    arg_filters JSONB, -- e.g., {"from": "$USER", "minValueWei": "1000000000000000000"}
    min_block BIGINT, -- Lowest block to watch
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for quest tasks
CREATE INDEX quest_tasks_quest_id_idx ON public.quest_tasks (quest_id);
CREATE INDEX quest_tasks_contract_address_idx ON public.quest_tasks (contract_address);

-- User task events table to store verified on-chain events
CREATE TABLE public.user_task_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    task_id UUID NOT NULL REFERENCES public.quest_tasks(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    tx_hash TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    proof JSONB, -- Raw event log data
    status TEXT NOT NULL DEFAULT 'verified', -- 'verified' or 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (task_id, user_id) -- Prevent duplicate verifications per task
);

-- Index for user task events
CREATE INDEX user_task_events_user_id_idx ON public.user_task_events (user_id, task_id);

-- Quest claims table to manage reward claims
CREATE TABLE public.quest_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
    reward_wei BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'rejected'
    tx_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, quest_id) -- One claim per user per quest
);

-- Function to check if a task is verified for a user
CREATE OR REPLACE FUNCTION public.fn_is_task_verified(p_user UUID, p_task UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_task_events
        WHERE user_id = p_user AND task_id = p_task AND status = 'verified'
    );
$$;

-- Function to check if a quest is completed by a user
CREATE OR REPLACE FUNCTION public.fn_is_quest_completed(p_user UUID, p_quest UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
    WITH needed AS (
        SELECT id FROM public.quest_tasks WHERE quest_id = p_quest
    )
    SELECT NOT EXISTS (
        SELECT 1 FROM needed n
        WHERE NOT public.fn_is_task_verified(p_user, n.id)
    );
$$;

-- Function to queue a claim for a quest (security definer)
CREATE OR REPLACE FUNCTION public.fn_queue_claim(p_quest UUID)
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
    v_uid UUID;
    v_reward BIGINT;
    v_claim_id UUID;
    v_active BOOLEAN;
    v_now TIMESTAMPTZ := NOW();
    v_max INTEGER;
    v_current INTEGER;
BEGIN
    -- Get the current user ID
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Fetch quest details
    SELECT reward_wei, is_active, starts_at, ends_at, max_claims
    INTO v_reward, v_active, v_now, v_now, v_max
    FROM public.quests
    WHERE id = p_quest;

    IF NOT v_active THEN
        RAISE EXCEPTION 'Quest not active';
    END IF;

    -- Check if quest is completed
    IF NOT public.fn_is_quest_completed(v_uid, p_quest) THEN
        RAISE EXCEPTION 'Quest not completed';
    END IF;

    -- Check claim cap if set
    IF v_max IS NOT NULL THEN
        SELECT COUNT(*) INTO v_current
        FROM public.quest_claims
        WHERE quest_id = p_quest AND status IN ('pending', 'paid');
        IF v_current >= v_max THEN
            RAISE EXCEPTION 'Quest claim cap reached';
        END IF;
    END IF;

    -- Insert or update claim
    INSERT INTO public.quest_claims (user_id, quest_id, reward_wei, status)
    VALUES (v_uid, p_quest, v_reward, 'pending')
    ON CONFLICT (user_id, quest_id) DO UPDATE
    SET status = EXCLUDED.status
    RETURNING id INTO v_claim_id;

    RETURN v_claim_id;
END;
$$;

-- Enable RLS on all tables
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_claims ENABLE ROW LEVEL SECURITY;

-- RLS policies for wallets
CREATE POLICY "wallets_owner_read" ON public.wallets
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wallets_owner_insert" ON public.wallets
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wallets_owner_update" ON public.wallets
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS policies for quests and tasks - public read
CREATE POLICY "quests_public_read" ON public.quests FOR SELECT USING (TRUE);
CREATE POLICY "tasks_public_read" ON public.quest_tasks FOR SELECT USING (TRUE);

-- RLS policies for user_task_events - user can only see their own events
CREATE POLICY "events_owner_read" ON public.user_task_events
FOR SELECT USING (auth.uid() = user_id);

-- RLS policies for quest_claims - user can only see their own claims
CREATE POLICY "claims_owner_read" ON public.quest_claims
FOR SELECT USING (auth.uid() = user_id);

-- Revoke direct write access from users for critical tables
REVOKE ALL ON public.user_task_events FROM anon, authenticated;
REVOKE ALL ON public.quest_claims FROM anon, authenticated;

-- Grant select access to authenticated users
GRANT SELECT ON public.user_task_events TO authenticated;
GRANT SELECT ON public.quest_claims TO authenticated;
