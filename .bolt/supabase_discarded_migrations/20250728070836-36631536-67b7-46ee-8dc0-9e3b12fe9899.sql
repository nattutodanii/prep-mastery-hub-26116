-- Add sample questions to chapter_questions table
-- First, let's get a chapter ID to use
-- We'll use the chapter_id you specified: 990e8400-e29b-41d4-a716-446655440001

-- MSQ Question 1
INSERT INTO chapter_questions (
  id,
  chapter_id,
  question_statement,
  question_type,
  options,
  answer,
  solution,
  correct_marks,
  incorrect_marks,
  skipped_marks,
  partial_marks,
  time_minutes,
  is_pyq,
  pyq_year
) VALUES (
  gen_random_uuid(),
  '990e8400-e29b-41d4-a716-446655440001',
  'Which of the following statements are correct about normal distribution? (Select all that apply)',
  'MSQ',
  '["The mean equals the median", "The curve is bell-shaped", "The standard deviation determines the spread", "The area under the curve equals 1", "It is always symmetric"]',
  '["The mean equals the median", "The curve is bell-shaped", "The standard deviation determines the spread", "The area under the curve equals 1", "It is always symmetric"]',
  'All the given statements are correct properties of a normal distribution. \\textbf{Explanation:} A normal distribution has the following key properties: 1) Mean = Median = Mode, 2) Bell-shaped curve, 3) Standard deviation controls spread, 4) Total area = 1, 5) Perfectly symmetric about the mean.',
  4.0,
  -1.0,
  0.0,
  1.0,
  3,
  false,
  NULL
);

-- MSQ Question 2
INSERT INTO chapter_questions (
  id,
  chapter_id,
  question_statement,
  question_type,
  options,
  answer,
  solution,
  correct_marks,
  incorrect_marks,
  skipped_marks,
  partial_marks,
  time_minutes,
  is_pyq,
  pyq_year
) VALUES (
  gen_random_uuid(),
  '990e8400-e29b-41d4-a716-446655440001',
  'For a standard normal distribution \\(Z \\sim N(0,1)\\), which of the following are true?',
  'MSQ',
  '["\\(P(Z \\leq 0) = 0.5\\)", "\\(P(Z \\geq 1.96) \\approx 0.025\\)", "\\(P(-1 \\leq Z \\leq 1) \\approx 0.68\\)", "\\(E[Z] = 0\\)", "\\(Var(Z) = 1\\)"]',
  '["\\(P(Z \\leq 0) = 0.5\\)", "\\(P(Z \\geq 1.96) \\approx 0.025\\)", "\\(P(-1 \\leq Z \\leq 1) \\approx 0.68\\)", "\\(E[Z] = 0\\)", "\\(Var(Z) = 1\\)"]',
  'All statements are correct for a standard normal distribution. \\textbf{Solution:} For \\(Z \\sim N(0,1)\\): 1) By symmetry, \\(P(Z \\leq 0) = 0.5\\), 2) \\(P(Z \\geq 1.96) = 0.025\\) (critical value), 3) Empirical rule: \\(P(-1 \\leq Z \\leq 1) \\approx 0.68\\), 4) \\(E[Z] = 0\\) by definition, 5) \\(Var(Z) = 1\\) by definition.',
  4.0,
  -1.0,
  0.0,
  1.0,
  4,
  false,
  NULL
);

-- Subjective Question 1
INSERT INTO chapter_questions (
  id,
  chapter_id,
  question_statement,
  question_type,
  options,
  answer,
  solution,
  correct_marks,
  incorrect_marks,
  skipped_marks,
  partial_marks,
  time_minutes,
  is_pyq,
  pyq_year
) VALUES (
  gen_random_uuid(),
  '990e8400-e29b-41d4-a716-446655440001',
  'Derive the probability density function of a normal distribution \\(N(\\mu, \\sigma^2)\\) starting from the standard normal distribution. Show all mathematical steps and explain the transformation involved.',
  'SUB',
  NULL,
  'attempted',
  'The PDF of \\(N(\\mu, \\sigma^2)\\) is derived through standardization. \\textbf{Solution:} Starting with \\(Z \\sim N(0,1)\\) having PDF \\(f_Z(z) = \\frac{1}{\\sqrt{2\\pi}}e^{-z^2/2}\\). For \\(X = \\sigma Z + \\mu\\), we use transformation \\(Z = \\frac{X-\\mu}{\\sigma}\\). Using Jacobian \\(|J| = \\frac{1}{\\sigma}\\), we get: \\[f_X(x) = f_Z\\left(\\frac{x-\\mu}{\\sigma}\\right) \\cdot \\frac{1}{\\sigma} = \\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}\\]',
  6.0,
  0.0,
  0.0,
  NULL,
  8,
  false,
  NULL
);

