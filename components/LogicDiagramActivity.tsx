import React, { useState, useEffect, useMemo, useCallback } from 'react';

type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR';
const GATE_TYPES: GateType[] = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'];
const GATE_EXPLANATIONS: Record<GateType, string> = {
    AND: 'Outputs 1 only if BOTH inputs are 1.',
    OR: 'Outputs 1 if AT LEAST ONE input is 1.',
    NOT: 'Outputs the INVERSE of the single input (1 becomes 0, 0 becomes 1).',
    NAND: 'Outputs 0 only if BOTH inputs are 1. It is the opposite of AND.',
    NOR: 'Outputs 1 only if BOTH inputs are 0. It is the opposite of OR.',
    XOR: 'Outputs 1 only if the inputs are DIFFERENT (one is 1, the other is 0).',
};

const GateSVG: React.FC<{ type: GateType }> = ({ type }) => {
    const props = {
        className: "w-32 h-20 sm:w-40 sm:h-28 text-cyan-400",
        stroke: "currentColor", strokeWidth: "2.5", fill: "none",
        strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    };
    switch (type) {
        case 'AND': return <svg viewBox="0 0 100 60" {...props}><path d="M20 5 V 55 H 60 A 25 25 0 0 0 60 5 H 20 Z" /></svg>;
        case 'OR': return <svg viewBox="0 0 100 60" {...props}><path d="M5 5 Q 30 30 5 55 Q 50 30 85 30 Q 50 30 5 5 Z" /></svg>;
        case 'NOT': return <svg viewBox="0 0 100 60" {...props}><path d="M5 5 L 80 30 L 5 55 Z" /><circle cx="88" cy="30" r="8" fill="none" stroke="currentColor" /></svg>;
        case 'NAND': return <svg viewBox="0 0 100 60" {...props}><path d="M20 5 V 55 H 50 A 25 25 0 0 0 50 5 H 20 Z" /><circle cx="83" cy="30" r="8" fill="none" stroke="currentColor" /></svg>;
        case 'NOR': return <svg viewBox="0 0 100 60" {...props}><path d="M5 5 Q 25 30 5 55 Q 45 30 75 30 Q 45 30 5 5 Z" /><circle cx="91" cy="30" r="8" fill="none" stroke="currentColor" /></svg>;
        case 'XOR': return <svg viewBox="0 0 100 60" {...props}><path d="M15 5 Q 35 30 15 55 Q 55 30 85 30 Q 55 30 15 5 Z" /><path d="M5 5 Q 25 30 5 55" /></svg>;
        default: return null;
    }
};

const InputToggle: React.FC<{ label: string; value: 0 | 1; onChange: (val: 0 | 1) => void; }> = ({ label, value, onChange }) => (
    <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-2xl">{label}</span>
        <button
            onClick={() => onChange(value === 1 ? 0 : 1)}
            className={`w-20 h-20 text-4xl font-bold rounded-lg transition-all duration-200 flex items-center justify-center border-2 ${
                value === 1 ? 'bg-cyan-500 border-cyan-400 text-white shadow-cyan-500/30 shadow-lg' : 'bg-gray-700 border-gray-600 text-gray-300'
            }`}
        >
            {value}
        </button>
    </div>
);

