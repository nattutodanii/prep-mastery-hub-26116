-- Add new columns to exams table for additional content sections
ALTER TABLE exams ADD COLUMN syllabus TEXT;
ALTER TABLE exams ADD COLUMN campus TEXT;
ALTER TABLE exams ADD COLUMN admission_procedure TEXT;
ALTER TABLE exams ADD COLUMN exam_pattern TEXT;
ALTER TABLE exams ADD COLUMN pyqs TEXT;
ALTER TABLE exams ADD COLUMN cutoff_trends TEXT;
ALTER TABLE exams ADD COLUMN short_notes TEXT;
ALTER TABLE exams ADD COLUMN important_dates TEXT;
ALTER TABLE exams ADD COLUMN eligibility_criteria TEXT;
ALTER TABLE exams ADD COLUMN exam_centers TEXT;
ALTER TABLE exams ADD COLUMN scholarships_stipends TEXT;
ALTER TABLE exams ADD COLUMN recommended_books TEXT;

-- Add new columns to courses table for additional content sections
ALTER TABLE courses ADD COLUMN exam_pattern TEXT;
ALTER TABLE courses ADD COLUMN skills_learning_outcomes TEXT;
ALTER TABLE courses ADD COLUMN admission_procedure TEXT;
ALTER TABLE courses ADD COLUMN preparation_strategy TEXT;
ALTER TABLE courses ADD COLUMN syllabus TEXT;
ALTER TABLE courses ADD COLUMN notes TEXT;
ALTER TABLE courses ADD COLUMN short_notes TEXT;
ALTER TABLE courses ADD COLUMN chapter_wise_questions TEXT;
ALTER TABLE courses ADD COLUMN full_length_mocks TEXT;
ALTER TABLE courses ADD COLUMN course_curriculum TEXT;
ALTER TABLE courses ADD COLUMN projects_assignments TEXT;
ALTER TABLE courses ADD COLUMN day_in_life TEXT;
ALTER TABLE courses ADD COLUMN campus_life TEXT;
ALTER TABLE courses ADD COLUMN alumni_stories TEXT;
ALTER TABLE courses ADD COLUMN global_exposure TEXT;
ALTER TABLE courses ADD COLUMN course_comparison TEXT;
ALTER TABLE courses ADD COLUMN quick_facts TEXT;

-- Insert CMI exam data
INSERT INTO exams (
  name, 
  short_description, 
  description,
  location,
  established_year,
  detailed_description,
  introduction,
  history,
  recognition,
  rankings,
  infrastructure,
  placements,
  global_collaborations,
  fees_scholarships,
  preparation_tips,
  why_choose,
  syllabus,
  campus,
  admission_procedure,
  exam_pattern,
  pyqs,
  cutoff_trends,
  short_notes,
  important_dates,
  eligibility_criteria,
  exam_centers,
  scholarships_stipends,
  recommended_books,
  campuses,
  faqs
) VALUES (
  'CMI',
  'Chennai Mathematical Institute - Premier research institute for mathematics, physics and computer science',
  'Chennai Mathematical Institute (CMI) is a premier research and education institute in mathematics, physics, and computer science, known for its rigorous academic programs and world-class research.',
  'Chennai, Tamil Nadu',
  1989,
  'Chennai Mathematical Institute (CMI) stands as one of India''s most prestigious institutions dedicated to advanced research and education in mathematics, physics, and computer science. Established in 1989, CMI has built a reputation for academic excellence, innovative research, and producing graduates who excel in academia and industry worldwide.',
  'CMI offers undergraduate, postgraduate, and doctoral programs designed to nurture mathematical thinking and computational skills. The institute''s unique approach combines theoretical rigor with practical applications.',
  'Founded in 1989 by SPIC Science Foundation, CMI began as a center for mathematical research and has evolved into a comprehensive institute offering programs across mathematics, physics, and computer science.',
  'CMI is recognized by the University Grants Commission (UGC) and is deemed to be a university under Section 3 of the UGC Act, 1956.',
  'Consistently ranked among the top institutions for mathematics and computer science research in India. High international recognition for research output.',
  'State-of-the-art computing facilities, well-equipped laboratories, extensive library with digital resources, and collaborative spaces designed for research.',
  'Graduates pursue careers in top universities worldwide, leading technology companies, research institutions, and academic positions at premier institutes.',
  'Collaborations with universities across USA, Europe, and Asia. Regular exchange programs and joint research initiatives.',
  'Merit-based scholarships available. Need-based financial assistance for deserving students. Research fellowships for doctoral programs.',
  'Focus on problem-solving skills, mathematical reasoning, and computational thinking. Regular seminars, workshops, and research interactions.',
  'World-class faculty, rigorous academics, research opportunities, international exposure, and strong alumni network in academia and industry.',
  'Mathematics: Algebra, Analysis, Geometry, Number Theory, Probability, Statistics. Physics: Classical Mechanics, Quantum Mechanics, Statistical Mechanics. Computer Science: Algorithms, Data Structures, Programming Languages, Computational Complexity.',
  'Single campus in Chennai with residential facilities, academic buildings, research centers, and recreational amenities.',
  'Online application process, entrance examination, interview rounds for shortlisted candidates, document verification, and counseling process.',
  'Multiple choice questions, subjective problems, programming tests (for CS), duration varies by program, emphasis on analytical thinking.',
  'Previous years'' question papers available, focus on mathematical problem-solving, computational thinking, and logical reasoning.',
  'Cutoff trends vary by program and category. Generally competitive with emphasis on mathematical aptitude and problem-solving skills.',
  'Comprehensive study materials, problem sets, reference books, and online resources available for preparation.',
  'Application deadlines, exam dates, result announcements, counseling schedules published on official website.',
  'Class 12 completion for UG, Bachelor''s degree for PG, Master''s degree for PhD. Specific subject requirements vary by program.',
  'Entrance exams conducted at Chennai and select cities across India. Online modes may be available.',
  'Merit-based scholarships, need-based financial aid, research assistantships, and fellowship programs available.',
  'Recommended textbooks in mathematics, physics, computer science, previous years'' papers, and reference materials for competitive preparation.',
  '["Chennai Main Campus - Academic buildings, hostels, library, computing center, recreational facilities"]'::jsonb,
  '[
    {"question": "What programs does CMI offer?", "answer": "CMI offers undergraduate programs in Mathematics, Physics, and Computer Science, postgraduate programs including MSc and PhD across these disciplines."},
    {"question": "How is the admission process?", "answer": "Admission is through entrance examinations followed by interviews for shortlisted candidates. The process emphasizes mathematical aptitude and problem-solving skills."},
    {"question": "What are the career prospects?", "answer": "Graduates pursue careers in top universities worldwide, leading technology companies, research institutions, and academic positions."},
    {"question": "Are scholarships available?", "answer": "Yes, merit-based scholarships and need-based financial assistance are available for deserving students."}
  ]'::jsonb
);

