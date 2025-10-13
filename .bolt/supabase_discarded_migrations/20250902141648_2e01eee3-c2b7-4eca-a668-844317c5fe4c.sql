-- Add missing columns to exam_roadmap table if they don't exist
ALTER TABLE exam_roadmap ADD COLUMN IF NOT EXISTS daily_schedule jsonb DEFAULT '[]'::jsonb;
ALTER TABLE exam_roadmap ADD COLUMN IF NOT EXISTS study_approach text DEFAULT '50-50'; -- '70-30', '50-50', '30-70'
ALTER TABLE exam_roadmap ADD COLUMN IF NOT EXISTS subject_order jsonb DEFAULT '[]'::jsonb;
ALTER TABLE exam_roadmap ADD COLUMN IF NOT EXISTS study_days jsonb DEFAULT '[]'::jsonb; -- [1,2,3,4,5,6] for Mon-Sat
ALTER TABLE exam_roadmap ADD COLUMN IF NOT EXISTS mock_days jsonb DEFAULT '[]'::jsonb; -- [0,7] for Sun
ALTER TABLE exam_roadmap ADD COLUMN IF NOT EXISTS current_day_index integer DEFAULT 0;
ALTER TABLE exam_roadmap ADD COLUMN IF NOT EXISTS total_days integer DEFAULT 0;
ALTER TABLE exam_roadmap ADD COLUMN IF NOT EXISTS theory_days integer DEFAULT 0;
ALTER TABLE exam_roadmap ADD COLUMN IF NOT EXISTS mock_days_count integer DEFAULT 0;