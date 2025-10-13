-- Add new columns to exams table for additional content sections
ALTER TABLE exams ADD COLUMN IF NOT EXISTS syllabus TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS campus TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS admission_procedure TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS exam_pattern TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS pyqs TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS cutoff_trends TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS short_notes TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS important_dates TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS eligibility_criteria TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS exam_centers TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS scholarships_stipends TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS recommended_books TEXT;

-- Add new columns to courses table for additional content sections
ALTER TABLE courses ADD COLUMN IF NOT EXISTS exam_pattern TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS skills_learning_outcomes TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS admission_procedure TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS preparation_strategy TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS syllabus TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS short_notes TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS chapter_wise_questions TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS full_length_mocks TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_curriculum TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS projects_assignments TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS day_in_life TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS campus_life TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS alumni_stories TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS global_exposure TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_comparison TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS quick_facts TEXT;

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
) ON CONFLICT (name) DO NOTHING;