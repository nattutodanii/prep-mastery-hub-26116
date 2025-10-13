-- Add calculator and parts functionality to courses table
ALTER TABLE public.courses ADD COLUMN is_calculator boolean DEFAULT false;
ALTER TABLE public.courses ADD COLUMN is_parts boolean DEFAULT false;
ALTER TABLE public.courses ADD COLUMN test_parts jsonb DEFAULT null;
ALTER TABLE public.courses ADD COLUMN freemium_group text DEFAULT null;
ALTER TABLE public.courses ADD COLUMN premium_group text DEFAULT null;

-- Add part column to all question tables
ALTER TABLE public.chapter_questions ADD COLUMN part text DEFAULT null;
ALTER TABLE public.mock_questions ADD COLUMN part text DEFAULT null;
ALTER TABLE public.test_questions ADD COLUMN part text DEFAULT null;

-- Update existing courses with sample data
UPDATE public.courses SET 
  is_calculator = true,
  is_parts = true,
  test_parts = '["Part 1", "Part 2"]',
  freemium_group = 'https://chat.whatsapp.com/freemium',
  premium_group = 'https://chat.whatsapp.com/premium'
WHERE name = 'M.S. in Data Science';

UPDATE public.courses SET 
  is_calculator = false,
  is_parts = true,
  test_parts = '["MCQ", "MSQ", "Subjective"]',
  freemium_group = 'https://chat.whatsapp.com/math-freemium',
  premium_group = 'https://chat.whatsapp.com/math-premium'
WHERE name = 'M.S. in Mathematics';

-- Create gosuper table for pricing and coupons
CREATE TABLE public.gosuper (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name text NOT NULL,
  current_price decimal(10,2) NOT NULL,
  original_price decimal(10,2) NOT NULL,
  discount_percentage integer NOT NULL,
  features jsonb NOT NULL,
  popular boolean DEFAULT false,
  refer_earn_link text DEFAULT null,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create coupons table
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_code text NOT NULL UNIQUE,
  discount_percentage integer NOT NULL,
  is_public boolean DEFAULT true,
  is_active boolean DEFAULT true,
  max_uses integer DEFAULT null,
  current_uses integer DEFAULT 0,
  valid_until timestamp with time zone DEFAULT null,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for new tables
ALTER TABLE public.gosuper ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for gosuper table (public read)
CREATE POLICY "Anyone can view gosuper plans" 
ON public.gosuper 
FOR SELECT 
USING (true);

-- Create policies for coupons table (public read for active coupons)
CREATE POLICY "Anyone can view active public coupons" 
ON public.coupons 
FOR SELECT 
USING (is_active = true AND is_public = true);

-- Insert sample pricing data
INSERT INTO public.gosuper (plan_name, current_price, original_price, discount_percentage, features, popular, refer_earn_link) VALUES
('Monthly Plan', 499.00, 699.00, 30, '["All Practice Tests", "Chapter-wise PYQs", "Mock Tests", "Detailed Analytics"]', false, 'https://refer.mastersup.com'),
('Quarterly Plan', 1299.00, 1999.00, 35, '["All Practice Tests", "Chapter-wise PYQs", "Mock Tests", "Detailed Analytics", "Priority Support"]', true, 'https://refer.mastersup.com'),
('Half-Yearly Plan', 2199.00, 3499.00, 37, '["All Practice Tests", "Chapter-wise PYQs", "Mock Tests", "Detailed Analytics", "Priority Support", "Live Sessions"]', false, 'https://refer.mastersup.com'),
('Yearly Plan', 3999.00, 6999.00, 43, '["All Practice Tests", "Chapter-wise PYQs", "Mock Tests", "Detailed Analytics", "Priority Support", "Live Sessions", "1-on-1 Mentoring"]', false, 'https://refer.mastersup.com');

-- Insert sample coupons
INSERT INTO public.coupons (coupon_code, discount_percentage, is_public, is_active, max_uses) VALUES
('EARLY30', 30, true, true, 1000),
('WELCOME15', 15, true, true, 500),
('STUDENT25', 25, false, true, 100),
('PREMIUM40', 40, false, true, 50);

-- Update existing questions with parts
UPDATE public.chapter_questions SET part = 'Part 1' WHERE question_type IN ('MCQ', 'MSQ');
UPDATE public.chapter_questions SET part = 'Part 2' WHERE question_type IN ('NAT', 'SUB');

UPDATE public.mock_questions SET part = 'Part 1' WHERE question_type IN ('MCQ', 'MSQ');
UPDATE public.mock_questions SET part = 'Part 2' WHERE question_type IN ('NAT', 'SUB');

UPDATE public.test_questions SET part = 'Part 1' WHERE question_type IN ('MCQ', 'MSQ');
UPDATE public.test_questions SET part = 'Part 2' WHERE question_type IN ('NAT', 'SUB');

-- Create trigger for updating updated_at on gosuper
CREATE TRIGGER update_gosuper_updated_at
BEFORE UPDATE ON public.gosuper
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();