'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dvtkcuqwvkakycsseydh.supabase.co';
const sb = createClient(SUPABASE_URL,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q'
);
const anonSb = createClient(SUPABASE_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70');

export default function PendingPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [rejectId, setRejectId] = useState<string|null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [loading, setLoading] = useState<string|null>(null);
  const [previewUrl, setPreviewUrl] = useState<string|null>(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const { data } = await sb.from('papers')
      .select('*, departments(name,code), teachers(name), subjects(name,course_code)')
      .eq('status','Pending').order('created_at',{ ascending: false });
    setPapers(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const approve = async (p: any) => {
    setLoading(p.id); setMsg('');

    // Move file pending/ → approved/
    const newPath = p.file_path.startsWith('pending/')
      ? p.file_path.replace('pending/', 'approved/')
      : p.file_path;

    if (p.file_path !== newPath) {
      await sb.storage.from('papers').move(p.file_path, newPath);
    }

    // Correct public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/papers/${newPath}`;

    const { error } = await sb.from('papers').update({
      status: 'Approved',
      file_path: newPath,
      file_url: publicUrl,
      reviewed_at: new Date().toISOString(),
    }).eq('id', p.id);

    if (error) { setMsg('Error: ' + error.message); }
    else { setMsg('Approved!'); }

    setLoading(null);
    await load();
    setTimeout(() => setMsg(''), 2000);
  };

  const reject = async () => {
    if (!rejectId || !rejectNote.trim()) return;
    setLoading(rejectId);
    await sb.from('papers').update({
      status: 'Rejected',
      admin_note: rejectNote,
      reviewed_at: new Date().toISOString(),
    }).eq('id', rejectId);
    setRejectId(null); setRejectNote('');
    setLoading(null);
    await load();
  };

  const preview = async (p: any) => {
    // Get signed URL for pending file
    const { data } = await sb.storage.from('papers').createSignedUrl(p.file_path, 120);
    setPreviewUrl(data?.signedUrl ?? null);
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 6 }}>Pending Papers</h1>
      <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>{papers.length} papers awaiting review</p>

      {msg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#166534', fontSize: 13 }}>
          {msg}
        </div>
      )}

      {papers.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '48px', textAlign: 'center', color: '#aaa' }}>
          All caught up! No pending papers.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {papers.map(p => (
            <div key={p.id} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, margin: '0 0 4px', color: '#111' }}>{p.subjects?.name}</h3>
              <div style={{ fontSize: 12, color: '#aaa', fontFamily: 'monospace', marginBottom: 12 }}>{p.subjects?.course_code}</div>

              <div style={{ fontSize: 13, color: '#555', lineHeight: 2, marginBottom: 14 }}>
                <div><b style={{ color: '#888', fontWeight: 500, width: 60, display: 'inline-block' }}>Dept</b>{p.departments?.name}</div>
                <div><b style={{ color: '#888', fontWeight: 500, width: 60, display: 'inline-block' }}>Teacher</b>{p.teachers?.name}</div>
                <div><b style={{ color: '#888', fontWeight: 500, width: 60, display: 'inline-block' }}>Exam</b>{p.exam_type} · Sem {p.semester} · {p.term} {p.year}</div>
                <div><b style={{ color: '#888', fontWeight: 500, width: 60, display: 'inline-block' }}>Roll</b><span style={{ fontFamily: 'monospace' }}>{p.roll_number}</span></div>
                <div><b style={{ color: '#888', fontWeight: 500, width: 60, display: 'inline-block' }}>File</b>{p.file_name}</div>
              </div>

              <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid #f0f0f0' }}>
                <button onClick={() => preview(p)}
                  style={{ padding: '7px 12px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#444' }}>
                  Preview
                </button>
                <button onClick={() => approve(p)} disabled={loading === p.id}
                  style={{ flex: 1, padding: '7px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 700, opacity: loading === p.id ? 0.6 : 1 }}>
                  {loading === p.id ? '…' : 'Approve'}
                </button>
                <button onClick={() => { setRejectId(p.id); setRejectNote(''); }}
                  style={{ flex: 1, padding: '7px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#fff', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8e8e8' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>File Preview</span>
            <button onClick={() => setPreviewUrl(null)}
              style={{ background: '#f5f5f5', border: 'none', borderRadius: 6, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
          <iframe src={previewUrl} style={{ flex: 1, border: 'none' }} title="Preview" />
        </div>
      )}

      {/* Reject modal */}
      {rejectId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 16px 48px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Reject Paper</h3>
            <p style={{ fontSize: 13, color: '#777', marginBottom: 12 }}>Provide a reason for rejection:</p>
            <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={4}
              placeholder="e.g. Poor image quality, wrong subject…"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectId(null)}
                style={{ padding: '8px 16px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 7, cursor: 'pointer', fontSize: 13 }}>
                Cancel
              </button>
              <button onClick={reject} disabled={!rejectNote.trim()}
                style={{ padding: '8px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 700, opacity: rejectNote.trim() ? 1 : 0.5 }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
