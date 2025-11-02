import React, { useState, useCallback } from 'react';
import { TOPICS } from '../constants';
import type { Topic, Worksheet, WorksheetQuestion, WorksheetSubQuestion } from '../types';
import { generateWorksheet } from '../services/geminiService';
import Spinner from './Spinner';
import Dashboard from './Dashboard';
import { EyeIcon, EyeOffIcon } from './Icons';

const WorksheetPartDisplay: React.FC<{ part: WorksheetSubQuestion; index: number }> = ({ part, index }) => {
    const [showAnswer, setShowAnswer] = useState(false);
    const [studentAnswer, setStudentAnswer] = useState('');
    const partLetter = String.fromCharCode(97 + index); // a, b, c...

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/80">
            <div className="flex justify-between items-start gap-4">
                <p className="font-semibold text-gray-200 flex-1 text-xl">
                    <span className="font-bold">({partLetter})</span> {part.prompt}
                </p>
                <span className="px-3 py-1 bg-cyan-800 text-cyan-200 text-sm font-bold rounded-full whitespace-nowrap">
                    [{part.marks}]
                </span>
            </div>

            <textarea
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className={`w-full h-28 mt-4 bg-gray-700/60 border rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-y transition-colors text-lg ${
                    showAnswer ? 'border-amber-500/50' : 'border-gray-600'
                }`}
                aria-label={`Answer for question part ${partLetter}`}
            />

            <div className="mt-3">
                <button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-lg font-semibold transition-colors"
                >
                    {showAnswer ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    {showAnswer ? 'Hide' : 'Show'} Model Answer
                </button>
            </div>

            {showAnswer && (
                <div className="mt-3 pt-3 border-t border-gray-700/50 animate-fadeIn">
                    <h4 className="font-bold text-gray-300 text-base">Model Answer:</h4>
                    <p className="text-gray-400 mt-2 whitespace-pre-wrap text-base leading-relaxed">{part.modelAnswer}</p>
                </div>
            )}
        </div>
    );
};

const WorksheetQuestionDisplay: React.FC<{ question: WorksheetQuestion; index: number }> = ({ question, index }) => {
    return (
        <div className="bg-gray-800/80 border border-gray-700 p-4 sm:p-6 rounded-xl mb-6 shadow-lg transition-all duration-300 hover:border-cyan-500/50">
            <h3 className="text-2xl sm:text-3xl font-bold text-white border-b border-gray-700 pb-3 mb-4">{index}. {question.title}</h3>
            <div className="space-y-4">
                {question.parts.map((part, partIndex) => (
                    <WorksheetPartDisplay key={partIndex} part={part} index={partIndex} />
                ))}
            </div>
        </div>
    );
};


const Worksheets: React.FC = () => {
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [generatedWorksheet, setGeneratedWorksheet] = useState<Worksheet | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [numQuestions, setNumQuestions] = useState<number>(5);


    const handleTopicSelect = useCallback(async (topic: Topic) => {
        setSelectedTopic(topic);
        setIsLoading(true);
        setError(null);
        setGeneratedWorksheet(null);

        try {
            const worksheetData = await generateWorksheet(topic.title, numQuestions);
            setGeneratedWorksheet(worksheetData);
        } catch (err) {
            setError('Failed to generate worksheet. The AI may be experiencing high demand. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [numQuestions]);

    const handleGoBack = () => {
        setSelectedTopic(null);
        setGeneratedWorksheet(null);
        setError(null);
    };

    if (!selectedTopic) {
        return (
            <div>
                <div className="text-center mb-8">
                    <h2 className="text-5xl font-bold">Worksheet Generator</h2>
                    <p className="text-xl text-gray-400 mt-2">Select a topic to generate a practice worksheet with self-marked, exam-style questions.</p>
                </div>

                <div className="max-w-md mx-auto bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8 flex flex-col sm:flex-row gap-6 items-center justify-center">
                    <div className="w-full">
                        <label htmlFor="numQuestions" className="block text-base font-medium text-gray-300 mb-2 text-center">Number of Questions</label>
                        <select
                            id="numQuestions"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(Number(e.target.value))}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-5 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-lg"
                        >
                            <option value={5}>5 Questions</option>
                            <option value={8}>8 Questions</option>
                            <option value={12}>12 Questions</option>
                        </select>
                    </div>
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
                    Worksheet: {generatedWorksheet?.title || selectedTopic.title}
                </h2>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Spinner />
                    <p className="mt-4 text-lg">Building your exam-style worksheet...</p>
                    <p className="text-base text-gray-500 mt-1">This may take a moment.</p>
                </div>
            )}
            {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg text-lg">{error}</div>}
            {generatedWorksheet && (
                <div>
                    {generatedWorksheet.questions.map((q, index) => (
                        <WorksheetQuestionDisplay key={index} question={q} index={index + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Worksheets;