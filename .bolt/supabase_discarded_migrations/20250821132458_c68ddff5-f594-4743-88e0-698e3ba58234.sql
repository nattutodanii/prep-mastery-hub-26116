
-- Add missing fields to exams table for comprehensive information
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS detailed_description TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS introduction TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS established_year INTEGER;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS history TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS recognition TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS campuses JSONB DEFAULT '[]';
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS rankings TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS infrastructure TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS placements TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS global_collaborations TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS fees_scholarships TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS preparation_tips TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS why_choose TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]';

-- Add missing fields to courses table for detailed course information
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS intake_capacity TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS average_package TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS degree_type TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS placement_statistics TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS course_overview TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS entrance_exam_details TEXT;

-- Insert sample data for IIT JAM to match your screenshots
INSERT INTO public.exams (
  id,
  name,
  description,
  short_description,
  detailed_description,
  introduction,
  location,
  established_year,
  history,
  recognition,
  campuses,
  rankings,
  infrastructure,
  placements,
  preparation_tips,
  why_choose,
  faqs
) VALUES (
  gen_random_uuid(),
  'IIT JAM',
  'Joint Admission Test for M.Sc. programmes in IITs',
  'Gateway to prestigious M.Sc. programmes in Indian Institutes of Technology',
  'IIT JAM is a national level entrance examination conducted jointly by Indian Institutes of Technology (IITs) for admission to M.Sc. (Two Years), Joint M.Sc.-Ph.D., M.Sc.-Ph.D. Dual Degree and other Post-Bachelor Degree programmes.',
  'The Joint Admission Test for M.Sc. (JAM) is an all-India entrance examination for admission to M.Sc. programmes at the IITs and integrated Ph.D. programmes at IISc Bangalore.',
  'New Delhi',
  1959,
  'IIT JAM was first conducted in 2005 to provide a common platform for admission to post-graduate science programmes in IITs.',
  'Recognized by UGC and approved by AICTE. All programmes are NBA accredited.',
  '["Delhi", "Mumbai", "Chennai", "Kolkata", "Kanpur", "Kharagpur", "Roorkee", "Guwahati", "Hyderabad", "Indore", "Jodhpur", "Patna", "Bhubaneswar", "Gandhinagar", "Ropar", "Mandi", "Varanasi", "Palakkad", "Tirupati", "Goa", "Jammu", "Dhanbad", "Dharwad"]',
  'IITs are consistently ranked among the top engineering and science institutes globally. QS World University Rankings place IITs in top 200 worldwide.',
  'State-of-the-art laboratories, research facilities, libraries with extensive digital resources, hostels, sports complexes, and modern computational facilities.',
  'Excellent placement records with top companies like Google, Microsoft, Amazon, Tesla. Average package ranges from 15-25 LPA with highest going up to 1+ Crore.',
  'Focus on conceptual understanding, practice previous year questions extensively, take regular mock tests, and maintain consistency in preparation.',
  'Premier institutes with world-class faculty, excellent research opportunities, strong alumni network, and guaranteed placements in top companies.',
  '[{"question": "What is the exam pattern for IIT JAM?", "answer": "IIT JAM is conducted online with 60 questions in 3 hours. It includes MCQs, MSQs, and NAT type questions."}, {"question": "Which subjects are available in IIT JAM?", "answer": "Mathematics, Physics, Chemistry, Mathematical Statistics, Biotechnology, Economics, and Geology."}, {"question": "What is the age limit for IIT JAM?", "answer": "There is no age limit for appearing in IIT JAM examination."}]'
) ON CONFLICT (name) DO UPDATE SET
  short_description = EXCLUDED.short_description,
  detailed_description = EXCLUDED.detailed_description,
  introduction = EXCLUDED.introduction,
  location = EXCLUDED.location,
  established_year = EXCLUDED.established_year,
  history = EXCLUDED.history,
  recognition = EXCLUDED.recognition,
  campuses = EXCLUDED.campuses,
  rankings = EXCLUDED.rankings,
  infrastructure = EXCLUDED.infrastructure,
  placements = EXCLUDED.placements,
  preparation_tips = EXCLUDED.preparation_tips,
  why_choose = EXCLUDED.why_choose,
  faqs = EXCLUDED.faqs;

-- Insert sample courses for IIT JAM
INSERT INTO public.courses (
  id,
  exam_id,
  name,
  description,
  duration,
  intake_capacity,
  average_package,
  degree_type,
  placement_statistics,
  course_overview,
  entrance_exam_details
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM exams WHERE name = 'IIT JAM' LIMIT 1),
  'IIT JAM Mathematics',
  'Master of Science in Mathematics',
  'Varies',
  'Limited students',
  'Excellent',
  'Professional Degree',
  'Outstanding placement records with top research institutions and tech companies',
  'Comprehensive mathematics program covering advanced topics in pure and applied mathematics',
  'Entrance through IIT JAM Mathematics paper with topics including Calculus, Linear Algebra, Real Analysis'
),
(
  gen_random_uuid(),
  (SELECT id FROM exams WHERE name = 'IIT JAM' LIMIT 1),
  'IIT JAM Statistics',
  'Master of Science in Mathematical Statistics', 
  'Varies',
  'Limited students',
  'Excellent',
  'Professional Degree',
  'Excellent placement opportunities in analytics, finance, and research sectors',
  'Advanced program in statistics, probability theory, and data analysis techniques',
  'Entrance through IIT JAM Mathematical Statistics paper covering probability, statistics, and mathematics'
);