-- Subjective Question 2
INSERT INTO chapter_questions (
  id,
  chapter_id,
  question_statement,
  question_type,
  options,
  answer,
  solution,
  correct_marks,
  incorrect_marks,
  skipped_marks,
  partial_marks,
  time_minutes,
  is_pyq,
  pyq_year
) VALUES (
  gen_random_uuid(),
  '990e8400-e29b-41d4-a716-446655440001',
  'Prove that for any normal distribution \\(X \\sim N(\\mu, \\sigma^2)\\), the standardized variable \\(Z = \\frac{X-\\mu}{\\sigma}\\) follows a standard normal distribution \\(N(0,1)\\). Include the moment generating function approach in your proof.',
  'SUB',
  NULL,
  'attempted',
  'Proof using MGF approach: \\textbf{Solution:} Let \\(X \\sim N(\\mu, \\sigma^2)\\) with MGF \\(M_X(t) = e^{\\mu t + \\frac{\\sigma^2 t^2}{2}}\\). For \\(Z = \\frac{X-\\mu}{\\sigma}\\), we have: \\[M_Z(t) = E[e^{tZ}] = E[e^{t(X-\\mu)/\\sigma}] = e^{-\\mu t/\\sigma} M_X(t/\\sigma)\\] \\[= e^{-\\mu t/\\sigma} \\cdot e^{\\mu(t/\\sigma) + \\frac{\\sigma^2(t/\\sigma)^2}{2}} = e^{\\frac{t^2}{2}}\\] This is the MGF of \\(N(0,1)\\), proving \\(Z \\sim N(0,1)\\).',
  6.0,
  0.0,
  0.0,
  NULL,
  10,
  false,
  NULL
);

-- Add some sample notes and short notes to the chapter
UPDATE chapters 
SET 
  notes = '# Normal Distribution\n\nThe **normal distribution** is one of the most important probability distributions in statistics.\n\n## Definition\nA continuous random variable $X$ follows a normal distribution with parameters $\\mu$ and $\\sigma^2$, denoted as $X \\sim N(\\mu, \\sigma^2)$, if its probability density function is:\n\n$$f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$$\n\nwhere:\n- $\\mu$ is the mean (location parameter)\n- $\\sigma^2$ is the variance (scale parameter)\n- $\\sigma > 0$ is the standard deviation\n\n## Properties\n\n### 1. Symmetry\nThe normal distribution is symmetric about its mean $\\mu$.\n\n### 2. Mean, Median, and Mode\nFor a normal distribution: Mean = Median = Mode = $\\mu$\n\n### 3. Standard Normal Distribution\nWhen $\\mu = 0$ and $\\sigma = 1$, we get the **standard normal distribution** $Z \\sim N(0,1)$ with PDF:\n$$\\phi(z) = \\frac{1}{\\sqrt{2\\pi}} e^{-z^2/2}$$\n\n### 4. Standardization\nAny normal random variable can be standardized using:\n$$Z = \\frac{X - \\mu}{\\sigma}$$\n\n## Applications\n1. Central Limit Theorem\n2. Statistical inference\n3. Quality control\n4. Natural phenomena modeling',
  short_notes = '# Normal Distribution - Quick Notes\n\n## Key Formula\n$$f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$$\n\n## Important Facts\n- **Mean = Median = Mode** = $\\mu$\n- **68-95-99.7 Rule**: \n  - 68% within $\\mu \\pm \\sigma$\n  - 95% within $\\mu \\pm 2\\sigma$ \n  - 99.7% within $\\mu \\pm 3\\sigma$\n\n## Standard Normal\n- $Z \\sim N(0,1)$: $\\phi(z) = \\frac{1}{\\sqrt{2\\pi}} e^{-z^2/2}$\n- Standardization: $Z = \\frac{X-\\mu}{\\sigma}$\n\n## Critical Values\n- $P(Z \\leq 1.96) = 0.975$ (95% CI)\n- $P(Z \\leq 2.58) = 0.995$ (99% CI)\n\n## MGF\n$$M_X(t) = e^{\\mu t + \\frac{\\sigma^2 t^2}{2}}$$'
WHERE id = '990e8400-e29b-41d4-a716-446655440001';