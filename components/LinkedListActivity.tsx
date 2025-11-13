import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ResetIcon, CheckCircleIcon, XCircleIcon, TrashIcon } from './Icons';

interface Node {
    id: number;
    value: number;
    next: number | null;
}

type Operation = 'INSERT_HEAD' | 'INSERT_TAIL' | 'DELETE';
interface Problem {
    operation: Operation;
    value: number; // value to insert or delete
    initialState: Node[];
    finalState: Node[];
    steps: QuizStep[];
}

interface QuizStep {
    question: string;
    options: string[];
    correctOption: string;
}

// --- VISUAL COMPONENTS ---

const NodeComponent: React.FC<{ node: Node, isHead: boolean, isHighlighted?: boolean }> = ({ node, isHead, isHighlighted }) => (
    <div className="flex flex-col items-center">
        <div className={`flex items-center justify-center w-20 h-20 rounded-lg shadow-lg transition-all duration-300 ${isHighlighted ? 'bg-cyan-500 border-2 border-cyan-300' : 'bg-gray-700'}`}>
            <span className="text-3xl font-bold text-white">{node.value}</span>
        </div>
        {isHead && <span className="mt-2 text-sm font-semibold text-cyan-400">HEAD</span>}
    </div>
);

const Arrow: React.FC = () => (
    <div className="flex items-center">
        <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
    </div>
);

const NullComponent: React.FC = () => (
    <div className="flex items-center">
         <div className="w-12 h-1 bg-gray-600"></div>
         <div className="w-1 h-8 bg-gray-600"></div>
    </div>
);


// --- PROBLEM GENERATION LOGIC ---

