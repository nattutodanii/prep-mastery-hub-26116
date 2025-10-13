import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export interface ExamRoadmap {
  id: string;
  user_id: string;
  course_id: string;
  exam_date: string;
  syllabus_progress: number;
  weekly_hours: number;
  roadmap_data: any;
  is_active: boolean;
  daily_schedule: any; // JSON field from database
  study_approach: string;
  subject_order: any; // JSON field from database
  study_days: any; // JSON field from database
  mock_days: any; // JSON field from database
  current_day_index: number;
  total_days: number;
  theory_days: number;
  mock_days_count: number;
  created_at: string;
  updated_at: string;
}

export interface DailyTask {
  date: string;
  day_index: number;
  tasks: {
    type: 'notes' | 'pyq' | 'practice' | 'mock';
    subject_name: string;
    chapter_name: string;
    chapter_id: string;
    completed: boolean;
  }[];
  is_mock_day: boolean;
}

export function useExamRoadmap() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [roadmap, setRoadmap] = useState<ExamRoadmap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile?.selected_course_id) {
      fetchRoadmap();
    } else {
      setLoading(false);
    }
  }, [user, profile?.selected_course_id]);

  const fetchRoadmap = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_roadmap')
        .select('*')
        .eq('user_id', user?.id)
        .eq('course_id', profile?.selected_course_id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setRoadmap(data);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRoadmap = async (roadmapData: Partial<ExamRoadmap>) => {
    try {
      console.log('Creating roadmap with data:', roadmapData);
      
      const { data, error } = await supabase
        .from('exam_roadmap')
        .insert({
          user_id: user?.id,
          course_id: profile?.selected_course_id,
          ...roadmapData
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('Roadmap created successfully:', data);
      setRoadmap(data);
      return data;
    } catch (error) {
      console.error('Error creating roadmap:', error);
      throw error;
    }
  };

  const updateRoadmap = async (updates: Partial<ExamRoadmap>) => {
    if (!roadmap) return;

    try {
      const { data, error } = await supabase
        .from('exam_roadmap')
        .update(updates)
        .eq('id', roadmap.id)
        .select()
        .single();

      if (error) throw error;
      setRoadmap(data);
      return data;
    } catch (error) {
      console.error('Error updating roadmap:', error);
      throw error;
    }
  };

  const markTaskComplete = async (dayIndex: number, taskIndex: number) => {
    if (!roadmap) return;

    const scheduleArray = Array.isArray(roadmap.daily_schedule) ? roadmap.daily_schedule : [];
    const updatedSchedule = [...scheduleArray];
    if (updatedSchedule[dayIndex] && updatedSchedule[dayIndex].tasks) {
      updatedSchedule[dayIndex].tasks[taskIndex].completed = true;
      await updateRoadmap({ daily_schedule: updatedSchedule });
    }
  };

  const getCurrentDayTasks = () => {
    if (!roadmap || !roadmap.daily_schedule) return null;
    
    console.log('getCurrentDayTasks - roadmap.daily_schedule:', roadmap.daily_schedule);
    
    const scheduleArray = Array.isArray(roadmap.daily_schedule) ? roadmap.daily_schedule : [];
    console.log('scheduleArray:', scheduleArray.length, 'items');
    
    const today = new Date().toISOString().split('T')[0];
    console.log('Looking for date:', today);
    
    // First try to find today's tasks
    let todayTasks = scheduleArray.find((day: any) => day.date === today);
    console.log('Today tasks found:', todayTasks);
    
    // If not found, use current day index
    if (!todayTasks && scheduleArray.length > 0) {
      const currentIndex = Math.min(roadmap.current_day_index || 0, scheduleArray.length - 1);
      todayTasks = scheduleArray[currentIndex];
      console.log('Using current day index:', currentIndex, 'tasks:', todayTasks);
    }
    
    // If still not found, use first day
    if (!todayTasks && scheduleArray.length > 0) {
      todayTasks = scheduleArray[0];
      console.log('Using first day tasks:', todayTasks);
    }
    
    return todayTasks;
  };

  const canAccessDay = (dayIndex: number) => {
    if (!roadmap) return false;
    
    const scheduleArray = Array.isArray(roadmap.daily_schedule) ? roadmap.daily_schedule : [];
    
    // Can access if it's today, past days, or if previous day is completed
    const currentIndex = roadmap.current_day_index;
    if (dayIndex <= currentIndex) return true;
    
    // Check if previous days are completed
    for (let i = 0; i < dayIndex; i++) {
      const day = scheduleArray[i];
      if (!day || !day.tasks || !day.tasks.every((task: any) => task.completed)) {
        return false;
      }
    }
    return true;
  };

  return {
    roadmap,
    loading,
    createRoadmap,
    updateRoadmap,
    markTaskComplete,
    getCurrentDayTasks,
    canAccessDay,
    refetch: fetchRoadmap
  };
}