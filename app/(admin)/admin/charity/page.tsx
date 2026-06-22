'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q', { auth: { persistSession: false, autoRefreshToken: false } });

const METHODS = ['JazzCash', 'EasyPaisa', 'SadaPay', 'Bank', 'Other'];

interface PayRow { method: string; number: string; account_name: string; }

const EMPTY = {
  name: '', department: '', is_passout: false, info: '', avatar_url: '',
  payments: [] as PayRow[], display_order: 0, is_active: true,
};

export default function CharityPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await sb.from('charity_members').select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });
    setMembers(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: '', ok: true }), 2800);
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const resetForm = () => { setForm({ ...EMPTY }); setEditId(null); };

  const addPay = () => setForm(f => ({ ...f, payments: [...f.payments, { method: 'JazzCash', number: '', account_name: '' }] }));
  const updPay = (i: number, k: keyof PayRow, v: string) =>
    setForm(f => ({ ...f, payments: f.payments.map((p, idx) => idx === i ? { ...p, [k]: v } : p) }));
  const delPay = (i: number) =>
    setForm(f => ({ ...f, payments: f.payments.filter((_, idx) => idx !== i) }));

  const save = async () => {
    if (!form.name.trim()) { flash('Name is required.', false); return; }
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      department: form.department.trim() || null,
      is_passout: form.is_passout,
      info: form.info.trim() || null,
      avatar_url: form.avatar_url.trim() || null,
      payments: form.payments
        .map(p => ({ method: p.method, number: p.number.trim(), account_name: p.account_name.trim() }))
        .filter(p => p.number),
      display_order: Number(form.display_order) || 0,
      is_active: form.is_active,
    };

    if (editId) {
      const { error } = await sb.from('charity_members').update(payload).eq('id', editId);
      if (error) { flash(error.message, false); } else { flash('Updated!'); resetForm(); await load(); }
    } else {
      const { error } = await sb.from('charity_members').insert(payload);
      if (error) { flash(error.message, false); } else { flash('Member added!'); resetForm(); await load(); }
    }
    setLoading(false);
  };

  const edit = (m: any) => {
    setEditId(m.id);
    setForm({
      name: m.name ?? '', department: m.department ?? '', is_passout: m.is_passout ?? false,
      info: m.info ?? '', avatar_url: m.avatar_url ?? '',
      payments: Array.isArray(m.payments) ? m.payments.map((p: any) => ({ method: p.method ?? 'JazzCash', number: p.number ?? '', account_name: p.account_name ?? '' })) : [],
      display_order: m.display_order ?? 0, is_active: m.is_active ?? true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleActive = async (m: any) => {
    await sb.from('charity_members').update({ is_active: !m.is_active }).eq('id', m.id);
    await load();
  };

  const del = async (id: string) => {
    if (!confirm('Remove this charity member from the public page?')) return;
    const { error } = await sb.from('charity_members').delete().eq('id', id);
    if (error) flash(error.message, false);
    else { flash('Removed.'); if (editId === id) resetForm(); await load(); }
  };

  const inp: React.CSSProperties = { padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none', color: '#111', fontFamily: 'inherit' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 };
  const focus = (e: any) => (e.target.style.borderColor = '#111');
  const blur = (e: any) => (e.target.style.borderColor = '#e0e0e0');

  return (
    <div style={{ maxWidth: 880 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 4 }}>Charity Management</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
        Trusted members who collect donations for needy students. Active members appear on the public
        <a href="/charity" target="_blank" rel="noopener noreferrer" style={{ color: '#3b5bdb', textDecoration: 'none', fontWeight: 600 }}> Charity</a> page.
      </p>

      {/* Form */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 22, marginBottom: 22 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 16 }}>{editId ? 'Edit Member' : 'Add Charity Member'}</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={lbl}>Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ali Khan" style={inp} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={lbl}>Department</label>
            <input value={form.department} onChange={e => set('department', e.target.value)} placeholder="Computer Science" style={inp} onFocus={focus} onBlur={blur} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Info / About</label>
          <textarea value={form.info} onChange={e => set('info', e.target.value)} placeholder="A short note about this member…" rows={2} style={{ ...inp, resize: 'vertical' }} onFocus={focus} onBlur={blur} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Avatar / Photo URL (optional)</label>
          <input value={form.avatar_url} onChange={e => set('avatar_url', e.target.value)} placeholder="https://… (leave blank to use initials)" style={inp} onFocus={focus} onBlur={blur} />
        </div>

        {/* Payment methods */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ ...lbl, marginBottom: 0 }}>Payment Accounts</label>
            <button type="button" onClick={addPay} style={{ padding: '4px 12px', background: '#f0f4ff', color: '#3b5bdb', border: '1px solid #dbe4ff', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>+ Add account</button>
          </div>
          {form.payments.length === 0 && <p style={{ fontSize: 12, color: '#bbb' }}>No accounts yet. Add JazzCash / EasyPaisa / SadaPay numbers.</p>}
          {form.payments.map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr 1.6fr auto', gap: 8, marginBottom: 8 }}>
              <select value={p.method} onChange={e => updPay(i, 'method', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input value={p.number} onChange={e => updPay(i, 'number', e.target.value)} placeholder="03xx-xxxxxxx" style={inp} onFocus={focus} onBlur={blur} />
              <input value={p.account_name} onChange={e => updPay(i, 'account_name', e.target.value)} placeholder="Account holder name" style={inp} onFocus={focus} onBlur={blur} />
              <button type="button" onClick={() => delPay(i)} style={{ padding: '0 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>✕</button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 14 }}>
          <div style={{ width: 130 }}>
            <label style={lbl}>Display Order</label>
            <input type="number" value={form.display_order} onChange={e => set('display_order', e.target.value)} style={inp} onFocus={focus} onBlur={blur} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444', cursor: 'pointer', marginTop: 18 }}>
            <input type="checkbox" checked={form.is_passout} onChange={e => set('is_passout', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
            Passout (alumnus)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444', cursor: 'pointer', marginTop: 18 }}>
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
            Visible on public site
          </label>
        </div>

        {msg.text && <p style={{ fontSize: 13, color: msg.ok ? '#059669' : '#dc2626', marginBottom: 12, fontWeight: 500 }}>{msg.text}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save} disabled={loading}
            style={{ padding: '9px 22px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: loading ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving…' : editId ? 'Update Member' : 'Add Member'}
          </button>
          {editId && (
            <button onClick={resetForm} style={{ padding: '9px 16px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#555', fontWeight: 600 }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0f0', fontSize: 14, fontWeight: 700, color: '#111' }}>
          Charity Members ({members.length})
        </div>
        {members.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#aaa', fontSize: 14 }}>No members yet.</div>
        ) : members.map((m, i) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < members.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, background: m.avatar_url ? `center/cover no-repeat url(${m.avatar_url})` : 'linear-gradient(135deg,#10b981,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
              {!m.avatar_url && (m.name?.[0]?.toUpperCase() ?? '?')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{m.name}</span>
                {m.is_passout && <span style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', padding: '2px 7px', borderRadius: 5 }}>ALUMNUS</span>}
                {!m.is_active && <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '2px 7px', borderRadius: 5 }}>HIDDEN</span>}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {[m.department, Array.isArray(m.payments) && m.payments.length ? `${m.payments.length} account${m.payments.length > 1 ? 's' : ''}` : 'no accounts'].filter(Boolean).join(' · ')}
              </div>
            </div>
            <span style={{ fontSize: 11, color: '#bbb', flexShrink: 0 }}>#{m.display_order}</span>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button onClick={() => toggleActive(m)} style={{ padding: '5px 11px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>{m.is_active ? 'Hide' : 'Show'}</button>
              <button onClick={() => edit(m)} style={{ padding: '5px 12px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Edit</button>
              <button onClick={() => del(m.id)} style={{ padding: '5px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
