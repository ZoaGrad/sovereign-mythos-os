// TECH: Quest board component that displays all active quests.
// MYTHOS: The hall of available trials where users choose their path.

import React from 'react';
import { useQuests } from '../hooks/useQuests';
import { QuestCard } from './QuestCard';

export const QuestBoard: React.FC = () => {
  const { data: quests, isLoading, error } = useQuests();

  if (isLoading) {
    return <div className="text-white/60">Loading quests...</div>;
  }

  if (error) {
    return <div className="text-red-400">Error loading quests: {error.message}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {quests?.map(quest => (
        <QuestCard key={quest.id} quest={quest} />
      ))}
    </div>
  );
};
