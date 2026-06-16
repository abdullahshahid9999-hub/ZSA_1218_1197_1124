import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get('teacher_id');
  const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q', { auth: { persistSession: false } });

  let query = sb.from('subjects').select('id,name,course_code').eq('is_active', true);
  if (teacherId) query = query.eq('teacher_id', teacherId);

  const { data, error } = await query.order('name');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q', { auth: { persistSession: false } });

  const body = await request.json();
  const { name, course_code, teacher_id, credits } = body;

  if (!name?.trim() || !course_code?.trim() || !teacher_id) {
    return NextResponse.json({ success: false, error: 'All required fields needed.' }, { status: 400 });
  }

  const normalizedCode = course_code.trim().toUpperCase();

  const { data: existing } = await sb
    .from('subjects')
    .select('*')
    .eq('course_code', normalizedCode)
    .eq('teacher_id', teacher_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { success: false, error: 'This teacher already has this course assigned' },
      { status: 409 }
    );
  }

  const { data, error } = await sb
    .from('subjects')
    .insert({
      name: name.trim(),
      course_code: normalizedCode,
      teacher_id,
      credits: credits ? parseInt(credits) : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}
