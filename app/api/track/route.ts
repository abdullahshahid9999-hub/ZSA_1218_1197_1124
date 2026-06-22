import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, getClientIp } from '@/lib/utils/rateLimit';

const SUPABASE_URL = 'https://dvtkcuqwvkakycsseydh.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q';

// Records an anonymous public page view. The admin dashboard shows the totals.
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Generous cap to allow normal browsing while blocking flood/abuse.
  const rl = rateLimit(`track:${ip}`, { windowMs: 60_000, max: 60 });
  if (!rl.allowed) return NextResponse.json({ ok: false }, { status: 429 });

  let body: any = {};
  try { body = await request.json(); } catch {}

  const visitor_id = typeof body?.visitor_id === 'string' ? body.visitor_id.slice(0, 64) : null;
  const path       = typeof body?.path === 'string' ? body.path.slice(0, 200) : null;

  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  await sb.from('page_visits').insert({ visitor_id, path });

  return NextResponse.json({ ok: true });
}
