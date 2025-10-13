-- Create subscription type enum
CREATE TYPE subscription_type AS ENUM ('freemium', 'premium');

-- Create question type enum
CREATE TYPE question_type AS ENUM ('MCQ', 'MSQ', 'NAT', 'SUB');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  selected_exam_id UUID,
  selected_course_id UUID,
  subscription subscription_type NOT NULL DEFAULT 'freemium',
  subscription_expiry TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create units table
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chapters table
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  notes TEXT, -- LaTeX content
  short_notes TEXT, -- LaTeX content
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chapter_questions table
CREATE TABLE public.chapter_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  question_statement TEXT NOT NULL,
  question_type question_type NOT NULL,
  options JSONB, -- Array of options for MCQ/MSQ
  answer TEXT NOT NULL,
  solution TEXT NOT NULL,
  is_pyq BOOLEAN NOT NULL DEFAULT false,
  pyq_year INTEGER,
  correct_marks FLOAT NOT NULL DEFAULT 4,
  incorrect_marks FLOAT NOT NULL DEFAULT -1,
  skipped_marks FLOAT NOT NULL DEFAULT 0,
  partial_marks FLOAT DEFAULT 1,
  time_minutes INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mock_questions table
CREATE TABLE public.mock_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  mock_name TEXT NOT NULL,
  question_statement TEXT NOT NULL,
  question_type question_type NOT NULL,
  options JSONB,
  answer TEXT NOT NULL,
  solution TEXT NOT NULL,
  correct_marks FLOAT NOT NULL DEFAULT 4,
  incorrect_marks FLOAT NOT NULL DEFAULT -1,
  skipped_marks FLOAT NOT NULL DEFAULT 0,
  partial_marks FLOAT DEFAULT 1,
  time_minutes INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test_questions table
CREATE TABLE public.test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  test_name TEXT NOT NULL,
  question_statement TEXT NOT NULL,
  question_type question_type NOT NULL,
  options JSONB,
  answer TEXT NOT NULL,
  solution TEXT NOT NULL,
  correct_marks FLOAT NOT NULL DEFAULT 4,
  incorrect_marks FLOAT NOT NULL DEFAULT -1,
  skipped_marks FLOAT NOT NULL DEFAULT 0,
  partial_marks FLOAT DEFAULT 1,
  time_minutes INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_progress table
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  chapter_practice_completed BOOLEAN DEFAULT false,
  chapter_pyq_completed BOOLEAN DEFAULT false,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, chapter_id)
);

-- Create test_history table
CREATE TABLE public.test_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  test_type TEXT NOT NULL, -- 'chapter-practice', 'chapter-pyq', 'mock', 'pyp', 'test-series'
  test_name TEXT NOT NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  mode TEXT NOT NULL, -- 'practice' or 'test'
  total_questions INTEGER NOT NULL,
  attempted_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  incorrect_answers INTEGER NOT NULL,
  skipped_questions INTEGER NOT NULL,
  total_marks FLOAT NOT NULL,
  obtained_marks FLOAT NOT NULL,
  time_taken_minutes INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT true,
  answers JSONB NOT NULL, -- Store user answers
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookmarked_questions table
CREATE TABLE public.bookmarked_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  question_id UUID NOT NULL, -- References any question table
  question_type TEXT NOT NULL, -- 'chapter', 'mock', 'test'
  test_history_id UUID REFERENCES public.test_history(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, question_id, question_type)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarked_questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for content tables (public read access)
CREATE POLICY "Anyone can view exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Anyone can view units" ON public.units FOR SELECT USING (true);
CREATE POLICY "Anyone can view chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Anyone can view chapter questions" ON public.chapter_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can view mock questions" ON public.mock_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can view test questions" ON public.test_questions FOR SELECT USING (true);

-- Create RLS policies for user data
CREATE POLICY "Users can view their own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own test history" ON public.test_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own test history" ON public.test_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own test history" ON public.test_history FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own bookmarks" ON public.bookmarked_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookmarks" ON public.bookmarked_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarked_questions FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.exams (id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'CMI', 'Chennai Mathematical Institute'),
  ('550e8400-e29b-41d4-a716-446655440002', 'IIT JAM', 'Indian Institute of Technology Joint Admission Test'),
  ('550e8400-e29b-41d4-a716-446655440003', 'MBA', 'Master of Business Administration');

INSERT INTO public.courses (id, exam_id, name, description) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'CMI MSDS', 'Master of Science in Data Science'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'CMI MATHS', 'Master of Science in Mathematics'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'IIT JAM Mathematics', 'Mathematics'),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'IIT JAM Statistics', 'Mathematical Statistics'),
  ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'CAT', 'Common Admission Test');

INSERT INTO public.subjects (id, course_id, name, description, order_index) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Mathematics', 'Core Mathematics', 1),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Statistics', 'Statistical Methods', 2),
  ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'Algebra', 'Linear and Abstract Algebra', 1),
  ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', 'Calculus', 'Differential and Integral Calculus', 1),
  ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440005', 'Quantitative Aptitude', 'Mathematical Problem Solving', 1);

