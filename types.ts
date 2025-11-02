import type React from 'react';

export interface SubTopic {
  id: string;
  title: string;
  prompt: string;
}

export interface Topic {
  id:string;
  title: string;
  description: string;
  Icon: React.FC<{ className?: string }>;
  subTopics: SubTopic[];
  color: string;
}

export type QuizType = 'multiple-choice' | 'true-false' | 'short-answer' | 'mixed';

export interface QuizQuestion {
  type: QuizType;
  question: string;
  options?: string[]; // Optional for short-answer questions
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export interface Resource {
    id: string;
    title: string;
    url: string;
}

export interface WorksheetSubQuestion {
  prompt: string;
  marks: number;
  modelAnswer: string;
}

export interface WorksheetQuestion {
  title: string;
  parts: WorksheetSubQuestion[];
}

export interface Worksheet {
  title: string;
  questions: WorksheetQuestion[];
}

// Types for Interactive Learning Modules
export interface KeyTerm {
  term: string;
  definition: string;
}

export interface ThinkingRoutine {
  name: string;
  description: string;
  prompt: string;
}

export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'code' | 'list' | 'quote';
  content: string;
}

export interface LearningModule {
  coreConcept: ContentBlock[];
  keyVocabulary: KeyTerm[];
  thinkingRoutine: ThinkingRoutine;
  realWorldLink: string;
}

// New types for Lesson Planner
export interface LessonActivity {
    title: string;
    description: string;
    duration: number; // in minutes
    interactiveSuggestion: string;
}

export interface LessonPlan {
    title: string;
    learningObjectives: string[];
    activities: LessonActivity[];
}