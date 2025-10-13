import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

interface TestQuestion {
  id: string;
  question_statement: string;
  question_type: 'MCQ' | 'MSQ' | 'NAT' | 'SUB';
  options?: string[] | null;
  answer: string;
  solution: string;
  correct_marks: number;
  incorrect_marks: number;
  skipped_marks: number;
  partial_marks?: number;
  time_minutes: number;
  part?: string | null;
}

interface MockTest {
  mock_name: string;
  questions: TestQuestion[];
  total_time: number;
  total_marks: number;
}

interface PYPTest {
  year: number;
  questions: TestQuestion[];
  total_time: number;
  total_marks: number;
}

export function useTestData() {
  const { profile } = useProfile();
  const [chapterQuestions, setChapterQuestions] = useState<Record<string, TestQuestion[]>>({});
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [pypTests, setPypTests] = useState<PYPTest[]>([]);
  const [testSeries, setTestSeries] = useState<Record<string, TestQuestion[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.selected_course_id) {
      fetchTestData();
    }
  }, [profile?.selected_course_id]);

  const fetchTestData = async () => {
    if (!profile?.selected_course_id) return;

    try {
      setLoading(true);

      // Fetch chapter questions
      const { data: chapterQuestionsData } = await supabase
        .from('chapter_questions')
        .select(`
          *,
          chapters!inner(
            id,
            name,
            units!inner(
              subjects!inner(
                course_id
              )
            )
          )
        `)
        .eq('chapters.units.subjects.course_id', profile.selected_course_id);

      // Group chapter questions by chapter
      const chapterQuestionsMap: Record<string, TestQuestion[]> = {};
      chapterQuestionsData?.forEach((q: any) => {
        const chapterId = q.chapters.id;
        if (!chapterQuestionsMap[chapterId]) {
          chapterQuestionsMap[chapterId] = [];
        }
        chapterQuestionsMap[chapterId].push({
          id: q.id,
          question_statement: q.question_statement,
          question_type: q.question_type,
          options: q.options,
          answer: q.answer,
          solution: q.solution,
          correct_marks: q.correct_marks,
          incorrect_marks: q.incorrect_marks,
          skipped_marks: q.skipped_marks,
          partial_marks: q.partial_marks,
          time_minutes: q.time_minutes,
          part: q.part,
        });
      });
      setChapterQuestions(chapterQuestionsMap);

      // Fetch mock questions
      const { data: mockQuestionsData } = await supabase
        .from('mock_questions')
        .select('*')
        .eq('course_id', profile.selected_course_id);

      // Group mock questions by mock name
      const mockTestsMap: Record<string, TestQuestion[]> = {};
      mockQuestionsData?.forEach((q: any) => {
        if (!mockTestsMap[q.mock_name]) {
          mockTestsMap[q.mock_name] = [];
        }
        mockTestsMap[q.mock_name].push({
          id: q.id,
          question_statement: q.question_statement,
          question_type: q.question_type,
          options: q.options,
          answer: q.answer,
          solution: q.solution,
          correct_marks: q.correct_marks,
          incorrect_marks: q.incorrect_marks,
          skipped_marks: q.skipped_marks,
          partial_marks: q.partial_marks,
          time_minutes: q.time_minutes,
          part: q.part,
        });
      });

      const mockTestsArray = Object.entries(mockTestsMap).map(([mockName, questions]) => ({
        mock_name: mockName,
        questions,
        total_time: questions.reduce((sum, q) => sum + q.time_minutes, 0),
        total_marks: questions.reduce((sum, q) => sum + q.correct_marks, 0),
      }));
      setMockTests(mockTestsArray);

      // Fetch PYP data
      const { data: pypQuestionsData } = await supabase
        .from('chapter_questions')
        .select(`
          *,
          chapters!inner(
            units!inner(
              subjects!inner(
                course_id
              )
            )
          )
        `)
        .eq('is_pyq', true)
        .eq('chapters.units.subjects.course_id', profile.selected_course_id)
        .not('pyq_year', 'is', null);

      // Group PYP questions by year
      const pypTestsMap: Record<number, TestQuestion[]> = {};
      pypQuestionsData?.forEach((q: any) => {
        const year = q.pyq_year;
        if (!pypTestsMap[year]) {
          pypTestsMap[year] = [];
        }
        pypTestsMap[year].push({
          id: q.id,
          question_statement: q.question_statement,
          question_type: q.question_type,
          options: q.options,
          answer: q.answer,
          solution: q.solution,
          correct_marks: q.correct_marks,
          incorrect_marks: q.incorrect_marks,
          skipped_marks: q.skipped_marks,
          partial_marks: q.partial_marks,
          time_minutes: q.time_minutes,
          part: q.part,
        });
      });

      const pypTestsArray = Object.entries(pypTestsMap).map(([year, questions]) => ({
        year: parseInt(year),
        questions,
        total_time: questions.reduce((sum, q) => sum + q.time_minutes, 0),
        total_marks: questions.reduce((sum, q) => sum + q.correct_marks, 0),
      }));
      setPypTests(pypTestsArray.sort((a, b) => b.year - a.year));

      // Fetch test series
      const { data: testSeriesData } = await supabase
        .from('test_questions')
        .select('*')
        .eq('course_id', profile.selected_course_id);

      // Group test questions by test name
      const testSeriesMap: Record<string, TestQuestion[]> = {};
      testSeriesData?.forEach((q: any) => {
        if (!testSeriesMap[q.test_name]) {
          testSeriesMap[q.test_name] = [];
        }
        testSeriesMap[q.test_name].push({
          id: q.id,
          question_statement: q.question_statement,
          question_type: q.question_type,
          options: q.options,
          answer: q.answer,
          solution: q.solution,
          correct_marks: q.correct_marks,
          incorrect_marks: q.incorrect_marks,
          skipped_marks: q.skipped_marks,
          partial_marks: q.partial_marks,
          time_minutes: q.time_minutes,
          part: q.part,
        });
      });
      setTestSeries(testSeriesMap);

    } catch (error) {
      console.error('Error fetching test data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    chapterQuestions,
    mockTests,
    pypTests,
    testSeries,
    loading,
    refetch: fetchTestData,
  };
}