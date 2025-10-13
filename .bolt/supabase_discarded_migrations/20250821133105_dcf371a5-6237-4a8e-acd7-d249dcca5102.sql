
-- Add missing columns to exams table
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS established_year INTEGER;

-- Add missing columns to courses table  
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS exam_id UUID REFERENCES public.exams(id);

-- Insert sample exam data if the table is empty
INSERT INTO public.exams (name, description, short_description, location, established_year)
SELECT * FROM (VALUES 
  ('JEE Main & Advanced', 'Joint Entrance Examination for Engineering', 'Premier engineering entrance exam conducted by NTA for admission to IITs, NITs, and other top engineering colleges.', 'All India', 1960),
  ('NEET', 'National Eligibility cum Entrance Test', 'National level medical entrance exam for MBBS, BDS, and other medical courses in India.', 'All India', 2013),
  ('UPSC Civil Services', 'Union Public Service Commission Examination', 'Most prestigious exam in India for recruitment to various Civil Services including IAS, IPS, IFS.', 'New Delhi', 1926),
  ('GATE', 'Graduate Aptitude Test in Engineering', 'National level exam for admission to postgraduate programs and PSU recruitment.', 'All India', 1984),
  ('CAT', 'Common Admission Test', 'Management entrance exam for admission to IIMs and other top B-schools.', 'All India', 1990)
) AS new_exams(name, description, short_description, location, established_year)
WHERE NOT EXISTS (SELECT 1 FROM public.exams LIMIT 1);

-- Insert sample courses for each exam
INSERT INTO public.courses (name, description, exam_id)
SELECT course_data.name, course_data.description, e.id
FROM public.exams e
CROSS JOIN (VALUES 
  ('Mathematics', 'Advanced mathematics covering calculus, algebra, trigonometry, and coordinate geometry'),
  ('Physics', 'Comprehensive physics including mechanics, thermodynamics, optics, and modern physics'),
  ('Chemistry', 'Complete chemistry syllabus covering physical, organic, and inorganic chemistry'),
  ('English', 'English language and comprehension skills'),
  ('General Knowledge', 'Current affairs, history, geography, and general awareness')
) AS course_data(name, description)
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE exam_id = e.id LIMIT 1);
