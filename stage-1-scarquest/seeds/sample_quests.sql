-- TECH: Seed data for initial quests to bootstrap the system.
-- MYTHOS: The first trials offered to users of the ScarQuest.

-- Insert a sample quest
INSERT INTO public.quests (title, description, starts_at, reward_wei, max_claims)
VALUES (
  'Foundational Acts',
  'Prove your presence by moving SCAR and staking in a VaultNode.',
  NOW(),
  5000000000000000000, -- 5 SCAR
  1000
);

-- Get the quest ID
WITH quest_id AS (SELECT id FROM public.quests WHERE title = 'Foundational Acts')
-- Insert SCAR transfer task
INSERT INTO public.quest_tasks (quest_id, type, contract_address, event_sig, arg_filters, min_block)
SELECT
  id,
  'onchain_event',
  '0xSCAR_ADDRESS', -- Replace with actual SCAR address
  'Transfer(address,address,uint256)',
  '{"from": "$USER", "minValueWei": "1000000000000000000"}', -- 1 SCAR
  52000000
FROM quest_id;

-- Insert VaultNode stake task
WITH quest_id AS (SELECT id FROM public.quests WHERE title = 'Foundational Acts')
INSERT INTO public.quest_tasks (quest_id, type, contract_address, event_sig, arg_filters, min_block)
SELECT
  id,
  'onchain_event',
  '0xVAULT_NODE_ADDRESS', -- Replace with actual VaultNode address
  'Staked(address,uint256)',
  '{"from": "$USER", "minValueWei": "1000000000000000000"}', -- 1 SCAR worth of stake
  52000000
FROM quest_id;
