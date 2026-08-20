import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../utils/supabase';

const Screen2Web = ({ onGetStarted, onSignIn, isDarkMode = true }) => {
  const containerRef = useRef(null);
  const [activeUsersCount, setActiveUsersCount] = useState(0);

  useEffect(() => {
    const fetchSupabaseCount = async () => {
      try {
        if (supabase) {
          const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
          if (!error && typeof count === 'number') {
            setActiveUsersCount(count);
          }
        }
      } catch (e) {
        console.log("[Screen2Web] Error fetching Supabase count:", e.message);
      }
    };
    fetchSupabaseCount();

    // Subscribe to realtime inserts
    let channel;
    if (supabase) {
      channel = supabase
        .channel('public:profiles')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, payload => {
          setActiveUsersCount(prev => prev + 1);
        })
        .subscribe();
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    window.handleGetStarted = () => {
      if (onGetStarted) onGetStarted();
    };
    window.handleSignIn = () => {
      if (onSignIn) onSignIn();
    };

    const container = containerRef.current;
    if (!container) return;

    const canvas = container.querySelector('#helix');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let w = (canvas.width = window.innerWidth);
      let h = (canvas.height = window.innerHeight);
      let t = 0;
      let animId;

      const handleResize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', handleResize);

      function draw() {
        ctx.clearRect(0, 0, w, h);
        const cx = w * 0.78;
        const amp = Math.min(w * 0.16, 220);
        const spacing = 26;
        const count = Math.ceil(h / spacing) + 4;
        ctx.lineWidth = 1;
        const pts1 = [];
        const pts2 = [];

        for (let i = 0; i < count; i++) {
          const y = i * spacing - (t % spacing);
          const phase = y * 0.02 + t * 0.006;
          const x1 = cx + Math.sin(phase) * amp;
          const x2 = cx + Math.sin(phase + Math.PI) * amp;
          pts1.push([x1, y]);
          pts2.push([x2, y]);
        }

        for (let i = 0; i < pts1.length; i++) {
          if (i % 3 === 0) {
            ctx.strokeStyle = 'rgba(124,92,252,0.14)';
            ctx.beginPath();
            ctx.moveTo(pts1[i][0], pts1[i][1]);
            ctx.lineTo(pts2[i][0], pts2[i][1]);
            ctx.stroke();
          }
        }

        [pts1, pts2].forEach((pts, idx) => {
          ctx.fillStyle = idx === 0 ? 'rgba(178,150,255,0.55)' : 'rgba(34,211,200,0.5)';
          pts.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 7);
            ctx.fill();
          });
        });

        t += 1;
        animId = requestAnimationFrame(draw);
      }
      draw();

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animId);
      };
    }
  }, [onGetStarted, onSignIn]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function decodeText(el, text) {
      if (!el) return;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
      let frame = 0;
      const total = 18;
      const interval = setInterval(() => {
        let out = '';
        for (let i = 0; i < text.length; i++) {
          if (text[i] === ' ') {
            out += ' ';
            continue;
          }
          const reveal = frame - i * 1.3;
          if (reveal > total) {
            out += text[i];
          } else if (reveal > 0) {
            out += chars[Math.floor(Math.random() * chars.length)];
          } else {
            out += '';
          }
        }
        el.textContent = out;
        frame++;
        if (frame > text.length * 1.3 + total) {
          el.textContent = text;
          clearInterval(interval);
        }
      }, 28);
    }

    const t1 = setTimeout(() => decodeText(container.querySelector('#l1'), 'Your career,'), 200);
    const t2 = setTimeout(() => decodeText(container.querySelector('#l2'), 'decoded by AI.'), 700);

    const companies = [
      "Google", "Apple", "Microsoft", "Amazon", "Meta", "Netflix", "Tesla", "Nvidia",
      "Samsung", "IBM", "Intel", "Adobe", "Salesforce", "Uber", "Spotify",
      "Goldman Sachs", "JPMorgan", "McKinsey", "Deloitte", "Airbnb"
    ];
    const track = container.querySelector('#tickerTrack');
    if (track) {
      const listHtml = companies.map((c) => `<span class="tick-item"><b>${c}</b></span>`).join('');
      track.innerHTML = listHtml + listHtml;
    }

    const cards = container.querySelectorAll('.card');
    cards.forEach((card) => {
      const handleMove = (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      };
      card.addEventListener('mousemove', handleMove);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in-view');
        });
      },
      { threshold: 0.15 }
    );
    container.querySelectorAll('.card, .proof, footer').forEach((el) => observer.observe(el));

    const testimonials = [
      { q: "SkillGenome helped me understand exactly which skills to focus on. I landed my dream job within three months.", n: "Arjun M.", r: "Senior Engineer @ Google", a: "AM" },
      { q: "The Career Sim let me test a pivot into product before I risked my actual title. Best decision I made this year.", n: "Priya S.", r: "Product Lead @ Stripe", a: "PS" },
      { q: "It's like having a coach who's read every job description on earth and actually remembers mine.", n: "Daniel K.", r: "Data Scientist @ Netflix", a: "DK" }
    ];
    const quoteEl = container.querySelector('#quoteText');
    const nameEl = container.querySelector('#quoteName');
    const roleEl = container.querySelector('#quoteRole');
    const avEl = container.querySelector('#quoteAvatar');
    const dotsWrap = container.querySelector('#dots');
    let ti = 0;

    if (dotsWrap && quoteEl) {
      dotsWrap.innerHTML = '';
      testimonials.forEach((_, i) => {
        const d = document.createElement('div');
        d.className = `dot${i === 0 ? ' active' : ''}`;
        d.onclick = () => setTestimonial(i);
        dotsWrap.appendChild(d);
      });

      function setTestimonial(i) {
        ti = i;
        quoteEl.style.opacity = 0;
        setTimeout(() => {
          quoteEl.textContent = `“${testimonials[i].q}”`;
          if (nameEl) nameEl.textContent = testimonials[i].n;
          if (roleEl) roleEl.textContent = testimonials[i].r;
          if (avEl) avEl.textContent = testimonials[i].a;
          quoteEl.style.transition = 'opacity .4s';
          quoteEl.style.opacity = 1;
        }, 200);
        [...dotsWrap.children].forEach((d, idx) => d.classList.toggle('active', idx === i));
      }

      setTestimonial(0);
      const testTimer = setInterval(() => setTestimonial((ti + 1) % testimonials.length), 5000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearInterval(testTimer);
        observer.disconnect();
      };
    }
  }, []);

  const bg = isDarkMode ? '#08090d' : '#ffffff';
  const bg2 = isDarkMode ? '#0d0f16' : '#f8fafc';
  const surface = isDarkMode ? 'rgba(255,255,255,0.035)' : '#ffffff';
  const border = isDarkMode ? 'rgba(255,255,255,0.09)' : '#e2e8f0';
  const text = isDarkMode ? '#eef1f6' : '#0f172a';
  const muted = isDarkMode ? '#8991a6' : '#475569';
  const headingColor = isDarkMode ? '#ffffff' : '#0f172a';

  return (
    <div ref={containerRef} style={{ width: '100vw', minHeight: '100vh', position: 'absolute', inset: 0, overflowY: 'auto', backgroundColor: bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        :root{
          --bg:${bg};
          --bg2:${bg2};
          --surface:${surface};
          --border:${border};
          --text:${text};
          --muted:${muted};
          --heading:${headingColor};
          --violet:#7c5cfc;
          --violet2:${isDarkMode ? '#b39dff' : '#6d28d9'};
          --teal:#06b6d4;
          --amber:#f3b74e;
        }
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{
          background:var(--bg);
          color:var(--text);
          font-family:'Inter',sans-serif;
          overflow-x:hidden;
          -webkit-font-smoothing:antialiased;
        }

        #helix{
          position:fixed; inset:0; z-index:0; opacity:${isDarkMode ? 0.55 : 0.25}; pointer-events:none;
        }
        .grain{
          position:fixed; inset:0; z-index:1; pointer-events:none; opacity:0.035;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .wrap{position:relative; z-index:2; max-width:1080px; margin:0 auto; padding:0 28px;}

        nav{
          display:flex; align-items:center; justify-content:space-between;
          padding:28px 0 0;
        }
        .logo-row{display:flex; align-items:center; gap:12px;}
        .logo-mark{
          width:40px; height:40px; border-radius:11px;
          background:linear-gradient(135deg,var(--violet),#5b21b6);
          display:flex; align-items:center; justify-content:center;
          font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:14px; color:#fff;
          box-shadow:0 6px 20px rgba(124,92,252,0.35);
        }
        .wordmark{font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:16px; letter-spacing:-0.2px; color:var(--heading);}
        .live-badge{
          display:flex; align-items:center; gap:7px;
          padding:6px 13px; border-radius:20px;
          background:${isDarkMode ? "rgba(34,211,238,0.08)" : "rgba(6,182,212,0.1)"}; border:1px solid ${isDarkMode ? "rgba(34,211,238,0.25)" : "rgba(6,182,212,0.3)"};
          font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:0.4px; color:var(--teal);
        }
        .live-dot{width:6px; height:6px; border-radius:50%; background:var(--teal); box-shadow:0 0 8px var(--teal); animation:pulse 1.8s infinite;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.35;}}

        .hero{padding:96px 0 56px; text-align:left;}
        .eyebrow{
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:2px; text-transform:uppercase;
          color:var(--teal); display:flex; align-items:center; gap:10px; margin-bottom:22px;
          opacity:0; animation:fadeUp 0.7s ease forwards 0.1s;
        }
        .eyebrow::before{content:''; width:22px; height:1px; background:var(--teal);}

        h1{
          font-family:'Space Grotesk',sans-serif; font-weight:800;
          font-size:clamp(40px,6.4vw,74px); line-height:1.03; letter-spacing:-2px;
          max-width:800px; color:var(--heading);
        }
        h1 .line{display:block; overflow:hidden;}
        h1 .line span{display:inline-block; opacity:0; transform:translateY(110%);}
        h1 .accent{
          background:linear-gradient(100deg,var(--violet2),var(--teal));
          -webkit-background-clip:text; background-clip:text; color:transparent;
        }

        .sub{
          font-size:18px; line-height:1.65; color:var(--muted); max-width:560px; margin-top:24px;
          opacity:0; animation:fadeUp 0.7s ease forwards 1.15s;
        }

        .cta-row{display:flex; gap:14px; margin-top:38px; flex-wrap:wrap;
          opacity:0; animation:fadeUp 0.7s ease forwards 1.3s;
        }
        .btn-primary{
          position:relative; overflow:hidden;
          font-family:'Inter',sans-serif; font-weight:700; font-size:15.5px; color:#fff;
          padding:16px 30px; border-radius:13px; border:none; cursor:pointer;
          background:linear-gradient(120deg,var(--violet),#5b21b6);
          box-shadow:0 10px 30px rgba(124,92,252,0.32);
          animation: ctaPulse 2.4s ease-in-out infinite;
          transition:transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s;
        }
        @keyframes ctaPulse{
          0%, 100%{ transform: scale(1); box-shadow: 0 10px 30px rgba(124,92,252,0.32); }
          50%{ transform: scale(1.04); box-shadow: 0 14px 40px rgba(124,92,252,0.5); }
        }
        .btn-primary:hover{transform:translateY(-2px) scale(1.04); box-shadow:0 14px 40px rgba(124,92,252,0.45);}
        .btn-primary .shine{
          position:absolute; top:0; left:-60%; width:40%; height:100%;
          background:linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent);
          transform:skewX(-20deg);
        }
        .btn-primary:hover .shine{animation:shine 0.9s ease;}
        @keyframes shine{from{left:-60%;} to{left:130%;}}

        .btn-ghost{
          font-family:'Inter',sans-serif; font-weight:700; font-size:15.5px; color:var(--text);
          padding:15px 26px; border-radius:13px; border:1.5px solid var(--border);
          background:rgba(255,255,255,0.03); cursor:pointer; transition:all .3s;
        }
        .btn-ghost:hover{border-color:rgba(255,255,255,0.25); background:rgba(255,255,255,0.06);}

        @keyframes fadeUp{from{opacity:0; transform:translateY(16px);} to{opacity:1; transform:translateY(0);}}

        .readouts{
          display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:44px;
          opacity:0; animation:fadeUp 0.7s ease forwards 1.45s;
        }
        @media(max-width:640px){.readouts{grid-template-columns:1fr;}}
        .readout-card{
          padding:20px 16px; border-radius:16px; background:var(--surface);
          border:1px solid var(--border); text-align:center;
          box-shadow:0 4px 16px rgba(0,0,0,0.1);
        }
        .readout-card .num{
          font-family:'JetBrains Mono',monospace; font-weight:700; font-size:22px; color:var(--text);
          letter-spacing:-0.5px;
        }
        .readout-card .num .cursor{color:var(--amber);}
        .readout-card .lbl{font-size:11px; color:var(--muted); margin-top:5px; letter-spacing:0.5px; font-weight:700;}

        .ticker-section{margin-top:78px; position:relative;}
        .ticker-label{
          font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:2px; color:var(--muted);
          text-transform:uppercase; margin-bottom:16px; text-align:center;
        }
        .ticker-mask{
          position:relative; overflow:hidden;
          -webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
          mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
        }
        .ticker-track{display:flex; width:max-content; animation:scroll 34s linear infinite; gap:0;}
        .ticker-track:hover{animation-play-state:paused;}
        @keyframes scroll{from{transform:translateX(0);} to{transform:translateX(-50%);}}
        .tick-item{
          font-family:'JetBrains Mono',monospace; font-size:14px; color:var(--muted);
          padding:10px 26px; white-space:nowrap; letter-spacing:0.5px;
          border-right:1px solid var(--border);
        }
        .tick-item b{color:var(--text); font-weight:600;}

        .divider{display:flex; align-items:center; gap:18px; margin:96px 0 44px;}
        .divider .ln{flex:1; height:1px; background:var(--border);}
        .divider .lbl{
          font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--muted);
        }

        .grid{display:grid; grid-template-columns:repeat(4,1fr); gap:14px;}
        @media(max-width:860px){.grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:520px){.grid{grid-template-columns:1fr;}}

        .card{
          position:relative; padding:26px 22px; border-radius:18px;
          background:var(--surface); border:1px solid var(--border);
          overflow:hidden; cursor:default;
          opacity:0; transform:translateY(24px);
          transition:transform .45s cubic-bezier(.2,.8,.2,1), border-color .35s, background .35s;
        }
        .card.in-view{opacity:1; transform:translateY(0);}
        .card::before{
          content:''; position:absolute; inset:0; border-radius:18px; opacity:0;
          background:radial-gradient(220px circle at var(--mx,50%) var(--my,50%), rgba(124,92,252,0.16), transparent 60%);
          transition:opacity .3s;
        }
        .card:hover::before{opacity:1;}
        .card:hover{transform:translateY(-4px); border-color:rgba(124,92,252,0.35);}
        .card .icon{
          width:44px; height:44px; border-radius:12px; margin-bottom:16px;
          display:flex; align-items:center; justify-content:center;
          background:linear-gradient(135deg,rgba(124,92,252,0.18),rgba(34,211,200,0.10));
          border:1px solid var(--border); font-size:20px;
        }
        .card h3{font-family:'Space Grotesk',sans-serif; font-size:15.5px; font-weight:700; margin-bottom:6px; color:var(--heading);}
        .card p{font-size:13px; color:var(--muted); line-height:1.55;}

        .proof{
          margin-top:96px; border-radius:22px; border:1px solid var(--border);
          padding:40px; position:relative; overflow:hidden;
          background:${isDarkMode ? "linear-gradient(135deg,rgba(124,92,252,0.08),rgba(34,211,200,0.05))" : "linear-gradient(135deg,#ffffff,#f8fafc)"};
          opacity:0; transform:translateY(24px); transition:all .6s cubic-bezier(.2,.8,.2,1);
        }
        .proof.in-view{opacity:1; transform:translateY(0);}
        .proof .mark{font-family:'Space Grotesk',sans-serif; font-size:52px; color:var(--violet2); opacity:0.4; line-height:0.5;}
        .quote{font-size:20px; line-height:1.55; font-weight:500; max-width:640px; margin-top:6px; min-height:100px; color:var(--heading);}
        .attr{display:flex; align-items:center; gap:12px; margin-top:22px;}
        .avatar{
          width:38px; height:38px; border-radius:50%;
          background:linear-gradient(135deg,var(--teal),var(--violet)); display:flex; align-items:center; justify-content:center;
          font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:13px; color:#fff;
        }
        .attr .name{font-weight:700; font-size:14px; color:var(--heading);}
        .attr .role{font-size:12.5px; color:var(--muted);}
        .dots{display:flex; gap:7px; margin-top:26px;}
        .dot{width:6px; height:6px; border-radius:50%; background:var(--border); cursor:pointer; transition:.3s;}
        .dot.active{background:var(--teal); width:20px; border-radius:4px;}

        footer{text-align:center; padding:110px 0 60px; opacity:0; transform:translateY(20px); transition:all .6s;}
        footer.in-view{opacity:1; transform:translateY(0);}
        footer h2{font-family:'Space Grotesk',sans-serif; font-size:clamp(28px,4vw,40px); font-weight:800; letter-spacing:-1px; color:var(--heading);}
        footer p{color:var(--muted); margin-top:12px;}
        footer .btn-primary{margin-top:28px;}
      `}</style>

      <canvas id="helix"></canvas>
      <div className="grain"></div>

      <div className="wrap">
        <nav>
          <div className="logo-row">
            <div className="logo-mark">SG</div>
            <div className="wordmark">SkillGenome</div>
          </div>
        </nav>

        <section className="hero">
          <div className="eyebrow">Genome-grade career intelligence</div>
          <h1>
            <span className="line"><span id="l1">Your career,</span></span>
            <span className="line"><span id="l2" className="accent">decoded by AI.</span></span>
          </h1>
          <p className="sub">
            SkillGenome sequences your professional DNA, skills, mindset, and momentum, then compiles a living roadmap to your next breakthrough.
          </p>

          <div className="cta-row">
            <button onClick={() => window.handleGetStarted && window.handleGetStarted()} className="btn-primary">
              Get started free <span className="shine"></span>
            </button>
            <button onClick={() => window.handleSignIn && window.handleSignIn()} className="btn-ghost">
              Sign in
            </button>
          </div>

          <div className="readouts">
            <div className="readout-card">
              <div className="num">{activeUsersCount.toLocaleString()}<span className="cursor">_</span></div>
              <div className="lbl">PROFESSIONALS MAPPED</div>
            </div>
            <div className="readout-card">
              <div className="num">94.2%</div>
              <div className="lbl">MATCH ACCURACY</div>
            </div>
            <div className="readout-card">
              <div className="num">24/7</div>
              <div className="lbl">AI CAREER TWIN</div>
            </div>
          </div>
        </section>

        <section className="ticker-section">
          <div className="ticker-label">Career DNA matched at</div>
          <div className="ticker-mask">
            <div className="ticker-track" id="tickerTrack"></div>
          </div>
        </section>

        <div className="divider">
          <div className="ln"></div>
          <div className="lbl">What you unlock</div>
          <div className="ln"></div>
        </div>

        <div className="grid" id="cardGrid">
          <div className="card">
            <div className="icon">🧬</div>
            <h3>Genome Score</h3>
            <p>An AI-computed fingerprint of your skills, ranked against where the market is heading.</p>
          </div>
          <div className="card">
            <div className="icon">🤖</div>
            <h3>AI Career Twin</h3>
            <p>A personalised coach that studies your trajectory and nudges you before you fall behind.</p>
          </div>
          <div className="card">
            <div className="icon">🚀</div>
            <h3>Career Sim</h3>
            <p>Run what-if simulations across roles, industries, and skill bets before you commit.</p>
          </div>
          <div className="card">
            <div className="icon">📊</div>
            <h3>Live Analytics</h3>
            <p>Real-time recruiter interest and demand signals mapped straight to your profile.</p>
          </div>
        </div>

        <div className="proof">
          <div className="mark">"</div>
          <div className="quote" id="quoteText"></div>
          <div className="attr">
            <div className="avatar" id="quoteAvatar">AM</div>
            <div>
              <div className="name" id="quoteName">Arjun M.</div>
              <div className="role" id="quoteRole">Senior Engineer @ Google</div>
            </div>
          </div>
          <div className="dots" id="dots"></div>
        </div>

        <footer id="footer">
          <h2>Your next role is already<br/>written in the data.</h2>
          <p>Start your sequence in under two minutes. No credit card required.</p>
          <button onClick={() => window.handleGetStarted && window.handleGetStarted()} className="btn-primary">
            Get started free <span className="shine"></span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Screen2Web;
