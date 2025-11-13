import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResetIcon, CheckCircleIcon, XCircleIcon } from './Icons';

type Base = 'Decimal' | 'Binary' | 'Hexadecimal';

const CONVERSION_TYPES: { from: Base, to: Base }[] = [
    { from: 'Decimal', to: 'Binary' },
    { from: 'Binary', to: 'Decimal' },
    { from: 'Decimal', to: 'Hexadecimal' },
    { from: 'Hexadecimal', to: 'Decimal' },
    { from: 'Binary', to: 'Hexadecimal' },
    { from: 'Hexadecimal', to: 'Binary' },
];

const getExplanation = (value: number, from: Base, to: Base, result: string): React.ReactNode => {
    switch (`${from}-${to}`) {
        case 'Decimal-Binary': {
            let steps = [];
            let num = value;
            if (num === 0) return <p>The decimal number 0 is simply 0 in binary.</p>;
            while (num > 0) {
                steps.push({ num, rem: num % 2 });
                num = Math.floor(num / 2);
            }
            return (
                <div className="space-y-2 text-left">
                    <p>We use repeated division by 2. We record the remainder at each step.</p>
                    <table className="w-full text-center font-mono mt-2 bg-gray-900/50">
                        <thead><tr className="border-b border-gray-600"><th className="p-2">Division</th><th className="p-2">Result</th><th className="p-2">Remainder</th></tr></thead>
                        <tbody>
                            {steps.map((s, i) => <tr key={i} className="border-b border-gray-700/50"><td>{s.num} / 2</td><td>{Math.floor(s.num/2)}</td><td className="text-cyan-300 font-bold">{s.rem}</td></tr>)}
                        </tbody>
                    </table>
                    <p className="pt-2">Then, we read the remainders from the <strong className="text-white">bottom up</strong> to get the binary answer: <strong className="text-cyan-300 font-bold tracking-wider">{result}</strong>.</p>
                </div>
            );
        }
        case 'Binary-Decimal': {
            const binaryStr = String(value);
            const steps = binaryStr.split('').reverse().map((bit, i) => ({ bit, power: i, value: parseInt(bit) * Math.pow(2, i) }));
            return (
                <div className="space-y-2 text-left">
                    <p>We multiply each binary digit by its corresponding power of 2, then sum the results.</p>
                    <p className="font-mono text-center tracking-widest text-xl my-2">{binaryStr}</p>
                    <div className="font-mono text-center text-lg">
                        {steps.reverse().map(s => `(${s.bit} × 2^${s.power})`).join(' + ')}
                         <br/>= {steps.map(s => s.value).join(' + ')}
                         <br/>= <strong className="text-cyan-300 font-bold text-xl">{result}</strong>
                    </div>
                </div>
            )
        }
        case 'Decimal-Hexadecimal': {
            let steps = [];
            let num = value;
            if (num === 0) return <p>The decimal number 0 is simply 0 in hexadecimal.</p>;
            while (num > 0) {
                const rem = num % 16;
                steps.push({ num, rem: rem.toString(16).toUpperCase() });
                num = Math.floor(num / 16);
            }
            return (
                 <div className="space-y-2 text-left">
                    <p>We use repeated division by 16. We convert remainders 10-15 to A-F.</p>
                     <table className="w-full text-center font-mono mt-2 bg-gray-900/50">
                        <thead><tr className="border-b border-gray-600"><th className="p-2">Division</th><th className="p-2">Result</th><th className="p-2">Remainder</th></tr></thead>
                        <tbody>
                            {steps.map((s, i) => <tr key={i} className="border-b border-gray-700/50"><td>{s.num} / 16</td><td>{Math.floor(s.num/16)}</td><td className="text-cyan-300 font-bold">{s.rem}</td></tr>)}
                        </tbody>
                    </table>
                    <p className="pt-2">Reading the remainders from the <strong className="text-white">bottom up</strong> gives us: <strong className="text-cyan-300 font-bold tracking-wider">{result}</strong>.</p>
                </div>
            )
        }
        case 'Hexadecimal-Decimal': {
            const hexStr = String(value);
            const steps = hexStr.split('').reverse().map((digit, i) => ({ digit, power: i, value: parseInt(digit, 16) * Math.pow(16, i) }));
             return (
                <div className="space-y-2 text-left">
                    <p>We multiply each hex digit by its corresponding power of 16, then sum the results.</p>
                    <p className="font-mono text-center tracking-widest text-xl my-2">{hexStr}</p>
                    <div className="font-mono text-center text-lg">
                        {steps.reverse().map(s => `(${s.digit} × 16^${s.power})`).join(' + ')}
                         <br/>= {steps.map(s => s.value).join(' + ')}
                         <br/>= <strong className="text-cyan-300 font-bold text-xl">{result}</strong>
                    </div>
                </div>
            )
        }
        default:
            return <p>The correct answer is <strong className="text-cyan-300 font-bold tracking-wider">{result}</strong>.</p>;
    }
};

