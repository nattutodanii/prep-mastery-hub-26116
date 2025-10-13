export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  selectedExam: string;
  selectedCourse: string;
  subscription: 'freemium' | 'premium';
  subscriptionExpiry?: Date;
}

export interface Exam {
  id: string;
  name: string;
  description: string;
  courses: Course[];
}

export interface Course {
  id: string;
  name: string;
  description: string;
  subjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  units: Unit[];
}

export interface Unit {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  name: string;
  questionsCount: number;
  estimatedTime: number;
  isCompleted: boolean;
}

export interface Question {
  id: string;
  type: 'MCQ' | 'MSQ' | 'NAT' | 'SUB';
  statement: string;
  options?: string[];
  correctAnswers: string[];
  explanation: string;
  marks: number;
  negativeMarks: number;
  partialMarks?: number;
}

export interface Test {
  id: string;
  name: string;
  type: 'chapter-practice' | 'chapter-pyq' | 'mock' | 'pyp' | 'test-series';
  questions: Question[];
  totalTime: number;
  totalMarks: number;
}

export interface TestResult {
  id: string;
  testId: string;
  score: number;
  percentage: number;
  percentile: number;
  rank: number;
  totalStudents: number;
  correct: number;
  incorrect: number;
  skipped: number;
  timeTaken: number;
  answers: Record<string, string | string[]>;
  bookmarkedQuestions: string[];
}

export interface Analytics {
  accuracy: number;
  syllabusCompletion: number;
  mockPercentile: number;
}