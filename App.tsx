import React, { useState } from 'react';
import SyllabusDashboard from './components/SyllabusDashboard';
import Quizzes from './components/Quizzes';
import InternalAssessment from './components/InternalAssessment';
import Resources from './components/Resources';
import Navbar from './components/Navbar';
import Worksheets from './components/Worksheets';
import LessonPlanner from './components/LessonPlanner';

export type View = 'syllabus' | 'quizzes' | 'ia' | 'resources' | 'worksheets' | 'lessonPlanner';

const App: React.FC = () => {
  const [view, setView] = useState<View>('syllabus');

  const renderView = () => {
    switch (view) {
      case 'syllabus':
        return <SyllabusDashboard />;
      case 'quizzes':
        return <Quizzes />;
      case 'ia':
        return <InternalAssessment />;
      case 'resources':
        return <Resources />;
      case 'worksheets':
        return <Worksheets />;
      case 'lessonPlanner':
        return <LessonPlanner />;
      default:
        return <SyllabusDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 sm:p-8 lg:p-10">
      <header className="text-center mb-8">
        <h1 className="text-6xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
          IBDP CS 
        </h1>
        <p className="mt-2 text-2xl text-gray-400">Learning and Revision Hub for IB Computer Science</p>
      </header>
      <Navbar currentView={view} setView={setView} />
      <main className="max-w-7xl mx-auto mt-8">
        {renderView()}
      </main>
      <footer className="text-center mt-12 text-gray-500 text-lg">
        <p>IBDP Computer Science(new curriculum)</p>
        <p className="mt-1">&copy; Pooja Arora, Computing Teacher at The British International School Budapest</p>
      </footer>
    </div>
  );
};

export default App;