-- ============================================================
-- Teacher type: Permanent vs Visiting
-- Visiting teachers teach for a limited time; the public papers
-- page warns students when they pick a visiting teacher.
-- Migration: 006_teacher_type.sql
-- ============================================================

ALTER TABLE teachers
  ADD COLUMN IF NOT EXISTS teacher_type TEXT NOT NULL DEFAULT 'Permanent';

-- Restrict to the two valid values (re-runnable)
ALTER TABLE teachers DROP CONSTRAINT IF EXISTS teachers_teacher_type_check;
ALTER TABLE teachers
  ADD CONSTRAINT teachers_teacher_type_check
  CHECK (teacher_type IN ('Permanent', 'Visiting'));

-- Existing teachers default to 'Permanent'; admin can mark any as 'Visiting'.
