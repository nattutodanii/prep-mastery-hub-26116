
-- Add missing fields to exams table for comprehensive information
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS detailed_description TEXT;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS introduction TEXT;
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

-- Insert ISI exam with comprehensive details
INSERT INTO public.exams (
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
  global_collaborations,
  fees_scholarships,
  preparation_tips,
  why_choose,
  faqs
) VALUES (
  'ISI',
  'Indian Statistical Institute - Premier institute for Statistics, Mathematics & Data Science',
  'Premier institute for Statistics, Mathematics & Data Science',
  'Indian Statistical Institute (ISI) is one of India''s most prestigious institutions for advanced studies in Statistics, Mathematics, Data Science, Economics, and Computer Science. Established in 1931 by Professor Prasanta Chandra Mahalanobis, ISI has been at the forefront of statistical research and education for over 90 years. The institute is known for its rigorous academic programs, world-class research facilities, and exceptional faculty who are leaders in their respective fields.',
  'ISI Kolkata stands as a beacon of excellence in quantitative sciences, consistently ranked among the top institutions globally for research in statistics and mathematics. The institute has produced numerous renowned statisticians, mathematicians, and data scientists who have made significant contributions to their fields. With its unique approach to education that combines theoretical rigor with practical applications, ISI continues to attract the brightest minds from across India and the world.',
  'Kolkata, West Bengal',
  1931,
  'Founded in 1931 by Professor Prasanta Chandra Mahalanobis, often called the "Father of Indian Statistics," ISI began as a small research institute with the vision of developing statistical methods for planning and development in India. Mahalanobis established ISI to promote the application of statistics in various fields including agriculture, industry, and governance. The institute played a crucial role in India''s Five-Year Plans and continues to contribute to policy-making through statistical research. Over the decades, ISI has expanded its scope to include mathematics, computer science, economics, and interdisciplinary research areas.',
  'Institute of National Importance status granted by the Government of India, NAAC A++ Grade, UGC Recognition, ISO 9001:2015 Certified, Recognized by Department of Scientific and Industrial Research (DSIR)',
  '["Kolkata (Main Campus)", "Delhi", "Bangalore", "Chennai", "Tezpur", "Hyderabad"]',
  'ISI is consistently ranked #1 in Statistics in India and among the top 10 globally in statistical research publications. It holds the prestigious Institute of National Importance status. The institute has received NAAC A++ grade and is internationally recognized for its research contributions. ISI faculty and alumni have received numerous prestigious awards including international fellowships and research grants.',
  'ISI boasts world-class infrastructure including a library with over 2 lakh books and journals, one of the largest collections in Asia for statistics and mathematics. The institute has high-performance computing facilities with advanced servers and software, state-of-the-art research laboratories, modern classrooms with audio-visual facilities, and well-equipped hostels. Students enjoy subsidized accommodation, sports facilities including basketball, badminton, and cricket grounds, recreational areas, and a vibrant campus life.',
  'ISI graduates command some of the highest packages in the industry with average packages ranging from ₹15-25 LPA across programs. Top recruiters include Goldman Sachs, JP Morgan Chase, Amazon, Microsoft, Google, Meta, McKinsey & Company, Boston Consulting Group, Deloitte, PwC, and leading research institutions worldwide. Many graduates also pursue PhD programs at top global universities like Harvard, MIT, Stanford, Oxford, and Cambridge. The alumni network spans across leading academic institutions, tech companies, financial firms, and government organizations.',
  'ISI has extensive partnerships with Harvard University, MIT, Stanford University, Oxford University, Cambridge University, University of California Berkeley, and other leading institutions worldwide for research collaborations, student exchange programs, joint degree offerings, and faculty exchanges. The institute regularly hosts international conferences and workshops, attracting researchers from around the globe.',
  'ISI offers education at minimal cost with most programs having very low tuition fees (₹2,000-₹40,000 total program cost). All students receive monthly stipends ranging from ₹8,000 to ₹12,000 depending on the program. Merit-based scholarships are available for exceptional students. PhD students receive government fellowships and research assistantships. The institute also provides financial assistance for conference participation, research activities, and international collaborations. Additional support is available for students from economically weaker sections.',
  'Success at ISI requires strong mathematical foundations and analytical thinking skills. Focus on building expertise in linear algebra, calculus, probability theory, and statistical inference. Practice extensively with previous year papers as ISI maintains consistent exam patterns and difficulty levels. Develop problem-solving skills through regular practice of challenging mathematical problems from various competitions and textbooks. Join study groups and online communities for peer learning. Seek guidance from current students, alumni, or faculty members. Maintain consistency in preparation and allocate sufficient time for each subject area.',
  'ISI offers a unique combination of rigorous academics, cutting-edge research opportunities, and excellent career prospects. The institute provides high-quality education at minimal cost with guaranteed stipends, ensuring financial accessibility for students from all backgrounds. Small batch sizes ensure personalized attention from world-renowned faculty. Students gain exposure to international research standards and have opportunities to collaborate with leading researchers. The strong alumni network provides excellent mentorship and career guidance. The interdisciplinary approach prepares students for diverse career paths in academia, industry, and research.',
  '[
    {"question": "Is ISI better than IITs for Statistics and Data Science?", "answer": "ISI offers specialized programs with deeper focus on theoretical foundations of statistics and mathematics, while IITs offer broader engineering-based data science programs. For pure statistics, mathematics, and research-oriented careers, ISI is unmatched in India."},
    {"question": "What are the hostel facilities like at ISI?", "answer": "ISI provides well-maintained hostels with modern amenities including Wi-Fi, common rooms, mess facilities, and recreational areas. The hostels are subsidized and offer affordable accommodation for all students."},
    {"question": "How difficult is the ISI entrance exam?", "answer": "The ISI entrance exam is conceptually challenging and requires deep understanding of mathematical concepts rather than speed-based problem solving. It tests mathematical maturity, analytical thinking, and problem-solving abilities."},
    {"question": "Do all students receive stipends at ISI?", "answer": "Yes, all admitted students receive monthly stipends. The amount varies by program but typically ranges from ₹8,000 to ₹12,000 per month, making it financially attractive for students."},
    {"question": "What are the research opportunities at ISI?", "answer": "ISI offers excellent research opportunities with world-class faculty, access to international conferences, collaboration with global institutions, and funding support for research projects. Students can work on cutting-edge problems in their field of interest."},
    {"question": "Can students from non-mathematics backgrounds apply?", "answer": "Several programs accept students from diverse backgrounds, but strong mathematical aptitude and analytical skills are essential for success in all ISI programs. The entrance exams test mathematical foundations regardless of the specific program."}
  ]'::jsonb
) ON CONFLICT (name) DO NOTHING;

