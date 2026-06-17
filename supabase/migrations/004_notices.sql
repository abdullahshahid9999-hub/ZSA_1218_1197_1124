-- ============================================================
-- Notices / Announcements for students
-- Managed from the admin portal ("Notices" module),
-- shown on the public site at /notices.
-- Migration: 004_notices.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS notices (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  category      TEXT,                              -- 'General','Exam','Result','Event','Holiday','Fee','Urgent'
  is_pinned     BOOLEAN NOT NULL DEFAULT FALSE,    -- pinned notices show on top
  link_url      TEXT,                              -- optional attachment / external link
  link_label    TEXT,                              -- label for the link button
  published_at  DATE NOT NULL DEFAULT CURRENT_DATE,-- the notice date (editable)
  expires_at    DATE,                              -- optional; hidden from public on/after this date
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,     -- show/hide on public
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notices_active
  ON notices(is_active, is_pinned DESC, published_at DESC);

-- updated_at auto-update (function already exists from 001; CREATE OR REPLACE is safe)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notices_updated_at ON notices;
CREATE TRIGGER trg_notices_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Public (anon) reads only ACTIVE and not-yet-expired notices.
DROP POLICY IF EXISTS "Public read active notices" ON notices;
CREATE POLICY "Public read active notices"
  ON notices FOR SELECT
  USING (is_active = TRUE AND (expires_at IS NULL OR expires_at >= CURRENT_DATE));

-- Writes (insert/update/delete) go through the admin portal's service_role key.
