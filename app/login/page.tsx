'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70');

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { data, error: err } = await sb.auth.signInWithPassword({ email: email.trim(), password: password.trim() });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.session) window.location.replace('/admin');
    else { setError('Login failed. Please try again.'); setLoading(false); }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', color: '#111827',
    background: 'white', outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '60px', height: '60px', background: '#1a56db', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>📚</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>StudyNest Admin</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>National Textile University</p>
        </div>

        {/* Form card */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '36px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Sign in to Admin Portal</h2>
          <form onSubmit={login}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@ntu.edu.pk" autoComplete="email"
                style={inp} onFocus={e => (e.target.style.borderColor='#1a56db')} onBlur={e => (e.target.style.borderColor='#e5e7eb')} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" autoComplete="current-password"
                style={inp} onFocus={e => (e.target.style.borderColor='#1a56db')} onBlur={e => (e.target.style.borderColor='#e5e7eb')} />
            </div>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>⚠️</span>
                <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', background: loading ? '#93c5fd' : '#1a56db',
              color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
            }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#9ca3af' }}>
          Admin access only · Unauthorized access is prohibited
        </p>
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <a href="/papers" style={{ fontSize: '13px', color: '#1a56db', textDecoration: 'none' }}>← Back to Public Site</a>
        </div>
      </div>
    </div>
  );
}
