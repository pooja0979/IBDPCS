import React, { useState, useCallback, useEffect } from 'react';
import type { SubTopic, Topic, LearningModule, ContentBlock } from '../types';
import { generateLearningModule } from '../services/geminiService';
import Spinner from './Spinner';
import { ConceptIcon, VocabularyIcon, WorldIcon, ThinkingIcon } from './Icons';
import LogicDiagramActivity from './LogicDiagramActivity';
import BinaryAdventure from './BinaryAdventure';
import BubbleSortActivity from './BubbleSortActivity';
import NumberSystemConverterActivity from './NumberSystemConverterActivity';
import LinkedListActivity from './LinkedListActivity';
import BinarySearchTreeActivity from './BinarySearchTreeActivity';

const ContentBlockDisplay: React.FC<{ block: ContentBlock }> = ({ block }) => {
    switch (block.type) {
        case 'heading':
            return <h4 className="text-3xl font-bold text-cyan-300 pt-4 border-b border-cyan-800/50 pb-2 mb-3">{block.content}</h4>;
        case 'paragraph':
            return <p className="text-xl text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') }} />;
        case 'code':
             return (
                <div className="bg-gray-900 rounded-lg my-4 border border-gray-700">
                    <div className="bg-gray-700/50 px-4 py-1.5 rounded-t-lg text-xs text-gray-400 font-mono">Python Example</div>
                    <pre className="p-4 text-cyan-300 overflow-x-auto text-lg"><code>{block.content}</code></pre>
                </div>
            );
        case 'list':
            return (
                <ul className="list-disc list-inside space-y-2 text-xl text-gray-300 pl-2">
                    {block.content.split('\n').map((item, i) => item.trim() && <li key={i}>{item.trim().replace(/^- /, '')}</li>)}
                </ul>
            );
        case 'quote':
            return <blockquote className="border-l-4 border-amber-500 pl-4 italic text-xl text-gray-400 my-4 bg-gray-800/50 py-2">{block.content}</blockquote>;
        default:
            return <p className="text-xl text-gray-300">{block.content}</p>;
    }
};


const LearningModuleCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; color: string }> = ({ title, icon, children, color }) => {
    const shadowClass = {
        cyan: 'hover:shadow-cyan-500/20',
        fuchsia: 'hover:shadow-fuchsia-500/20',
        amber: 'hover:shadow-amber-500/20',
        emerald: 'hover:shadow-emerald-500/20',
    }[color] || 'hover:shadow-gray-500/20';

    const borderClass = {
        cyan: 'border-t-cyan-500',
        fuchsia: 'border-t-fuchsia-500',
        amber: 'border-t-amber-500',
        emerald: 'border-t-emerald-500',
    }[color] || 'border-t-gray-500';

    const iconBgClass = {
        cyan: 'from-cyan-500 to-cyan-400',
        fuchsia: 'from-fuchsia-500 to-fuchsia-400',
        amber: 'from-amber-500 to-amber-400',
        emerald: 'from-emerald-500 to-emerald-400',
    }[color] || 'from-gray-500 to-gray-400';

    return (
        <div className={`bg-gray-800/80 border border-gray-700 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl ${shadowClass} border-t-4 ${borderClass}`}>
            <div className={`flex items-center gap-4 p-4 bg-gray-900/50 border-b border-gray-700`}>
                <div className={`p-2 bg-gradient-to-br ${iconBgClass} rounded-lg text-white`}>
                     {icon}
                </div>
                <h3 className="text-3xl font-bold text-white">{title}</h3>
            </div>
            <div className="p-6 bg-gradient-to-b from-gray-800/60 to-transparent">
                {children}
            </div>
        </div>
    );
};


const ThinkingRoutineCard: React.FC<{ routine: LearningModule['thinkingRoutine'] }> = ({ routine }) => {
    return (
        <LearningModuleCard title={routine.name} icon={<ThinkingIcon className="h-6 w-6" />} color="amber">
            <div className="prose prose-invert prose-p:text-xl space-y-4">
                 <p className="italic text-gray-400">{routine.description.replace(/\*\*/g, '')}</p>
                 <p className="font-semibold text-gray-200">{routine.prompt.replace(/\*\*/g, '')}</p>
            </div>
        </LearningModuleCard>
    );
};


interface TopicDetailProps {
  topic: Topic;
  onClose: () => void;
}

