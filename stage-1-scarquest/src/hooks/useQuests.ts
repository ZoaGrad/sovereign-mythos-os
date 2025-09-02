// TECH: React Query hooks for fetching quests and tasks.
// MYTHOS: Hooks into the stream of available quests from the ledger.

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useQuests() {
  return useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useQuestTasks(questId: string) {
  return useQuery({
    queryKey: ['quest_tasks', questId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quest_tasks')
        .select('*')
        .eq('quest_id', questId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!questId,
  });
}
