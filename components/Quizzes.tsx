import React, { useState, useCallback } from 'react';
import { TOPICS } from '../constants';
import type { Topic, Quiz, QuizQuestion, QuizType } from '../types';
import { generateQuiz } from '../services/geminiService';
import Spinner from './Spinner';
import Dashboard from './Dashboard';

const QuestionCard: React.FC<{ question: QuizQuestion; questionIndex: number; showAnswer: boolean }> = ({ question, questionIndex, showAnswer }) => {
    const isMC_TF = question.type === 'multiple-choice' || question.type === 'true-false';

    return (
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg mb-4 transform transition-transform hover:scale-[1.02]">
            <p className="font-semibold text-2xl mb-4 text-gray-200">{questionIndex + 1}. {question.question}</p>
            
            {isMC_TF && question.options && (
                <div className="space-y-3">
                    {question.options.map((option, index) => {
                        const isCorrect = option === question.correctAnswer;
                        let style = 'bg-gray-700 border-gray-600';
                        if (showAnswer) {
                            if (isCorrect) {
                                style = 'bg-green-500/20 border-green-500 text-white';
                            } else {
                                style = 'bg-gray-700 border-gray-600 opacity-60';
                            }
                        }
                        return (
                            <div key={index} className={`p-4 border rounded-md transition-all duration-300 text-xl ${style}`}>
                                {option}
                            </div>
                        );
                    })}
                </div>
            )}

            {showAnswer && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-base text-gray-400 font-bold">{question.type === 'short-answer' ? "Model Answer:" : "Correct Answer:"}</p>
                    {question.type !== 'short-answer' && <p className="text-green-300 font-semibold text-xl my-2">{question.correctAnswer}</p>}
                    <p className="text-base text-gray-400 mt-2">Explanation:</p>
                    <p className="text-base text-gray-300 mt-1 whitespace-pre-wrap">{question.explanation}</p>
                </div>
            )}
        </div>
    );
};


const Quizzes: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  // New state for quiz options
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [quizType, setQuizType] = useState<QuizType>('multiple-choice');

  const handleTopicSelect = useCallback(async (topic: Topic) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    setError(null);
    setGeneratedQuiz(null);
    setShowAnswers(false);

    try {
      const quizData = await generateQuiz(topic.title, numQuestions, quizType);
      setGeneratedQuiz(quizData);
    } catch (err) {
      setError('Failed to generate quiz. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [numQuestions, quizType]);

  const handleGoBack = () => {
    setSelectedTopic(null);
    setGeneratedQuiz(null);
    setError(null);
  };
  
  if (!selectedTopic) {
    return (
        <div>
             <div className="text-center mb-8">
                <h2 className="text-5xl font-bold">Quiz Generator</h2>
                <p className="text-xl text-gray-400 mt-2">Select a topic to generate a practice quiz.</p>
            </div>

            <div className="max-w-2xl mx-auto bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8 flex flex-col sm:flex-row gap-6 items-center justify-center">
                <div className="w-full sm:w-auto">
                    <label htmlFor="numQuestions" className="block text-base font-medium text-gray-300 mb-2">Number of Questions</label>
                    <select
                        id="numQuestions"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-5 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-lg"
                    >
                        <option value={5}>5 Questions</option>
                        <option value={10}>10 Questions</option>
                        <option value={15}>15 Questions</option>
                    </select>
                </div>
                 <div className="w-full sm:w-auto">
                    <label htmlFor="quizType" className="block text-base font-medium text-gray-300 mb-2">Question Type</label>
                    <select
                        id="quizType"
                        value={quizType}
                        onChange={(e) => setQuizType(e.target.value as QuizType)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-5 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-lg"
                    >
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="true-false">True/False</option>
                        <option value="short-answer">Short Answer</option>
                        <option value="mixed">Mixed</option>
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
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Quiz: {selectedTopic.title}</h2>
        </div>
        
        {isLoading && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Spinner />
                <p className="mt-4 text-lg">Generating your quiz...</p>
            </div>
        )}
        {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg text-lg">{error}</div>}
        {generatedQuiz && (
            <div>
                {generatedQuiz.questions.map((q, index) => (
                    <QuestionCard key={index} question={q} questionIndex={index} showAnswer={showAnswers} />
                ))}
                <div className="text-center mt-8">
                    <button 
                        onClick={() => setShowAnswers(!showAnswers)} 
                        className="px-10 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform text-xl"
                    >
                        {showAnswers ? 'Hide Answers' : 'Show Answers'}
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default Quizzes;