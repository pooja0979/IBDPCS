import React, { useState, useEffect, useCallback } from 'react';
import { ResetIcon } from './Icons';

// Helper to generate a random array
const generateRandomArray = (size = 8) => {
    const arr = [];
    for (let i = 0; i < size; i++) {
        arr.push(Math.floor(Math.random() * 90) + 10);
    }
    return arr;
};

const BubbleSortActivity: React.FC = () => {
    const [array, setArray] = useState<number[]>([]);
    const [i, setI] = useState<number>(0); // outer loop
    const [j, setJ] = useState<number>(0); // inner loop
    const [swapped, setSwapped] = useState<boolean>(false);
    const [comparing, setComparing] = useState<[number, number] | null>(null);
    const [sortedIndices, setSortedIndices] = useState<number[]>([]);
    const [isSorted, setIsSorted] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('Click "Next Step" to begin sorting the array.');
    const [quiz, setQuiz] = useState<{ active: boolean; question: string; correct: boolean } | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const reset = useCallback(() => {
        const newArray = generateRandomArray();
        setArray(newArray);
        setI(0);
        setJ(0);
        setSwapped(false);
        setComparing(null);
        setSortedIndices([]);
        setIsSorted(false);
        setQuiz(null);
        setFeedback(null);
        setMessage('A new random array is generated. Click "Next Step" to begin sorting.');
    }, []);

    useEffect(() => {
        reset();
    }, [reset]);

    const startNextStep = () => {
        if (isSorted || quiz?.active) return;
        
        if (i >= array.length - 1) {
            setIsSorted(true);
            setComparing(null);
            setSortedIndices(Array.from(Array(array.length).keys()));
            setMessage('Array is fully sorted! Click "Reset" to try again.');
            return;
        }

        setComparing([j, j + 1]);
        setFeedback(null);
        setSwapped(false);
        setMessage(`Comparing elements at index ${j} (${array[j]}) and ${j+1} (${array[j+1]}).`);
        setQuiz({
            active: true,
            question: `Should we swap ${array[j]} and ${array[j+1]}?`,
            correct: array[j] > array[j+1]
        });
    }

    const handleQuizAnswer = (userAnswer: boolean) => {
        if (!quiz) return;

        if (userAnswer === quiz.correct) {
            setFeedback('Correct!');
        } else {
            setFeedback(`Incorrect. We ${quiz.correct ? 'should' : 'should not'} swap.`);
        }

        setQuiz({ ...quiz, active: false });
        setTimeout(performStep, 1000);
    }

    const performStep = () => {
        setFeedback(null);
        let currentI = i;
        let currentJ = j;
        let currentArray = [...array];

        if (currentArray[currentJ] > currentArray[currentJ + 1]) {
            [currentArray[currentJ], currentArray[currentJ + 1]] = [currentArray[currentJ + 1], currentArray[currentJ]];
            setArray(currentArray);
            setMessage(`Swapped! New order: ${currentArray[currentJ]}, ${currentArray[currentJ+1]}.`);
            setSwapped(true);
        } else {
            setMessage('No swap needed. Elements are in order.');
            setSwapped(false);
        }
        
        currentJ++;
        if (currentJ >= currentArray.length - 1 - currentI) {
            setSortedIndices(prev => [...prev, currentArray.length - 1 - currentI]);
            currentI++;
            currentJ = 0;
            if (currentI >= currentArray.length - 1) {
                setIsSorted(true);
                setComparing(null);
                setSortedIndices(Array.from(Array(array.length).keys()));
                setMessage('Array is fully sorted! Click "Reset" to try again.');
            }
        }
        
        setI(currentI);
        setJ(currentJ);

        setTimeout(() => setSwapped(false), 500);
    }
    
    const getBarColor = (index: number) => {
        if (isSorted || sortedIndices.includes(index)) {
            return 'bg-emerald-500';
        }
        if (swapped && (index === comparing?.[0] || index === comparing?.[1])) {
            return 'bg-amber-500';
        }
        if (comparing && (index === comparing[0] || index === comparing[1])) {
            return 'bg-cyan-500';
        }
        return 'bg-gray-600';
    };

    return (
        <div className="bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl p-4 sm:p-6 text-center">
            <h3 className="text-4xl font-bold">Interactive Bubble Sort</h3>
            <p className="text-xl text-gray-400 mt-1 mb-6">Test your knowledge by predicting the next step in the Bubble Sort algorithm.</p>
            
            <div className="bg-gray-900/50 rounded-lg p-4 sm:p-8 min-h-[250px] flex items-end justify-center gap-2" aria-label="Array visualization">
                {array.map((value, index) => (
                    <div
                        key={index}
                        className="w-10 rounded-t-md transition-all duration-300 flex items-center justify-center pt-2"
                        style={{ height: `${value * 2.5}px`, backgroundColor: getBarColor(index).replace('bg-','') }}
                        aria-valuenow={value}
                    >
                        <span className="text-white font-bold text-lg">{value}</span>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-4 bg-gray-900 rounded-lg min-h-[60px] flex items-center justify-center">
                 <p className="text-xl text-gray-300 font-mono">{message}</p>
            </div>

            {quiz?.active && (
                <div className="mt-4 animate-fadeIn">
                    <p className="text-2xl font-semibold text-white mb-4">{quiz.question}</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => handleQuizAnswer(true)} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg text-lg">Yes</button>
                        <button onClick={() => handleQuizAnswer(false)} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg text-lg">No</button>
                    </div>
                </div>
            )}

            {feedback && (
                <div className={`mt-4 text-2xl font-bold ${feedback === 'Correct!' ? 'text-green-400' : 'text-red-400'}`}>
                    {feedback}
                </div>
            )}

            <div className="flex justify-center gap-4 mt-6">
                <button
                    onClick={startNextStep}
                    disabled={isSorted || !!quiz?.active}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform text-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-2"
                >
                    Next Step
                </button>
                <button
                    onClick={reset}
                    className="px-8 py-4 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform text-xl flex items-center gap-2"
                >
                    <ResetIcon className="w-6 h-6" />
                    Reset
                </button>
            </div>
        </div>
    );
};

export default BubbleSortActivity;
