import { createClient } from '@supabase/supabase-js';
import { PendingPapersClient } from './PendingPapersClient';

async function getPendingPapers() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { data } = await supabase.from('papers').select(`id, exam_type, semester, term, year, roll_number, file_path, created_at, department:departments(name,code), teacher:teachers(name), subject:subjects(name,course_code)`).eq('status', 'Pending').order('created_at', { ascending: false });
  return data ?? [];
}

export default async function PendingPapersPage() {
  const papers = await getPendingPapers();
  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Pending Papers</h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>{papers.length} paper{papers.length !== 1 ? 's' : ''} awaiting review</p>
      <PendingPapersClient papers={papers} />
    </div>
  );
}
