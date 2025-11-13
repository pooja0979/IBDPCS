import React, { useState } from 'react';
import { LightbulbOnIcon, LightbulbOffIcon } from './Icons';

const OnOffSwitch: React.FC<{ on: boolean; onToggle: () => void }> = ({ on, onToggle }) => {
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-8">
                <div className="text-center">
                    <p className={`transition-opacity duration-300 text-3xl font-bold ${on ? 'text-gray-500' : 'text-white'}`}>We represent OFF with a</p>
                    <p className={`transition-opacity duration-300 text-8xl font-mono font-bold ${on ? 'text-gray-600' : 'text-cyan-300'}`}>0</p>
                </div>
                <button
                    onClick={onToggle}
                    className={`relative w-48 h-24 rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 ${on ? 'bg-cyan-500' : 'bg-gray-700'}`}
                    aria-pressed={on}
                >
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-4xl font-bold transition-opacity ${on ? 'opacity-50' : 'opacity-100 text-white'}`}>OFF</span>
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-4xl font-bold transition-opacity ${on ? 'opacity-100 text-white' : 'opacity-50'}`}>ON</span>
                    <span className={`absolute top-2 left-2 w-20 h-20 bg-white rounded-full shadow-lg transform transition-transform duration-300 ease-in-out ${on ? 'translate-x-[92px]' : ''}`}></span>
                </button>
                 <div className="text-center">
                    <p className={`transition-opacity duration-300 text-3xl font-bold ${!on ? 'text-gray-500' : 'text-white'}`}>We represent ON with a</p>
                    <p className={`transition-opacity duration-300 text-8xl font-mono font-bold ${!on ? 'text-gray-600' : 'text-cyan-300'}`}>1</p>
                </div>
            </div>
        </div>
    );
};

const BinaryLightSwitch: React.FC<{ on: boolean; onToggle: () => void }> = ({ on, onToggle }) => {
    return (
        <div className="flex flex-col items-center gap-4">
            {on ? <LightbulbOnIcon className="w-24 h-24" /> : <LightbulbOffIcon className="w-24 h-24" />}
             <button
                onClick={onToggle}
                className={`relative w-28 h-14 rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 ${on ? 'bg-cyan-600' : 'bg-gray-600'}`}
                aria-pressed={on}
            >
                <span className={`absolute top-2 left-2 w-10 h-10 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${on ? 'translate-x-14' : ''}`}></span>
            </button>
        </div>
    )
}

const DecimalDial = () => (
    <div className="relative w-48 h-48">
        <svg viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="95" stroke="#4b5563" strokeWidth="4" fill="none" />
            <line x1="100" y1="100" x2="35" y2="155" stroke="white" strokeWidth="5" strokeLinecap="round" />
            {[...Array(10)].map((_, i) => {
                const angle = (i / 10) * 360 - 90;
                const x = 100 + 80 * Math.cos(angle * Math.PI / 180);
                const y = 100 + 80 * Math.sin(angle * Math.PI / 180);
                return <text key={i} x={x} y={y} dy="0.35em" textAnchor="middle" fill="white" fontSize="20" className="font-mono">{i}</text>
            })}
        </svg>
    </div>
);

const Page1: React.FC<{ onNext: () => void }> = ({ onNext }) => {
    const [isOn, setIsOn] = useState(false);
    return (
         <div key="page1" className="animate-contentFadeIn">
            <h3 className="text-4xl font-bold text-cyan-300 text-center">1. Why do Computers Talk in 0s and 1s?</h3>
            <div className="mt-6 text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto text-center space-y-4">
                <p>Have you ever wondered why computers don't just use numbers like we do (0, 1, 2...9)? The answer is surprisingly simple: <strong className="text-white">electricity!</strong></p>
                <p>A computer is made of billions of tiny electronic switches. Each switch can either be <strong className="text-white">ON</strong> (letting electricity flow) or <strong className="text-white">OFF</strong> (blocking it).</p>
            </div>
            <div className="my-10 bg-gray-800/50 border border-gray-700 rounded-xl p-8 flex justify-center items-center">
                <OnOffSwitch on={isOn} onToggle={() => setIsOn(!isOn)} />
            </div>
            <div className="mt-6 text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto text-center">
                 <p>This two-state system is called <strong className="text-white">Binary</strong>. It's the simplest, most reliable way for a machine to understand instructions. There's no confusion—it's either ON or OFF. Click the switch above to see it in action!</p>
            </div>
            <div className="mt-10 text-center">
                <button onClick={onNext} className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-colors text-lg">
                    Next: Why not our numbers? &rarr;
                </button>
            </div>
        </div>
    );
};

const Page2: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [isOn, setIsOn] = useState(false);
    return (
         <div key="page2" className="animate-contentFadeIn">
            <h3 className="text-4xl font-bold text-cyan-300 text-center">2. But Why Not Our Numbers (Decimal)?</h3>
            <div className="mt-6 text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto text-center">
                 <p>That's a great question! Our number system, called Decimal or Base-10, uses ten different digits (0-9). For a computer to use decimal, it would need a switch with ten different states. Imagine how tricky that would be!</p>
            </div>

            <div className="mt-10 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col items-center text-center">
                    <h4 className="text-3xl font-bold text-white">Decimal (Base-10)</h4>
                    <p className="mt-2 text-lg text-gray-400 min-h-[100px]">Imagine a switch with 10 levels of brightness. It's complex and easy to make a mistake. Is it level 7 or 8?</p>
                    <DecimalDial />
                    <p className="mt-4 text-lg text-rose-400 font-semibold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Complex & Error-Prone
                    </p>
                </div>
                 <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col items-center text-center">
                    <h4 className="text-3xl font-bold text-white">Binary (Base-2)</h4>
                    <p className="mt-2 text-lg text-gray-400 min-h-[100px]">Now, picture a simple light switch. It's either completely ON or completely OFF. <strong className="text-white">Click the switch below</strong> to see for yourself!</p>
                    <BinaryLightSwitch on={isOn} onToggle={() => setIsOn(!isOn)} />
                    <p className="mt-4 text-lg text-emerald-400 font-semibold flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Simple & Reliable
                    </p>
                </div>
            </div>
             <div className="mt-10 text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto text-center">
                <p>Binary is just more reliable for a machine. Simple ON/OFF is much easier to build and understand than ten different "levels" of on.</p>
            </div>
             <div className="mt-10 text-center">
                <button onClick={onBack} className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg shadow-lg hover:bg-gray-500 transition-colors text-lg">
                    &larr; Back to Page 1
                </button>
            </div>
        </div>
    );
};

const BinaryAdventure: React.FC = () => {
    const [page, setPage] = useState(1);

    return (
        <div className="bg-gray-900/50 border-2 border-dashed border-gray-700 rounded-xl p-6 sm:p-8">
            {page === 1 && <Page1 onNext={() => setPage(2)} />}
            {page === 2 && <Page2 onBack={() => setPage(1)} />}
        </div>
    );
};

export default BinaryAdventure;
