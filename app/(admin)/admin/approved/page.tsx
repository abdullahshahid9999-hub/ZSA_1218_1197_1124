'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dvtkcuqwvkakycsseydh.supabase.co';
const sb = createClient(SUPABASE_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q');

export default function ApprovedPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<string|null>(null);
  const [rejectId, setRejectId] = useState<string|null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [loadingAction, setLoadingAction] = useState<string|null>(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const { data } = await sb.from('papers')
      .select('*, departments(name,code), teachers(name), subjects(name,course_code)')
      .eq('status','Approved').order('created_at',{ ascending: false });
    setPapers(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const getSignedUrl = async (filePath: string) => {
    const { data } = await sb.storage.from('papers').createSignedUrl(filePath, 3600);
    return data?.signedUrl ?? null;
  };

  const rejectPaper = async () => {
    if (!rejectId || !rejectNote.trim()) return;
    setLoadingAction(rejectId); setMsg('');
    const p = papers.find(x => x.id === rejectId);
    
    // Move file back to pending folder
    let newPath = p.file_path;
    if (p.file_path.startsWith('approved/')) {
      newPath = p.file_path.replace('approved/', 'pending/');
      await sb.storage.from('papers').move(p.file_path, newPath);
    }
    
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/papers/${newPath}`;

    await sb.from('papers').update({
      status: 'Rejected',
      admin_note: rejectNote,
      file_path: newPath,
      file_url: publicUrl,
      reviewed_at: new Date().toISOString(),
    }).eq('id', rejectId);

    setRejectId(null); setRejectNote(''); setLoadingAction(null);
    setMsg('Paper successfully moved to Rejected.');
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

      {msg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#166534', fontSize: 13 }}>
          {msg}
        </div>
      )}

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
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={async () => { const url = await getSignedUrl(p.file_path); if(url) setPreview(url); }} disabled={loadingAction === p.id}
                      style={{ padding: '4px 10px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>
                      View
                    </button>
                    <button onClick={() => { setRejectId(p.id); setRejectNote(''); }} disabled={loadingAction === p.id}
                      style={{ padding: '4px 10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      Reject
                    </button>
                    <button onClick={() => deletePaper(p)} disabled={loadingAction === p.id}
                      style={{ padding: '4px 10px', background: '#111', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>
                      {loadingAction === p.id ? '…' : 'Delete'}
                    </button>
                  </div>
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

      {/* Reject modal */}
      {rejectId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 16px 48px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Reject Paper</h3>
            <p style={{ fontSize: 13, color: '#777', marginBottom: 12 }}>Provide a reason for rejection:</p>
            <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={4}
              placeholder="e.g. Invalid paper, wrong subject..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectId(null)}
                style={{ padding: '8px 16px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 7, cursor: 'pointer', fontSize: 13 }}>
                Cancel
              </button>
              <button onClick={rejectPaper} disabled={!rejectNote.trim() || loadingAction === rejectId}
                style={{ padding: '8px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 700, opacity: (!rejectNote.trim() || loadingAction === rejectId) ? 0.5 : 1 }}>
                {loadingAction === rejectId ? 'Wait...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
