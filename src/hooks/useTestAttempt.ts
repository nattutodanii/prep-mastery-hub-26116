
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import type { Database } from '@/integrations/supabase/types';

type TestAttemptRow = Database['public']['Tables']['test_attempts']['Row'];

export function useTestAttempt() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [testAttempts, setTestAttempts] = useState<Record<string, TestAttemptRow>>({});
  const [loading, setLoading] = useState(false);

  const getTestIdentifier = (testName: string, testType: string, chapterId?: string) => {
    const base = `${testType}-${testName.toLowerCase().replace(/\s+/g, '-')}`;
    return chapterId ? `${base}-${chapterId}` : base;
  };

  const fetchTestAttempt = async (testName: string, testType: string, chapterId?: string) => {
    if (!user?.id || !profile?.selected_course_id) return null;

    const testIdentifier = getTestIdentifier(testName, testType, chapterId);
    
    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('test_identifier', testIdentifier)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching test attempt:', error);
      return null;
    }
  };

  const createOrUpdateTestAttempt = async (
    testName: string,
    testType: string,
    status: 'not_started' | 'in_progress' | 'completed',
    additionalData: Partial<TestAttemptRow> = {},
    chapterId?: string
  ) => {
    if (!user?.id || !profile?.selected_course_id) return null;

    const testIdentifier = getTestIdentifier(testName, testType, chapterId);
    
    try {
      const existingAttempt = await fetchTestAttempt(testName, testType, chapterId);
      
      if (existingAttempt) {
        const { data, error } = await supabase
          .from('test_attempts')
          .update({
            status,
            last_attempt_date: new Date().toISOString(),
            ...additionalData
          })
          .eq('id', existingAttempt.id)
          .select()
          .single();

        if (error) throw error;
        
        setTestAttempts(prev => ({
          ...prev,
          [testIdentifier]: data
        }));
        
        return data;
      } else {
        const { data, error } = await supabase
          .from('test_attempts')
          .insert({
            user_id: user.id,
            course_id: profile.selected_course_id,
            chapter_id: chapterId || null,
            test_name: testName,
            test_type: testType,
            test_identifier: testIdentifier,
            status,
            attempt_count: 1,
            last_attempt_date: new Date().toISOString(),
            ...additionalData
          })
          .select()
          .single();

        if (error) throw error;
        
        setTestAttempts(prev => ({
          ...prev,
          [testIdentifier]: data
        }));
        
        return data;
      }
    } catch (error) {
      console.error('Error creating/updating test attempt:', error);
      return null;
    }
  };

  const getTestStatus = (testName: string, testType: string, chapterId?: string): 'not_started' | 'in_progress' | 'completed' => {
    const testIdentifier = getTestIdentifier(testName, testType, chapterId);
    return (testAttempts[testIdentifier]?.status as 'not_started' | 'in_progress' | 'completed') || 'not_started';
  };

  const getTestAttemptData = (testName: string, testType: string, chapterId?: string) => {
    const testIdentifier = getTestIdentifier(testName, testType, chapterId);
    return testAttempts[testIdentifier] || null;
  };

  const loadTestAttempts = async () => {
    if (!user?.id || !profile?.selected_course_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', profile.selected_course_id);

      if (error) throw error;

      const attemptsMap = data?.reduce((acc, attempt) => {
        acc[attempt.test_identifier] = attempt;
        return acc;
      }, {} as Record<string, TestAttemptRow>) || {};

      setTestAttempts(attemptsMap);
    } catch (error) {
      console.error('Error loading test attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestAttempts();
  }, [user?.id, profile?.selected_course_id]);

  return {
    testAttempts,
    loading,
    fetchTestAttempt,
    createOrUpdateTestAttempt,
    getTestStatus,
    getTestAttemptData,
    refetch: loadTestAttempts
  };
}
