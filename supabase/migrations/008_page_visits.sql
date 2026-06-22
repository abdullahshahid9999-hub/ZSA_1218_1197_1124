-- ============================================================
-- Visitor analytics
-- Each public page view is recorded (anonymously) via the
-- service_role /api/track route. The admin dashboard reads the
-- aggregated counts from v_visit_stats.
-- Migration: 008_page_visits.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS page_visits (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id  TEXT,            -- random id stored in the visitor's browser (for unique counts)
  path        TEXT,            -- which page was viewed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_page_visits_created ON page_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_page_visits_visitor ON page_visits(visitor_id);

-- RLS on, NO policies: anon/authenticated can neither read nor write directly.
-- Writes go through the service_role /api/track route; reads via the admin (service_role).
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- Aggregated stats for the dashboard
CREATE OR REPLACE VIEW v_visit_stats AS
SELECT
  COUNT(*)::int                                                            AS total_views,
  COUNT(DISTINCT visitor_id)::int                                          AS unique_visitors,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::int                   AS views_today,
  COUNT(DISTINCT visitor_id) FILTER (WHERE created_at >= CURRENT_DATE)::int AS visitors_today,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int      AS views_7d
FROM page_visits;

-- Lock the view to the admin (service_role) only; the public must not read it.
REVOKE ALL ON v_visit_stats FROM anon, authenticated;
GRANT SELECT ON v_visit_stats TO service_role;
