-- ============================================================
-- Charity module
-- A directory of trusted members who collect donations (via
-- JazzCash / EasyPaisa / SadaPay / bank) to help needy students.
-- Managed from the admin portal ("Charity Management"), shown on
-- the public /charity page.
-- Migration: 009_charity.sql
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS charity_members (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  department    TEXT,
  is_passout    BOOLEAN NOT NULL DEFAULT FALSE,        -- graduated (alumnus) vs current student
  info          TEXT,
  avatar_url    TEXT,
  payments      JSONB NOT NULL DEFAULT '[]'::jsonb,    -- [{ "method","number","account_name" }]
  display_order INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_charity_members_active ON charity_members(is_active, display_order);

DROP TRIGGER IF EXISTS trg_charity_members_updated_at ON charity_members;
CREATE TRIGGER trg_charity_members_updated_at
  BEFORE UPDATE ON charity_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE charity_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active charity members" ON charity_members;
CREATE POLICY "Public read active charity members"
  ON charity_members FOR SELECT USING (is_active = TRUE);
