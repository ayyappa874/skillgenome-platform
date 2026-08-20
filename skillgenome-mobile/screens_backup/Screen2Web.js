import React, { useEffect } from 'react';

const getHtmlCss = (isDarkMode) => `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  :root{
    --bg: ${isDarkMode ? '#090b12' : '#f8fafc'};
    --bg-2: ${isDarkMode ? '#0d1019' : '#f1f5f9'};
    --surface: ${isDarkMode ? '#12151f' : '#ffffff'};
    --surface-2: ${isDarkMode ? '#171b28' : '#f8fafc'};
    --border: ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
    --border-strong: ${isDarkMode ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)'};
    --text: ${isDarkMode ? '#f3f4f8' : '#0f172a'};
    --muted: ${isDarkMode ? '#8d93a8' : '#64748b'};
    --muted-2: ${isDarkMode ? '#5d6273' : '#94a3b8'};
    --violet: #8b5cf6;
    --violet-deep: #5b21b6;
    --teal: ${isDarkMode ? '#2dd4bf' : '#0f766e'};
    --amber: ${isDarkMode ? '#f0b429' : '#d97706'};
    --green: #34d399;
    --grid-line: ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
  }

  .sg-landing * { box-sizing:border-box; margin:0; padding:0; }
  .sg-landing {
    background: var(--bg);
    color: var(--text);
    font-family:'Inter',sans-serif;
    -webkit-font-smoothing:antialiased;
    overflow-x:hidden;
    min-height:100vh;
    width: 100vw;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
  }

  .sg-landing .mono{ font-family:'JetBrains Mono',monospace; }

  @media (prefers-reduced-motion: reduce){
    .sg-landing *{ animation-duration:0.01ms !important; animation-iteration-count:1 !important; transition-duration:0.01ms !important; }
  }

  /* ---------- ambient backdrop ---------- */
  .sg-landing .backdrop{
    position:fixed; inset:0; z-index:0; overflow:hidden; pointer-events:none;
    background:
      radial-gradient(1100px 700px at 15% -10%, rgba(139,92,246,0.20), transparent 60%),
      radial-gradient(900px 600px at 100% 10%, rgba(45,212,191,0.14), transparent 55%),
      radial-gradient(700px 500px at 50% 120%, rgba(240,180,41,0.08), transparent 60%),
      linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%);
  }
  .sg-landing .grid-lines{ position:absolute; inset:0; opacity:0.35; }
  .sg-landing .grid-lines svg{ width:100%; height:100%; }

  .sg-landing .helix-wrap{
    position:absolute; top:-6%; right:-14%; width:60vw; max-width:820px; opacity:0.55;
    animation: drift 26s ease-in-out infinite;
  }
  @keyframes drift{
    0%,100%{ transform: translateY(0) rotate(0deg); }
    50%{ transform: translateY(24px) rotate(1.5deg); }
  }
  .sg-landing .helix-wrap.lower{
    top:auto; bottom:-18%; right:auto; left:-18%; width:46vw; max-width:640px; opacity:0.35;
    animation-duration:34s; animation-direction:reverse;
  }

  /* ---------- layout shell ---------- */
  .sg-landing .page{ position:relative; z-index:1; }
  .sg-landing nav{
    display:flex; align-items:center; justify-content:space-between;
    max-width:1160px; margin:0 auto; padding:28px 24px 0;
  }
  .sg-landing .brand{ display:flex; align-items:center; gap:12px; }
  .sg-landing .mark{
    width:40px; height:40px; border-radius:11px;
    background:linear-gradient(135deg, var(--violet), #4f9dff);
    display:flex; align-items:center; justify-content:center;
    font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:14px; color:#fff;
    box-shadow:0 6px 20px rgba(139,92,246,0.35);
  }
  .sg-landing .brand-name{ font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:16px; letter-spacing:-0.01em; }
  .sg-landing .nav-links{ display:flex; align-items:center; gap:28px; }
  .sg-landing .nav-links a{
    color:var(--muted); text-decoration:none; font-size:14px; font-weight:500;
    transition:color .2s ease; cursor:pointer;
  }
  .sg-landing .nav-links a:hover{ color:var(--text); }
  .sg-landing .nav-cta{
    padding:9px 18px; border-radius:9px; background:var(--surface-2);
    border:1px solid var(--border-strong); color:var(--text) !important;
    font-weight:600 !important; font-size:13px !important; cursor:pointer;
  }
  @media (max-width:720px){ .sg-landing .nav-links a:not(.nav-cta){ display:none; } }

  .sg-landing main{ max-width:1160px; margin:0 auto; padding:0 24px; }

  /* ---------- hero ---------- */
  .sg-landing .hero{ padding:96px 0 64px; text-align:center; display:flex; flex-direction:column; align-items:center; }

  .sg-landing .sequence-badge{
    display:inline-flex; align-items:center; gap:10px;
    padding:7px 8px 7px 14px; border-radius:100px;
    border:1px solid var(--border-strong); background:rgba(255,255,255,0.03);
    margin-bottom:28px; opacity:0; animation:rise .7s ease forwards;
  }
  .sg-landing .sequence-badge .label{ font-size:12.5px; color:var(--muted); font-weight:600; letter-spacing:0.01em; }
  .sg-landing .seq{ display:flex; gap:3px; padding:4px 8px; border-radius:100px; background:rgba(139,92,246,0.12); }
  .sg-landing .seq span{
    font-size:11px; font-weight:600; color:var(--violet);
    animation: pulse-base 2.4s ease-in-out infinite;
  }
  .sg-landing .seq span:nth-child(1){ animation-delay:0s; }
  .sg-landing .seq span:nth-child(2){ animation-delay:.3s; color:var(--teal); }
  .sg-landing .seq span:nth-child(3){ animation-delay:.6s; }
  .sg-landing .seq span:nth-child(4){ animation-delay:.9s; color:var(--teal); }
  .sg-landing .seq span:nth-child(5){ animation-delay:1.2s; }
  @keyframes pulse-base{ 0%,100%{ opacity:0.45; } 50%{ opacity:1; } }

  .sg-landing h1{
    font-family:'Space Grotesk',sans-serif;
    font-weight:700;
    font-size:clamp(40px, 7vw, 78px);
    line-height:1.03;
    letter-spacing:-0.03em;
    color:var(--text);
    opacity:0; animation:rise .7s ease .08s forwards;
  }
  .sg-landing h1 .accent{
    background:linear-gradient(100deg, var(--violet) 15%, var(--teal) 85%);
    -webkit-background-clip:text; background-clip:text; color:transparent;
  }

  .sg-landing .hero-sub{
    max-width:600px; margin:22px auto 0; font-size:18px; line-height:1.6; color:var(--muted);
    opacity:0; animation:rise .7s ease .16s forwards;
  }

  .sg-landing .cta-row{
    display:flex; gap:14px; margin-top:38px; flex-wrap:wrap; justify-content:center;
    opacity:0; animation:rise .7s ease .24s forwards;
  }
  .sg-landing .btn-primary{
    position:relative; overflow:hidden;
    padding:17px 30px; border-radius:13px; border:none; cursor:pointer;
    background:linear-gradient(100deg, var(--violet), var(--violet-deep));
    color:#fff; font-weight:700; font-size:15.5px; font-family:'Inter',sans-serif;
    box-shadow:0 10px 30px rgba(139,92,246,0.35);
    transition:transform .2s ease, box-shadow .2s ease;
  }
  .sg-landing .btn-primary:hover{ transform:translateY(-2px); box-shadow:0 14px 36px rgba(139,92,246,0.48); }
  .sg-landing .btn-primary:active{ transform:translateY(0); }
  .sg-landing .btn-ghost{
    padding:17px 26px; border-radius:13px; cursor:pointer;
    background:rgba(255,255,255,0.04); border:1.5px solid var(--border-strong);
    color:var(--text); font-weight:700; font-size:15.5px; font-family:'Inter',sans-serif;
    transition:background .2s ease, border-color .2s ease;
  }
  .sg-landing .btn-ghost:hover{ background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.28); }

  @keyframes rise{ from{ opacity:0; transform:translateY(18px); } to{ opacity:1; transform:translateY(0); } }

  .sg-landing .trust-row{
    display:flex; align-items:center; justify-content:center; gap:10px; flex-wrap:wrap;
    margin-top:44px; opacity:0; animation:rise .7s ease .3s forwards;
  }
  .sg-landing .trust-item{ font-size:12.5px; color:var(--muted-2); font-weight:600; display:flex; align-items:center; gap:6px; }
  .sg-landing .trust-item svg{ width:12px; height:12px; color:var(--teal); }
  .sg-landing .trust-dot{ width:3px; height:3px; border-radius:2px; background:var(--border-strong); }

  /* ---------- divider ---------- */
  .sg-landing .section-label{
    display:flex; align-items:center; gap:16px; margin:88px 0 40px;
  }
  .sg-landing .section-label .line{ flex:1; height:1px; background:var(--border); }
  .sg-landing .section-label .txt{
    font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:0.12em;
    color:var(--muted-2); text-transform:uppercase; white-space:nowrap;
  }

  /* ---------- feature grid ---------- */
  .sg-landing .features{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  @media (max-width:920px){ .sg-landing .features{ grid-template-columns:repeat(2,1fr); } }
  @media (max-width:560px){ .sg-landing .features{ grid-template-columns:1fr; } }

  .sg-landing .fcard{
    position:relative; padding:26px 22px; border-radius:18px;
    border:1px solid var(--border); background:var(--surface);
    overflow:hidden; cursor:default;
    transition:border-color .25s ease, transform .25s ease, background .25s ease;
  }
  .sg-landing .fcard:hover{ transform:translateY(-4px); border-color:var(--border-strong); background:var(--surface-2); }
  .sg-landing .fcard::before{
    content:''; position:absolute; inset:0; opacity:0; transition:opacity .25s ease;
    background:radial-gradient(220px 140px at 20% 0%, rgba(139,92,246,0.16), transparent 70%);
  }
  .sg-landing .fcard:hover::before{ opacity:1; }
  .sg-landing .fcard .tag{
    font-family:'JetBrains Mono',monospace; font-size:10.5px; color:var(--muted-2);
    letter-spacing:0.08em; margin-bottom:16px; display:block;
  }
  .sg-landing .ficon{
    width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center;
    margin-bottom:16px; background:rgba(139,92,246,0.12); color:var(--violet);
  }
  .sg-landing .ficon svg{ width:19px; height:19px; }
  .sg-landing .fcard:nth-child(2) .ficon{ background:rgba(45,212,191,0.12); color:var(--teal); }
  .sg-landing .fcard:nth-child(3) .ficon{ background:rgba(240,180,41,0.14); color:var(--amber); }
  .sg-landing .fcard:nth-child(4) .ficon{ background:rgba(52,211,153,0.12); color:var(--green); }
  .sg-landing .fcard h3{ font-family:'Space Grotesk',sans-serif; font-size:16.5px; font-weight:600; margin-bottom:7px; }
  .sg-landing .fcard p{ font-size:13.5px; line-height:1.55; color:var(--muted); }

  /* ---------- proof ---------- */
  .sg-landing .proof{
    margin-top:22px; position:relative; border-radius:22px; overflow:hidden;
    border:1px solid var(--border-strong);
    background:linear-gradient(135deg, rgba(139,92,246,0.14), rgba(45,212,191,0.07) 60%, var(--surface) 100%);
    padding:38px 34px;
    display:grid; grid-template-columns:auto 1fr; gap:22px; align-items:center;
  }
  @media (max-width:640px){ .sg-landing .proof{ grid-template-columns:1fr; text-align:center; } .sg-landing .proof .avatar{ margin:0 auto; } }
  .sg-landing .proof .avatar{
    width:54px; height:54px; border-radius:50%;
    background:linear-gradient(135deg,var(--teal),var(--violet));
    display:flex; align-items:center; justify-content:center;
    font-family:'Space Grotesk',sans-serif; font-weight:700; color:#0a0c14; font-size:18px;
    flex-shrink:0;
  }
  .sg-landing .proof blockquote{
    font-size:18px; line-height:1.55; color:var(--text); font-weight:500;
    margin-bottom:12px;
  }
  .sg-landing .proof cite{ font-style:normal; font-size:13.5px; color:var(--teal); font-weight:600; }
  .sg-landing .proof .stars{ display:flex; gap:3px; margin-bottom:10px; }
  .sg-landing .proof .stars svg{ width:13px; height:13px; color:var(--amber); }

  /* ---------- final cta ---------- */
  .sg-landing .final-cta{
    margin:96px 0 80px; text-align:center; padding:56px 24px;
    border-radius:26px; border:1px solid var(--border-strong);
    background:radial-gradient(600px 300px at 50% 0%, rgba(139,92,246,0.18), transparent 70%), var(--surface);
    position:relative;
  }
  .sg-landing .final-cta h2{
    font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:clamp(28px,4vw,40px);
    letter-spacing:-0.02em; margin-bottom:14px;
  }
  .sg-landing .final-cta p{ color:var(--muted); font-size:15.5px; margin-bottom:30px; }

  .sg-landing footer{
    max-width:1160px; margin:0 auto; padding:28px 24px 44px;
    display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;
    color:var(--muted-2); font-size:12.5px; border-top:1px solid var(--border);
  }
`;

