import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/utils/rateLimit';

const SUPABASE_URL = 'https://dvtkcuqwvkakycsseydh.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q';

const DEPT_MAP: Record<string,string> = {
  CS:'Department of Computer Science', TE:'Textile Engineering',
  ME:'Mechanical Engineering', MS:'Management Sciences',
  EE:'Electrical Engineering', CHE:'Chemical Engineering', ENV:'Environmental Sciences',
};

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function parseDept(roll: string) {
  const m = roll.trim().toUpperCase().match(/^\d{2}-([A-Z]+)-([A-Z]+)-[A-Z]+-\d{4,6}$/);
  return m && m[1] === 'NTU' ? m[2] : null;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';

  // Rate limit: 5 submissions per minute per IP (abuse / spam protection)
  const rl = rateLimit(`contribute:${ip}`, { windowMs: 60_000, max: 5 });
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many submissions. Please slow down and try again in a minute.' },
      { status: 429 }
    );
  }

  let formData: FormData;
  try { formData = await request.formData(); }
  catch { return NextResponse.json({ success: false, error: 'Invalid form data.' }, { status: 400 }); }

  const roll      = (formData.get('roll_number') as string)?.trim().toUpperCase();
  const teacherId = formData.get('teacher_id') as string;
  const subjectId = formData.get('subject_id') as string;
  const examType  = formData.get('exam_type') as string;
  const semester  = formData.get('semester') as string;
  const term      = formData.get('term') as string;
  const year      = parseInt(formData.get('year') as string);
  const file      = formData.get('file') as File | null;

  if (!roll || !teacherId || !subjectId || !examType || !semester || !term || !year) {
    return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 422 });
  }

  const deptCode = parseDept(roll);
  if (!deptCode) return NextResponse.json({ success: false, error: 'Invalid roll number format.' }, { status: 422 });

  if (!file || file.size === 0) return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });

  const allowed = ['application/pdf','image/jpeg','image/jpg','image/png','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowed.includes(file.type)) return NextResponse.json({ success: false, error: 'Invalid file type.' }, { status: 400 });
  if (file.size > 20 * 1024 * 1024) return NextResponse.json({ success: false, error: 'File too large. Max 20MB.' }, { status: 400 });

  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  const { data: dept } = await sb.from('departments').select('id').eq('code', deptCode).eq('is_active', true).single();
  if (!dept) return NextResponse.json({ success: false, error: `Department "${deptCode}" not found.` }, { status: 400 });

  // Duplicate check
  const { count } = await sb.from('papers').select('id', { count: 'exact', head: true })
    .eq('department_id', dept.id).eq('teacher_id', teacherId).eq('subject_id', subjectId)
    .eq('exam_type', examType).eq('semester', semester).eq('term', term).eq('year', year).eq('status', 'Approved');

  if ((count ?? 0) > 0) {
    return NextResponse.json({ success: false, error: 'This paper already exists. For corrections or disputes, please contact administration.' }, { status: 409 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const storagePath = `pending/${genId()}.${ext}`;
  const buffer = await file.arrayBuffer();

  const { error: uploadErr } = await sb.storage.from('papers').upload(storagePath, buffer, { contentType: file.type, upsert: false });
  if (uploadErr) {
    console.error('Upload error:', uploadErr);
    return NextResponse.json({ success: false, error: 'File upload failed. Please try again.' }, { status: 500 });
  }

  const { data: contrib } = await sb.from('contributors')
    .upsert({ roll_number: roll, department_id: dept.id }, { onConflict: 'roll_number' })
    .select('id').single();

  const { data: paper, error: paperErr } = await sb.from('papers').insert({
    department_id: dept.id, teacher_id: teacherId, subject_id: subjectId,
    contributor_id: contrib?.id ?? null, exam_type: examType, semester, term, year,
    file_path: storagePath, file_name: file.name, file_type: file.type, file_size: file.size,
    roll_number: roll, upload_ip: ip, status: 'Pending',
  }).select('id').single();

  if (paperErr || !paper) {
    await sb.storage.from('papers').remove([storagePath]);
    return NextResponse.json({ success: false, error: 'Submission failed. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Paper submitted! It will appear after admin review. Thank you for contributing!' }, { status: 201 });
}