INSERT INTO public.units (id, subject_id, name, description, order_index) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Linear Algebra', 'Vectors and Matrices', 1),
  ('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Probability', 'Basic Probability Theory', 1),
  ('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'Group Theory', 'Abstract Algebra', 1),
  ('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'Limits and Continuity', 'Basic Calculus', 1),
  ('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', 'Arithmetic', 'Basic Mathematics', 1);

INSERT INTO public.chapters (id, unit_id, name, description, notes, short_notes, order_index) VALUES
  ('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'Vector Spaces', 'Introduction to Vector Spaces', 
   '\section{Vector Spaces}\n\nA vector space $V$ over a field $F$ is a set equipped with two operations:\n\n\begin{itemize}\n\item Vector addition: $u + v \in V$ for all $u, v \in V$\n\item Scalar multiplication: $c \cdot v \in V$ for all $c \in F, v \in V$\n\end{itemize}\n\n\textbf{Axioms:}\n\begin{enumerate}\n\item $(u + v) + w = u + (v + w)$ (Associativity)\n\item $u + v = v + u$ (Commutativity)\n\item There exists $0 \in V$ such that $v + 0 = v$ for all $v \in V$\n\item For each $v \in V$, there exists $-v \in V$ such that $v + (-v) = 0$\n\end{enumerate}',
   '\textbf{Vector Space Quick Notes:}\n\n$V$ over field $F$ with operations $+$ and $\cdot$\n\nKey properties:\n\begin{itemize}\n\item Closure under addition and scalar multiplication\n\item Associativity and commutativity of addition\n\item Existence of zero vector and additive inverses\n\item Distributivity laws\n\end{itemize}', 1),
  ('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 'Basic Probability', 'Fundamentals of Probability',
   '\section{Basic Probability}\n\n\textbf{Sample Space:} The set of all possible outcomes of an experiment, denoted by $S$ or $\Omega$.\n\n\textbf{Event:} A subset of the sample space.\n\n\textbf{Probability:} For any event $A$, $P(A)$ satisfies:\n\begin{enumerate}\n\item $0 \leq P(A) \leq 1$\n\item $P(S) = 1$\n\item For mutually exclusive events $A_1, A_2, \ldots$:\n$$P(A_1 \cup A_2 \cup \cdots) = P(A_1) + P(A_2) + \cdots$$\n\end{enumerate}',
   '\textbf{Probability Quick Notes:}\n\n$P(A) \in [0,1]$, $P(S) = 1$\n\nKey formulas:\n\begin{itemize}\n\item $P(A^c) = 1 - P(A)$\n\item $P(A \cup B) = P(A) + P(B) - P(A \cap B)$\n\item $P(A|B) = \frac{P(A \cap B)}{P(B)}$\n\end{itemize}', 1);

-- Insert sample questions
INSERT INTO public.chapter_questions (id, chapter_id, question_statement, question_type, options, answer, solution, is_pyq, pyq_year, correct_marks, incorrect_marks, time_minutes) VALUES
  ('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 
   'Let $V$ be a vector space over field $\mathbb{R}$. Which of the following is NOT a required axiom for vector addition?', 
   'MCQ', 
   '["Associativity: $(u + v) + w = u + (v + w)$", "Commutativity: $u + v = v + u$", "Distributivity: $c(u + v) = cu + cv$", "Identity: There exists $0$ such that $v + 0 = v$"]',
   'Distributivity: $c(u + v) = cu + cv$',
   'Distributivity is an axiom for scalar multiplication, not vector addition. The required axioms for vector addition are associativity, commutativity, identity, and inverse.',
   false, NULL, 4, -1, 2),
  ('aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001',
   'If $V = \mathbb{R}^3$ and $u = (1, 2, 3)$, $v = (4, 5, 6)$, what is $u + v$?',
   'MCQ',
   '["$(5, 7, 9)$", "$(4, 10, 18)$", "$(3, 3, 3)$", "$(1, 2, 3, 4, 5, 6)$"]',
   '$(5, 7, 9)$',
   'Vector addition in $\mathbb{R}^3$ is component-wise: $(1, 2, 3) + (4, 5, 6) = (1+4, 2+5, 3+6) = (5, 7, 9)$.',
   true, 2023, 4, -1, 2),
  ('aa0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440002',
   'A fair coin is tossed twice. What is the probability of getting at least one head?',
   'MCQ',
   '["$\frac{1}{4}$", "$\frac{1}{2}$", "$\frac{3}{4}$", "$1$"]',
   '$\frac{3}{4}$',
   'Sample space: $\{HH, HT, TH, TT\}$. Favorable outcomes (at least one head): $\{HH, HT, TH\}$. Probability = $\frac{3}{4}$.',
   false, NULL, 4, -1, 2);

-- Insert mock questions
INSERT INTO public.mock_questions (id, course_id, mock_name, question_statement, question_type, options, answer, solution, correct_marks, incorrect_marks, time_minutes) VALUES
  ('bb0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Mock Test 1',
   'What is the determinant of the matrix $\begin{pmatrix} 2 & 1 \\ 3 & 4 \end{pmatrix}$?',
   'NAT', NULL, '5',
   'For a $2 \times 2$ matrix $\begin{pmatrix} a & b \\ c & d \end{pmatrix}$, determinant = $ad - bc = 2(4) - 1(3) = 8 - 3 = 5$.',
   4, -1, 3);

-- Insert test series questions
INSERT INTO public.test_questions (id, course_id, test_name, question_statement, question_type, options, answer, solution, correct_marks, incorrect_marks, time_minutes) VALUES
  ('cc0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Unit Test 1',
   'Which of the following are properties of vector spaces? (Select all correct options)',
   'MSQ',
   '["Closure under addition", "Closure under scalar multiplication", "Commutativity of multiplication", "Existence of additive identity"]',
   'Closure under addition,Closure under scalar multiplication,Existence of additive identity',
   'Vector spaces must be closed under addition and scalar multiplication, and must have an additive identity. Commutativity of multiplication is not a requirement.',
   4, -1, 3);