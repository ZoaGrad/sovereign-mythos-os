// TECH: React Query hooks for claiming quest rewards.
// MYTHOS: The ritual to summon reward from completed quests.

import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useQueueClaim() {
  return useMutation({
    mutationFn: async (questId: string) => {
      const { data, error } = await supabase.rpc('fn_queue_claim', {
        p_quest: questId,
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useClaims() {
  return useQuery({
    queryKey: ['claims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quest_claims')
        .select('*');
      if (error) throw error;
      return data;
    },
  });
}
