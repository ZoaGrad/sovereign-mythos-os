// TECH: Listener service that scans blockchain for quest-related events and records them in Supabase.
// MYTHOS: The Herald that watches the chain and inscribes deeds into the ledger.

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

// Initialize Supabase client with service role key
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Initialize Ethereum provider
const RPC_URL = process.env.POLYGON_RPC_URL!;
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Configuration
const SCAN_INTERVAL_MS = Number(process.env.SCAN_INTERVAL_MS) || 5000;
const DEFAULT_START_BLOCK = Number(process.env.DEFAULT_START_BLOCK) || 52000000;

interface Task {
  id: string;
  chain_id: number;
  contract_address: string;
  event_sig: string;
  topic0: string | null;
  arg_filters: any | null;
  min_block: number | null;
}

// Fetch active on-chain tasks from Supabase
async function fetchActiveTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('quest_tasks')
    .select('id, chain_id, contract_address, event_sig, topic0, arg_filters, min_block')
    .eq('type', 'onchain_event');
  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
  return data as Task[];
}

// Load wallet map from Supabase
async function loadWalletMap(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('wallets')
    .select('user_id, address')
    .eq('verified', true);
  if (error) {
    console.error('Error fetching wallets:', error);
    throw error;
  }
  const map: Record<string, string> = {};
  data.forEach((w: any) => {
    map[w.address.toLowerCase()] = w.user_id;
  });
  return map;
}

// Encode event signature to topic0
function encodeTopic0(eventSig: string): string {
  return ethers.id(eventSig);
}

// Check if event arguments match the filters
function argMatches(args: any[], argFilters: any, walletAddress: string): boolean {
  const normalize = (addr: string) => addr.toLowerCase();

  if (argFilters?.from) {
    const expected = argFilters.from === '$USER' ? walletAddress : argFilters.from;
    if (normalize(args[0]) !== normalize(expected)) return false;
  }

  if (argFilters?.to) {
    const expected = argFilters.to === '$USER' ? walletAddress : argFilters.to;
    if (normalize(args[1]) !== normalize(expected)) return false;
  }

  if (argFilters?.minValueWei) {
    const value = args[2] ? BigInt(args[2].toString()) : 0n;
    if (value < BigInt(argFilters.minValueWei)) return false;
  }

  return true;
}

// Upsert user task event into Supabase
async function upsertUserTaskEvent(
  userId: string,
  taskId: string,
  walletAddress: string,
  txHash: string,
  occurredAt: string,
  proof: any
) {
  const { error } = await supabase.from('user_task_events').upsert(
    {
      user_id: userId,
      task_id: taskId,
      wallet_address: walletAddress,
      tx_hash: txHash,
      occurred_at: occurredAt,
      proof,
      status: 'verified',
    },
    { onConflict: 'task_id,user_id' }
  );
  if (error && !error.message.includes('duplicate')) {
    console.error('Error upserting event:', error);
    throw error;
  }
}

// Scan a specific task for events
async function scanTask(task: Task, walletMap: Record<string, string>) {
  if (task.chain_id !== 137) return; // Only Polygon mainnet for now

  const iface = new ethers.Interface([`event ${task.event_sig}`]);
  const topic0 = task.topic0 || encodeTopic0(task.event_sig);
  const fromBlock = task.min_block || DEFAULT_START_BLOCK;
  const toBlock = await provider.getBlockNumber();

  try {
    const logs = await provider.getLogs({
      address: task.contract_address,
      topics: [topic0],
      fromBlock,
      toBlock,
    });

    for (const log of logs) {
      try {
        const parsedLog = iface.parseLog({
          topics: log.topics,
          data: log.data,
        });
        const args = parsedLog.args as any[];

        // Check against all verified wallets
        for (const [address, userId] of Object.entries(walletMap)) {
          if (task.arg_filters && !argMatches(args, task.arg_filters, address)) {
            continue;
          }

          const block = await provider.getBlock(log.blockNumber);
          const occurredAt = new Date(block!.timestamp * 1000).toISOString();

          await upsertUserTaskEvent(
            userId,
            task.id,
            address,
            log.transactionHash,
            occurredAt,
            {
              name: parsedLog.name,
              args: parsedLog.args,
              blockNumber: log.blockNumber,
            }
          );
        }
      } catch (parseError) {
        // Skip unparsable logs
        continue;
      }
    }
  } catch (logError) {
    console.error(`Error scanning task ${task.id}:`, logError);
  }
}

// Main loop
async function main() {
  console.log('ScarQuest listener started');
  while (true) {
    try {
      const [tasks, walletMap] = await Promise.all([
        fetchActiveTasks(),
        loadWalletMap(),
      ]);
      for (const task of tasks) {
        await scanTask(task, walletMap);
      }
    } catch (error) {
      console.error('Error in main loop:', error);
    }
    await new Promise(resolve => setTimeout(resolve, SCAN_INTERVAL_MS));
  }
}

main().catch(console.error);
