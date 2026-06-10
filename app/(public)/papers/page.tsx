import { createClient } from '@supabase/supabase-js';

interface PaperPublic {
  id: string;
  exam_type: string;
  semester: string;
  term: string;
  year: number;
  file_url: string;
  file_name: string;
  created_at: string;
  department_name: string;
  department_code: string;
  teacher_name: string;
  subject_name: string;
  course_code: string;
}

async function getPapers(params: Record<string, string>) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  let query = supabase.from('v_papers_public').select('*', { count: 'exact' });
  if (params.department_id) query = query.eq('department_id', params.department_id);
  if (params.exam_type) query = query.eq('exam_type', params.exam_type);
  if (params.term) query = query.eq('term', params.term);
  if (params.year) query = query.eq('year', parseInt(params.year));
  if (params.search) query = query.or(`subject_name.ilike.%${params.search}%,teacher_name.ilike.%${params.search}%`);
  const page = parseInt(params.page ?? '1');
  const limit = 12;
  const offset = (page - 1) * limit;
  const { data, count } = await query.order('year', { ascending: false }).range(offset, offset + limit - 1);
  return { papers: (data ?? []) as PaperPublic[], count: count ?? 0, page, totalPages: Math.ceil((count ?? 0) / limit) };
}

async function getDepartments() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from('departments').select('id,name,code').eq('is_active', true).order('name');
  return data ?? [];
}

interface PageProps { searchParams: Promise<Record<string, string>>; }

export default async function PapersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [{ papers, count, totalPages, page }, departments] = await Promise.all([getPapers(params), getDepartments()]);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '4px' }}>Past Papers</h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>{count.toLocaleString()} papers available</p>

      {/* Filters */}
      <form method="GET" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
        <input name="search" defaultValue={params.search} placeholder="Search subject, teacher..." style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', minWidth: '200px' }} />
        <select name="exam_type" defaultValue={params.exam_type} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}>
          <option value="">All Exam Types</option>
          <option value="Mid">Mid</option>
          <option value="Final">Final</option>
        </select>
        <select name="term" defaultValue={params.term} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}>
          <option value="">All Terms</option>
          <option value="Spring">Spring</option>
          <option value="Fall">Fall</option>
        </select>
        <select name="year" defaultValue={params.year} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}>
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button type="submit" style={{ padding: '8px 20px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Filter</button>
        <a href="/papers" style={{ padding: '8px 16px', color: '#64748b', fontSize: '14px', lineHeight: '2' }}>Clear</a>
      </form>

      {/* Papers Grid */}
      {papers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>
          <p style={{ fontSize: '1.2rem' }}>No papers found</p>
          <p>Try adjusting your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {papers.map((paper) => (
            <div key={paper.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontWeight: '600', fontSize: '15px', margin: 0, flex: 1 }}>{paper.subject_name}</h3>
                <span style={{ background: paper.exam_type === 'Final' ? '#1d4ed8' : '#64748b', color: 'white', padding: '2px 8px', borderRadius: '999px', fontSize: '12px', marginLeft: '8px' }}>{paper.exam_type}</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '12px', fontFamily: 'monospace', margin: '0 0 8px' }}>{paper.course_code}</p>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.8' }}>
                <div>📚 {paper.department_name}</div>
                <div>👤 {paper.teacher_name}</div>
                <div>📅 Semester {paper.semester} · {paper.term} {paper.year}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <a href={paper.file_url} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', background: '#1d4ed8', color: 'white', borderRadius: '6px', fontSize: '13px', textDecoration: 'none' }}>View</a>
                <a href={paper.file_url} download style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', textDecoration: 'none', color: '#374151' }}>Download</a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
            const np = new URLSearchParams(params); np.set('page', String(p));
            return <a key={p} href={`/papers?${np}`} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: p === page ? '#1d4ed8' : 'white', color: p === page ? 'white' : '#374151', textDecoration: 'none', fontSize: '14px' }}>{p}</a>;
          })}
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: 'Past Papers — NTU Past Papers Archive',
  description: 'Browse and download past exam papers from National Textile University.',
};