-- Insert MSQMS course with detailed information
INSERT INTO public.courses (
  exam_id,
  name,
  description,
  duration,
  intake_capacity,
  average_package,
  degree_type,
  placement_statistics,
  course_overview,
  entrance_exam_details,
  freemium_group,
  premium_group
) VALUES (
  (SELECT id FROM exams WHERE name = 'ISI' LIMIT 1),
  'Master of Science in Quality Management Science (MSQMS)',
  'A unique 2-year interdisciplinary program combining Statistics, Operations Research, and Quality Management',
  '2 Years (4 Semesters)',
  '15 seats per year',
  '₹7-12 LPA',
  'Master''s Degree',
  '100% placement record with leading companies across industries including manufacturing, consulting, analytics, and technology sectors. Graduates receive multiple job offers with attractive packages and growth opportunities.',
  'The Master of Science in Quality Management Science (MSQMS) is ISI''s flagship interdisciplinary program that uniquely combines statistical methods, operations research techniques, and quality management principles. This program is designed to create industry-ready professionals who can apply statistical thinking to solve complex business problems. Students experience a dual-campus journey with the first year in Bangalore and second year in Hyderabad, providing exposure to diverse industrial environments and extensive networking opportunities with industry professionals.',
  'Entrance through ISI Admission Test consisting of Part A (MCQ format covering quantitative aptitude, general aptitude, and basic statistics) and Part B (descriptive questions on applied statistics, probability, linear algebra, and optimization). The exam tests mathematical maturity, analytical thinking, and problem-solving skills. Typical cutoffs range from 45-55 marks for general category out of 100 total marks.',
  'isi-msqms-free',
  'isi-msqms-premium'
) ON CONFLICT DO NOTHING;

-- Update existing exams with better content
UPDATE public.exams SET
  short_description = CASE 
    WHEN name = 'JEE Main & Advanced' THEN 'Premier engineering entrance exam for IITs, NITs & top colleges'
    WHEN name = 'NEET' THEN 'National medical entrance exam for MBBS, BDS & medical courses'
    WHEN name = 'UPSC Civil Services' THEN 'Most prestigious exam for IAS, IPS & other civil services'
    WHEN name = 'GATE' THEN 'Graduate Aptitude Test for M.Tech admissions & PSU jobs'
    WHEN name = 'CAT' THEN 'Common Admission Test for IIMs & top MBA colleges'
    ELSE short_description
  END,
  detailed_description = CASE
    WHEN name = 'JEE Main & Advanced' THEN 'The Joint Entrance Examination (JEE) is the most prestigious engineering entrance exam in India, conducted for admission to the Indian Institutes of Technology (IITs), National Institutes of Technology (NITs), and other premier engineering institutions. JEE Advanced is exclusively for IIT admissions and is considered one of the toughest competitive exams globally.'
    WHEN name = 'NEET' THEN 'The National Eligibility cum Entrance Test (NEET) is the sole entrance examination for admission to medical (MBBS), dental (BDS), AYUSH courses, and other medical programs in India. It replaced all other medical entrance exams and is conducted by the National Testing Agency (NTA).'
    ELSE detailed_description
  END,
  faqs = CASE
    WHEN name = 'JEE Main & Advanced' THEN '[
      {"question": "What is the difference between JEE Main and JEE Advanced?", "answer": "JEE Main is the first stage for admission to NITs, IIITs, and other engineering colleges, while JEE Advanced is exclusively for IIT admissions and requires qualification in JEE Main."},
      {"question": "How many attempts are allowed for JEE?", "answer": "Students can attempt JEE Main any number of times but only in consecutive years. For JEE Advanced, maximum 2 attempts are allowed."},
      {"question": "What is the exam pattern for JEE Advanced?", "answer": "JEE Advanced consists of two papers (Paper 1 and Paper 2), each of 3 hours duration, covering Physics, Chemistry, and Mathematics with various question types."}
    ]'::jsonb
    WHEN name = 'NEET' THEN '[
      {"question": "Is NEET mandatory for all medical admissions?", "answer": "Yes, NEET is mandatory for admission to all medical, dental, AYUSH courses in government and private colleges across India."},
      {"question": "What is the NEET exam pattern?", "answer": "NEET is a single paper with 180 questions (45 each from Physics, Chemistry, Botany, and Zoology) for 720 marks in 3 hours."},
      {"question": "How many times can I attempt NEET?", "answer": "There is no limit on the number of attempts for NEET, but candidates must meet age criteria."}
    ]'::jsonb
    ELSE faqs
  END
WHERE name IN ('JEE Main & Advanced', 'NEET', 'UPSC Civil Services', 'GATE', 'CAT');
