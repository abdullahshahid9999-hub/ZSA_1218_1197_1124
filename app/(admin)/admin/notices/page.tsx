'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q');

const CATEGORIES = ['General', 'Exam', 'Result', 'Event', 'Holiday', 'Fee', 'Urgent'];

const EMPTY = {
  title: '', content: '', category: 'General', is_pinned: false,
  link_url: '', link_label: '', published_at: '', expires_at: '', is_active: true,
};

export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await sb.from('notices').select('*')
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false });
    setNotices(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: '', ok: true }), 2800);
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const resetForm = () => { setForm({ ...EMPTY }); setEditId(null); };

  const save = async () => {
    if (!form.title.trim()) { flash('Title is required.', false); return; }
    if (!form.content.trim()) { flash('Content is required.', false); return; }
    setLoading(true);

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category || 'General',
      is_pinned: form.is_pinned,
      link_url: form.link_url.trim() || null,
      link_label: form.link_label.trim() || null,
      published_at: form.published_at || new Date().toISOString().slice(0, 10),
      expires_at: form.expires_at || null,
      is_active: form.is_active,
    };

    if (editId) {
      const { error } = await sb.from('notices').update(payload).eq('id', editId);
      if (error) { flash(error.message, false); } else { flash('Notice updated!'); resetForm(); await load(); }
    } else {
      const { error } = await sb.from('notices').insert(payload);
      if (error) { flash(error.message, false); } else { flash('Notice published!'); resetForm(); await load(); }
    }
    setLoading(false);
  };

  const edit = (n: any) => {
    setEditId(n.id);
    setForm({
      title: n.title ?? '', content: n.content ?? '', category: n.category ?? 'General',
      is_pinned: n.is_pinned ?? false, link_url: n.link_url ?? '', link_label: n.link_label ?? '',
      published_at: n.published_at ? n.published_at.slice(0, 10) : '',
      expires_at: n.expires_at ? n.expires_at.slice(0, 10) : '',
      is_active: n.is_active ?? true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggle = async (n: any, field: 'is_active' | 'is_pinned') => {
    await sb.from('notices').update({ [field]: !n[field] }).eq('id', n.id);
    await load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this notice? It will be removed from the public site too.')) return;
    const { error } = await sb.from('notices').delete().eq('id', id);
    if (error) flash(error.message, false);
    else { flash('Notice deleted.'); if (editId === id) resetForm(); await load(); }
  };

  const inp: React.CSSProperties = { padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none', color: '#111', fontFamily: 'inherit' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 };
  const focus = (e: any) => (e.target.style.borderColor = '#111');
  const blur = (e: any) => (e.target.style.borderColor = '#e0e0e0');

  const catColor = (c: string) => ({
    General: { bg: '#eef2ff', fg: '#3b5bdb' }, Exam: { bg: '#fff4e6', fg: '#e8590c' },
    Result: { bg: '#ebfbee', fg: '#2b8a3e' }, Event: { bg: '#f3e8ff', fg: '#7c3aed' },
    Holiday: { bg: '#e6fcf5', fg: '#0c8599' }, Fee: { bg: '#fff9db', fg: '#b08900' },
    Urgent: { bg: '#fff5f5', fg: '#e03131' },
  } as Record<string, { bg: string; fg: string }>)[c] ?? { bg: '#f1f3f5', fg: '#666' };

  return (
    <div style={{ maxWidth: 860 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 4 }}>Notices</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
        Post announcements for students. Active notices appear on the public
        <a href="/notices" target="_blank" style={{ color: '#3b5bdb', textDecoration: 'none', fontWeight: 600 }}> Notices</a> page.
      </p>

      {/* Form */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 22, marginBottom: 22 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 16 }}>
          {editId ? 'Edit Notice' : 'New Notice'}
        </h2>

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Title *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Mid-term exam schedule released" style={inp} onFocus={focus} onBlur={blur} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Content *</label>
          <textarea value={form.content} onChange={e => set('content', e.target.value)} placeholder="Write the full notice here…" rows={4} style={{ ...inp, resize: 'vertical' }} onFocus={focus} onBlur={blur} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={lbl}>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Published date</label>
            <input type="date" value={form.published_at} onChange={e => set('published_at', e.target.value)} style={inp} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={lbl}>Expiry date (optional)</label>
            <input type="date" value={form.expires_at} onChange={e => set('expires_at', e.target.value)} style={inp} onFocus={focus} onBlur={blur} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Link label (optional)</label>
            <input value={form.link_label} onChange={e => set('link_label', e.target.value)} placeholder="e.g. Download schedule" style={inp} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={lbl}>Link URL (optional)</label>
            <input value={form.link_url} onChange={e => set('link_url', e.target.value)} placeholder="https://…" style={inp} onFocus={focus} onBlur={blur} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_pinned} onChange={e => set('is_pinned', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
            📌 Pin to top
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
            Visible on public site
          </label>
        </div>

        {msg.text && <p style={{ fontSize: 13, color: msg.ok ? '#059669' : '#dc2626', marginBottom: 12, fontWeight: 500 }}>{msg.text}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save} disabled={loading}
            style={{ padding: '9px 22px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: loading ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving…' : editId ? 'Update Notice' : 'Publish Notice'}
          </button>
          {editId && (
            <button onClick={resetForm}
              style={{ padding: '9px 16px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#555', fontWeight: 600 }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0f0', fontSize: 14, fontWeight: 700, color: '#111' }}>
          All Notices ({notices.length})
        </div>
        {notices.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#aaa', fontSize: 14 }}>No notices yet. Publish the first one above.</div>
        ) : notices.map((n, i) => {
          const c = catColor(n.category);
          return (
            <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px', borderBottom: i < notices.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  {n.is_pinned && <span title="Pinned" style={{ fontSize: 13 }}>📌</span>}
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{n.title}</span>
                  <span style={{ background: c.bg, color: c.fg, padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>{n.category}</span>
                  {!n.is_active && <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '2px 7px', borderRadius: 5 }}>HIDDEN</span>}
                </div>
                <div style={{ fontSize: 12, color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {n.published_at}{n.expires_at ? ` · expires ${n.expires_at}` : ''}{n.link_url ? ' · has link' : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => toggle(n, 'is_pinned')} style={{ padding: '5px 11px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>{n.is_pinned ? 'Unpin' : 'Pin'}</button>
                <button onClick={() => toggle(n, 'is_active')} style={{ padding: '5px 11px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>{n.is_active ? 'Hide' : 'Show'}</button>
                <button onClick={() => edit(n)} style={{ padding: '5px 12px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Edit</button>
                <button onClick={() => del(n.id)} style={{ padding: '5px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
