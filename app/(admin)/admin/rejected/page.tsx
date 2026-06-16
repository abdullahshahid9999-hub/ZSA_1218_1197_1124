'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q');

export default function RejectedPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loadingAction, setLoadingAction] = useState<string|null>(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const { data } = await sb.from('papers').select('*, departments(name,code), teachers(name), subjects(name,course_code)')
      .eq('status', 'Rejected').order('created_at', { ascending: false });
    setPapers(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const approvePaper = async (p: any) => {
    setLoadingAction(p.id); setMsg('');

    let newPath = p.file_path;
    if (p.file_path.startsWith('pending/')) {
      newPath = p.file_path.replace('pending/', 'approved/');
      await sb.storage.from('papers').move(p.file_path, newPath);
    }
    
    const SUPABASE_URL = 'https://dvtkcuqwvkakycsseydh.supabase.co';
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/papers/${newPath}`;

    await sb.from('papers').update({
      status: 'Approved',
      file_path: newPath,
      file_url: publicUrl,
      reviewed_at: new Date().toISOString(),
    }).eq('id', p.id);

    setLoadingAction(null);
    setMsg('Paper successfully approved!');
    await load();
    setTimeout(() => setMsg(''), 3000);
  };

  const deletePaper = async (p: any) => {
    if (!confirm('Are you sure you want to permanently delete this paper? This cannot be undone.')) return;
    setLoadingAction(p.id); setMsg('');
    
    if (p.file_path) {
      await sb.storage.from('papers').remove([p.file_path]);
    }
    await sb.from('papers').delete().eq('id', p.id);

    setLoadingAction(null);
    setMsg('Paper deleted permanently.');
    await load();
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '8px' }}>Rejected Papers</h1>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>{papers.length} rejected papers</p>

      {msg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#166534', fontSize: 13 }}>
          {msg}
        </div>
      )}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Subject','Teacher','Exam','Term/Year','Roll No','Reason','Rejected On','Actions'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {papers.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < papers.length-1 ? '1px solid #f3f4f6' : 'none' }}>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ fontWeight: '500', fontSize: '13px' }}>{p.subjects?.name}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{p.subjects?.course_code}</div>
                </td>
                <td style={{ padding: '11px 14px', fontSize: '13px' }}>{p.teachers?.name}</td>
                <td style={{ padding: '11px 14px', fontSize: '13px' }}>{p.exam_type}</td>
                <td style={{ padding: '11px 14px', fontSize: '13px' }}>{p.term} {p.year}</td>
                <td style={{ padding: '11px 14px', fontSize: '12px', fontFamily: 'monospace', color: '#6b7280' }}>{p.roll_number}</td>
                <td style={{ padding: '11px 14px', fontSize: '12px', color: '#dc2626' }}>{p.admin_note || '—'}</td>
                <td style={{ padding: '11px 14px', fontSize: '12px', color: '#6b7280' }}>{new Date(p.reviewed_at ?? p.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => approvePaper(p)} disabled={loadingAction === p.id}
                      style={{ padding: '4px 10px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      Approve
                    </button>
                    <button onClick={() => deletePaper(p)} disabled={loadingAction === p.id}
                      style={{ padding: '4px 10px', background: '#111', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>
                      {loadingAction === p.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {papers.length === 0 && <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No rejected papers.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
