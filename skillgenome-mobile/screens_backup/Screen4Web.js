import React, { useState } from 'react';

const getHtmlCss = (isDarkMode) => `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
  
  :root{
    --bg: ${isDarkMode ? '#090b12' : '#f6f5fb'};
    --bg-2: ${isDarkMode ? '#0d1019' : '#efeefa'};
    --surface: ${isDarkMode ? '#12151f' : '#ffffff'};
    --surface-2: ${isDarkMode ? '#171b28' : '#f8f7fc'};
    --field: ${isDarkMode ? '#14171f' : '#ffffff'};
    --field-focus: ${isDarkMode ? '#181c28' : '#ffffff'};
    --border: ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(20,20,30,0.09)'};
    --border-strong: ${isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(20,20,30,0.14)'};
    --text: ${isDarkMode ? '#f3f4f8' : '#14141f'};
    --muted: ${isDarkMode ? '#8d93a8' : '#66697c'};
    --muted-2: ${isDarkMode ? '#5d6273' : '#8b8ea1'};
    --violet: ${isDarkMode ? '#8b5cf6' : '#7c3aed'};
    --violet-deep: ${isDarkMode ? '#5b21b6' : '#5b21b6'};
    --teal: ${isDarkMode ? '#2dd4bf' : '#0d9488'};
    --amber: ${isDarkMode ? '#f0b429' : '#b45309'};
    --danger: #f87171;
    --shadow: ${isDarkMode ? '0 30px 80px rgba(0,0,0,0.5)' : '0 30px 70px rgba(76,29,149,0.14)'};
  }

  .sg-signin *{ box-sizing:border-box; margin:0; padding:0; }
  .sg-signin{
    min-height:100vh; width: 100vw; font-family:'Inter',sans-serif; color:var(--text);
    background:
      radial-gradient(900px 500px at 12% -10%, color-mix(in srgb, var(--violet) 20%, transparent), transparent 60%),
      radial-gradient(800px 500px at 100% 10%, color-mix(in srgb, var(--teal) 14%, transparent), transparent 55%),
      linear-gradient(180deg, var(--bg), var(--bg-2));
    display:flex; align-items:center; justify-content:center; padding:40px 20px;
    transition:background .35s ease, color .35s ease;
    position:absolute; inset:0; overflow-y:auto; overflow-x:hidden;
  }
  .sg-signin .mono{ font-family:'JetBrains Mono',monospace; }

  .sg-signin .helix{ position:absolute; top:-8%; right:-16%; width:52vw; max-width:640px; opacity:0.4; pointer-events:none; }
  .sg-signin .helix.lower{ top:auto; bottom:-14%; left:-18%; right:auto; width:40vw; max-width:520px; opacity:0.25; }

  .sg-signin .card{
    position:relative; z-index:1; width:100%; max-width:420px; margin: auto;
    background:var(--surface); border:1px solid var(--border-strong);
    border-radius:26px; padding:38px 34px 32px; box-shadow:var(--shadow);
  }

  .sg-signin .badge{
    display:inline-flex; align-items:center; gap:9px; padding:6px 8px 6px 13px; border-radius:100px;
    border:1px solid var(--border-strong); background:var(--surface-2); margin-bottom:22px;
  }
  .sg-signin .badge .mark{ width:20px; height:20px; border-radius:6px; background:linear-gradient(135deg,var(--violet),#4f9dff); display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:9px; color:#fff; }
  .sg-signin .badge span.name{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:13px; }
  .sg-signin .seq{ display:flex; gap:3px; padding:3px 7px; border-radius:100px; background:color-mix(in srgb, var(--violet) 14%, transparent); }
  .sg-signin .seq span{ font-size:10px; font-weight:700; color:var(--violet); }
  .sg-signin .seq span:nth-child(2n){ color:var(--teal); }

  .sg-signin h1{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:30px; letter-spacing:-0.02em; margin-bottom:8px; }
  .sg-signin .lead{ font-size:14.5px; color:var(--muted); line-height:1.55; margin-bottom:28px; }
  .sg-signin .lead b{ color:var(--text); font-weight:600; }

  .sg-signin label{ display:block; font-size:12.5px; font-weight:700; color:var(--muted); margin-bottom:7px; text-transform:uppercase; letter-spacing:0.04em; }
  .sg-signin .field-group{ margin-bottom:18px; }
  .sg-signin .field-wrap{ position:relative; }
  .sg-signin input{
    width:100%; padding:14px 16px; border-radius:13px; border:1.5px solid var(--border);
    background:var(--field); color:var(--text); font-size:14.5px; font-family:'Inter',sans-serif;
    outline:none; transition:border-color .2s ease, background .2s ease;
  }
  .sg-signin input::placeholder{ color:var(--muted-2); }
  .sg-signin input:focus{ border-color:var(--violet); background:var(--field-focus); }
  .sg-signin .show-toggle{
    position:absolute; right:14px; top:50%; transform:translateY(-50%);
    font-size:12.5px; font-weight:700; color:var(--violet); background:none; border:none; cursor:pointer;
    font-family:'Inter',sans-serif;
  }

  .sg-signin .row-between{ display:flex; justify-content:flex-end; margin:-6px 0 20px; }
  .sg-signin .forgot{ font-size:13px; color:var(--violet); text-decoration:none; font-weight:600; }
  .sg-signin .forgot:hover{ text-decoration:underline; }

  .sg-signin .btn-primary{
    width:100%; padding:16px; border:none; border-radius:14px; cursor:pointer;
    background:linear-gradient(100deg, var(--violet), var(--violet-deep));
    color:#fff; font-weight:700; font-size:15px; font-family:'Inter',sans-serif;
    box-shadow:0 12px 28px color-mix(in srgb, var(--violet) 38%, transparent);
    transition:transform .18s ease, box-shadow .18s ease;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .sg-signin .btn-primary:hover{ transform:translateY(-1px); }
  .sg-signin .btn-primary:active{ transform:translateY(0); }

  .sg-signin .divider{ display:flex; align-items:center; gap:14px; margin:26px 0 20px; }
  .sg-signin .divider .line{ flex:1; height:1px; background:var(--border); }
  .sg-signin .divider span{ font-size:11px; font-weight:700; letter-spacing:0.08em; color:var(--muted-2); text-transform:uppercase; }

  .sg-signin .social-row{ display:flex; gap:10px; margin-bottom:24px; }
  .sg-signin .social-btn{
    flex:1; display:flex; align-items:center; justify-content:center; gap:8px;
    padding:12px 8px; border-radius:12px; border:1.5px solid var(--border);
    background:var(--surface-2); cursor:pointer; transition:border-color .2s ease, background .2s ease;
  }
  .sg-signin .social-btn:hover{ border-color:var(--border-strong); background:var(--field-focus); }
  .sg-signin .social-btn svg{ width:17px; height:17px; }
  .sg-signin .social-btn span{ font-size:12.5px; font-weight:600; color:var(--text); }
  @media (max-width:380px){ .sg-signin .social-btn span{ display:none; } }

  .sg-signin .footer-link{
    text-align:center; padding:14px; border-radius:13px; border:1px solid var(--border);
    background:var(--surface-2); font-size:13.5px; color:var(--text); font-weight:600;
    cursor:pointer;
  }
  .sg-signin .footer-link span{ color:var(--violet); font-weight:700; text-decoration:none; }
  .sg-signin .footer-link:hover span{ text-decoration:underline; }

  .sg-signin .status{
    display:flex; align-items:center; justify-content:center; gap:6px; margin-top:20px;
    font-size:11px; color:var(--muted-2); font-weight:600;
  }
  .sg-signin .status .dot{ width:5px; height:5px; border-radius:3px; background:var(--teal); animation:sg-blink 1.8s ease-in-out infinite; }
  @keyframes sg-blink{ 0%,100%{opacity:0.3;} 50%{opacity:1;} }
`;

