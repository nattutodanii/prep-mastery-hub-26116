-- Update subscription type enum if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_type') THEN
        CREATE TYPE subscription_type AS ENUM ('freemium', 'premium');
    END IF;
END $$;

-- Update question type enum
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
        CREATE TYPE question_type AS ENUM ('MCQ', 'MSQ', 'NAT', 'SUB');
    END IF;
END $$;

-- Add sample exams data
INSERT INTO public.exams (name, description) VALUES 
('CMI MSDS', 'Chennai Mathematical Institute - MSc in Data Science'),
('CAT', 'Common Admission Test'),
('GATE CS', 'Graduate Aptitude Test in Engineering - Computer Science'),
('JEE Advanced', 'Joint Entrance Examination Advanced')
ON CONFLICT DO NOTHING;

-- Add sample courses data  
INSERT INTO public.courses (exam_id, name, description) VALUES 
((SELECT id FROM exams WHERE name = 'CMI MSDS'), 'Mathematics & Statistics', 'Core mathematics and statistics curriculum'),
((SELECT id FROM exams WHERE name = 'CMI MSDS'), 'Computer Science', 'Programming and algorithms curriculum'),
((SELECT id FROM exams WHERE name = 'CAT'), 'Quantitative Aptitude', 'Mathematical reasoning and data interpretation'),
((SELECT id FROM exams WHERE name = 'CAT'), 'Verbal Ability', 'English language and comprehension'),
((SELECT id FROM exams WHERE name = 'GATE CS'), 'Computer Science & Engineering', 'Core CS subjects and programming'),
((SELECT id FROM exams WHERE name = 'JEE Advanced'), 'PCM', 'Physics, Chemistry, Mathematics')
ON CONFLICT DO NOTHING;

-- Add sample subjects
INSERT INTO public.subjects (course_id, name, description, order_index) VALUES 
((SELECT id FROM courses WHERE name = 'Mathematics & Statistics'), 'Algebra', 'Linear algebra, sequences, series', 1),
((SELECT id FROM courses WHERE name = 'Mathematics & Statistics'), 'Calculus', 'Differential and integral calculus', 2),
((SELECT id FROM courses WHERE name = 'Mathematics & Statistics'), 'Statistics', 'Probability and statistical methods', 3),
((SELECT id FROM courses WHERE name = 'Quantitative Aptitude'), 'Arithmetic', 'Basic mathematical operations', 1),
((SELECT id FROM courses WHERE name = 'Quantitative Aptitude'), 'Algebra', 'Equations and inequalities', 2),
((SELECT id FROM courses WHERE name = 'Computer Science & Engineering'), 'Data Structures', 'Arrays, trees, graphs', 1),
((SELECT id FROM courses WHERE name = 'Computer Science & Engineering'), 'Algorithms', 'Sorting, searching, optimization', 2)
ON CONFLICT DO NOTHING;

-- Add sample units
INSERT INTO public.units (subject_id, name, description, order_index) VALUES 
((SELECT id FROM subjects WHERE name = 'Algebra' AND course_id = (SELECT id FROM courses WHERE name = 'Mathematics & Statistics')), 'Sequences & Series', 'Arithmetic and geometric progressions', 1),
((SELECT id FROM subjects WHERE name = 'Algebra' AND course_id = (SELECT id FROM courses WHERE name = 'Mathematics & Statistics')), 'Linear Algebra', 'Matrices and vector spaces', 2),
((SELECT id FROM subjects WHERE name = 'Calculus'), 'Differential Calculus', 'Limits, derivatives, applications', 1),
((SELECT id FROM subjects WHERE name = 'Calculus'), 'Integral Calculus', 'Integration techniques and applications', 2),
((SELECT id FROM subjects WHERE name = 'Statistics'), 'Probability', 'Basic probability and distributions', 1),
((SELECT id FROM subjects WHERE name = 'Data Structures'), 'Linear Data Structures', 'Arrays, stacks, queues', 1),
((SELECT id FROM subjects WHERE name = 'Data Structures'), 'Trees', 'Binary trees, BST, heaps', 2)
ON CONFLICT DO NOTHING;

