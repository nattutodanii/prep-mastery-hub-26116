-- Create test_leaderboard table for real-time rankings
CREATE TABLE public.test_leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_identifier TEXT NOT NULL,
  test_type TEXT NOT NULL,
  test_name TEXT NOT NULL,
  course_id UUID NOT NULL,
  chapter_id UUID,
  score DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_marks DOUBLE PRECISION NOT NULL,
  percentage DOUBLE PRECISION NOT NULL DEFAULT 0,
  time_taken_minutes INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.test_leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies for leaderboard access
CREATE POLICY "Anyone can view leaderboard entries" 
ON public.test_leaderboard 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own leaderboard entries" 
ON public.test_leaderboard 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leaderboard entries" 
ON public.test_leaderboard 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_test_leaderboard_updated_at
BEFORE UPDATE ON public.test_leaderboard
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_test_leaderboard_test_identifier ON public.test_leaderboard(test_identifier);
CREATE INDEX idx_test_leaderboard_score ON public.test_leaderboard(test_identifier, score DESC);
CREATE INDEX idx_test_leaderboard_user_test ON public.test_leaderboard(user_id, test_identifier);