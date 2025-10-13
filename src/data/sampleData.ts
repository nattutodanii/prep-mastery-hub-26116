import { Exam, Question, Test, TestResult, Analytics } from '@/types';

export const sampleExams: Exam[] = [
  {
    id: 'isi',
    name: 'ISI',
    description: 'Indian Statistical Institute Admission Test',
    courses: [
      {
        id: 'mstat',
        name: 'Master of Statistics (M.Stat.)',
        description: 'Advanced statistical methods and applications',
        subjects: [
          {
            id: 'math',
            name: 'Mathematics',
            units: [
              {
                id: 'algebra',
                name: 'Algebra',
                chapters: [
                  { id: 'sequences', name: 'Sequences & Series', questionsCount: 25, estimatedTime: 45, isCompleted: true },
                  { id: 'progressions', name: 'Arithmetic Progressions', questionsCount: 30, estimatedTime: 50, isCompleted: false },
                  { id: 'geometric', name: 'Geometric Progressions', questionsCount: 28, estimatedTime: 48, isCompleted: false }
                ]
              },
              {
                id: 'calculus',
                name: 'Calculus',
                chapters: [
                  { id: 'limits', name: 'Limits and Continuity', questionsCount: 35, estimatedTime: 60, isCompleted: false },
                  { id: 'derivatives', name: 'Derivatives', questionsCount: 40, estimatedTime: 70, isCompleted: false }
                ]
              }
            ]
          },
          {
            id: 'statistics',
            name: 'Statistics',
            units: [
              {
                id: 'probability',
                name: 'Probability',
                chapters: [
                  { id: 'basic-prob', name: 'Basic Probability', questionsCount: 30, estimatedTime: 55, isCompleted: false }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'cmi',
    name: 'CMI',
    description: 'Chennai Mathematical Institute Entrance Exam',
    courses: [
      {
        id: 'msc-math',
        name: 'MSc in Mathematics',
        description: 'Advanced mathematics program',
        subjects: [
          {
            id: 'math',
            name: 'Mathematics',
            units: [
              {
                id: 'algebra',
                name: 'Algebra',
                chapters: [
                  { id: 'linear-algebra', name: 'Linear Algebra', questionsCount: 40, estimatedTime: 75, isCompleted: false }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'msc-cs',
        name: 'MSc in Computer Science',
        description: 'Computer science and programming',
        subjects: []
      },
      {
        id: 'msc-ds',
        name: 'MSc in Data Science',
        description: 'Data analysis and machine learning',
        subjects: []
      }
    ]
  },
  {
    id: 'iit-jam',
    name: 'IIT JAM',
    description: 'Joint Admission Test for M.Sc.',
    courses: [
      { id: 'ma', name: 'Mathematics (MA)', description: 'Pure and applied mathematics', subjects: [] },
      { id: 'ms', name: 'Mathematical Statistics (MS)', description: 'Statistics and probability', subjects: [] },
      { id: 'ph', name: 'Physics (PH)', description: 'Physics concepts and applications', subjects: [] },
      { id: 'cy', name: 'Chemistry (CY)', description: 'Chemical principles and reactions', subjects: [] },
      { id: 'bt', name: 'Biotechnology (BT)', description: 'Biological technology applications', subjects: [] },
      { id: 'gg', name: 'Geology (GG)', description: 'Earth sciences and geology', subjects: [] },
      { id: 'en', name: 'Economics (EN)', description: 'Economic theory and applications', subjects: [] }
    ]
  },
  {
    id: 'mba',
    name: 'MBA',
    description: 'Master of Business Administration',
    courses: [
      {
        id: 'cat',
        name: 'CAT',
        description: 'Common Admission Test',
        subjects: []
      }
    ]
  }
];

export const sampleQuestions: Question[] = [
  {
    id: 'q1',
    type: 'MCQ',
    statement: 'What is the sum of the first 10 terms of the arithmetic progression 2, 5, 8, 11, ...?',
    options: ['155', '170', '185', '200'],
    correctAnswers: ['155'],
    explanation: 'Using the formula S_n = n/2[2a + (n-1)d], where a = 2, d = 3, n = 10. S_10 = 10/2[2(2) + (10-1)3] = 5[4 + 27] = 5 × 31 = 155',
    marks: 4,
    negativeMarks: -1
  },
  {
    id: 'q2',
    type: 'MSQ',
    statement: 'Which of the following sequences are arithmetic progressions?',
    options: ['2, 4, 6, 8, ...', '1, 4, 9, 16, ...', '3, 7, 11, 15, ...', '5, 5, 5, 5, ...'],
    correctAnswers: ['2, 4, 6, 8, ...', '3, 7, 11, 15, ...', '5, 5, 5, 5, ...'],
    explanation: 'An arithmetic progression has a constant common difference. Options 1, 3, and 4 have constant differences of 2, 4, and 0 respectively.',
    marks: 4,
    negativeMarks: -1,
    partialMarks: 1
  },
  {
    id: 'q3',
    type: 'NAT',
    statement: 'Find the 15th term of the arithmetic progression 7, 12, 17, 22, ...',
    correctAnswers: ['77'],
    explanation: 'Using a_n = a + (n-1)d, where a = 7, d = 5, n = 15. a_15 = 7 + (15-1)×5 = 7 + 70 = 77',
    marks: 4,
    negativeMarks: 0
  },
  {
    id: 'q4',
    type: 'SUB',
    statement: 'Prove that the sum of first n odd natural numbers is n².',
    correctAnswers: ['Mathematical Induction or Direct Formula'],
    explanation: 'The first n odd numbers are 1, 3, 5, ..., (2n-1). This forms an AP with a=1, d=2. Sum = n/2[2(1) + (n-1)2] = n/2[2 + 2n - 2] = n²',
    marks: 6,
    negativeMarks: 0
  }
];

export const sampleTests: Test[] = [
  {
    id: 'test1',
    name: 'Arithmetic Progressions - Practice',
    type: 'chapter-practice',
    questions: sampleQuestions,
    totalTime: 60,
    totalMarks: 18
  },
  {
    id: 'mock1',
    name: 'Mock Test 1',
    type: 'mock',
    questions: sampleQuestions,
    totalTime: 180,
    totalMarks: 72
  }
];

export const sampleAnalytics: Analytics = {
  accuracy: 85,
  syllabusCompletion: 72,
  mockPercentile: 78
};

export const sampleTestResult: TestResult = {
  id: 'result1',
  testId: 'test1',
  score: 16,
  percentage: 89,
  percentile: 85,
  rank: 12,
  totalStudents: 150,
  correct: 4,
  incorrect: 1,
  skipped: 0,
  timeTaken: 45,
  answers: {
    'q1': '155',
    'q2': ['2, 4, 6, 8, ...', '3, 7, 11, 15, ...'],
    'q3': '77',
    'q4': 'Attempted'
  },
  bookmarkedQuestions: ['q2']
};

export const subscriptionPlans = [
  {
    id: '1-month',
    name: '1 Month',
    originalPrice: 249,
    discountedPrice: 174,
    discount: 30,
    features: ['Access to all practice tests', 'Chapter-wise PYQs', 'Mock tests', 'Detailed solutions']
  },
  {
    id: '3-month',
    name: '3 Month',
    originalPrice: 499,
    discountedPrice: 349,
    discount: 30,
    features: ['Everything in 1 month', 'Test series', 'Performance analytics', 'Doubt support']
  },
  {
    id: '6-month',
    name: '6 Month',
    originalPrice: 899,
    discountedPrice: 629,
    discount: 30,
    features: ['Everything in 3 month', 'Study notes', 'Short notes', 'Priority support'],
    popular: true
  },
  {
    id: '1-year',
    name: '1 Year',
    originalPrice: 1499,
    discountedPrice: 1049,
    discount: 30,
    features: ['Everything included', 'All exam access', 'Lifetime doubt support', 'Premium analytics']
  }
];