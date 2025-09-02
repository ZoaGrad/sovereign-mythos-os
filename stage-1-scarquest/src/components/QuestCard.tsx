// TECH: Mobile-first quest card component with Tailwind CSS.
// MYTHOS: A visual contract showing the quest and its rewards.

import React from 'react';
import { useQuestTasks } from '../hooks/useQuests';
import { useTaskEvents } from '../hooks/useTaskEvents';
import { useQueueClaim } from '../hooks/useClaim';

interface Quest {
  id: string;
  title: string;
  description: string;
  reward_wei: number;
}

interface QuestCardProps {
  quest: Quest;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest }) => {
  const { data: tasks } = useQuestTasks(quest.id);
  const { data: events } = useTaskEvents();
  const queueClaim = useQueueClaim();

  const isCompleted = tasks?.every(task =>
    events?.some(event => event.task_id === task.id && event.status === 'verified')
  );

  const rewardScar = Number(quest.reward_wei) / 1e18;

  const handleClaim = async () => {
    try {
      await queueClaim.mutateAsync(quest.id);
      alert('Claim queued successfully!');
    } catch (error) {
      alert('Claim failed: ' + (error as Error).message);
    }
  };

  return (
    <div className="bg-white/10 rounded-lg p-4 shadow-lg backdrop-blur-sm border border-white/20">
      <h3 className="text-lg font-semibold text-white">{quest.title}</h3>
      <p className="text-white/70 text-sm mt-1">{quest.description}</p>

      <div className="mt-3">
        <h4 className="text-white/80 text-sm font-medium">Tasks:</h4>
        <ul className="mt-2 space-y-2">
          {tasks?.map(task => (
            <li key={task.id} className="flex items-center justify-between">
              <span className="text-white/60 text-xs">
                {task.event_sig} at {task.contract_address.slice(0, 6)}...{task.contract_address.slice(-4)}
              </span>
              {events?.some(e => e.task_id === task.id) ? (
                <span className="text-green-400 text-xs">✓</span>
              ) : (
                <span className="text-white/40 text-xs">○</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-emerald-300 font-medium">{rewardScar} SCAR</span>
        <button
          onClick={handleClaim}
          disabled={!isCompleted || queueClaim.isPending}
          className={`px-3 py-1 rounded text-sm font-medium ${
            isCompleted
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          {queueClaim.isPending ? 'Claiming...' : 'Claim Reward'}
        </button>
      </div>
    </div>
  );
};
