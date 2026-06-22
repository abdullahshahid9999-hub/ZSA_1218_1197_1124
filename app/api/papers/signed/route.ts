import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dvtkcuqwvkakycsseydh.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q';

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id     = searchParams.get('id');
  const action = searchParams.get('action') ?? 'view';

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  // Get paper with file_path
  const { data: paper, error: dbErr } = await sb
    .from('papers')
    .select('id, file_path, file_name, file_url, status')
    .eq('id', id)
    .eq('status', 'Approved')
    .single();

  if (dbErr || !paper) {
    return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
  }

  // Try the file_path directly first
  const paths = [
    paper.file_path,
    // If file_path has no folder prefix, try both
    paper.file_path.startsWith('approved/') ? paper.file_path : `approved/${paper.file_path}`,
    paper.file_path.startsWith('pending/')  ? paper.file_path.replace('pending/','approved/') : null,
  ].filter(Boolean) as string[];

  // Try each path until one works
  for (const tryPath of paths) {
    const { data: signed, error } = await sb.storage
      .from('papers')
      .createSignedUrl(tryPath, 3600, {
        download: action === 'download' ? (paper.file_name || true) : false,
      });

    if (!error && signed?.signedUrl) {
      // Update DB with correct path if it was wrong
      if (tryPath !== paper.file_path) {
        await sb.from('papers').update({ file_path: tryPath }).eq('id', id);
      }

      if (action === 'download') {
        // For download: redirect directly to signed URL
        return NextResponse.redirect(signed.signedUrl);
      }
      return NextResponse.json({ url: signed.signedUrl });
    }
  }

  // Nothing worked - log what we tried server-side only (don't leak storage paths to the client)
  console.error('Could not generate signed URL for paper:', id, 'paths tried:', paths);
  return NextResponse.json(
    { error: 'Could not generate URL' },
    { status: 500 }
  );
}
