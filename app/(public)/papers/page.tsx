'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q');

export default function PapersPage() {
  const [papers, setPapers]   = useState<any[]>([]);
  const [depts, setDepts]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [dept, setDept]       = useState('');
  const [exam, setExam]       = useState('');
  const [term, setTerm]       = useState('');
  const [year, setYear]       = useState('');
  const [sem, setSem]         = useState('');
  const [preview, setPreview] = useState<{ url: string; paper: any } | null>(null);
  const [busy, setBusy]       = useState<string | null>(null);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const load = useCallback(async () => {
    setLoading(true);
    let q = sb
      .from('papers')
      .select(`id, exam_type, semester, term, year, file_path,
        departments(id, name, code),
        teachers(id, name),
        subjects(id, name, course_code)`)
      .eq('status', 'Approved')
      .order('year', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(200);

    if (dept) q = q.eq('department_id', dept);
    if (exam) q = q.eq('exam_type', exam);
    if (term) q = q.eq('term', term);
    if (year) q = q.eq('year', parseInt(year));
    if (sem)  q = q.eq('semester', sem);

    const { data, error } = await q;

    if (error) { console.error('Papers load error:', error); setLoading(false); return; }

    let list = data ?? [];
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((p: any) =>
        p.subjects?.name?.toLowerCase().includes(s) ||
        p.subjects?.course_code?.toLowerCase().includes(s) ||
        p.teachers?.name?.toLowerCase().includes(s) ||
        p.departments?.name?.toLowerCase().includes(s)
      );
    }

    setPapers(list);
    setLoading(false);
  }, [dept, exam, term, year, sem, search]);

  useEffect(() => {
    sb.from('departments').select('id,name,code').eq('is_active', true).order('name')
      .then(({ data }) => setDepts(data ?? []));
  }, []);

  useEffect(() => { load(); }, [dept, exam, term, year, sem]);

  // Get signed URL via our API
  const getSignedUrl = async (paperId: string): Promise<string | null> => {
    const res = await fetch(`/api/papers/signed?id=${paperId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.url ?? null;
  };

  const handleView = async (paper: any) => {
    setBusy(paper.id);
    const url = await getSignedUrl(paper.id);
    setBusy(null);
    if (!url) { alert('Could not load paper. Please try again.'); return; }
    setPreview({ url, paper });
  };

  const handleDownload = async (paper: any) => {
    setBusy(paper.id + 'd');
    // Direct redirect to download endpoint
    window.open(`/api/papers/signed?id=${paper.id}&action=download`, '_blank');
    setBusy(null);
  };

  const sel: React.CSSProperties = {
    padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 8,
    fontSize: 13, background: '#fff', color: '#333', outline: 'none', cursor: 'pointer',
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 4 }}>Past Papers</h1>
        <p style={{ fontSize: 14, color: '#888' }}>
          {loading ? 'Loading…' : `${papers.length} paper${papers.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Filter bar */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#bbb', fontSize: 16, pointerEvents: 'none' }}>⌕</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Subject, teacher, code…"
            style={{ ...sel, paddingLeft: 32, width: '100%' }}
          />
        </div>
        <select value={dept} onChange={e => setDept(e.target.value)} style={sel}>
          <option value="">All Depts</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.code} — {d.name}</option>)}
        </select>
        <select value={exam} onChange={e => setExam(e.target.value)} style={sel}>
          <option value="">All Types</option>
          <option value="Mid">Mid</option>
          <option value="Final">Final</option>
        </select>
        <select value={term} onChange={e => setTerm(e.target.value)} style={sel}>
          <option value="">All Terms</option>
          <option value="Spring">Spring</option>
          <option value="Fall">Fall</option>
        </select>
        <select value={sem} onChange={e => setSem(e.target.value)} style={sel}>
          <option value="">All Sems</option>
          {['1','2','3','4','5','6','7','8'].map(s => <option key={s} value={s}>Sem {s}</option>)}
        </select>
        <select value={year} onChange={e => setYear(e.target.value)} style={sel}>
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={load}
          style={{ padding: '8px 18px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Search
        </button>
        {(search || dept || exam || term || year || sem) && (
          <button onClick={() => { setSearch(''); setDept(''); setExam(''); setTerm(''); setYear(''); setSem(''); }}
            style={{ padding: '8px 12px', background: 'transparent', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, color: '#666', cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 14 }}>
          {Array(8).fill(0).map((_, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20, height: 200 }}>
              {[70, 40, 55, 45].map((w, j) => (
                <div key={j} style={{ height: 12, background: '#f0f0f0', borderRadius: 4, marginBottom: 10, width: `${w}%` }} />
              ))}
            </div>
          ))}
        </div>
      ) : papers.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4 }}>No papers found</p>
          <p style={{ fontSize: 13, color: '#999' }}>Try different filters</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 14 }}>
          {papers.map((p: any) => (
            <div key={p.id}
              style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.15s,border-color 0.15s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; el.style.borderColor = '#ccc'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = 'none'; el.style.borderColor = '#e8e8e8'; }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.subjects?.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa', fontFamily: 'monospace' }}>{p.subjects?.course_code}</div>
                </div>
                <span style={{ flexShrink: 0, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: p.exam_type === 'Final' ? '#e8f0fe' : '#fef9e7', color: p.exam_type === 'Final' ? '#1a56db' : '#92400e' }}>
                  {p.exam_type}
                </span>
              </div>

              <div style={{ flex: 1, marginBottom: 14 }}>
                {[['Dept', p.departments?.name], ['Teacher', p.teachers?.name], ['Term', `Sem ${p.semester} · ${p.term} ${p.year}`]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', gap: 6, marginBottom: 5, fontSize: 13 }}>
                    <span style={{ color: '#bbb', width: 48, flexShrink: 0, fontSize: 12 }}>{l}</span>
                    <span style={{ color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f5f5f5', paddingTop: 14 }}>
                <button onClick={() => handleView(p)} disabled={busy === p.id}
                  style={{ flex: 1, padding: '8px', background: '#111', color: '#fff', border: 'none', borderRadius: 7, cursor: busy === p.id ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: busy === p.id ? 0.6 : 1 }}>
                  {busy === p.id ? 'Loading…' : 'View'}
                </button>
                <button onClick={() => handleDownload(p)} disabled={busy === p.id + 'd'}
                  style={{ flex: 1, padding: '8px', background: '#f5f5f5', color: '#333', border: '1px solid #e8e8e8', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Viewer */}
      {preview && (
        <div onClick={() => setPreview(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8e8e8', flexShrink: 0 }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{preview.paper.subjects?.name}</span>
              <span style={{ color: '#888', fontSize: 13, marginLeft: 10 }}>
                {preview.paper.subjects?.course_code} · {preview.paper.exam_type} · {preview.paper.term} {preview.paper.year}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleDownload(preview.paper)}
                style={{ padding: '7px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Download
              </button>
              <button onClick={() => setPreview(null)}
                style={{ background: '#f5f5f5', border: 'none', borderRadius: 7, width: 34, height: 34, fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
          </div>
          <div onClick={e => e.stopPropagation()} style={{ flex: 1, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1, transform: 'rotate(-20deg)' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'rgba(0,0,0,0.04)', letterSpacing: 3, userSelect: 'none', whiteSpace: 'nowrap' }}>NTU PAST PAPERS</span>
            </div>
            <iframe src={preview.url + '#toolbar=0'} style={{ width: '100%', height: '100%', border: 'none' }} title="Paper" />
          </div>
        </div>
      )}
    </div>
  );
}
