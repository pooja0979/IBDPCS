import React from 'react';
import type { View } from '../App';

interface NavbarProps {
  currentView: View;
  setView: (view: View) => void;
}

const NavItem: React.FC<{ title: string; viewName: View; currentView: View; setView: (view: View) => void; }> = ({ title, viewName, currentView, setView }) => {
  const isActive = currentView === viewName;
  return (
    <button
      onClick={() => setView(viewName)}
      className={`px-5 py-3 sm:px-6 rounded-md text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
        isActive
          ? 'bg-cyan-600 text-white shadow-md'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {title}
    </button>
  );
};

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  return (
    <nav className="max-w-3xl mx-auto bg-gray-800/50 backdrop-blur-sm p-1.5 rounded-lg flex justify-center items-center flex-wrap gap-1 sm:gap-2 border border-gray-700">
      <NavItem title="Syllabus" viewName="syllabus" currentView={currentView} setView={setView} />
      <NavItem title="Lesson Planner" viewName="lessonPlanner" currentView={currentView} setView={setView} />
      <NavItem title="Worksheets" viewName="worksheets" currentView={currentView} setView={setView} />
      <NavItem title="Quizzes" viewName="quizzes" currentView={currentView} setView={setView} />
      <NavItem title="IA Helper" viewName="ia" currentView={currentView} setView={setView} />
      <NavItem title="Resources" viewName="resources" currentView={currentView} setView={setView} />
    </nav>
  );
};

export default Navbar;