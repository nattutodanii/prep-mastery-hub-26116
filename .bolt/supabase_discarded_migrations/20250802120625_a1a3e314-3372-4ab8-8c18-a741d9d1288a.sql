
-- Create notification_student table for admin notifications
CREATE TABLE public.notification_student (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'general', -- 'general', 'exam', 'course', 'individual'
  target_exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
  target_course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_query table for student messages
CREATE TABLE public.student_query (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'responded', 'closed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Create user_notification_read table to track read notifications
CREATE TABLE public.user_notification_read (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES notification_student(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_id)
);

-- Create user_streaks table to track daily streaks
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  streak_freeze_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.notification_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_query ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_read ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_student (everyone can read active notifications)
CREATE POLICY "Anyone can view active notifications" ON public.notification_student
  FOR SELECT USING (is_active = true);

-- RLS policies for student_query
CREATE POLICY "Users can insert their own queries" ON public.student_query
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own queries" ON public.student_query
  FOR SELECT USING (auth.uid() = user_id);

-- RLS policies for user_notification_read
CREATE POLICY "Users can manage their own notification reads" ON public.user_notification_read
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for user_streaks
CREATE POLICY "Users can manage their own streaks" ON public.user_streaks
  FOR ALL USING (auth.uid() = user_id);

-- Insert some sample notifications
INSERT INTO public.notification_student (title, message, notification_type) VALUES
('Welcome to MastersUp!', 'Welcome to our learning platform. Start your journey with chapter-wise practice tests.', 'general'),
('New Mock Tests Available', 'We''ve added new mock tests for better practice. Check them out now!', 'general'),
('Weekly Challenge', 'Complete 5 tests this week to maintain your learning streak!', 'general');

-- Function to update streak when user takes a test
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  current_date_utc DATE := CURRENT_DATE;
BEGIN
  -- Get last activity date for this user
  SELECT last_activity_date INTO last_date
  FROM user_streaks 
  WHERE user_id = NEW.user_id;
  
  -- If no streak record exists, create one
  IF last_date IS NULL THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (NEW.user_id, 1, 1, current_date_utc)
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = 1,
      longest_streak = GREATEST(user_streaks.longest_streak, 1),
      last_activity_date = current_date_utc,
      updated_at = NOW();
  ELSE
    -- Calculate days difference
    DECLARE
      days_diff INTEGER := current_date_utc - last_date;
    BEGIN
      IF days_diff = 0 THEN
        -- Same day, no change needed
        RETURN NEW;
      ELSIF days_diff = 1 THEN
        -- Consecutive day, increment streak
        UPDATE user_streaks SET
          current_streak = current_streak + 1,
          longest_streak = GREATEST(longest_streak, current_streak + 1),
          last_activity_date = current_date_utc,
          updated_at = NOW()
        WHERE user_id = NEW.user_id;
      ELSIF days_diff = 2 THEN
        -- 2 days gap, streak continues (48 hour rule)
        UPDATE user_streaks SET
          current_streak = current_streak + 1,
          longest_streak = GREATEST(longest_streak, current_streak + 1),
          last_activity_date = current_date_utc,
          updated_at = NOW()
        WHERE user_id = NEW.user_id;
      ELSE
        -- More than 2 days, reset streak
        UPDATE user_streaks SET
          current_streak = 1,
          longest_streak = GREATEST(longest_streak, current_streak),
          last_activity_date = current_date_utc,
          updated_at = NOW()
        WHERE user_id = NEW.user_id;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update streaks when test attempts are created
CREATE TRIGGER trigger_update_user_streak
  AFTER INSERT ON test_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();

-- Add updated_at trigger for notification_student
CREATE TRIGGER update_notification_student_updated_at
  BEFORE UPDATE ON notification_student
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger for student_query  
CREATE TRIGGER update_student_query_updated_at
  BEFORE UPDATE ON student_query
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger for user_streaks
CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