const TopicDetail: React.FC<TopicDetailProps> = ({ topic, onClose }) => {
  const [activeSubTopic, setActiveSubTopic] = useState<SubTopic | null>(null);
  const [learningModule, setLearningModule] = useState<LearningModule | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'content'>('list');

   useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleSubTopicClick = useCallback(async (subTopic: SubTopic) => {
    setActiveSubTopic(subTopic);
    setView('content');
    
    // IDs for custom interactive components
    const interactiveComponentIds = ['a1-2-5', 'a1-2-0', 'b2-4-3', 'a1-2-1', 'b4-1-3-interactive', 'b4-1-4-interactive'];

    if (interactiveComponentIds.includes(subTopic.id)) {
      setIsLoading(false);
      setError(null);
      setLearningModule(null);
      return; 
    }

    setIsLoading(true);
    setError(null);
    setLearningModule(null);

    try {
      let finalPrompt = `For the IB Computer Science topic "${subTopic.title}", generate an interactive learning module. The core concept should be detailed, clear, and use visually descriptive language. Also include a thinking routine based on Harvard's Project Zero.`;
      
      if (topic.id.startsWith('b2-') || topic.id.startsWith('b3-')) {
        finalPrompt += "\nIn the 'coreConcept' section, provide plenty of clear code examples in Python.";
      }
      
      const module = await generateLearningModule(finalPrompt);
      setLearningModule(module);
    } catch (err) {
      setError('Failed to generate content. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [topic.id]);

  const handleBackToList = () => {
    setView('list');
    setActiveSubTopic(null);
    setLearningModule(null);
    setError(null);
  };
  
  const renderInteractiveComponent = () => {
    if (!activeSubTopic) return null;
    switch (activeSubTopic.id) {
        case 'a1-2-5':
            return <LogicDiagramActivity />;
        case 'a1-2-0':
            return <BinaryAdventure />;
        case 'b2-4-3':
            return <BubbleSortActivity />;
        case 'a1-2-1':
            return <NumberSystemConverterActivity />;
        case 'b4-1-3-interactive':
            return <LinkedListActivity />;
        case 'b4-1-4-interactive':
            return <BinarySearchTreeActivity />;
        default:
            return null;
    }
  }

  return (
    <div
      className="fixed inset-0 bg-gray-900 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`relative w-full h-full bg-gray-900 overflow-hidden flex flex-col animate-scaleIn bg-gradient-to-br ${topic.color}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 w-12 h-12 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors text-white"
            aria-label="Close topic details"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        
        <div className="flex-grow overflow-y-auto bg-gray-900/60 backdrop-blur-xl">
            <div className="p-6 sm:p-8 lg:p-12">
                <div key={view} className="animate-contentFadeIn">
                    {view === 'list' && (
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-3 rounded-lg inline-block bg-gradient-to-br ${topic.color}`}>
                                    <topic.Icon className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-4xl sm:text-5xl font-bold">{topic.title}</h2>
                                    <p className="text-gray-300 mt-1 text-xl">{topic.description}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {topic.subTopics.map((subTopic) => (
                                    <button
                                    key={subTopic.id}
                                    onClick={() => handleSubTopicClick(subTopic)}
                                    className="w-full text-left p-5 rounded-lg transition-all duration-300 bg-gray-800/70 hover:bg-gray-700/90 border border-gray-700 hover:border-cyan-500 transform hover:scale-105"
                                    >
                                    <p className="font-semibold text-white text-xl">{subTopic.title}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'content' && (
                        <div>
                            <button
                                onClick={handleBackToList}
                                className="mb-6 flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors font-semibold text-xl"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Back to All Concepts
                            </button>
                            
                            <h2 className="text-5xl font-bold text-white mb-6">{activeSubTopic?.title}</h2>

                            {renderInteractiveComponent() ?? (
                                <div className="min-h-[500px]">
                                    {isLoading && (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                            <Spinner />
                                            <p className="mt-4 text-xl">Building your learning module...</p>
                                        </div>
                                    )}
                                    {error && <div className="text-red-400 bg-red-900/30 p-4 rounded-lg text-lg">{error}</div>}
                                    
                                    {!isLoading && !error && learningModule && (
                                        <div className="space-y-6">
                                            <LearningModuleCard title="Core Concept" icon={<ConceptIcon className="h-6 w-6" />} color="cyan">
                                                <div className="space-y-4">
                                                    {learningModule.coreConcept.map((block, index) => (
                                                        <div key={index} className="animate-contentFadeIn" style={{ animationDelay: `${index * 150}ms`, opacity: 0 }}>
                                                            <ContentBlockDisplay block={block} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </LearningModuleCard>
                                            
                                            <LearningModuleCard title="Key Vocabulary" icon={<VocabularyIcon className="h-6 w-6" />} color="fuchsia">
                                                <ul className="space-y-3 text-xl">
                                                    {learningModule.keyVocabulary.map(item => (
                                                        <li key={item.term}>
                                                            <strong className="text-fuchsia-300">{item.term}:</strong>
                                                            <span className="text-gray-400 ml-2">{item.definition.replace(/\*\*/g, '')}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </LearningModuleCard>

                                            <ThinkingRoutineCard routine={learningModule.thinkingRoutine} />

                                            <LearningModuleCard title="Real-World Link" icon={<WorldIcon className="h-6 w-6" />} color="emerald">
                                                <div className="prose prose-invert prose-p:text-xl">
                                                    <p>{learningModule.realWorldLink.replace(/\*\*/g, '')}</p>
                                                </div>
                                            </LearningModuleCard>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetail;