
-- Add detailed content columns to exams table
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS 
  short_description TEXT,
  detailed_description TEXT,
  introduction TEXT,
  history TEXT,
  rankings TEXT,
  infrastructure TEXT,
  placements TEXT,
  fees_scholarships TEXT,
  preparation_tips TEXT,
  faqs JSONB DEFAULT '[]'::jsonb,
  why_choose TEXT,
  image_url TEXT,
  established_year INTEGER,
  location TEXT,
  campuses TEXT[],
  recognition TEXT,
  global_collaborations TEXT;

-- Add detailed content columns to courses table  
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS
  eligibility TEXT,
  duration TEXT,
  course_type TEXT,
  curriculum JSONB DEFAULT '[]'::jsonb,
  entrance_exam TEXT,
  exam_pattern TEXT,
  cutoff_trends TEXT,
  intake_capacity INTEGER,
  fees_amount TEXT,
  stipend_amount TEXT,
  average_package TEXT,
  highest_package TEXT,
  top_recruiters TEXT[],
  software_exposure TEXT[],
  preparation_strategy TEXT,
  course_faqs JSONB DEFAULT '[]'::jsonb,
  detailed_content TEXT,
  course_image_url TEXT;

-- Insert detailed ISI data
UPDATE public.exams 
SET 
  short_description = 'Premier institute for Statistics, Mathematics & Data Science',
  detailed_description = 'Indian Statistical Institute (ISI) is one of India''s most prestigious institutions for advanced studies in Statistics, Mathematics, Data Science, Economics, and Computer Science.',
  introduction = 'ISI Kolkata stands as a beacon of excellence in quantitative sciences, consistently ranked among the top institutions globally for research in statistics and mathematics.',
  history = 'Founded in 1931 by Professor Prasanta Chandra Mahalanobis, ISI has been at the forefront of statistical research and education for over 90 years.',
  rankings = 'Consistently ranked #1 in Statistics in India, Top 10 globally in statistical research publications, Institute of National Importance status',
  infrastructure = 'World-class library with over 2 lakh books, High-performance computing facilities, Advanced research labs, Subsidized hostel accommodation',
  placements = 'Average package: ₹15-20 LPA across programs, Top recruiters: Goldman Sachs, JP Morgan, Amazon, Microsoft, Google, Strong alumni network in top global firms',
  fees_scholarships = 'Zero tuition fees for most programs, Monthly stipend of ₹8,000-₹12,000, Merit-based scholarships available, Government fellowships for PhD students',
  preparation_tips = 'Focus on strong mathematical foundations, Practice previous year papers extensively, Develop analytical thinking skills, Master probability and statistics concepts',
  why_choose = 'Free world-class education with stipend, Global recognition and research opportunities, Excellent placement record, Unique specialized programs not available elsewhere',
  image_url = '/images/isi-kolkata.jpg',
  established_year = 1931,
  location = 'Kolkata, West Bengal',
  campuses = ARRAY['Kolkata (Main)', 'Delhi', 'Bangalore', 'Chennai', 'Tezpur'],
  recognition = 'Institute of National Importance, NAAC A++ Grade, UGC Recognition',
  global_collaborations = 'Partnerships with Harvard, MIT, Stanford, Oxford, Cambridge for research collaborations',
  faqs = '[
    {"question": "Is ISI better than IITs for Data Science?", "answer": "ISI offers specialized programs with deeper focus on statistics and mathematics, while IITs offer broader engineering-based data science programs."},
    {"question": "Does ISI provide hostel facilities?", "answer": "Yes, ISI provides subsidized hostel accommodation for all students with separate facilities for boys and girls."},
    {"question": "How difficult is the ISI admission test?", "answer": "The ISI entrance exam is moderately challenging, requiring strong foundations in mathematics and statistics."},
    {"question": "Do all students get a stipend?", "answer": "Yes, all admitted students receive a monthly stipend ranging from ₹8,000 to ₹12,000 depending on the program."}
  ]'::jsonb
WHERE name = 'ISI';

-- Insert detailed course data for ISI MSQMS
UPDATE public.courses 
SET 
  eligibility = 'Bachelor''s degree with Mathematics as a subject OR BE/B.Tech in any discipline',
  duration = '2 Years (4 Semesters)',
  course_type = 'Full-time residential program',
  entrance_exam = 'ISI Admission Test',
  exam_pattern = 'Part A (MCQ - 2 hours): General aptitude, Quantitative aptitude, Basic probability & statistics. Part B (Descriptive - 2 hours): Applied Statistics, Probability distributions, Linear Algebra, Optimization techniques',
  cutoff_trends = 'General: 45-50 marks, OBC/EWS: 40-45 marks, SC/ST: 30-35 marks (out of 100)',
  intake_capacity = 15,
  fees_amount = '₹40,000 total for 2 years + ₹200-300/month hostel',
  stipend_amount = '₹8,000 per month',
  average_package = '₹7-9 LPA',
  highest_package = '₹12 LPA',
  top_recruiters = ARRAY['TCS', 'Infosys', 'Boeing', 'Amazon', 'Goldman Sachs', 'JP Morgan', 'Microsoft', 'KPMG'],
  software_exposure = ARRAY['Python', 'R', 'SAS', 'MATLAB', 'Minitab', 'LINGO'],
  preparation_strategy = 'Master linear algebra and calculus, Practice ISI previous year papers, Focus on probability and statistics theory, Develop case study analysis skills for quality management',
  detailed_content = 'The Master of Science in Quality Management Science (MSQMS) is ISI''s flagship program combining statistics, operations research, and quality management. Students spend their first year in Bangalore and second year in Hyderabad, gaining exposure to diverse industrial environments.',
  curriculum = '[
    {"semester": 1, "subjects": ["Statistical Decision Making-1", "Statistical Process Control", "Research Methodology & Statistics-1", "Operations Research-1", "Total Quality Management", "Project Management"]},
    {"semester": 2, "subjects": ["Statistical Decision Making-2", "Advanced Statistical Process Control", "Research Methodology & Statistics-2", "Operations Research-2", "Multivariate Data Analysis", "Electives"]},
    {"semester": 3, "subjects": ["Six Sigma", "Operations Research-3", "Regression Analysis", "Quality Audit", "Industrial Experimentation"]},
    {"semester": 4, "subjects": ["Dissertation", "Live Industry Project"]}
  ]'::jsonb,
  course_faqs = '[
    {"question": "How hard is the ISI MSQMS entrance exam?", "answer": "Moderately tough. Strong UG-level math & stats preparation is essential."},
    {"question": "Is there negative marking?", "answer": "Yes, in Part A (MCQ section). No negative marking in subjective part."},
    {"question": "What makes MSQMS unique?", "answer": "It''s the only program in India combining statistics, quality management, and operations research with guaranteed stipend."},
    {"question": "Are there internship opportunities?", "answer": "Yes, students get internships with stipends ranging from ₹1-2.5 lakhs."}
  ]'::jsonb,
  course_image_url = '/images/isi-msqms.jpg'
WHERE name = 'Master of Statistics (M.Stat.)' AND id IN (
  SELECT c.id FROM courses c 
  JOIN exams e ON c.exam_id = e.id 
  WHERE e.name = 'ISI'
);
