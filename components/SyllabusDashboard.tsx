

import React, { useState } from 'react';
import Dashboard from './Dashboard';
import TopicDetail from './TopicDetail';
import type { Topic } from '../types';
import { TOPICS } from '../constants';

const SyllabusDashboard: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
  };

  const handleCloseModal = () => {
    setSelectedTopic(null);
  };

  return (
    <div>
        <div className="text-center mb-8">
            <h2 className="text-5xl font-bold">Syllabus Explorer</h2>
            <p className="text-xl text-gray-400 mt-2">Select a topic to get an AI-powered explanation of key concepts.</p>
        </div>
        <Dashboard topics={TOPICS} onSelectTopic={handleSelectTopic} />
      
      {selectedTopic && (
        <TopicDetail topic={selectedTopic} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default SyllabusDashboard;