const LogicDiagramActivity: React.FC = () => {
    const [gate, setGate] = useState<GateType>('AND');
    const [inputA, setInputA] = useState<0 | 1>(0);
    const [inputB, setInputB] = useState<0 | 1>(0);
    const [userOutput, setUserOutput] = useState<'0' | '1' | ''>('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'unanswered' | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    const correctAnswer = useMemo<0 | 1>(() => {
        switch (gate) {
            case 'AND': return (inputA & inputB) as 0 | 1;
            case 'OR': return (inputA | inputB) as 0 | 1;
            case 'NOT': return inputA === 0 ? 1 : 0;
            case 'NAND': return (inputA & inputB) ? 0 : 1;
            case 'NOR': return (inputA | inputB) ? 0 : 1;
            case 'XOR': return (inputA ^ inputB) as 0 | 1;
            default: return 0;
        }
    }, [gate, inputA, inputB]);

    const generateNewProblem = useCallback(() => {
        setGate(GATE_TYPES[Math.floor(Math.random() * GATE_TYPES.length)]);
        setInputA(Math.round(Math.random()) as 0 | 1);
        setInputB(Math.round(Math.random()) as 0 | 1);
        setUserOutput('');
        setFeedback(null);
        setShowExplanation(false);
    }, []);

    useEffect(() => {
        generateNewProblem();
    }, [generateNewProblem]);

    const handleCheck = () => {
        if (userOutput === '') {
            setFeedback('unanswered');
            return;
        }
        setFeedback(parseInt(userOutput, 10) === correctAnswer ? 'correct' : 'incorrect');
        setShowExplanation(true);
    };

    const getFeedbackUI = () => {
        if (!feedback) return <div className="h-10"></div>;
        if (feedback === 'unanswered') return <p className="h-10 text-center text-amber-400 text-2xl">Please select an output value.</p>;
        if (feedback === 'correct') return <p className="h-10 text-center text-green-400 font-bold text-2xl">Correct! Well done.</p>;
        if (feedback === 'incorrect') return <p className="h-10 text-center text-red-400 font-bold text-2xl">Not quite. The correct answer was {correctAnswer}.</p>;
    };

    const isBinaryGate = gate !== 'NOT';

    return (
        <div className="bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl p-4 sm:p-6 text-center">
            <h3 className="text-4xl font-bold">Logic Gate Simulator</h3>
            <p className="text-xl text-gray-400 mt-1 mb-6">Set the inputs, determine the output, and check your answer!</p>

            <div className="bg-gray-900/50 rounded-lg p-4 sm:p-8 flex flex-col md:flex-row items-center justify-around gap-6">
                <div className={`flex items-center ${isBinaryGate ? 'gap-8' : 'gap-4'}`}>
                    <InputToggle label="A" value={inputA} onChange={setInputA} />
                    {isBinaryGate && <InputToggle label="B" value={inputB} onChange={setInputB} />}
                </div>

                <div className="flex flex-col items-center">
                    <GateSVG type={gate} />
                    <p className="text-3xl font-bold font-mono tracking-widest mt-2">{gate}</p>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                    <span className="font-mono text-2xl">Output</span>
                     <div className="flex gap-3">
                        {['0', '1'].map((val) => (
                             <button
                                key={val}
                                onClick={() => setUserOutput(val as '0' | '1')}
                                className={`w-20 h-20 text-4xl font-bold rounded-lg transition-all duration-200 flex items-center justify-center border-2 ${
                                    userOutput === val ? 'bg-fuchsia-600 border-fuchsia-400 text-white shadow-fuchsia-500/30 shadow-lg' : 'bg-gray-700 border-gray-600 text-gray-300'
                                }`}
                            >
                                {val}
                             </button>
                        ))}
                     </div>
                </div>
            </div>

            <div className="mt-6">
                {getFeedbackUI()}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                <button
                    onClick={handleCheck}
                    className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform text-xl"
                >
                    Check Answer
                </button>
                <button
                    onClick={generateNewProblem}
                    className="px-10 py-4 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform text-xl"
                >
                    New Problem
                </button>
            </div>
            
            {showExplanation && (
                <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-600 text-left transition-opacity duration-500 animate-fadeIn">
                    <h4 className="font-bold text-2xl text-cyan-300">Explanation:</h4>
                    <p className="text-xl text-gray-300 mt-1">{GATE_EXPLANATIONS[gate]}</p>
                    <p className="text-xl text-gray-300 mt-1 font-mono">For inputs A={inputA} {isBinaryGate && `, B=${inputB}`}, the correct output is {correctAnswer}.</p>
                </div>
            )}
        </div>
    );
};

export default LogicDiagramActivity;