const Screen4Web = ({ 
  onSignInPress, 
  onForgotPasswordPress, 
  onCreateAccountPress, 
  onGooglePress, 
  onGitHubPress, 
  onLinkedInPress,
  isDarkMode = true 
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const cssString = React.useMemo(() => getHtmlCss(isDarkMode), [isDarkMode]);

  return (
    <div className="sg-signin">
      <style dangerouslySetInnerHTML={{ __html: cssString }} />
      <svg className="helix" viewBox="0 0 400 700" fill="none">
        <path d="M40 0 C160 90 -80 180 40 270 C160 360 -80 450 40 540 C160 630 -80 700 40 700" stroke="url(#g1)" strokeWidth="2"/>
        <path d="M360 0 C240 90 480 180 360 270 C240 360 480 450 360 540 C240 630 480 700 360 700" stroke="url(#g2)" strokeWidth="2"/>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="700"><stop stopColor="#8b5cf6"/><stop offset="1" stopColor="#2dd4bf" stopOpacity="0.15"/></linearGradient>
          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="700"><stop stopColor="#2dd4bf"/><stop offset="1" stopColor="#8b5cf6" stopOpacity="0.15"/></linearGradient>
        </defs>
      </svg>
      <svg className="helix lower" viewBox="0 0 400 700" fill="none">
        <path d="M40 0 C160 90 -80 180 40 270 C160 360 -80 450 40 540" stroke="#f0b429" strokeWidth="1.5" opacity="0.5"/>
        <path d="M360 0 C240 90 480 180 360 270 C240 360 480 450 360 540" stroke="#f0b429" strokeWidth="1.5" opacity="0.5"/>
      </svg>

      <div className="card">
        <div className="badge">
          <div className="mark">SG</div>
          <span className="name">SkillGenome</span>
          <div className="seq mono"><span>A</span><span>T</span><span>C</span></div>
        </div>

        <h1>Welcome back</h1>
        <p className="lead">Sign in to access your <b>Career Genome</b> & AI Mentor</p>

        <div className="field-group">
          <label>Email address</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="field-group">
          <label>Password</label>
          <div className="field-wrap">
            <input type={showPassword ? "text" : "password"} placeholder="Enter your password" style={{paddingRight: '64px'}} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="show-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="row-between">
          <a href="#" className="forgot" onClick={(e) => { e.preventDefault(); onForgotPasswordPress?.(); }}>Forgot password?</a>
        </div>

        <button className="btn-primary" onClick={() => onSignInPress?.(email, password)}>
          Sign in <span style={{fontSize: '16px'}}>→</span>
        </button>

        <div className="divider"><div className="line"></div><span>Or continue with</span><div className="line"></div></div>

        <div className="social-row">
          <div className="social-btn" onClick={() => onGooglePress?.()}>
            <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.05H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.95l3.66-2.85z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38z"/></svg>
            <span>Google</span>
          </div>
          <div className="social-btn" onClick={() => onGitHubPress?.()}>
            <svg viewBox="0 0 24 24" fill="var(--text)"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.15c-3.2.7-3.87-1.35-3.87-1.35-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a10.98 10.98 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.4-5.25 5.68.42.36.78 1.08.78 2.18v3.23c0 .3.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
            <span>GitHub</span>
          </div>
          <div className="social-btn" onClick={() => onLinkedInPress?.()}>
            <svg viewBox="0 0 24 24"><path fill="#0A66C2" d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.33V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.28 2.37 4.28 5.46zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56z"/></svg>
            <span>LinkedIn</span>
          </div>
        </div>

        <div className="footer-link" onClick={() => onCreateAccountPress?.()}>
          Don't have an account? <span>Create one now</span>
        </div>

        <div className="status"><div className="dot"></div><span className="mono">ENCRYPTED · SOC2 COMPLIANT</span></div>
      </div>
    </div>
  );
};

export default Screen4Web;
