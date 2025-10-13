
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

interface BookmarkedQuestion {
  id: string;
  user_id: string;
  course_id: string;
  chapter_id?: string;
  question_id: string;
  test_type: string;
  test_id: string;
  created_at: string;
}

interface BookmarkedTest {
  test_name: string;
  test_type: string;
  test_id: string;
  chapter_id?: string;
  question_count: number;
  questions: any[];
}

export function useBookmarkedQuestions() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<BookmarkedQuestion[]>([]);
  const [bookmarkedTests, setBookmarkedTests] = useState<BookmarkedTest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookmarkedQuestions = async () => {
    if (!user?.id || !profile?.selected_course_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookmarked_questions')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', profile.selected_course_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarkedQuestions(data || []);

      // Group bookmarked questions by test
      await groupBookmarkedByTest(data || []);
    } catch (error) {
      console.error('Error fetching bookmarked questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupBookmarkedByTest = async (bookmarks: BookmarkedQuestion[]) => {
    const testGroups: Record<string, BookmarkedQuestion[]> = {};
    
    // Group by test identifier
    bookmarks.forEach(bookmark => {
      const key = `${bookmark.test_type}-${bookmark.test_id}`;
      if (!testGroups[key]) {
        testGroups[key] = [];
      }
      testGroups[key].push(bookmark);
    });

    const bookmarkedTestsData: BookmarkedTest[] = [];

    // Fetch questions for each test group
    for (const [testKey, testBookmarks] of Object.entries(testGroups)) {
      const firstBookmark = testBookmarks[0];
      const questionIds = testBookmarks.map(b => b.question_id);
      
      let questions: any[] = [];
      let testName = firstBookmark.test_id;

      try {
        // Fetch questions based on test type
        if (firstBookmark.test_type === 'chapter' && firstBookmark.chapter_id) {
          const { data } = await supabase
            .from('chapter_questions')
            .select('*')
            .in('id', questionIds)
            .eq('chapter_id', firstBookmark.chapter_id);
          
          questions = data || [];
          
          // Get chapter name
          const { data: chapterData } = await supabase
            .from('chapters')
            .select('name')
            .eq('id', firstBookmark.chapter_id)
            .single();
          
          testName = chapterData?.name || 'Chapter Practice';
        } else if (firstBookmark.test_type === 'mock') {
          const { data } = await supabase
            .from('mock_questions')
            .select('*')
            .in('id', questionIds)
            .eq('course_id', profile.selected_course_id);
          
          questions = data || [];
          if (questions.length > 0) {
            testName = questions[0].mock_name;
          }
        } else if (firstBookmark.test_type === 'test-series') {
          const { data } = await supabase
            .from('test_questions')
            .select('*')
            .in('id', questionIds)
            .eq('course_id', profile.selected_course_id);
          
          questions = data || [];
          if (questions.length > 0) {
            testName = questions[0].test_name;
          }
        }

        if (questions.length > 0) {
          bookmarkedTestsData.push({
            test_name: testName,
            test_type: firstBookmark.test_type,
            test_id: firstBookmark.test_id,
            chapter_id: firstBookmark.chapter_id,
            question_count: questions.length,
            questions
          });
        }
      } catch (error) {
        console.error('Error fetching questions for test:', testKey, error);
      }
    }

    setBookmarkedTests(bookmarkedTestsData);
  };

  const addBookmark = async (questionId: string, testType: string, testId: string, chapterId?: string) => {
    if (!user?.id || !profile?.selected_course_id) return false;

    try {
      const { error } = await supabase
        .from('bookmarked_questions')
        .insert({
          user_id: user.id,
          course_id: profile.selected_course_id,
          chapter_id: chapterId || null,
          question_id: questionId,
          test_type: testType,
          test_id: testId
        });

      if (error) throw error;
      await fetchBookmarkedQuestions();
      return true;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return false;
    }
  };

  const removeBookmark = async (questionId: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('bookmarked_questions')
        .delete()
        .eq('user_id', user.id)
        .eq('question_id', questionId);

      if (error) throw error;
      await fetchBookmarkedQuestions();
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  };

  const isBookmarked = (questionId: string) => {
    return bookmarkedQuestions.some(bq => bq.question_id === questionId);
  };

  useEffect(() => {
    fetchBookmarkedQuestions();
  }, [user?.id, profile?.selected_course_id]);

  return {
    bookmarkedQuestions,
    bookmarkedTests,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    refetch: fetchBookmarkedQuestions
  };
}
