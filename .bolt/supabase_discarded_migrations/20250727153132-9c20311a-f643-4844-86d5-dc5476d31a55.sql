-- Continue with subjects, units, and chapters data
DO $$
DECLARE
    math_course_id UUID;
    cs_course_id UUID;
    cat_course_id UUID;
    gate_course_id UUID;
BEGIN
    -- Get course IDs
    SELECT id INTO math_course_id FROM public.courses WHERE name = 'Mathematics & Statistics' LIMIT 1;
    SELECT id INTO cat_course_id FROM public.courses WHERE name = 'Quantitative Aptitude' LIMIT 1;
    SELECT id INTO gate_course_id FROM public.courses WHERE name = 'Computer Science & Engineering' LIMIT 1;

    -- Add subjects
    INSERT INTO public.subjects (course_id, name, description, order_index) 
    SELECT math_course_id, 'Algebra', 'Linear algebra, sequences, series', 1
    WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE name = 'Algebra' AND course_id = math_course_id);

    INSERT INTO public.subjects (course_id, name, description, order_index) 
    SELECT math_course_id, 'Calculus', 'Differential and integral calculus', 2
    WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE name = 'Calculus' AND course_id = math_course_id);

    INSERT INTO public.subjects (course_id, name, description, order_index) 
    SELECT math_course_id, 'Statistics', 'Probability and statistical methods', 3
    WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE name = 'Statistics' AND course_id = math_course_id);

    INSERT INTO public.subjects (course_id, name, description, order_index) 
    SELECT cat_course_id, 'Arithmetic', 'Basic mathematical operations', 1
    WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE name = 'Arithmetic' AND course_id = cat_course_id);

    INSERT INTO public.subjects (course_id, name, description, order_index) 
    SELECT gate_course_id, 'Data Structures', 'Arrays, trees, graphs', 1
    WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE name = 'Data Structures' AND course_id = gate_course_id);

    INSERT INTO public.subjects (course_id, name, description, order_index) 
    SELECT gate_course_id, 'Algorithms', 'Sorting, searching, optimization', 2
    WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE name = 'Algorithms' AND course_id = gate_course_id);
END $$;