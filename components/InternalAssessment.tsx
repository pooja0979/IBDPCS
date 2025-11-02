import React, { useState, useCallback } from 'react';
import { generateIAHelp } from '../services/geminiService';
import Spinner from './Spinner';

const exemplarProjects = [
    {
        title: '"StudySync" Revision Timetable Generator',
        description: 'A desktop application that creates a personalized, balanced revision schedule for students based on their subjects, available time slots, and study preferences. It aims to prevent cramming by distributing study sessions logically over a period.',
        context: 'Object-Oriented Programming (OOP), Algorithmic Thinking, GUI Development (e.g., Python with Tkinter or Java with JavaFX).',
    },
    {
        title: '"Code Snippet Manager" Database',
        description: 'A local web application that allows a user to store, tag, search, and retrieve useful code snippets. It includes a simple user authentication system and uses an SQLite database to manage the data.',
        context: 'Database Management (SQL), Web Development (e.g., Python with Flask), CRUD Operations, User Interface Design.',
    },
    {
        title: '"EcoSim" Predator-Prey Simulation',
        description: 'A simulation that models a simple ecosystem with two or three interacting species (e.g., grass, rabbits, and foxes). The simulation visualizes population changes over time based on predefined rules for breeding, eating, and dying.',
        context: 'Object-Oriented Programming (OOP), Simulation, Data Structures (e.g., 2D arrays for the world), Algorithmic Thinking.',
    }
];

type Criterion = 'A' | 'B' | 'C' | 'D' | 'E';

const criteriaDetails: Record<Criterion, React.ReactNode> = {
    A: (
        <div>
            <h4 className="font-bold text-2xl text-white">Criterion A: Problem Specification (4 marks)</h4>
            <p className="text-lg text-gray-400 mb-4">Official word count: 300 words</p>
            <ul className="list-disc pl-5 space-y-3 text-lg">
                <li><strong>Define the Problem:</strong> Describe a scenario where a client approaches you with a problem that needs a computational solution.</li>
                <li><strong>Rationale & Justification:</strong> Justify why your proposed product and choice of software/technologies are a suitable solution for the problem.</li>
                <li><strong>Success Criteria:</strong> List 8-10 specific, measurable, and testable points that will define the success of your project. These will be evaluated in Criterion E.</li>
            </ul>
        </div>
    ),
    B: (
        <div>
            <h4 className="font-bold text-2xl text-white">Criterion B: Planning (4 marks)</h4>
            <p className="text-lg text-gray-400 mb-4">Official word count: 150 words. (User notes suggest 3-4 pages including diagrams)</p>
            <p className="text-lg text-gray-300 mb-3">Include an index page. Your plan should be specific to your product, not generic. Define stages for your project. Key planning documents include (only use what is applicable):</p>
            <ul className="list-disc pl-5 space-y-2 text-lg">
                <li><strong>Diagrams:</strong> UML, Structure Diagrams, Data Flow Diagrams (DFDs), ER diagrams.</li>
                <li><strong>Design:</strong> Flowcharts, Pseudocode for algorithms.</li>
                <li><strong>Data Structures:</strong> Justify the data structures you plan to use.</li>
                <li><strong>Test Plan:</strong> A plan outlining how you will test for the success criteria.</li>
            </ul>
            <h5 className="font-semibold text-gray-200 mt-4 text-xl">Implementation Stage Planning:</h5>
             <ul className="list-disc pl-5 space-y-2 mt-2 text-lg">
                <li>Plan for meetings with the client to discuss system configuration.</li>
                <li>Plan for resolving potential issues (e.g., synchronization).</li>
                <li>Plan for user training.</li>
             </ul>
        </div>
    ),
    C: (
        <div>
            <h4 className="font-bold text-2xl text-white">Criterion C: System Overview (6 marks)</h4>
            <p className="text-lg text-gray-400 mb-4">Official word count: 150 words</p>
            <p className="text-lg text-gray-300 mb-3">This criterion assesses your expertise in using algorithms and data structures. Include an index page.</p>
            <ul className="list-disc pl-5 space-y-3 text-lg">
                <li><strong>List of Techniques:</strong> Clearly list the programming techniques used.</li>
                <li><strong>External Libraries:</strong> List any external libraries/packages, where they are used, and their purpose.</li>
                <li><strong>Technique Justification:</strong> For each key technique (e.g., a 2D array, a specific sorting algorithm, a user-defined function), explain it once and then justify its use in 4-5 lines. You can then mention other sections where the same technique is re-used without re-explaining it.</li>
                <li><strong>Code & Output:</strong> Include screenshots of the final output and the corresponding code snippet that produced it.</li>
                <li><strong>Evidence of Ingenuity:</strong> Show creativity or complexity. <br/><em>Example: "To add an extra layer of ingenuity, I implemented a feature that exports the final grade reports to a PDF using the ReportLab library. This allows for a polished output that meets the client's need for printable reports."</em></li>
            </ul>
        </div>
    ),
    D: (
        <div>
            <h4 className="font-bold text-2xl text-white">Criterion D: Development (12 marks)</h4>
            <p className="text-lg text-gray-400 mb-4">Official word count: 1,000 words</p>
            <p className="text-lg text-gray-300 mb-3">This criterion assesses the functionality of your product and the quality of your code.</p>
            <ul className="list-disc pl-5 space-y-3 text-lg">
                <li><strong>Video Demonstration (under 7 minutes):</strong> Your video must demonstrate the system's functionality, clearly referring to the success criteria from Criterion A. Show key features like:
                    <ul className="list-disc pl-6 mt-1">
                        <li>Logging in</li>
                        <li>Entering data</li>
                        <li>Automatic calculations</li>
                        <li>Exporting reports (e.g., to PDF)</li>
                        <li>Show where files and databases are being saved.</li>
                    </ul>
                </li>
                 <li><strong>Full Code Listing:</strong> Your complete, commented source code must be included in the appendix for reference. The comments should explain key sections of the logic.</li>
            </ul>
        </div>
    ),
    E: (
        <div>
            <h4 className="font-bold text-2xl text-white">Criterion E: Evaluation (4 marks)</h4>
            <p className="text-lg text-gray-400 mb-4">Official word count: 400 words. (User notes suggest 6 marks, but official guide is 4)</p>
            <p className="text-lg text-gray-300 mb-3">Evaluate your final product and process.</p>
            <ul className="list-disc pl-5 space-y-3 text-lg">
                <li><strong>Evaluation Against Success Criteria:</strong> Directly address each success criterion from Criterion A, stating whether it was met, partially met, or not met, and provide evidence.</li>
                <li><strong>Client Feedback:</strong> Include feedback from your client. <br/><em>Example: "The client provided feedback via a questionnaire (Appendix – Client Interview 2). He stated that the system greatly reduced the time spent calculating grades and found the interface easy to use."</em></li>
                <li><strong>Improvements Suggested:</strong> Based on the project and feedback, suggest two future improvements. <br/><em>Example: "1. Adding a feature to allow bulk import of student data from a CSV file. 2. Implementing a feature to track students' performance over multiple terms."</em></li>
            </ul>
        </div>
    ),
};


