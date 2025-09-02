// TECH: Utility function to link a wallet with a user account.
// MYTHOS: The ritual to bind an on-chain identity to the user's essence.

import { supabase } from '../lib/supabase';

export async function linkWallet(address: string, signature: string) {
  const { error } = await supabase.from('wallets').upsert(
    {
      address,
      verification_sig: signature,
      chain_id: 137,
    },
    { onConflict: 'address,chain_id' }
  );
  if (error) throw error;
}