-- Insert CMI MSDS course data
INSERT INTO courses (
  exam_id,
  name,
  description,
  duration,
  intake_capacity,
  average_package,
  degree_type,
  course_overview,
  entrance_exam_details,
  placement_statistics,
  exam_pattern,
  skills_learning_outcomes,
  admission_procedure,
  preparation_strategy,
  syllabus,
  notes,
  short_notes,
  chapter_wise_questions,
  full_length_mocks,
  course_curriculum,
  projects_assignments,
  day_in_life,
  campus_life,
  alumni_stories,
  global_exposure,
  course_comparison,
  quick_facts,
  freemium_group,
  premium_group,
  is_calculator,
  is_parts,
  test_parts
) VALUES (
  (SELECT id FROM exams WHERE name = 'CMI'),
  'CMI MSDS',
  'Master of Science in Data Science - Advanced program combining mathematics, statistics, and computer science for data-driven insights',
  '2 Years',
  '40',
  '₹15-25 LPA',
  'Master''s',
  'The MSc in Data Science at CMI is designed to provide comprehensive training in mathematical foundations, statistical methods, and computational techniques essential for modern data science. The program combines theoretical rigor with practical applications.',
  'Entrance exam focusing on mathematics, statistics, probability, and basic programming concepts. Written test followed by interview for shortlisted candidates.',
  'Average placement package: ₹15-25 LPA. Top recruiters include tech giants, consulting firms, research institutions, and startups. 95% placement rate.',
  'Written examination covering mathematics, statistics, probability, and logical reasoning. Programming test and interview rounds.',
  'Advanced statistical analysis, machine learning algorithms, data visualization, big data processing, mathematical modeling, research methodology, and critical thinking.',
  'Online application submission, entrance examination, interview process, document verification, and final admission based on composite score.',
  'Focus on strengthening mathematical foundations, statistical concepts, programming skills, and analytical thinking. Practice with real datasets and case studies.',
  'Core Subjects: Linear Algebra, Probability Theory, Statistical Inference, Machine Learning, Data Mining, Database Systems. Electives: Deep Learning, Natural Language Processing, Computer Vision, Optimization.',
  'Comprehensive study materials, lecture notes, research papers, and practical assignments available through learning management system.',
  'Quick reference guides, formula sheets, key concepts summary, and cheat sheets for major topics and algorithms.',
  'Topic-wise practice problems, previous exam questions, assignment sets, and project-based questions for comprehensive preparation.',
  'Full-length practice tests, mock examinations, timed assessments, and comprehensive evaluation tests for exam preparation.',
  'Semester-wise curriculum covering mathematics, statistics, computer science fundamentals, advanced topics, and research project in final semester.',
  'Hands-on projects with real datasets, industry collaborations, research assignments, and capstone project in final semester.',
  'Daily schedule includes lectures, lab sessions, seminars, project work, and self-study. Strong emphasis on practical learning and research.',
  'Vibrant academic environment, research culture, seminars, workshops, cultural activities, sports facilities, and peer learning opportunities.',
  'Alumni working in top tech companies like Google, Microsoft, Facebook, leading consulting firms, research institutions, and pursuing PhD at premier universities.',
  'International collaborations, exchange programs, joint research projects, and opportunities for global internships and higher studies.',
  'Compared to other data science programs, CMI MSDS offers stronger mathematical foundation, research orientation, and excellent placement opportunities.',
  'Duration: 2 Years | Seats: 40 | Degree: MSc | Eligibility: Bachelor''s in Mathematics/Statistics/Computer Science/Engineering | Mode: Full-time',
  'cmi_msds_freemium',
  'cmi_msds_premium',
  true,
  false,
  null
);