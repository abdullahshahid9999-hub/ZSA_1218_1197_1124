'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dvtkcuqwvkakycsseydh.supabase.co';
const sb = createClient(SUPABASE_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q');

export default function ApprovedPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<string|null>(null);

  useEffect(() => {
    sb.from('papers')
      .select('*, departments(name,code), teachers(name), subjects(name,course_code)')
      .eq('status','Approved').order('created_at',{ ascending: false })
      .then(({ data }) => setPapers(data ?? []));
  }, []);

  const getSignedUrl = async (filePath: string) => {
    const { data } = await sb.storage.from('papers').createSignedUrl(filePath, 3600);
    return data?.signedUrl ?? null;
  };

  const filtered = papers.filter(p =>
    p.subjects?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.subjects?.course_code?.toLowerCase().includes(search.toLowerCase()) ||
    p.teachers?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.roll_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 6 }}>Approved Papers</h1>
      <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>{papers.length} approved papers</p>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subject, teacher, roll number…"
        style={{ padding: '9px 14px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', width: 300, marginBottom: 20, display: 'block' }} />

      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              {['Subject','Teacher','Dept','Exam','Term','Roll No','Approved','Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid #f5f5f5' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{p.subjects?.name}</div>
                  <div style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace' }}>{p.subjects?.course_code}</div>
                </td>
                <td style={{ padding: '11px 14px', fontSize: 13, color: '#555' }}>{p.teachers?.name}</td>
                <td style={{ padding: '11px 14px' }}>
                  <span style={{ background: '#f0f4ff', color: '#3b5bdb', padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{p.departments?.code}</span>
                </td>
                <td style={{ padding: '11px 14px', fontSize: 13 }}>{p.exam_type}</td>
                <td style={{ padding: '11px 14px', fontSize: 13, color: '#555' }}>{p.term} {p.year}</td>
                <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', color: '#777' }}>{p.roll_number}</td>
                <td style={{ padding: '11px 14px', fontSize: 12, color: '#aaa' }}>{new Date(p.reviewed_at ?? p.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '11px 14px' }}>
                  <button onClick={async () => { const url = await getSignedUrl(p.file_path); if(url) setPreview(url); }}
                    style={{ padding: '4px 10px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#aaa' }}>No approved papers yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {preview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#fff', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8e8e8' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Paper Preview</span>
            <button onClick={() => setPreview(null)} style={{ background: '#f5f5f5', border: 'none', borderRadius: 6, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
          <iframe src={preview} style={{ flex: 1, border: 'none' }} title="Preview" />
        </div>
      )}
    </div>
  );
}
