
-- Create test_attempts table to track test states
CREATE TABLE IF NOT EXISTS public.test_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  chapter_id UUID NULL,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  test_identifier TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  current_question INTEGER DEFAULT 0,
  answers_state JSONB DEFAULT '{}',
  remaining_time INTEGER NULL,
  attempt_count INTEGER DEFAULT 0,
  last_attempt_date TIMESTAMP WITH TIME ZONE NULL,
  best_score FLOAT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own test attempts" 
  ON public.test_attempts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own test attempts" 
  ON public.test_attempts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own test attempts" 
  ON public.test_attempts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own test attempts" 
  ON public.test_attempts 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_test_attempts_updated_at
  BEFORE UPDATE ON public.test_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_test 
  ON public.test_attempts(user_id, test_identifier);