const generateProblem = (): Problem => {
    // Generate a base list
    let list: Node[] = [];
    const size = Math.floor(Math.random() * 2) + 3; // 3 or 4 nodes
    for (let i = 0; i < size; i++) {
        list.push({ id: i, value: Math.floor(Math.random() * 90) + 10, next: i + 1 });
    }
    list[size - 1].next = null;
    
    const operations: Operation[] = ['INSERT_HEAD', 'INSERT_TAIL', 'DELETE'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const value = Math.floor(Math.random() * 90) + 10;

    let problem: Problem;

    switch(operation) {
        case 'INSERT_HEAD':
            problem = {
                operation, value, initialState: [...list],
                finalState: [{id: 100, value, next: 0}, ...list.map(n => ({...n, next: n.next === null ? null : n.next}))],
                steps: [
                    { question: "To insert a new node at the head, what is the first step?", options: ["Point the old head to the new node", "Point the new node's `next` to the current head", "Change the head pointer last"], correctOption: "Point the new node's `next` to the current head" },
                    { question: "After setting the new node's `next` pointer, what is the final step?", options: ["Set the old head's `next` to null", "Update the head pointer to point to the new node", "Nothing, it's done"], correctOption: "Update the head pointer to point to the new node" },
                ]
            };
            // Adjust final state IDs and pointers correctly
            problem.finalState = [{id: 100, value, next: list[0].id}, ...list];
            break;
        case 'INSERT_TAIL':
             problem = {
                operation, value, initialState: [...list],
                finalState: [...list, {id: 100, value, next: null}],
                steps: [
                    { question: "To insert at the tail, what must we find first?", options: ["The head node", "The second node", "The last node (where `next` is null)"], correctOption: "The last node (where `next` is null)" },
                    { question: "Once we find the last node, what do we do?", options: ["Set its `next` pointer to the new node", "Set the new node's `next` to the last node", "Update the head pointer"], correctOption: "Set its `next` pointer to the new node" },
                ]
            };
            // Adjust final state pointers
            const finalTailState = [...list];
            finalTailState[finalTailState.length - 1].next = 100;
            problem.finalState = [...finalTailState, {id: 100, value, next: null}];
            break;
        case 'DELETE':
            const nodeToDeleteIndex = Math.floor(Math.random() * (list.length - 2)) + 1; // Not head or tail
            const nodeToDelete = list[nodeToDeleteIndex];
            const prevNode = list[nodeToDeleteIndex-1];

            problem = {
                operation, value: nodeToDelete.value, initialState: [...list],
                finalState: list.filter(n => n.id !== nodeToDelete.id),
                steps: [
                    { question: `To delete node ${nodeToDelete.value}, which node's pointer must we change?`, options: [`Node ${nodeToDelete.value}`, `The node before it (${prevNode.value})`, `The node after it`], correctOption: `The node before it (${prevNode.value})` },
                    { question: `What should node ${prevNode.value}'s \`next\` pointer now point to?`, options: ["null", `Node ${nodeToDelete.value}`, `The node that ${nodeToDelete.value} was pointing to`], correctOption: `The node that ${nodeToDelete.value} was pointing to` },
                ]
            };
            // Adjust final state pointers
            const finalDeleteState = list.filter(n => n.id !== nodeToDelete.id);
            const finalPrevNode = finalDeleteState.find(n => n.id === prevNode.id);
            if(finalPrevNode) finalPrevNode.next = nodeToDelete.next;
            problem.finalState = finalDeleteState;
            break;
    }
    return problem;
};


const LinkedListActivity: React.FC = () => {
    const [problem, setProblem] = useState<Problem>(generateProblem());
    const [currentStep, setCurrentStep] = useState(0);
    const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string } | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [highlightedNodeId, setHighlightedNodeId] = useState<number | null>(null);
    
    const reset = useCallback(() => {
        setProblem(generateProblem());
        setCurrentStep(0);
        setFeedback(null);
        setIsComplete(false);
        setHighlightedNodeId(null);
    }, []);

    const handleAnswer = (option: string) => {
        if (isComplete) return;

        const correct = option === problem.steps[currentStep].correctOption;
        if (correct) {
            setFeedback({ type: 'correct', message: 'Correct! Proceeding to the next step.' });
            
            setTimeout(() => {
                setFeedback(null);
                if (currentStep < problem.steps.length - 1) {
                    setCurrentStep(currentStep + 1);
                } else {
                    setIsComplete(true);
                }
            }, 1500);
        } else {
            setFeedback({ type: 'incorrect', message: 'Not quite. Think about the order of pointer changes.' });
        }
    };
    
    const getInstruction = () => {
        switch(problem.operation) {
            case 'INSERT_HEAD': return `Insert a new node with value ${problem.value} at the head of the list.`;
            case 'INSERT_TAIL': return `Insert a new node with value ${problem.value} at the tail of the list.`;
            case 'DELETE': return `Delete the node with value ${problem.value} from the list.`;
        }
    }

    return (
        <div className="bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl p-4 sm:p-6 text-center">
            <h3 className="text-4xl font-bold">Interactive Linked List</h3>
            <p className="text-xl text-gray-400 mt-1 mb-6">Master pointer manipulation by solving step-by-step problems.</p>

            <div className="bg-gray-900/50 rounded-lg p-6 min-h-[180px] flex items-center justify-center overflow-x-auto">
                <div className="flex items-center gap-2">
                    {problem.initialState.map((node, index) => (
                        <React.Fragment key={node.id}>
                            <NodeComponent node={node} isHead={index === 0} isHighlighted={node.id === highlightedNodeId} />
                            {node.next !== null ? <Arrow /> : <NullComponent />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="mt-6 bg-gray-900 rounded-lg p-6 min-h-[250px] border border-gray-700">
                {!isComplete ? (
                    <>
                        <p className="text-2xl font-semibold text-white mb-2">Task: {getInstruction()}</p>
                        <p className="text-xl text-cyan-300 mb-4">{problem.steps[currentStep].question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                            {problem.steps[currentStep].options.map(option => (
                                <button
                                    key={option}
                                    onClick={() => handleAnswer(option)}
                                    disabled={!!feedback}
                                    className="p-4 bg-gray-700 rounded-lg text-lg text-left text-gray-200 hover:bg-cyan-800 transition-colors disabled:opacity-70"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                         {feedback && (
                            <div className={`mt-4 text-xl font-bold ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                                {feedback.message}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-green-400 animate-fadeIn">
                        <CheckCircleIcon className="h-16 w-16" />
                        <h4 className="text-3xl font-bold mt-4">Operation Complete!</h4>
                        <p className="text-xl text-gray-300 mt-2">You have successfully manipulated the linked list.</p>
                    </div>
                )}
            </div>

             <div className="mt-6">
                <button
                    onClick={reset}
                    className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform text-xl flex items-center gap-2 mx-auto"
                >
                    <ResetIcon className="w-6 h-6" />
                    New Problem
                </button>
            </div>
        </div>
    );
};

export default LinkedListActivity;