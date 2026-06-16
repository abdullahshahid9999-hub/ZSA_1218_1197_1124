-- Fix subject-teacher relationship: allow same course_code for different teachers
-- but prevent duplicate (course_code, teacher_id) pairs.

-- STEP 1: Drop old constraint (if exists)
ALTER TABLE subjects
DROP CONSTRAINT IF EXISTS subjects_course_code_key;

-- STEP 2: Add new composite constraint
ALTER TABLE subjects
ADD CONSTRAINT subjects_course_teacher_unique
UNIQUE (course_code, teacher_id);