const NumberSystemConverterActivity: React.FC = () => {
    const [question, setQuestion] = useState<{ value: string; from: Base; to: Base; decimalValue: number } | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string; explanation?: React.ReactNode } | null>(null);
    const [key, setKey] = useState(0); // To reset the component

    const generateNewProblem = useCallback(() => {
        const conversion = CONVERSION_TYPES[Math.floor(Math.random() * CONVERSION_TYPES.length)];
        const decimalValue = Math.floor(Math.random() * 246) + 10; // Random number from 10 to 255

        let fromValue: string;
        switch (conversion.from) {
            case 'Binary': fromValue = decimalValue.toString(2); break;
            case 'Hexadecimal': fromValue = decimalValue.toString(16).toUpperCase(); break;
            default: fromValue = decimalValue.toString();
        }
        
        setQuestion({ value: fromValue, from: conversion.from, to: conversion.to, decimalValue });
        setUserAnswer('');
        setFeedback(null);
    }, []);

    useEffect(() => {
        generateNewProblem();
    }, [key, generateNewProblem]);

    const correctAnswer = useMemo(() => {
        if (!question) return '';
        switch (question.to) {
            case 'Binary': return question.decimalValue.toString(2);
            case 'Hexadecimal': return question.decimalValue.toString(16).toUpperCase();
            default: return question.decimalValue.toString();
        }
    }, [question]);

    const handleCheck = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userAnswer.trim() || !question) return;

        const sanitizedAnswer = userAnswer.trim().toUpperCase();
        if (sanitizedAnswer === correctAnswer) {
            setFeedback({ type: 'correct', message: 'Correct! Well done.' });
        } else {
            setFeedback({
                type: 'incorrect',
                message: `Not quite. The correct answer was ${correctAnswer}.`,
                explanation: getExplanation(question.decimalValue, question.from, question.to, correctAnswer)
            });
        }
    };

    if (!question) return null;

    return (
        <div className="bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl p-4 sm:p-6 text-center">
            <h3 className="text-4xl font-bold">Number System Conversion Challenge</h3>
            <p className="text-xl text-gray-400 mt-1 mb-6">Test your conversion skills!</p>

            <div className="bg-gray-900/50 rounded-lg p-6 sm:p-8">
                <p className="text-2xl text-gray-300">
                    Convert the <strong className="text-white">{question.from}</strong> number below to <strong className="text-white">{question.to}</strong>:
                </p>
                <div className="my-4 p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-5xl font-mono text-cyan-300 tracking-widest">
                    {question.value}
                </div>
                <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="w-full sm:w-80 bg-gray-700 border border-gray-600 rounded-md px-5 py-3 text-2xl font-mono text-center focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        placeholder="Your Answer"
                        aria-label={`Answer for converting ${question.value}`}
                        disabled={!!feedback}
                    />
                    <button
                        type="submit"
                        disabled={!!feedback}
                        className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Check
                    </button>
                </form>
            </div>
            
            {feedback && (
                <div className={`mt-6 p-4 rounded-lg border animate-fadeIn ${feedback.type === 'correct' ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'}`}>
                    <div className="flex items-center justify-center gap-3">
                        {feedback.type === 'correct' ? <CheckCircleIcon className="h-8 w-8 text-green-400" /> : <XCircleIcon className="h-8 w-8 text-red-400" />}
                        <p className={`text-2xl font-bold ${feedback.type === 'correct' ? 'text-green-300' : 'text-red-300'}`}>{feedback.message}</p>
                    </div>
                    {feedback.explanation && (
                         <div className="mt-4 pt-4 border-t border-gray-600/50 text-xl text-gray-300">
                             <h4 className="font-bold text-2xl text-white mb-2">Here's how it's done:</h4>
                             {feedback.explanation}
                         </div>
                    )}
                </div>
            )}

            <div className="mt-6">
                <button
                    onClick={() => setKey(k => k + 1)}
                    className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform text-xl flex items-center gap-2 mx-auto"
                >
                    <ResetIcon className="w-6 h-6" />
                    New Question
                </button>
            </div>
        </div>
    );
};

export default NumberSystemConverterActivity;
