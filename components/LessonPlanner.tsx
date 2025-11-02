
import React, { useState, useCallback } from 'react';
import { TOPICS } from '../constants';
import type { Topic, LessonPlan, LessonActivity } from '../types';
import { generateLessonPlan } from '../services/geminiService';
import Spinner from './Spinner';
import Dashboard from './Dashboard';
import { ConceptIcon, TaskIcon } from './Icons';

const ActivityCard: React.FC<{ activity: LessonActivity }> = ({ activity }) => {
    return (
        <div className="bg-gray-900/70 border border-gray-700/80 rounded-lg p-5">
            <div className="flex justify-between items-start gap-4">
                <h4 className="text-2xl font-bold text-fuchsia-300">{activity.title}</h4>
                <span className="text-sm font-semibold bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full">{activity.duration} mins</span>
            </div>
            <p className="mt-2 text-lg text-gray-300 leading-relaxed">{activity.description}</p>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
                <p className="text-lg font-semibold text-cyan-300">💡 Interactive Idea</p>
                <p className="text-lg text-gray-400 mt-1">{activity.interactiveSuggestion}</p>
            </div>
        </div>
    );
};

const LessonPlanner: React.FC = () => {
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleTopicSelect = (topic: Topic) => {
        setSelectedTopic(topic);
        setLessonPlan(null);
        setError(null);
    };
    
    const handleGeneratePlan = useCallback(async () => {
        if (!selectedTopic) return;

        setIsLoading(true);
        setError(null);
        setLessonPlan(null);

        try {
            const plan = await generateLessonPlan(selectedTopic.title);
            setLessonPlan(plan);
        } catch (err) {
            setError('Failed to generate the lesson plan. The AI might be busy. Please try again in a moment.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedTopic]);

    const handleGoBack = () => {
        setSelectedTopic(null);
        setLessonPlan(null);
        setError(null);
    };

    if (!selectedTopic) {
        return (
            <div>
                <div className="text-center mb-8">
                    <h2 className="text-5xl font-bold">Lesson Planner</h2>
                    <p className="text-xl text-gray-400 mt-2">Select a topic to generate a 45-minute lesson plan with interactive activity suggestions.</p>
                </div>
                <Dashboard topics={TOPICS} onSelectTopic={handleTopicSelect} />
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={handleGoBack}
                className="mb-6 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-xl"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Back to Topics
            </button>
            <div className="text-center mb-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    Lesson Plan for: {selectedTopic.title}
                </h2>
                {!lessonPlan && !isLoading && (
                     <div className="mt-6">
                        <p className="text-gray-400 text-xl mb-4">Ready to create a lesson plan for this topic?</p>
                        <button 
                            onClick={handleGeneratePlan}
                            className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform text-xl"
                        >
                            Generate Lesson Plan
                        </button>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Spinner />
                    <p className="mt-4 text-xl">Designing your lesson plan...</p>
                    <p className="text-base text-gray-500 mt-1">This might take a moment.</p>
                </div>
            )}
            {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg text-lg">{error}</div>}
            
            {lessonPlan && (
                <div className="animate-fadeIn space-y-8">
                    <div className="bg-gray-800/80 border border-gray-700 p-6 rounded-xl shadow-lg">
                        <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                            <ConceptIcon className="h-7 w-7 text-cyan-400" />
                            Learning Objectives
                        </h3>
                        <ul className="list-disc list-inside mt-4 space-y-2 text-xl text-gray-300">
                            {lessonPlan.learningObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
                        </ul>
                    </div>

                     <div className="bg-gray-800/80 border border-gray-700 p-6 rounded-xl shadow-lg">
                        <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                             <TaskIcon className="h-7 w-7 text-cyan-400" />
                            Lesson Activities
                        </h3>
                        <div className="mt-4 space-y-4">
                            {lessonPlan.activities.map((activity, i) => <ActivityCard key={i} activity={activity} />)}
                        </div>
                    </div>
                    
                    <div className="text-center mt-8">
                         <button 
                            onClick={handleGeneratePlan}
                            disabled={isLoading}
                            className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform text-lg disabled:opacity-50"
                        >
                            {isLoading ? 'Regenerating...' : 'Regenerate Plan'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonPlanner;