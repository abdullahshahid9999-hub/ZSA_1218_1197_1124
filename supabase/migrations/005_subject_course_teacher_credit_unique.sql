-- ============================================================
-- Subjects uniqueness: allow same course + same teacher with
-- DIFFERENT credit hours (e.g. a teacher running the same course
-- as both Theory (3 cr) and Lab (1 cr)), while still preventing
-- exact duplicates.
-- Migration: 005_subject_course_teacher_credit_unique.sql
-- ============================================================

-- 1) Drop the previous (course_code, teacher_id) unique constraint
--    (and the even older course_code-only one, if present).
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_course_teacher_unique;
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_course_code_key;

-- 2) New unique key on (course_code, teacher_id, credits).
--    This is MORE permissive than the old key, so it never conflicts
--    with existing rows.
ALTER TABLE subjects
  ADD CONSTRAINT subjects_course_teacher_credit_unique
  UNIQUE (course_code, teacher_id, credits);

-- NOTE: Postgres treats NULL credits as distinct in a UNIQUE key, so
-- always fill in the credit hours for each entry. The admin Subjects
-- page also guards against duplicates app-side (including the NULL case).
