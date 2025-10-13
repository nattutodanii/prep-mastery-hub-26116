-- First, let's add sample data step by step to avoid subquery issues

-- Insert exams one by one
INSERT INTO public.exams (name, description) 
SELECT 'CMI MSDS', 'Chennai Mathematical Institute - MSc in Data Science'
WHERE NOT EXISTS (SELECT 1 FROM public.exams WHERE name = 'CMI MSDS');

INSERT INTO public.exams (name, description) 
SELECT 'CAT', 'Common Admission Test'
WHERE NOT EXISTS (SELECT 1 FROM public.exams WHERE name = 'CAT');

INSERT INTO public.exams (name, description) 
SELECT 'GATE CS', 'Graduate Aptitude Test in Engineering - Computer Science'
WHERE NOT EXISTS (SELECT 1 FROM public.exams WHERE name = 'GATE CS');

-- Get the exam IDs for courses
DO $$
DECLARE
    cmi_exam_id UUID;
    cat_exam_id UUID;
    gate_exam_id UUID;
BEGIN
    SELECT id INTO cmi_exam_id FROM public.exams WHERE name = 'CMI MSDS' LIMIT 1;
    SELECT id INTO cat_exam_id FROM public.exams WHERE name = 'CAT' LIMIT 1;
    SELECT id INTO gate_exam_id FROM public.exams WHERE name = 'GATE CS' LIMIT 1;

    -- Insert courses
    INSERT INTO public.courses (exam_id, name, description) 
    SELECT cmi_exam_id, 'Mathematics & Statistics', 'Core mathematics and statistics curriculum'
    WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE name = 'Mathematics & Statistics');

    INSERT INTO public.courses (exam_id, name, description) 
    SELECT cat_exam_id, 'Quantitative Aptitude', 'Mathematical reasoning and data interpretation'
    WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE name = 'Quantitative Aptitude');

    INSERT INTO public.courses (exam_id, name, description) 
    SELECT gate_exam_id, 'Computer Science & Engineering', 'Core CS subjects and programming'
    WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE name = 'Computer Science & Engineering');
END $$;