import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ResetIcon, CheckCircleIcon, XCircleIcon } from './Icons';

// --- DATA STRUCTURES & TYPES ---
interface TreeNode {
    value: number;
    left: TreeNode | null;
    right: TreeNode | null;
    // For rendering
    id: string; // unique ID for key prop
    level: number;
    x: number; // horizontal position percentage (0-100)
}
type Operation = 'INSERT' | 'SEARCH';
interface Problem {
    type: Operation;
    value: number; // value to insert or search for
    initialTree: TreeNode | null;
    correctPath: number[]; // sequence of node values
    valueExists: boolean;
}

// --- UTILITY FUNCTIONS ---
const insertNode = (node: TreeNode | null, value: number, level = 0, x = 50, xOffset = 30): TreeNode => {
    if (node === null) {
        return { value, left: null, right: null, id: `node-${value}-${level}`, level, x };
    }
    if (value < node.value) {
        node.left = insertNode(node.left, value, level + 1, x - xOffset, xOffset / 1.7);
    } else if (value > node.value) {
        node.right = insertNode(node.right, value, level + 1, x + xOffset, xOffset / 1.7);
    }
    return node;
};

const getPath = (tree: TreeNode | null, value: number): number[] => {
    const path: number[] = [];
    let current = tree;
    while (current) {
        path.push(current.value);
        if (value === current.value) break;
        if (value < current.value) {
            current = current.left;
        } else {
            current = current.right;
        }
    }
    return path;
};

const generateProblem = (): Problem => {
    let tree: TreeNode | null = null;
    const values = new Set<number>();
    while (values.size < 7) {
        values.add(Math.floor(Math.random() * 90) + 10);
    }
    Array.from(values).forEach(v => {
        tree = insertNode(tree, v);
    });

    const type: Operation = Math.random() > 0.5 ? 'INSERT' : 'SEARCH';
    let value: number;
    let valueExists = false;

    if (type === 'INSERT') {
        do {
            value = Math.floor(Math.random() * 90) + 10;
        } while (values.has(value));
    } else { // SEARCH
        if (Math.random() > 0.3) { // 70% chance to search for existing value
            value = Array.from(values)[Math.floor(Math.random() * values.size)];
            valueExists = true;
        } else {
            do {
                value = Math.floor(Math.random() * 90) + 10;
            } while (values.has(value));
        }
    }
    const correctPath = getPath(tree, value);
    return { type, value, initialTree: tree, correctPath, valueExists };
};

// --- VISUAL COMPONENTS ---

const NodeDisplay: React.FC<{ node: TreeNode; isRoot: boolean; isHighlighted?: boolean; isUserPath?: boolean; onClick?: () => void }> = ({ node, isRoot, isHighlighted, isUserPath, onClick }) => (
    <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 flex flex-col items-center"
        style={{ top: `${node.level * 110 + 60}px`, left: `${node.x}%` }}
    >
        <button
            onClick={onClick}
            disabled={!onClick}
            className={`flex items-center justify-center w-20 h-20 rounded-full shadow-lg border-2 transition-all duration-300 z-10
                ${isHighlighted ? 'bg-cyan-500 border-cyan-300 scale-110' : ''}
                ${isUserPath ? 'bg-fuchsia-600 border-fuchsia-400' : ''}
                ${!isHighlighted && !isUserPath ? 'bg-gray-700 border-gray-600' : ''}
                ${onClick ? 'cursor-pointer hover:border-white' : 'cursor-default'}
            `}
        >
            <span className="text-3xl font-bold text-white">{node.value}</span>
        </button>
        {isRoot && <span className="mt-2 text-sm font-semibold text-cyan-400">ROOT</span>}
    </div>
);


const TreeDisplay: React.FC<{
    tree: TreeNode | null;
    containerWidth: number;
    highlightedValue?: number | null;
    userPath: number[];
    onNodeClick?: (value: number) => void;
}> = ({ tree, containerWidth, highlightedValue, userPath, onNodeClick }) => {
    if (!tree || !containerWidth) return null;

    const allNodes: TreeNode[] = [];
    const queue: (TreeNode | null)[] = [tree];
    while (queue.length > 0) {
        const node = queue.shift();
        if (node) {
            allNodes.push(node);
            queue.push(node.left);
            queue.push(node.right);
        }
    }

    const vSpace = 110;
    const yOffset = 60;

    return (
        <div className="absolute inset-0">
            <svg width="100%" height="500px" className="absolute inset-0">
                {allNodes.map(node => {
                    const children = [node.left, node.right].filter(Boolean) as TreeNode[];
                    return children.map(child => {
                        const parentXpx = (node.x / 100) * containerWidth;
                        const parentYpx = node.level * vSpace + yOffset;
                        const childXpx = (child.x / 100) * containerWidth;
                        const childYpx = child.level * vSpace + yOffset;
                        
                        return (
                            <line
                                key={`${node.id}-${child.id}`}
                                x1={parentXpx}
                                y1={parentYpx}
                                x2={childXpx}
                                y2={childYpx}
                                stroke="#4b5563"
                                strokeWidth="3"
                            />
                        );
                    });
                })}
            </svg>
            {allNodes.map((node) => (
                <NodeDisplay
                    key={node.id}
                    node={node}
                    isRoot={node.level === 0}
                    isHighlighted={node.value === highlightedValue}
                    isUserPath={userPath.includes(node.value)}
                    onClick={onNodeClick ? () => onNodeClick(node.value) : undefined}
                />
            ))}
        </div>
    );
};


