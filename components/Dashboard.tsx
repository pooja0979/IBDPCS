
import React from 'react';
import type { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  onSelect: (topic: Topic) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(topic)}
      className={`relative group p-7 rounded-xl bg-gray-800 border border-gray-700 hover:border-transparent cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden h-full`}
    >
        <div className={`absolute -top-1 -right-1 bg-gradient-to-bl ${topic.color} w-24 h-24 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-xl`}></div>
        <div className="relative z-10">
            <div className={`p-3 bg-gray-900 rounded-lg inline-block bg-gradient-to-br ${topic.color}`}>
                <topic.Icon className="h-8 w-8 text-white" />
            </div>
            <h3 className="mt-4 text-3xl font-bold text-white">{topic.title}</h3>
            <p className="mt-2 text-lg text-gray-400">{topic.description}</p>
        </div>
    </div>
  );
};


interface DashboardProps {
  topics: Topic[];
  onSelectTopic: (topic: Topic) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ topics, onSelectTopic }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {topics.map((topic, index) => (
        <div
          key={topic.id}
          className="animate-contentFadeIn"
          style={{ animationDelay: `${index * 75}ms`, opacity: 0 }}
        >
            <TopicCard topic={topic} onSelect={onSelectTopic} />
        </div>
      ))}
    </div>
  );
};

export default Dashboard;