const InternalAssessment: React.FC = () => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<'ideas' | 'plan' | null>(null);
    const [selectedCriterion, setSelectedCriterion] = useState<Criterion | null>(null);

    const handleGenerate = useCallback(async (helpType: 'ideas' | 'plan') => {
        setIsLoading(true);
        setError(null);
        setContent('');
        setActiveTool(helpType);
        try {
            const result = await generateIAHelp(helpType);
            setContent(result);
        } catch (err) {
            setError('Failed to generate content. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const renderCriterionButton = (criterion: Criterion, label: string) => {
        const isActive = selectedCriterion === criterion;
        return (
             <button
                onClick={() => setSelectedCriterion(criterion)}
                className={`flex-1 px-6 py-5 text-lg sm:text-xl font-bold rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                    isActive
                        ? 'bg-cyan-600 text-white ring-cyan-500'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
                {label}
            </button>
        )
    };


    return (
        <div className="space-y-10">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 md:p-8">
                <h2 className="text-5xl font-bold text-center">Internal Assessment Helper</h2>
                <p className="text-xl text-gray-400 mt-2 text-center max-w-2xl mx-auto">Get help with brainstorming, planning, and structuring your IB Computer Science IA project.</p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 my-8">
                    <button 
                        onClick={() => handleGenerate('ideas')} 
                        disabled={isLoading} 
                        className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xl"
                    >
                       {isLoading && activeTool === 'ideas' ? <Spinner/> : null}
                        Generate Project Ideas
                    </button>
                    <button 
                        onClick={() => handleGenerate('plan')} 
                        disabled={isLoading} 
                        className="px-8 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xl"
                    >
                        {isLoading && activeTool === 'plan' ? <Spinner/> : null}
                        Outline Project Plan
                    </button>
                </div>
                
                <div className="mt-6 bg-gray-900 p-6 rounded-lg min-h-[300px] border border-gray-700">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Spinner />
                            <p className="mt-4 text-xl">Generating content...</p>
                        </div>
                    )}
                    {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg text-lg">{error}</div>}
                    {!isLoading && !error && content && (
                        <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} className="whitespace-pre-wrap text-gray-300 leading-relaxed prose prose-invert prose-p:text-lg prose-headings:text-white prose-strong:text-cyan-400 prose-ul:list-disc prose-li:text-lg"></div>
                    )}
                    {!isLoading && !error && !content && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.375 3.375 0 0014 18.442V19.5a.75.75 0 01-1.5 0v-1.058a3.375 3.375 0 00-1.452-2.894l-.548-.547z" />
                            </svg>
                            <h3 className="text-2xl font-semibold mt-4">IA Assistant</h3>
                            <p className="mt-1 text-center text-lg">Select an AI-powered option above to get started.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 md:p-8">
                <h3 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">IA Requirements Summary</h3>
                 <p className="text-xl text-gray-400 mt-2 text-center max-w-2xl mx-auto">Click on each criterion to see a detailed breakdown. HL contributes <strong>20%</strong> and SL contributes <strong>30%</strong> to the total mark.</p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 bg-gray-900/50 p-2 rounded-xl">
                    {renderCriterionButton('A', 'Crit. A: Spec')}
                    {renderCriterionButton('B', 'Crit. B: Plan')}
                    {renderCriterionButton('C', 'Crit. C: Overview')}
                    {renderCriterionButton('D', 'Crit. D: Dev')}
                    {renderCriterionButton('E', 'Crit. E: Eval')}
                </div>
                <div className="mt-6 bg-gray-900/50 p-6 rounded-lg min-h-[150px] border border-gray-700">
                    {selectedCriterion ? (
                        <div className="text-gray-300 prose prose-invert max-w-none prose-p:text-lg prose-headings:text-white prose-strong:text-cyan-400 prose-ul:list-disc prose-li:text-lg">
                            {criteriaDetails[selectedCriterion]}
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full text-gray-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <p className="mt-3 text-center text-lg">Select a criterion button above to view its detailed requirements.</p>
                        </div>
                    )}
                </div>
            </div>

             <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 md:p-8">
                <h3 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Submission & Formatting Guidelines</h3>
                 <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
                    <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                        <h4 className="font-bold text-2xl text-white">Documentation Formatting</h4>
                        <ul className="list-disc pl-5 space-y-2 mt-2 text-lg">
                            <li><strong>Font:</strong> Use fonts like Arial, size 11 minimum.</li>
                            <li><strong>Spacing:</strong> Single or greater line spacing.</li>
                            <li><strong>Pages:</strong> Must be numbered.</li>
                            <li><strong>Orientation:</strong> Portrait, unless a landscape graph/illustration is necessary.</li>
                             <li><strong>Anonymity:</strong> Do not include your name, school name, or session number anywhere in the document.</li>
                        </ul>
                    </div>
                     <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                        <h4 className="font-bold text-2xl text-white">File Structure &amp; Sizes</h4>
                        <ul className="list-disc pl-5 space-y-2 mt-2 text-lg">
                            <li><strong>Cover Page:</strong> A cover page in HTML format.</li>
                            <li><strong>Folders:</strong>
                                <ul className="list-disc pl-6 mt-1">
                                    <li>A <code className="text-xs bg-gray-700 p-1 rounded">"Product"</code> folder containing the final product.</li>
                                    <li>A <code className="text-xs bg-gray-700 p-1 rounded">"Documentation"</code> folder with the PDF report.</li>
                                </ul>
                            </li>
                            <li><strong>Screencast:</strong> A video file demonstrating the product's function.</li>
                            <li><strong>File Size:</strong> The entire submission (zipped) must not exceed <strong>750 MB</strong>. PDFs should be A4/letter size.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 md:p-8">
                <h3 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">Exemplar Projects</h3>
                <p className="text-xl text-gray-400 mt-2 text-center max-w-2xl mx-auto">Use these examples as inspiration for your own project.</p>
                <div className="mt-8 grid md:grid-cols-1 lg:grid-cols-3 gap-6">
                    {exemplarProjects.map((project, index) => (
                        <div key={index} className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 hover:border-emerald-500 transition-colors">
                            <h4 className="font-bold text-2xl text-white">{project.title}</h4>
                            <p className="text-lg text-gray-400 mt-2">{project.description}</p>
                            <p className="text-sm text-emerald-300 mt-4"><strong className="font-semibold">Computational Context:</strong> {project.context}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default InternalAssessment;