// --- MAIN ACTIVITY COMPONENT ---
const BinarySearchTreeActivity: React.FC = () => {
    const [problem, setProblem] = useState<Problem>(generateProblem());
    const [currentPathIndex, setCurrentPathIndex] = useState(0);
    const [userPath, setUserPath] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string } | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        // Timeout to allow initial render to calculate width
        setTimeout(updateWidth, 0);
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [problem]); // Re-calculate on new problem


    const reset = useCallback(() => {
        setProblem(generateProblem());
        setCurrentPathIndex(0);
        setUserPath([]);
        setFeedback(null);
        setIsComplete(false);
    }, []);

    const handleInsertAnswer = (answer: 'left' | 'right') => {
        if (isComplete) return;

        const currentNodeValue = problem.correctPath[currentPathIndex];
        const correctMove = problem.value < currentNodeValue ? 'left' : 'right';

        if (answer === correctMove) {
            setFeedback({ type: 'correct', message: 'Correct!' });
            setTimeout(() => {
                setFeedback(null);
                if (currentPathIndex < problem.correctPath.length - 1) {
                    setCurrentPathIndex(prev => prev + 1);
                } else {
                    setIsComplete(true);
                    const newTree = insertNode(problem.initialTree, problem.value);
                    setProblem(p => ({...p, initialTree: newTree }));
                }
            }, 1000);
        } else {
            setFeedback({ type: 'incorrect', message: 'Incorrect. Try again.' });
        }
    };

    const handleNodeClick = (value: number) => {
        if (isComplete) return;
        setUserPath(path => {
            if (path.includes(value)) return path.filter(v => v !== value);
            return [...path, value];
        });
    };

    const checkSearchPath = () => {
        if (isComplete) return;
        const isCorrect = userPath.length === problem.correctPath.length && userPath.every((val, i) => val === problem.correctPath[i]);
        if (isCorrect) {
            const message = problem.valueExists ? `Correct path! Value ${problem.value} was found.` : `Correct path! Value ${problem.value} is not in the tree.`;
            setFeedback({ type: 'correct', message });
        } else {
            setFeedback({ type: 'incorrect', message: `Incorrect path. The correct path was: ${problem.correctPath.join(' -> ')}` });
        }
        setIsComplete(true);
    };

    const instructionText = useMemo(() => {
        if(isComplete) {
            return feedback?.message || "Task Complete!";
        }
        if (problem.type === 'INSERT') {
            const currentNode = problem.correctPath[currentPathIndex];
            return `To insert ${problem.value}, from node ${currentNode}, should we go Left or Right?`;
        }
        return `Click the nodes to trace the search path for value ${problem.value}, then check your answer.`;
    }, [problem, currentPathIndex, isComplete, feedback]);

    return (
        <div className="bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl p-4 sm:p-6 text-center">
            <h3 className="text-4xl font-bold">Interactive Binary Search Tree</h3>
            <p className="text-xl text-gray-400 mt-1 mb-6">Practice insertion and search operations.</p>

            <div ref={containerRef} className="relative bg-gray-900/50 rounded-lg min-h-[500px] w-full overflow-hidden">
                <TreeDisplay
                    tree={problem.initialTree}
                    containerWidth={containerWidth}
                    highlightedValue={problem.type === 'INSERT' && !isComplete ? problem.correctPath[currentPathIndex] : null}
                    userPath={userPath}
                    onNodeClick={problem.type === 'SEARCH' ? handleNodeClick : undefined}
                />
            </div>

            <div className="mt-6 bg-gray-900 rounded-lg p-6 min-h-[150px] border border-gray-700 flex flex-col justify-center">
                <p className="text-2xl font-semibold text-white mb-4">{instructionText}</p>
                {!isComplete && problem.type === 'INSERT' && (
                    <div className="flex justify-center gap-4">
                        <button onClick={() => handleInsertAnswer('left')} className="px-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-lg shadow-lg text-lg">Go Left</button>
                        <button onClick={() => handleInsertAnswer('right')} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg text-lg">Go Right</button>
                    </div>
                )}
                 {!isComplete && problem.type === 'SEARCH' && (
                    <div className="flex justify-center gap-4">
                        <button onClick={checkSearchPath} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg text-lg">Check Path</button>
                    </div>
                )}
                 {isComplete && feedback && (
                    <div className={`mt-2 text-xl font-bold ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                        {feedback.type === 'correct' ? <CheckCircleIcon className="h-8 w-8 mx-auto"/> : <XCircleIcon className="h-8 w-8 mx-auto"/>}
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

export default BinarySearchTreeActivity;
