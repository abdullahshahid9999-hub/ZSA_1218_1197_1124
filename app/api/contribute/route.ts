import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { contributeSchema, validateUploadedFile } from '@/lib/validations/schemas';
import { parseRollNumber } from '@/lib/utils/rollNumber';
import { rateLimit, getClientIp, verifyRecaptcha } from '@/lib/utils/rateLimit';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit(ip, { windowMs: 10 * 60_000, max: 5 });
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: 'Too many submissions. Please wait before trying again.' }, { status: 429 });
  }

  let formData: FormData;
  try { formData = await request.formData(); }
  catch { return NextResponse.json({ success: false, error: 'Invalid form data.' }, { status: 400 }); }

  const fields = {
    roll_number: formData.get('roll_number') as string,
    teacher_id: formData.get('teacher_id') as string,
    subject_id: formData.get('subject_id') as string,
    exam_type: formData.get('exam_type') as string,
    semester: formData.get('semester') as string,
    term: formData.get('term') as string,
    year: Number(formData.get('year')),
    recaptcha_token: formData.get('recaptcha_token') as string,
  };

  const parsed = contributeSchema.safeParse(fields);
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 422 });

  const captchaOk = await verifyRecaptcha(parsed.data.recaptcha_token);
  if (!captchaOk) return NextResponse.json({ success: false, error: 'reCAPTCHA verification failed.' }, { status: 403 });

  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });

  const fileCheck = validateUploadedFile({ name: file.name, type: file.type, size: file.size });
  if (!fileCheck.valid) return NextResponse.json({ success: false, error: fileCheck.error }, { status: 400 });

  const rollParsed = parseRollNumber(parsed.data.roll_number);
  if (!rollParsed.isValid) return NextResponse.json({ success: false, error: 'Invalid roll number format.' }, { status: 422 });

  const supabase = getAdminClient();

  const { data: dept } = await supabase.from('departments').select('id').eq('code', rollParsed.departmentCode).eq('is_active', true).single();
  if (!dept) return NextResponse.json({ success: false, error: `Department "${rollParsed.departmentCode}" not found.` }, { status: 400 });

  const { count: dupeCount } = await supabase.from('papers').select('id', { count: 'exact', head: true })
    .eq('department_id', dept.id).eq('teacher_id', parsed.data.teacher_id).eq('subject_id', parsed.data.subject_id)
    .eq('exam_type', parsed.data.exam_type).eq('semester', parsed.data.semester).eq('term', parsed.data.term)
    .eq('year', parsed.data.year).eq('status', 'Approved');

  if ((dupeCount ?? 0) > 0) {
    return NextResponse.json({ success: false, error: 'This paper already exists. For corrections or disputes, please contact administration.', code: 'DUPLICATE' }, { status: 409 });
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const storagePath = `pending/${generateId()}.${fileExt}`;
  const fileBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage.from('papers').upload(storagePath, fileBuffer, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ success: false, error: 'File upload failed. Please try again.' }, { status: 500 });

  const { data: contributor } = await supabase.from('contributors')
    .upsert({ roll_number: parsed.data.roll_number.toUpperCase(), department_id: dept.id }, { onConflict: 'roll_number' })
    .select('id').single();

  const { data: paper, error: paperErr } = await supabase.from('papers').insert({
    department_id: dept.id, teacher_id: parsed.data.teacher_id, subject_id: parsed.data.subject_id,
    contributor_id: contributor?.id ?? null, exam_type: parsed.data.exam_type, semester: parsed.data.semester,
    term: parsed.data.term, year: parsed.data.year, file_path: storagePath, file_name: file.name,
    file_type: file.type, file_size: file.size, roll_number: parsed.data.roll_number.toUpperCase(),
    upload_ip: ip, status: 'Pending',
  }).select('id').single();

  if (paperErr || !paper) {
    await supabase.storage.from('papers').remove([storagePath]);
    return NextResponse.json({ success: false, error: 'Submission failed. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Paper submitted! It will appear after admin review.', paper_id: paper.id }, { status: 201 });
}
