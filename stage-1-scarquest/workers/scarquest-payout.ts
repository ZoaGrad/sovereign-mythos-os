// TECH: Worker service that processes pending quest claims and disburses SCAR rewards.
// MYTHOS: The Treasury Keeper that fulfills the promise of reward for completed quests.

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

// Initialize Supabase client with service role key
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Initialize Ethereum provider and signer
const RPC_URL = process.env.POLYGON_RPC_URL!;
const TREASURY_PK = process.env.TREASURY_PRIVATE_KEY!;
const SCAR_ADDRESS = process.env.SCAR_ERC20_ADDRESS!;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(TREASURY_PK, provider);

// SCAR ERC-20 contract ABI
const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];
const scarContract = new ethers.Contract(SCAR_ADDRESS, ERC20_ABI, signer);

// Fetch the next pending claim
async function getNextPendingClaim(): Promise<any | null> {
  const { data, error } = await supabase
    .from('quest_claims')
    .select('id, user_id, quest_id, reward_wei')
    .eq('status', 'pending')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching pending claim:', error);
    throw error;
  }
  return data;
}

// Get user's primary verified wallet
async function getUserPrimaryWallet(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('wallets')
    .select('address')
    .eq('user_id', userId)
    .eq('verified', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user wallet:', error);
    throw error;
  }
  return data?.address || null;
}

// Update claim status to paid with transaction hash
async function markClaimPaid(claimId: string, txHash: string) {
  const { error } = await supabase
    .from('quest_claims')
    .update({ status: 'paid', tx_hash: txHash })
    .eq('id', claimId);

  if (error) {
    console.error('Error marking claim as paid:', error);
    throw error;
  }
}

// Update claim status to rejected with reason
async function markClaimRejected(claimId: string, reason: string) {
  const { error } = await supabase
    .from('quest_claims')
    .update({ status: 'rejected', tx_hash: reason })
    .eq('id', claimId);

  if (error) {
    console.error('Error marking claim as rejected:', error);
    throw error;
  }
}

// Process a single claim
async function processClaim(claim: any) {
  console.log(`Processing claim ${claim.id} for user ${claim.user_id}`);

  // Get user's wallet address
  const walletAddress = await getUserPrimaryWallet(claim.user_id);
  if (!walletAddress) {
    await markClaimRejected(claim.id, 'No verified wallet found');
    return;
  }

  // Revalidate quest completion
  const { data: isCompleted, error: validationError } = await supabase.rpc(
    'fn_is_quest_completed',
    { p_user: claim.user_id, p_quest: claim.quest_id }
  );

  if (validationError || !isCompleted) {
    await markClaimRejected(claim.id, 'Quest not completed');
    return;
  }

  try {
    // Execute SCAR transfer
    const tx = await scarContract.transfer(walletAddress, claim.reward_wei);
    console.log(`Transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed: ${receipt.hash}`);

    // Update claim status
    await markClaimPaid(claim.id, receipt.hash);
  } catch (error: any) {
    console.error('Error processing transfer:', error);
    await markClaimRejected(claim.id, `Transfer failed: ${error.message}`);
  }
}

// Main worker loop
async function main() {
  console.log('ScarQuest payout worker started');
  while (true) {
    try {
      const claim = await getNextPendingClaim();
      if (!claim) {
        // No pending claims, wait before checking again
        await new Promise(resolve => setTimeout(resolve, 4000));
        continue;
      }

      await processClaim(claim);
    } catch (error) {
      console.error('Error in worker loop:', error);
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  }
}

main().catch(console.error);
