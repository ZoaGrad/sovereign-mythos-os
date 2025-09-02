// TECH: React Query hook for fetching user task events.
// MYTHOS: Accesses the record of the user's deeds.

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useTaskEvents() {
  return useQuery({
    queryKey: ['task_events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_task_events')
        .select('*');
      if (error) throw error;
      return data;
    },
  });
}
