-- Create onboarding management table
CREATE TABLE public.onboarding_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  top_badge TEXT NOT NULL DEFAULT 'India''s #1 Masters Entrance Prep Platform',
  main_headline TEXT NOT NULL DEFAULT 'Your Gateway to Dream Masters Programs',
  description TEXT NOT NULL DEFAULT 'From ISI to IITs, JNU to BHU - we''ve got every masters entrance covered! Join 50,000+ students who''ve cracked their dream programs with MastersUp 🚀',
  stats_students TEXT NOT NULL DEFAULT '50,000+',
  stats_students_label TEXT NOT NULL DEFAULT 'Students Enrolled',
  stats_success_rate TEXT NOT NULL DEFAULT '85%',
  stats_success_rate_label TEXT NOT NULL DEFAULT 'Success Rate',
  stats_entrance_exams TEXT NOT NULL DEFAULT '25+',
  stats_entrance_exams_label TEXT NOT NULL DEFAULT 'Entrance Exams',
  stats_master_programs TEXT NOT NULL DEFAULT '100+',
  stats_master_programs_label TEXT NOT NULL DEFAULT 'Master Programs',
  early_bird_offer_active BOOLEAN NOT NULL DEFAULT true,
  early_bird_title TEXT NOT NULL DEFAULT 'Limited Time Deal - Early Bird Special!',
  early_bird_description TEXT NOT NULL DEFAULT 'One Subscription • All Courses • All Exams Access',
  early_bird_users_limit INTEGER NOT NULL DEFAULT 10000,
  early_bird_users_claimed INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view onboarding content" 
ON public.onboarding_content 
FOR SELECT 
USING (is_active = true);

-- Insert default content
INSERT INTO public.onboarding_content (id) VALUES (gen_random_uuid());

-- Create trigger for updated_at
CREATE TRIGGER update_onboarding_content_updated_at
BEFORE UPDATE ON public.onboarding_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();