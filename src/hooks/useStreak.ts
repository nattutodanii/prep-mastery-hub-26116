
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_freeze_used: boolean;
}

export function useStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchStreak();
    }
  }, [user?.id]);

  const fetchStreak = async () => {
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setStreak(data || {
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        streak_freeze_used: false
      });
    } catch (error) {
      console.error('Error fetching streak:', error);
      setStreak({
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        streak_freeze_used: false
      });
    } finally {
      setLoading(false);
    }
  };

  return { streak, loading, refetchStreak: fetchStreak };
}
