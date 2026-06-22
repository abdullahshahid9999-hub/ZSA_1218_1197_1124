"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("sn-theme");
    if (saved === "dark" || saved === "light") setTheme(saved);
  }, []);

  // Anonymous visit tracking — counts are shown in the admin dashboard.
  useEffect(() => {
    let vid = "";
    try {
      vid = localStorage.getItem("sn-vid") || "";
      if (!vid) { vid = crypto.randomUUID(); localStorage.setItem("sn-vid", vid); }
    } catch {}
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitor_id: vid, path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  const toggleTheme = () => setTheme(t => {
    const next = t === "dark" ? "light" : "dark";
    try { localStorage.setItem("sn-theme", next); } catch {}
    return next;
  });

  return (
    <div className="pub-shell" data-theme={theme} style={{ minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pub-shell {
          background:
            radial-gradient(820px 460px at 6% -10%, rgba(124,92,250,0.18), transparent 60%),
            radial-gradient(760px 460px at 100% 2%, rgba(56,189,248,0.14), transparent 55%),
            radial-gradient(720px 480px at 50% 118%, rgba(236,72,153,0.09), transparent 60%),
            linear-gradient(180deg, #f7f5ff 0%, #eef3ff 45%, #f6f8fd 100%);
          background-attachment: fixed;
        }
        .pub-shell h1, .pub-shell h2, .pub-shell h3, .pub-shell .paper-year {
          font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
        }
        /* Dark mode via inversion — keeps the inline-styled UI consistent.
           Images, SVGs and gradients are counter-inverted so they stay true. */
        .pub-shell[data-theme="dark"] { filter: invert(1) hue-rotate(180deg); }
        .pub-shell[data-theme="dark"] img,
        .pub-shell[data-theme="dark"] svg,
        .pub-shell[data-theme="dark"] [style*="gradient"],
        .pub-shell[data-theme="dark"] [style*="url("] { filter: invert(1) hue-rotate(180deg); }
        .theme-toggle { width:36px; height:36px; border-radius:9px; border:1.5px solid #e0e0e0; background:#fff; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; color:#555; transition:background 0.15s, transform 0.15s; flex-shrink:0; }
        .theme-toggle:hover { background:#f5f5f5; transform:translateY(-1px); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.04); } }
        .nav-link { padding:7px 15px; border-radius:8px; font-size:14px; font-weight:500; text-decoration:none; transition:background 0.18s, color 0.18s, transform 0.15s; display:inline-block; }
        .nav-link:hover { transform:translateY(-1px); }
        .fade-up   { animation:fadeUp 0.5s ease both; }
        .fade-up-1 { animation:fadeUp 0.5s 0.05s ease both; }
        .fade-up-2 { animation:fadeUp 0.5s 0.10s ease both; }
        .fade-up-3 { animation:fadeUp 0.5s 0.15s ease both; }
        .card-hover { transition:box-shadow 0.2s, transform 0.2s, border-color 0.2s; }
        .card-hover:hover { box-shadow:0 8px 28px rgba(0,0,0,0.09); transform:translateY(-2px); border-color:#c8c8c8 !important; }
        .btn-primary { background:#111; color:#fff; border:none; border-radius:9px; font-size:14px; font-weight:700; cursor:pointer; transition:background 0.17s, transform 0.15s, box-shadow 0.15s; font-family:inherit; }
        .btn-primary:hover:not(:disabled) { background:#333; transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,0.18); }
        .btn-secondary { background:#fff; color:#444; border:1px solid #e0e0e0; border-radius:9px; font-size:14px; font-weight:600; cursor:pointer; transition:background 0.15s, transform 0.15s; font-family:inherit; }
        .btn-secondary:hover { background:#f7f7f7; transform:translateY(-1px); }
        .chip { padding:9px 18px; border-radius:9px; font-size:13px; font-weight:500; cursor:pointer; border:1.5px solid #e0e0e0; background:#fff; color:#333; transition:all 0.16s; font-family:inherit; }
        .chip:hover { border-color:#aaa; background:#f8f8f8; transform:translateY(-1px); }
        .chip.active { background:#111; color:#fff; border-color:#111; font-weight:700; }
        .input-field { width:100%; padding:11px 14px; border:1.5px solid #e0e0e0; border-radius:9px; font-size:14px; color:#111; background:#fff; outline:none; transition:border-color 0.17s, box-shadow 0.17s; font-family:inherit; }
        .input-field:focus { border-color:#111; box-shadow:0 0 0 3px rgba(17,17,17,0.07); }
        .tag { display:inline-flex; align-items:center; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700; }
        .section-card { background:rgba(255,255,255,0.72); -webkit-backdrop-filter:blur(16px) saturate(150%); backdrop-filter:blur(16px) saturate(150%); border:1px solid rgba(255,255,255,0.75); border-radius:18px; padding:24px; margin-bottom:14px; box-shadow:0 12px 34px rgba(86,72,160,0.10); animation:fadeUp 0.4s ease both; }
        .step-dot { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; flex-shrink:0; transition:background 0.2s; }
        .step-dot.done   { background:#059669; color:#fff; }
        .step-dot.active { background:#111; color:#fff; }
        .step-dot.idle   { background:#ebebeb; color:#aaa; }
        .upload-zone { border:2px dashed #d0d0d0; border-radius:12px; padding:36px 20px; text-align:center; cursor:pointer; background:#fafafa; transition:all 0.2s; }
        .upload-zone:hover { border-color:#888; background:#f3f3f3; }
        .upload-zone.has-file { border-color:#059669; background:#f0fdf4; border-style:solid; }
        .submit-btn { width:100%; padding:13px; background:#111; color:#fff; border:none; border-radius:10px; font-size:15px; font-weight:700; cursor:pointer; transition:all 0.17s; font-family:inherit; }
        .submit-btn:hover:not(:disabled) { background:#222; box-shadow:0 6px 20px rgba(0,0,0,0.2); transform:translateY(-1px); }
        .submit-btn:disabled { background:#aaa; cursor:not-allowed; }
        .table-row { transition:background 0.12s; }
        .table-row:hover { background:#f8f8ff !important; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); backdrop-filter:blur(3px); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s ease; }
        .modal-box { background:#fff; border-radius:18px; padding:30px; width:100%; max-width:520px; max-height:85vh; overflow-y:auto; box-shadow:0 24px 64px rgba(0,0,0,0.18); animation:fadeUp 0.25s ease; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:#f0f0f0; border-radius:3px; }
        ::-webkit-scrollbar-thumb { background:#ccc; border-radius:3px; }
      `}</style>

      <nav style={{
        background: scrolled ? "rgba(255,255,255,0.95)" : "#fff",
        borderBottom: "1px solid #e8e8e8",
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.25s",
        boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.07)" : "none",
      }}>
        <div className="pub-nav-inner" style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:58 }}>
          <Link href="/papers" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#667eea,#764ba2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:14, flexShrink:0 }}>S</div>
            <div>
              <span style={{ fontWeight:800, fontSize:15, color:"#111", letterSpacing:"-0.4px" }}>StudyNest</span>
              <span style={{ fontSize:12, color:"#bbb", marginLeft:6 }}>NTU</span>
            </div>
          </Link>
          <div className="pub-nav-links" style={{ display:"flex", gap:4 }}>
            {([
              ["/papers","Papers"],
              ["/contribute","Contribute"],
              ["/leaderboard","Leaderboard"],
              ["/notices","Notices"],
              ["/charity","Charity"],
              ["/about","About Us"],
            ] as [string,string][]).map(([href, label]) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link key={href} href={href} className="nav-link" style={{
                  color: active ? "#111" : "#666",
                  background: active ? "#f0f0f5" : "transparent",
                  fontWeight: active ? 700 : 500,
                }}>
                  {label}
                </Link>
              );
            })}
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle dark mode" title="Toggle theme">
              {theme === "dark" ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="pub-main" style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px" }}>{children}</main>

      <footer style={{ borderTop:"1px solid #e8e8e8", background:"#fff", padding:"24px", marginTop:60, textAlign:"center" }}>
        <div style={{ fontSize:13, color:"#bbb" }}>
          <span style={{ fontWeight:700, color:"#999" }}>StudyNest</span> &mdash; NTU Past Papers Archive &middot; For students, by students
        </div>
      </footer>
    </div>
  );
}
