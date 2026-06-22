'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70');

const nav = [
  { label: 'Dashboard',    href: '/admin' },
  { label: 'Departments',  href: '/admin/departments' },
  { label: 'Teachers',     href: '/admin/teachers' },
  { label: 'Subjects',     href: '/admin/subjects' },
  { label: 'Pending',      href: '/admin/pending' },
  { label: 'Approved',     href: '/admin/approved' },
  { label: 'Rejected',     href: '/admin/rejected' },
  { label: 'Contributors', href: '/admin/contributors' },
  { label: 'Leaderboard',  href: '/admin/leaderboard' },
  { label: 'Notices',      href: '/admin/notices' },
  { label: 'Admin Management', href: '/admin/team' },
  { label: 'Contact Us',   href: '/admin/contact' },
  { label: 'Charity Management', href: '/admin/charity' },
];

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 880px)');
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return mobile;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) window.location.replace('/login');
    });
  }, []);

  // Close the mobile drawer whenever the route changes
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", background: '#f5f5f5' }}>

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 52, zIndex: 65,
          background: '#fff', borderBottom: '1px solid #e8e8e8',
          display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px',
        }}>
          <button onClick={() => setOpen(o => !o)} aria-label="Toggle menu" style={{
            width: 36, height: 36, borderRadius: 8, border: '1px solid #e0e0e0', background: '#fff',
            cursor: 'pointer', fontSize: 18, lineHeight: 1, color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {open ? '✕' : '☰'}
          </button>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>NTU Past Papers <span style={{ color: '#aaa', fontWeight: 500 }}>· Admin</span></div>
        </div>
      )}

      {/* Backdrop (mobile, when drawer open) */}
      {isMobile && open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 60 }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#fff', borderRight: '1px solid #e8e8e8',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 64,
        transform: isMobile ? (open ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        transition: 'transform 0.25s ease',
        boxShadow: isMobile && open ? '0 0 40px rgba(0,0,0,0.2)' : 'none',
      }}>
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#111', letterSpacing: '-0.2px' }}>NTU Past Papers</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>Admin</div>
        </div>

        <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
          {nav.map(({ label, href }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <a key={href} href={href} onClick={() => setOpen(false)} style={{
                display: 'block', padding: '8px 10px',
                borderRadius: 7, marginBottom: 2,
                fontSize: 13, fontWeight: active ? 600 : 400,
                color: active ? '#111' : '#666',
                background: active ? '#f0f0f0' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.1s, color 0.1s',
              }}>
                {label}
              </a>
            );
          })}
        </nav>

        <div style={{ padding: '12px 10px', borderTop: '1px solid #f0f0f0' }}>
          <a href="/papers" style={{ display: 'block', padding: '7px 10px', fontSize: 12, color: '#999', borderRadius: 7, marginBottom: 4, textDecoration: 'none' }}>
            ← Public Site
          </a>
          <button onClick={async () => { await sb.auth.signOut(); window.location.replace('/login'); }}
            style={{ width: '100%', padding: '7px 10px', background: 'transparent', border: '1px solid #e0e0e0', borderRadius: 7, fontSize: 12, color: '#666', cursor: 'pointer', textAlign: 'left' as const, fontFamily: 'inherit' }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 220,
        padding: isMobile ? '68px 16px 28px' : '32px 36px',
        minHeight: '100vh',
        width: '100%', minWidth: 0,
      }}>
        {children}
      </main>
    </div>
  );
}