-- Add sample chapters
INSERT INTO public.chapters (unit_id, name, description, order_index, notes, short_notes) VALUES 
((SELECT id FROM units WHERE name = 'Sequences & Series'), 'Arithmetic Progressions', 'Study of arithmetic sequences', 1, 
'# Arithmetic Progressions

An **arithmetic progression (AP)** is a sequence where the difference between consecutive terms is constant.

## Definition
If $a_1, a_2, a_3, \ldots$ is an AP with first term $a$ and common difference $d$, then:
$$a_n = a + (n-1)d$$

## Sum Formula
The sum of first $n$ terms is:
$$S_n = \frac{n}{2}[2a + (n-1)d]$$

## Properties
- Common difference: $d = a_{n+1} - a_n$
- If three terms $a, b, c$ are in AP, then $2b = a + c$',

'# AP Quick Notes

**General term:** $a_n = a + (n-1)d$

**Sum:** $S_n = \frac{n}{2}[2a + (n-1)d]$

**Common difference:** $d = a_{n+1} - a_n$'),

((SELECT id FROM units WHERE name = 'Sequences & Series'), 'Geometric Progressions', 'Study of geometric sequences', 2,
'# Geometric Progressions

A **geometric progression (GP)** is a sequence where each term is obtained by multiplying the previous term by a constant ratio.

## Definition
If $a_1, a_2, a_3, \ldots$ is a GP with first term $a$ and common ratio $r$, then:
$$a_n = ar^{n-1}$$

## Sum Formula
- Finite GP: $S_n = a\frac{r^n - 1}{r - 1}$ (when $r \neq 1$)
- Infinite GP: $S_\infty = \frac{a}{1-r}$ (when $|r| < 1$)

## Properties
- Common ratio: $r = \frac{a_{n+1}}{a_n}$
- If three terms $a, b, c$ are in GP, then $b^2 = ac$',

'# GP Quick Notes

**General term:** $a_n = ar^{n-1}$

**Sum (finite):** $S_n = a\frac{r^n - 1}{r - 1}$

**Sum (infinite):** $S_\infty = \frac{a}{1-r}$ when $|r| < 1$'),

((SELECT id FROM units WHERE name = 'Linear Algebra'), 'Matrices', 'Matrix operations and properties', 1,
'# Matrices

A **matrix** is a rectangular array of numbers arranged in rows and columns.

## Matrix Operations
- **Addition:** $(A + B)_{ij} = A_{ij} + B_{ij}$
- **Multiplication:** $(AB)_{ij} = \sum_{k=1}^n A_{ik}B_{kj}$

## Determinant
For a $2 \times 2$ matrix:
$$\det\begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc$$

## Inverse
If $\det(A) \neq 0$, then $A^{-1} = \frac{1}{\det(A)} \text{adj}(A)$',

'# Matrix Quick Notes

**Det(2×2):** $ad - bc$

**Inverse:** $A^{-1} = \frac{1}{\det(A)} \text{adj}(A)$

**Multiplication:** Rows × Columns'),

((SELECT id FROM units WHERE name = 'Probability'), 'Basic Probability', 'Fundamental concepts of probability', 1,
'# Basic Probability

**Probability** measures the likelihood of an event occurring.

## Definition
For an event $E$ in sample space $S$:
$$P(E) = \frac{\text{Number of favorable outcomes}}{\text{Total number of outcomes}}$$

## Properties
- $0 \leq P(E) \leq 1$
- $P(S) = 1$ (certain event)
- $P(\phi) = 0$ (impossible event)
- $P(E^c) = 1 - P(E)$ (complement)

## Addition Rule
$$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$',

'# Probability Quick Notes

**Basic:** $P(E) = \frac{\text{Favorable}}{\text{Total}}$

**Range:** $0 \leq P(E) \leq 1$

**Addition:** $P(A \cup B) = P(A) + P(B) - P(A \cap B)$')

ON CONFLICT DO NOTHING;

-- Add sample chapter questions
INSERT INTO public.chapter_questions (
    chapter_id, question_statement, question_type, options, answer, solution, 
    is_pyq, pyq_year, correct_marks, incorrect_marks, skipped_marks, partial_marks, time_minutes
) VALUES 
-- AP Questions
((SELECT id FROM chapters WHERE name = 'Arithmetic Progressions'), 
'Find the 10th term of the AP: $3, 7, 11, 15, \ldots$', 
'MCQ', 
'["$35$", "$39$", "$43$", "$47$"]',
'$39$',
'Given AP: $3, 7, 11, 15, \ldots$\n\nFirst term $a = 3$, common difference $d = 7 - 3 = 4$\n\nUsing $a_n = a + (n-1)d$:\n$a_{10} = 3 + (10-1) \times 4 = 3 + 36 = 39$',
true, 2023, 4, -1, 0, 1, 2),

((SELECT id FROM chapters WHERE name = 'Arithmetic Progressions'),
'The sum of first 20 terms of an AP is $400$ and the sum of first 40 terms is $1600$. Find the first term.',
'NAT',
null,
'$-5$',
'Let first term be $a$ and common difference be $d$.\n\nGiven: $S_{20} = 400$ and $S_{40} = 1600$\n\nUsing $S_n = \frac{n}{2}[2a + (n-1)d]$:\n\n$S_{20} = \frac{20}{2}[2a + 19d] = 10[2a + 19d] = 400$\n$\Rightarrow 2a + 19d = 40$ ... (1)\n\n$S_{40} = \frac{40}{2}[2a + 39d] = 20[2a + 39d] = 1600$\n$\Rightarrow 2a + 39d = 80$ ... (2)\n\nSubtracting (1) from (2): $20d = 40 \Rightarrow d = 2$\n\nSubstituting in (1): $2a + 19(2) = 40 \Rightarrow 2a = 2 \Rightarrow a = -5$',
false, null, 4, -1, 0, 1, 3),

-- GP Questions  
((SELECT id FROM chapters WHERE name = 'Geometric Progressions'),
'In a GP, if the 3rd term is $12$ and the 6th term is $96$, find the first term.',
'MCQ',
'["$1.5$", "$3$", "$6$", "$12$"]',
'$3$',
'Let first term be $a$ and common ratio be $r$.\n\nGiven: $a_3 = 12$ and $a_6 = 96$\n\nUsing $a_n = ar^{n-1}$:\n$a_3 = ar^2 = 12$ ... (1)\n$a_6 = ar^5 = 96$ ... (2)\n\nDividing (2) by (1): $\frac{ar^5}{ar^2} = \frac{96}{12} \Rightarrow r^3 = 8 \Rightarrow r = 2$\n\nSubstituting in (1): $a \times 4 = 12 \Rightarrow a = 3$',
true, 2022, 4, -1, 0, 1, 3),

-- Matrix Questions
((SELECT id FROM chapters WHERE name = 'Matrices'),
'Find the determinant of matrix $A = \begin{pmatrix} 2 & 3 \\ 1 & 4 \end{pmatrix}$',
'NAT',
null,
'$5$',
'For a $2 \times 2$ matrix $\begin{pmatrix} a & b \\ c & d \end{pmatrix}$, determinant = $ad - bc$\n\n$\det(A) = 2 \times 4 - 3 \times 1 = 8 - 3 = 5$',
false, null, 4, -1, 0, 1, 2),

-- Probability Questions
((SELECT id FROM chapters WHERE name = 'Basic Probability'),
'A die is thrown twice. What is the probability of getting sum equal to $8$?',
'MSQ',
'["$\frac{1}{9}$", "$\frac{5}{36}$", "$\frac{1}{6}$", "$\frac{7}{36}$"]',
'$\frac{5}{36}$',
'When a die is thrown twice, total outcomes = $6 \times 6 = 36$\n\nFavorable outcomes for sum = 8:\n$(2,6), (3,5), (4,4), (5,3), (6,2)$ = 5 outcomes\n\nProbability = $\frac{5}{36}$',
true, 2021, 4, -1, 0, 1, 2);

-- Add sample mock questions
INSERT INTO public.mock_questions (
    course_id, mock_name, question_statement, question_type, options, answer, solution,
    correct_marks, incorrect_marks, skipped_marks, partial_marks, time_minutes
) VALUES 
((SELECT id FROM courses WHERE name = 'Mathematics & Statistics'),
'Mock Test 1',
'Evaluate: $\lim_{x \to 0} \frac{\sin x}{x}$',
'MCQ',
'["$0$", "$1$", "$\infty$", "Does not exist"]',
'$1$',
'This is a standard limit. Using L''Hôpital''s rule or known result:\n$\lim_{x \to 0} \frac{\sin x}{x} = 1$',
4, -1, 0, 1, 2),

((SELECT id FROM courses WHERE name = 'Mathematics & Statistics'),
'Mock Test 1', 
'Find the value of $x$ for which the matrix $\begin{pmatrix} x & 2 \\ 3 & x \end{pmatrix}$ is singular.',
'NAT',
null,
'$\pm\sqrt{6}$',
'A matrix is singular when its determinant is zero.\n\n$\det = x \cdot x - 2 \cdot 3 = x^2 - 6 = 0$\n\n$x^2 = 6 \Rightarrow x = \pm\sqrt{6}$',
4, -1, 0, 1, 3);

-- Add sample test questions  
INSERT INTO public.test_questions (
    course_id, test_name, question_statement, question_type, options, answer, solution,
    correct_marks, incorrect_marks, skipped_marks, partial_marks, time_minutes
) VALUES 
((SELECT id FROM courses WHERE name = 'Mathematics & Statistics'),
'Unit 1 Test',
'If $a, b, c$ are in arithmetic progression, then $a^2(b+c), b^2(c+a), c^2(a+b)$ are in:',
'MCQ',
'["Arithmetic progression", "Geometric progression", "Harmonic progression", "None of these"]',
'Arithmetic progression',
'Since $a, b, c$ are in AP, we have $2b = a + c$.\n\nLet''s check if $a^2(b+c), b^2(c+a), c^2(a+b)$ are in AP.\n\nUsing the property and algebraic manipulation, we can show that these terms form an AP.',
4, -1, 0, 1, 4);

-- Enable RLS on all tables and add policies
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to curriculum data
CREATE POLICY "Anyone can view exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Anyone can view units" ON public.units FOR SELECT USING (true);
CREATE POLICY "Anyone can view chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Anyone can view chapter questions" ON public.chapter_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can view mock questions" ON public.mock_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can view test questions" ON public.test_questions FOR SELECT USING (true);

-- Create user-specific tables
CREATE TABLE IF NOT EXISTS public.bookmarked_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    question_id UUID NOT NULL,
    question_type TEXT NOT NULL,
    test_history_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.test_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    chapter_id UUID,
    test_name TEXT NOT NULL,
    test_type TEXT NOT NULL, -- 'chapter-practice', 'chapter-pyq', 'mock', 'pyp', 'test-series'
    mode TEXT NOT NULL, -- 'practice', 'test'
    total_questions INTEGER NOT NULL,
    attempted_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    incorrect_answers INTEGER NOT NULL,
    skipped_questions INTEGER NOT NULL,
    total_marks DECIMAL NOT NULL,
    obtained_marks DECIMAL NOT NULL,
    time_taken_minutes INTEGER NOT NULL,
    answers JSONB NOT NULL,
    completed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    chapter_practice_completed BOOLEAN DEFAULT false,
    chapter_pyq_completed BOOLEAN DEFAULT false,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user tables
ALTER TABLE public.bookmarked_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user tables
CREATE POLICY "Users can view their own bookmarks" ON public.bookmarked_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookmarks" ON public.bookmarked_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarked_questions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own test history" ON public.test_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own test history" ON public.test_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own test history" ON public.test_history FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger to auto-update updated_at in profiles
CREATE OR REPLACE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();