const Screen2Web = ({ onGetStarted, onSignIn, isDarkMode = true }) => {
  return (
    <div className="sg-landing">
      <style dangerouslySetInnerHTML={{ __html: getHtmlCss(isDarkMode) }} />
      <div className="backdrop">
        <div className="grid-lines">
          <svg><defs><pattern id="gridpat" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="var(--grid-line)" strokeWidth="1"/>
          </pattern></defs><rect width="100%" height="100%" fill="url(#gridpat)"/></svg>
        </div>
        <div className="helix-wrap">
          <svg viewBox="0 0 400 700" fill="none">
            <path d="M40 0 C160 90 -80 180 40 270 C160 360 -80 450 40 540 C160 630 -80 700 40 700" stroke="url(#g1)" strokeWidth="2" opacity="0.7"/>
            <path d="M360 0 C240 90 480 180 360 270 C240 360 480 450 360 540 C240 630 480 700 360 700" stroke="url(#g2)" strokeWidth="2" opacity="0.7"/>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="700" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6"/><stop offset="1" stopColor="#2dd4bf" stopOpacity="0.2"/>
              </linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="700" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2dd4bf"/><stop offset="1" stopColor="#8b5cf6" stopOpacity="0.2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="helix-wrap lower">
          <svg viewBox="0 0 400 700" fill="none">
            <path d="M40 0 C160 90 -80 180 40 270 C160 360 -80 450 40 540" stroke="#f0b429" strokeWidth="1.5" opacity="0.4"/>
            <path d="M360 0 C240 90 480 180 360 270 C240 360 480 450 360 540" stroke="#f0b429" strokeWidth="1.5" opacity="0.4"/>
          </svg>
        </div>
      </div>

      <div className="page">
        <nav>
          <div className="brand">
            <div className="mark">SG</div>
            <span className="brand-name">SkillGenome</span>
          </div>
          <div className="nav-links">
            <a href="#unlock">Product</a>
            <a href="#proof">Stories</a>
            <a onClick={onSignIn} className="nav-cta">Sign in</a>
          </div>
        </nav>

        <main>
          <section className="hero">
            <div className="sequence-badge">
              <span className="label">Beta · v2.0 live</span>
              <div className="seq mono"><span>A</span><span>T</span><span>C</span><span>G</span><span>A</span></div>
            </div>

            <h1>Your career,<br/><span className="accent">decoded by AI.</span></h1>

            <p className="hero-sub">
              SkillGenome maps your professional DNA — skills, mindset, and potential —
              then builds a living roadmap to your next breakthrough.
            </p>

            <div className="cta-row">
              <button onClick={onGetStarted} className="btn-primary">Get started free →</button>
              <button onClick={onSignIn} className="btn-ghost">Sign in</button>
            </div>

            <div className="trust-row">
              <span className="trust-item">10K+ professionals</span>
              <span className="trust-dot"></span>
              <span className="trust-item">AI-powered</span>
              <span className="trust-dot"></span>
              <span className="trust-item">Privacy first</span>
              <span className="trust-dot"></span>
              <span className="trust-item">Free to start</span>
            </div>
          </section>

          <div className="section-label" id="unlock">
            <div className="line"></div>
            <span className="txt">What you unlock</span>
            <div className="line"></div>
          </div>

          <section className="features">
            <div className="fcard">
              <span className="tag mono">01 · SEQUENCE</span>
              <div className="ficon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4c4 4 4 8 0 12s4 8 8 4M20 4c-4 4-4 8 0 12s-4 8-8 4" strokeLinecap="round"/></svg></div>
              <h3>Genome Score</h3>
              <p>An AI-computed fingerprint of your skills, strengths, and blind spots.</p>
            </div>
            <div className="fcard">
              <span className="tag mono">02 · COACH</span>
              <div className="ficon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6" strokeLinecap="round"/></svg></div>
              <h3>AI Career Twin</h3>
              <p>A personalised coach, on call around the clock to plan your next move.</p>
            </div>
            <div className="fcard">
              <span className="tag mono">03 · SIMULATE</span>
              <div className="ficon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 3 7v10l9 5 9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10" strokeLinecap="round"/></svg></div>
              <h3>Career Sim</h3>
              <p>Run what-if simulations across roles, industries, and timelines.</p>
            </div>
            <div className="fcard">
              <span className="tag mono">04 · SIGNAL</span>
              <div className="ficon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round"/></svg></div>
              <h3>Live Analytics</h3>
              <p>Real-time visibility into how recruiters are reading your profile.</p>
            </div>
          </section>

          <div id="proof" style={{ marginTop: 96 }}>
            <div className="proof">
              <div className="avatar">AM</div>
              <div>
                <div className="stars">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 6h6.4l-5.2 4 2 6.4-5.8-4-5.8 4 2-6.4L1 7h6.4z"/></svg>
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 6h6.4l-5.2 4 2 6.4-5.8-4-5.8 4 2-6.4L1 7h6.4z"/></svg>
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 6h6.4l-5.2 4 2 6.4-5.8-4-5.8 4 2-6.4L1 7h6.4z"/></svg>
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 6h6.4l-5.2 4 2 6.4-5.8-4-5.8 4 2-6.4L1 7h6.4z"/></svg>
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 6h6.4l-5.2 4 2 6.4-5.8-4-5.8 4 2-6.4L1 7h6.4z"/></svg>
                </div>
                <blockquote>"SkillGenome helped me understand exactly which skills to focus on. I landed my dream job within three months."</blockquote>
                <cite>— Arjun M., Senior Engineer @ Google</cite>
              </div>
            </div>
          </div>

          <section className="final-cta">
            <h2>Your next role is already<br/>written in your data.</h2>
            <p>Decode it in under two minutes. No credit card required.</p>
            <button onClick={onGetStarted} className="btn-primary">Get started free →</button>
          </section>
        </main>

        <footer>
          <span>© 2026 SkillGenome</span>
          <span className="mono">STATUS: ALL SYSTEMS DECODED</span>
        </footer>
      </div>
    </div>
  );
};

export default Screen2Web;
