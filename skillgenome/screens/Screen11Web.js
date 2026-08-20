import React, { useState, useEffect, useRef, useMemo } from 'react';

const MODULES_DEF = [
  { id:"resume",  label:"Resume DNA",   icon:"📄", accent:"var(--violet)", desc:"Skills & career DNA parsed from your resume.", scoreKey:"resumeScore", key:"isResumeCompleted", action:"Upload Resume", onOpen:"onOpenUploadResume" },
  { id:"github",  label:"GitHub Dev",   icon:"💻", accent:"var(--purple)", desc:"Repository insights & developer ratings.",     scoreKey:"githubScore", key:"isGitHubCompleted", action:"Analyze GitHub", onOpen:"onOpenGitHubConnect" },
  { id:"thought", label:"ThoughtPrint", icon:"🧠", accent:"var(--rose)",   desc:"Cognitive and sentiment scans from journaling.", scoreKey:"thoughtScore", key:"isThoughtCompleted", action:"Thought Print", onOpen:"onOpenThoughtPrint" },
  { id:"emotion", label:"EmotionPrint", icon:"🎭", accent:"var(--amber)", desc:"Vocal prosody & facial composure analysis.",    scoreKey:"emotionScore", key:"isEmotionCompleted", action:"Emotion Print", onOpen:"onOpenEmotionPrint" },
];
const ACTIONS = [
  { label:"Interview\nPrep",  icon:"🎯", accent:"var(--green)", actionKey: "onOpenInterviewPrep" },
  { label:"Career\nFutures",  icon:"🚀", accent:"var(--violet)", actionKey: "onOpenMentors" },
  { label:"Timeline\nSync",   icon:"📅", accent:"var(--purple)", actionKey: "onOpenTimeline" },
  { label:"Community\nFeed",  icon:"🌐", accent:"var(--rose)", actionKey: "onOpenCommunity" },
  { label:"Job\nMatches",     icon:"💼", accent:"var(--amber)", actionKey: "onOpenExplore" },
  { label:"Study\nGroup",     icon:"📖", accent:"var(--cyan)", actionKey: "onOpenStudyGroup" },
];

const Screen11Web = (props) => {
  const {
    onOpenTimeline, onOpenSettings, onOpenUploadResume,
    onOpenGitHubConnect, onOpenEmotionPrint, onOpenThoughtPrint,
    onOpenCommunity, onOpenMentors, onOpenStudyGroup,
    onOpenInterviewPrep, onOpenProfile, onOpenExplore, onOpenAIChat,
    profile = {}, resumeAnalysis, githubAnalysis, thoughtAnalysis,
    emotionAnalysis, journalEntries = [], recordingDuration = 0,
    isDarkMode = true, language = 'English',
  } = props;

  const isResumeCompleted  = !!resumeAnalysis;
  const isGitHubCompleted  = !!githubAnalysis;
  const isThoughtCompleted = (journalEntries?.length > 0) || !!thoughtAnalysis;
  const isEmotionCompleted = recordingDuration > 0 || !!emotionAnalysis;

  const extractedResume = resumeAnalysis?.extractedSkills || [];
  const resumeScore = isResumeCompleted
    ? (resumeAnalysis.trueGenomeScore || Math.round(extractedResume.reduce((a, s) => a + (s.score || 0), 0) / Math.max(1, extractedResume.length)) || 85) : 0;
  const githubScore  = isGitHubCompleted  ? (githubAnalysis.score || 75) : 0;
  const thoughtScore = isThoughtCompleted ? (thoughtAnalysis?.overall_score || 82) : 0;
  const emotionScore = isEmotionCompleted ? (emotionAnalysis?.eq_score || 78) : 0;

  const modState = { isResumeCompleted, isGitHubCompleted, isThoughtCompleted, isEmotionCompleted, resumeScore, githubScore, thoughtScore, emotionScore };
  
  const currentModules = MODULES_DEF.map(m => ({
    ...m,
    done: !!modState[m.key],
    score: modState[m.key] ? modState[m.scoreKey] : 0
  }));

  const activeMods = currentModules.filter(m => m.done).length;
  const genomeScore = activeMods ? Math.round(currentModules.reduce((a,m)=>a+m.score,0)/activeMods) : 0;
  const tier = genomeScore >= 80 ? "Elite Candidate" : genomeScore >= 60 ? "Strong Profile" : genomeScore >= 30 ? "Building Momentum" : "Getting Started";

  const nextMod = currentModules.find(m => !m.done);

  // Animated numbers & rings
  const [displayScore, setDisplayScore] = useState(0);
  const [displayRingPcts, setDisplayRingPcts] = useState([0,0,0,0]);
  const [showRadarGlow, setShowRadarGlow] = useState(false);

  useEffect(() => {
    let animationFrame;
    if (activeMods > 0) {
      let curScore = 0;
      const stepScore = () => {
        curScore += 2;
        if (curScore >= genomeScore) {
          setDisplayScore(genomeScore);
        } else {
          setDisplayScore(Math.floor(curScore));
          animationFrame = requestAnimationFrame(stepScore);
        }
      };
      animationFrame = requestAnimationFrame(stepScore);
    } else {
      setDisplayScore(0);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [genomeScore, activeMods]);

  useEffect(() => {
    let frame;
    let curPcts = [0,0,0,0];
    const targets = currentModules.map(m => m.score);
    const stepPcts = () => {
      let allDone = true;
      const nextPcts = curPcts.map((c, i) => {
        const target = targets[i];
        if (!target) return 0;
        const incr = Math.max(1, target / 30);
        if (c + incr >= target) {
          return target;
        }
        allDone = false;
        return c + incr;
      });
      curPcts = nextPcts;
      setDisplayRingPcts([...nextPcts]);
      if (!allDone) frame = requestAnimationFrame(stepPcts);
    };
    frame = requestAnimationFrame(stepPcts);
    return () => cancelAnimationFrame(frame);
  }, [activeMods]); // re-trigger when activeMods changes

  useEffect(() => {
    const t = setTimeout(() => setShowRadarGlow(true), 300);
    return () => clearTimeout(t);
  }, []);

  const [navIndex, setNavIndex] = useState(0);
  const navPositions = [0, 68, 220, 288]; // based on the provided HTML

  const [tilt, setTilt] = useState('perspective(900px) rotateY(0) rotateX(0)');
  const handleTilt = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt(`perspective(900px) rotateY(${px * 4}deg) rotateX(${-py * 4}deg) translateZ(0)`);
  };
  const resetTilt = () => setTilt('perspective(900px) rotateY(0) rotateX(0)');

  // Radar drawing logic
  const drawRadar = () => {
    const cx = 115, cy = 115, R = 88;
    const n = currentModules.length;
    const angleFor = (i) => -Math.PI/2 + i * (2*Math.PI/n);
    const ptAt = (i, frac) => [cx + Math.cos(angleFor(i))*R*frac, cy + Math.sin(angleFor(i))*R*frac];

    const polyLevels = [0.25, 0.5, 0.75, 1].map((f, idx) => {
      const pts = currentModules.map((_, i) => ptAt(i, f).join(',')).join(' ');
      return (
        <polygon key={`poly-${idx}`} points={pts} fill="none" stroke="var(--border-strong)" strokeWidth={f===1 ? 1.4 : 1} />
      );
    });

    const lines = currentModules.map((_, i) => {
      const [x, y] = ptAt(i, 1);
      return <line key={`line-${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth={1} />;
    });

    const valuePts = currentModules.map((m, i) => ptAt(i, m.score/100).join(',')).join(' ');
    
    return (
      <svg viewBox="0 0 230 230" id="radarSvg">
        <defs>
          <radialGradient id="radarFill">
            <stop offset="0%" stopColor="#8b6bff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.12" />
          </radialGradient>
        </defs>
        {polyLevels}
        {lines}
        <polygon 
          points={valuePts} 
          fill="url(#radarFill)" 
          stroke="var(--violet)" 
          strokeWidth={2} 
          strokeLinejoin="round"
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: showRadarGlow ? 'scale(1)' : 'scale(0.3)',
            opacity: showRadarGlow ? 1 : 0,
            transition: 'transform 1s cubic-bezier(.16,1,.3,1), opacity .8s ease'
          }}
        />
        {currentModules.map((m, i) => {
          const [x, y] = ptAt(i, m.score/100);
          return <circle key={`dot-${i}`} cx={x} cy={y} r={4} fill={m.accent} />;
        })}
      </svg>
    );
  };

  const handleNavClick = (idx, handler) => {
    setNavIndex(idx);
    if(handler) handler();
  };
  const cssString = useMemo(() => `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Lora:ital,wght@0,400..700;1,400..700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    
    .dashboard-root {
      --bg-dark: #09090B; --bg-dark-2: #1E1B4B; --bg-dark-3: #111827; --bg-dark-4: #0F172A;
      --glass-dark: rgba(255,255,255,0.06); --glass-border-dark: rgba(255,255,255,0.12);
      
      --bg: var(--bg-dark); --bg2: var(--bg-dark-2); 
      --surface: var(--glass-dark); --surface2: rgba(255,255,255,0.03);
      --border: var(--glass-border-dark); --border-strong: rgba(255,255,255,0.2);
      --text: #f4f5f8; --muted: #94a3b8; --muted2: #64748b;
      --violet: #8B5CF6; --violet-deep: #6366F1; --teal: #2dd4bf;
      --amber: #f59e0b; --rose: #e11d48; --purple: #d946ef; --green: #10b981; --cyan: #06b6d4;
      --shadow-lg: 0 30px 80px -20px rgba(0,0,0,0.5);
      --shadow-sm: 0 10px 30px -10px rgba(0,0,0,0.4);
      --blur: blur(24px);
      
      background: transparent;
      color: var(--text); font-family: 'Inter', sans-serif; min-height: 100vh;
      transition: background 0.4s ease, color 0.4s ease; padding-bottom: 20px;
      position: relative; overflow-x: hidden;
    }
    
    @keyframes meshBg {
      0% { background-position: 0% 0%, 100% 100%, 50% 50%; }
      50% { background-position: 50% 50%, 0% 100%, 100% 0%; }
      100% { background-position: 100% 100%, 0% 0%, 50% 100%; }
    }

    .dashboard-root.light {
      --bg-light: #FFFFFF; --bg-light-2: #FDF2F8; --bg-light-3: #EEF2FF; --bg-light-4: #FFF7ED;
      --glass-light: rgba(255,255,255,0.7); --glass-border-light: rgba(255,255,255,0.9);
      
      --bg: var(--bg-light); --bg2: var(--bg-light-2);
      --surface: var(--glass-light); --surface2: rgba(255,255,255,0.4);
      --border: var(--glass-border-light); --border-strong: rgba(255,255,255,1);
      --text: #09090B; --muted: #64748b; --muted2: #94a3b8;
      --violet: #7C3AED; --violet-deep: #4F46E5; --teal: #0d9488;
      --amber: #d97706; --rose: #be123c; --purple: #a21caf; --green: #047857; --cyan: #0369a1;
      --shadow-lg: 0 30px 80px -20px rgba(0,0,0,0.1);
      --shadow-sm: 0 10px 30px -10px rgba(0,0,0,0.06);
      
      background-image:
        radial-gradient(1200px 800px at 0% 0%, color-mix(in srgb,var(--bg-light-3) 100%, transparent), transparent 70%),
        radial-gradient(1000px 600px at 100% 100%, color-mix(in srgb,var(--bg-light-2) 100%, transparent), transparent 70%),
        radial-gradient(800px 500px at 50% 50%, color-mix(in srgb,var(--bg-light-4) 100%, transparent), transparent 80%);
    }

    .dashboard-root::after {
      content:''; position:fixed; inset:0; pointer-events:none; opacity:0.04; mix-blend-mode:overlay; z-index:1;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }
    .dashboard-root * { box-sizing: border-box; }
    .wrap { max-width: 1180px; margin: 0 auto; padding: 28px 22px 140px; position: relative; z-index: 2; }

    @keyframes rise { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .stagger { opacity: 0; animation: rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
    .who { display: flex; align-items: center; gap: 16px; cursor: pointer; padding: 8px 16px 8px 8px; border-radius: 100px; transition: background 0.3s ease; }
    .who:hover { background: var(--surface2); backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur); }
    
    .avatar {
      width: 48px; height: 48px; border-radius: 50%; position: relative;
      background: linear-gradient(135deg, var(--violet), var(--cyan));
      display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 18px;
      box-shadow: 0 0 20px color-mix(in srgb, var(--violet) 40%, transparent);
    }
    .avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
    .avatar-glow {
      position: absolute; inset: -4px; border-radius: 50%; z-index: -1;
      background: linear-gradient(135deg, var(--violet), var(--cyan)); opacity: 0.5; filter: blur(8px);
    }
    .avatar::after { 
      content: ''; position: absolute; right: 0; bottom: 0; width: 14px; height: 14px; border-radius: 50%; 
      background: var(--green); border: 3px solid var(--bg); 
      box-shadow: 0 0 10px var(--green); animation: pulseGreen 2s infinite;
    }
    @keyframes pulseGreen { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.8; } }
    
    .greet { font-size: 13px; color: var(--muted); font-weight: 500; }
    .name { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; color: var(--text); }
    
    .ai-btn {
      display: flex; align-items: center; gap: 10px; padding: 12px 14px 12px 20px; border-radius: 100px; border: 1px solid var(--border-strong); cursor: pointer;
      background: linear-gradient(135deg, color-mix(in srgb, var(--violet) 20%, transparent), transparent);
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      color: var(--text); font-weight: 700; font-size: 14px;
      box-shadow: 0 8px 30px color-mix(in srgb, var(--violet) 20%, transparent); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .ai-btn:hover { transform: translateY(-3px) scale(1.02); border-color: var(--violet); background: color-mix(in srgb, var(--violet) 25%, transparent); box-shadow: 0 15px 40px color-mix(in srgb, var(--violet) 35%, transparent); }
    .ai-btn .dot-icon {
      width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff;
      background: linear-gradient(135deg, var(--violet), var(--violet-deep)); box-shadow: 0 0 15px var(--violet);
    }

    .bento { display: grid; grid-template-columns: 1.55fr 1fr; gap: 20px; margin-bottom: 20px; }
    @media (max-width: 880px) { .bento { grid-template-columns: 1fr; } }

    .glass {
      border-radius: 32px; border: 1px solid var(--border); background: var(--surface);
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      box-shadow: var(--shadow-lg); position: relative; overflow: hidden;
    }
    .glass::before {
      content: ''; position: absolute; inset: 0; border-radius: 32px;
      padding: 1px; background: linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
    }
    
    .radar-card { padding: 32px; display: flex; flex-direction: column; gap: 8px; min-height: 320px; }
    .card-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; color: var(--muted2); text-transform: uppercase; }
    .tier { font-size: 26px; font-weight: 700; margin-top: 6px; letter-spacing: -0.5px; color: var(--text); }
    
    .sync-badge { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 100px; border: 1px solid var(--border-strong); background: rgba(16, 185, 129, 0.1); flex-shrink: 0; backdrop-filter: blur(10px); }
    .sync-badge .dot { width: 8px; height: 8px; border-radius: 50%; animation: blink 1.8s ease-in-out infinite; box-shadow: 0 0 8px currentColor; }
    @keyframes blink { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    .sync-badge span { font-size: 12px; font-weight: 700; color: var(--green); }

    .radar-body { display: flex; align-items: center; gap: 16px; margin-top: 16px; flex: 1; }
    .radar-svg-wrap { flex-shrink: 0; position: relative; width: 250px; height: 250px; filter: drop-shadow(0 0 20px color-mix(in srgb, var(--violet) 20%, transparent)); }
    .radar-center-score { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
    .radar-center-num { font-size: 52px; font-weight: 900; letter-spacing: -2px; color: var(--text); text-shadow: 0 0 30px rgba(255,255,255,0.3); }
    .radar-center-lbl { font-size: 11px; font-weight: 700; color: var(--muted); letter-spacing: 0.1em; margin-top: -2px; }

    .radar-legend { flex: 1; display: flex; flex-direction: column; gap: 12px; }
    .rl-item { 
      display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 16px; 
      background: var(--surface2); border: 1px solid var(--border); cursor: default; 
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); 
    }
    .rl-item:hover { border-color: var(--rl-accent); transform: translateX(4px) scale(1.02); box-shadow: 0 8px 20px color-mix(in srgb, var(--rl-accent) 15%, transparent); }
    .rl-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--rl-accent); flex-shrink: 0; box-shadow: 0 0 8px var(--rl-accent); }
    .rl-name { font-size: 13.5px; font-weight: 600; flex: 1; color: var(--text); }
    .rl-score { font-size: 14px; font-weight: 800; color: var(--rl-accent); font-family: 'JetBrains Mono', monospace; }

    .hero-empty { flex: 1; display: flex; align-items: center; gap: 24px; }
    .hero-empty-icon {
      width: 120px; height: 120px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
      border: 2px dashed var(--border-strong); background: var(--surface2);
    }
    .hero-empty-icon svg { filter: drop-shadow(0 0 10px var(--violet)); }
    .hero-empty-title { font-size: 22px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; }
    .hero-empty-sub { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 20px; max-width: 360px; }
    .hero-empty-cta {
      display: inline-flex; align-items: center; gap: 8px; padding: 14px 24px; border: none; border-radius: 100px; cursor: pointer;
      background: linear-gradient(135deg, var(--violet), var(--violet-deep)); color: #fff; font-weight: 700; font-size: 14px;
      box-shadow: 0 10px 30px color-mix(in srgb, var(--violet) 40%, transparent); transition: all 0.3s ease;
    }
    .hero-empty-cta:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 15px 40px color-mix(in srgb, var(--violet) 60%, transparent); }

    .stat-card { padding: 32px; display: flex; flex-direction: column; }
    .snap-title { font-size: 18px; font-weight: 700; margin-bottom: 24px; letter-spacing: -0.3px; }
    .stat-row { display: flex; justify-content: space-between; align-items: baseline; padding: 14px 0; border-bottom: 1px solid var(--border); transition: 0.2s; }
    .stat-row:hover { padding-left: 4px; padding-right: 4px; border-bottom-color: var(--border-strong); }
    .stat-row:last-child { border-bottom: none; }
    .stat-label { font-size: 13.5px; color: var(--muted); font-weight: 500; }
    .stat-value { font-size: 18px; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
    .snap-cta {
      margin-top: auto; padding: 16px; border: none; border-radius: 20px; cursor: pointer;
      background: linear-gradient(135deg, color-mix(in srgb, var(--violet) 80%, transparent), var(--violet-deep)); color: #fff; font-weight: 700; font-size: 14px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 12px 30px color-mix(in srgb, var(--violet) 30%, transparent);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .snap-cta:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 18px 40px color-mix(in srgb, var(--violet) 50%, transparent); }

    .nudge {
      display: flex; align-items: center; gap: 16px; padding: 20px 24px; border-radius: 24px;
      border: 1px solid var(--border); background: var(--surface); margin-bottom: 24px;
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur); box-shadow: var(--shadow-sm);
    }
    .nudge-icon { 
      width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; 
      background: linear-gradient(135deg, color-mix(in srgb, var(--violet) 20%, transparent), transparent); border: 1px solid var(--border-strong);
    }
    .nudge-text { flex: 1; min-width: 0; }
    .nudge-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: var(--muted2); text-transform: uppercase; margin-bottom: 4px; }
    .nudge-title { font-size: 15px; font-weight: 600; }
    .nudge-cta {
      flex-shrink: 0; padding: 12px 20px; border-radius: 100px; border: none; cursor: pointer;
      background: var(--violet); color: #fff; font-weight: 700; font-size: 13px; white-space: nowrap;
      box-shadow: 0 8px 20px color-mix(in srgb, var(--violet) 40%, transparent); transition: all 0.3s ease;
    }
    .nudge-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 30px color-mix(in srgb, var(--violet) 60%, transparent); }

    .section-head { display: flex; align-items: baseline; justify-content: space-between; margin: 32px 0 20px; }
    .section-title { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .section-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.15em; color: var(--muted2); text-transform: uppercase; }
    .section-sub { font-size: 14px; color: var(--muted); margin-top: 6px; max-width: 560px; line-height: 1.5; }

    .dims { display: flex; flex-direction: column; gap: 12px; }
    .dim-row {
      display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-radius: 20px;
      border: 1px solid var(--border); background: var(--surface); cursor: pointer;
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .dim-row:hover { transform: translateX(6px) scale(1.01); border-color: var(--border-strong); background: var(--surface2); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
    .dim-icon { 
      width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; 
      background: color-mix(in srgb,var(--dr-accent) 15%, transparent); flex-shrink: 0; transition: .3s; border: 1px solid color-mix(in srgb,var(--dr-accent) 25%, transparent);
    }
    .dim-row:hover .dim-icon { background: color-mix(in srgb,var(--dr-accent) 25%, transparent); }
    .dim-row.empty .dim-icon { background: var(--surface2); border-color: var(--border-strong); opacity: .7; }
    .dim-text { flex: 1; min-width: 0; }
    .dim-label { font-size: 15px; font-weight: 700; }
    .dim-desc { font-size: 13px; color: var(--muted); margin-top: 4px; line-height: 1.5; }
    .dim-status { font-size: 12px; font-weight: 700; color: var(--dr-accent); margin-top: 6px; display: flex; align-items: center; gap: 6px; }
    .dim-row.empty .dim-status { color: var(--amber); }
    .dim-ring {
      width: 54px; height: 54px; border-radius: 50%; flex-shrink: 0; position: relative;
      background: conic-gradient(var(--dr-accent) calc(var(--dr-pct, 0) * 1%), var(--border) 0);
      display: flex; align-items: center; justify-content: center; transition: background 1s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 0 15px color-mix(in srgb, var(--dr-accent) 20%, transparent);
    }
    .dim-ring::before { content: ''; position: absolute; inset: 5px; border-radius: 50%; background: var(--bg); }
    .dim-ring span { position: relative; z-index: 1; font-size: 13px; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
    .dim-row.empty .dim-ring { background: var(--surface2); border: 2px dashed var(--border-strong); box-shadow: none; }
    .dim-row.empty .dim-ring span { color: var(--muted2); font-size: 16px; font-family: 'Inter', sans-serif; }
    .dim-chev { color: var(--muted2); font-size: 20px; flex-shrink: 0; transition: transform 0.3s ease; }
    .dim-row:hover .dim-chev { transform: translateX(4px); color: var(--dr-accent); }

    .actions-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
    @media (max-width: 820px) { .actions-grid { grid-template-columns: repeat(3, 1fr); } }
    .action-tile {
      border-radius: 24px; border: 1px solid var(--border); background: var(--surface);
      padding: 24px 12px; text-align: center; cursor: pointer; backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .action-tile:hover { transform: translateY(-6px) scale(1.02); border-color: var(--a-accent); background: var(--surface2); box-shadow: 0 20px 40px color-mix(in srgb, var(--a-accent) 15%, transparent); }
    .action-icon { 
      width: 54px; height: 54px; margin: 0 auto 16px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; 
      background: color-mix(in srgb, var(--a-accent) 15%, transparent); border: 1px solid color-mix(in srgb, var(--a-accent) 25%, transparent);
      box-shadow: 0 8px 20px color-mix(in srgb, var(--a-accent) 20%, transparent); transition: transform 0.3s ease;
    }
    .action-tile:hover .action-icon { transform: scale(1.1); }
    .action-label { font-size: 13px; font-weight: 600; line-height: 1.4; white-space: pre-wrap; }

    .skills { display: flex; flex-wrap: wrap; gap: 12px; }
    .pill {
      display: flex; align-items: center; gap: 10px; padding: 12px 14px 12px 18px; border-radius: 100px;
      border: 1px solid var(--p-border); background: var(--p-bg); transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }
    .pill:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 10px 20px color-mix(in srgb, var(--p-color) 20%, transparent); }
    .pill span.n { font-size: 14px; font-weight: 600; color: var(--p-color); }
    .pill span.s { font-size: 12px; font-weight: 800; color: var(--p-color); background: var(--p-badge); padding: 6px 10px; border-radius: 100px; font-family: 'JetBrains Mono', monospace; }

    .empty-card {
      display: flex; align-items: center; gap: 20px; padding: 24px 28px; border-radius: 24px;
      border: 1px dashed var(--border-strong); background: var(--surface); backdrop-filter: var(--blur);
    }
    .empty-card-icon { width: 60px; height: 60px; border-radius: 18px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 26px; background: var(--surface2); border: 1px solid var(--border); }
    .empty-card-title { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
    .empty-card-sub { font-size: 13.5px; color: var(--muted); line-height: 1.6; }
    .empty-card-cta {
      flex-shrink: 0; padding: 14px 22px; border-radius: 14px; border: 1px solid var(--border-strong); cursor: pointer;
      background: var(--surface2); color: var(--text); font-weight: 700; font-size: 13.5px; transition: all 0.3s ease;
    }
    .empty-card-cta:hover { border-color: var(--violet); color: var(--text); background: color-mix(in srgb, var(--violet) 15%, transparent); transform: translateY(-2px); box-shadow: 0 10px 20px color-mix(in srgb, var(--violet) 20%, transparent); }

    .gh-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .gh-stat { 
      padding: 24px; border-radius: 24px; border: 1px solid var(--border); background: var(--surface); text-align: center; 
      backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur); transition: transform 0.3s ease;
    }
    .gh-stat:hover { transform: translateY(-4px); box-shadow: var(--shadow-sm); border-color: var(--border-strong); }
    .gh-stat-val { font-size: 28px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: var(--text); text-shadow: 0 0 20px color-mix(in srgb, var(--purple) 40%, transparent); }
    .gh-stat-lbl { font-size: 12px; color: var(--muted); font-weight: 700; margin-top: 8px; letter-spacing: 0.05em; }

    .navbar { position: fixed; bottom: 24px; left: 0; right: 0; z-index: 50; display: flex; justify-content: center; pointer-events: none; }
    .navbar-inner {
      pointer-events: auto; position: relative; display: flex; align-items: center; gap: 8px;
      border-radius: 100px; border: 1px solid var(--border-strong); background: var(--surface);
      backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
      padding: 8px; box-shadow: 0 30px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05) inset;
    }
    .nav-indicator {
      position: absolute; top: 8px; bottom: 8px; left: 8px; width: 60px; border-radius: 100px;
      background: linear-gradient(135deg, var(--violet), var(--violet-deep));
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); z-index: 0;
      box-shadow: 0 8px 20px color-mix(in srgb, var(--violet) 50%, transparent);
    }
    .nav-item {
      position: relative; z-index: 1; width: 60px; height: 60px; border-radius: 100px; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 2px; cursor: pointer; color: var(--muted); transition: all 0.3s ease;
    }
    .nav-item:hover { color: var(--text); transform: scale(1.1); }
    .nav-item.active { color: #fff; transform: scale(1.05); }
    .nav-icon { display: flex; align-items: center; justify-content: center; }
    .nav-icon svg { width: 22px; height: 22px; }
    .nav-lbl { font-size: 10px; font-weight: 600; font-family: 'Inter', sans-serif; margin-top: 2px; opacity: 0; transition: opacity 0.3s, transform 0.3s; transform: translateY(5px); }
    .nav-item.active .nav-lbl { opacity: 1; transform: translateY(0); }
    .nav-center {
      width: 64px; height: 64px; border-radius: 50%; margin: 0 6px; position: relative; z-index: 1;
      background: linear-gradient(135deg, var(--violet), var(--cyan));
      display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer;
      box-shadow: 0 15px 30px color-mix(in srgb, var(--violet) 50%, transparent), inset 0 2px 5px rgba(255,255,255,0.4);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .nav-center:hover { transform: scale(1.1) translateY(-4px); box-shadow: 0 20px 40px color-mix(in srgb, var(--violet) 60%, transparent), inset 0 2px 5px rgba(255,255,255,0.6); }

    .streak-card {
      display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: 24px;
      border: 1px solid var(--border); background: var(--surface); backdrop-filter: var(--blur);
      position: relative; overflow: hidden; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .streak-card:hover { transform: translateY(-4px) scale(1.01); border-color: var(--amber); box-shadow: 0 15px 30px color-mix(in srgb, var(--amber) 15%, transparent); }
    .streak-icon { 
      width: 56px; height: 56px; border-radius: 16px; background: color-mix(in srgb, var(--amber) 20%, transparent); 
      display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; border: 1px solid color-mix(in srgb, var(--amber) 40%, transparent);
      box-shadow: 0 8px 20px color-mix(in srgb, var(--amber) 30%, transparent);
    }
    .streak-body { flex: 1; }
    .streak-title { font-size: 18px; font-weight: 700; color: var(--amber); margin-bottom: 4px; }
    .streak-sub { font-size: 14px; color: var(--muted); line-height: 1.5; }
    
    .mentors-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 600px) { .mentors-row { grid-template-columns: 1fr; } }
    .mentor-card {
      padding: 20px; border-radius: 24px; border: 1px solid var(--border); background: var(--surface); backdrop-filter: var(--blur);
      display: flex; align-items: center; gap: 16px; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .mentor-card:hover { border-color: var(--violet); transform: translateY(-4px); background: var(--surface2); box-shadow: 0 15px 30px color-mix(in srgb, var(--violet) 15%, transparent); }
    .m-avatar { width: 52px; height: 52px; border-radius: 16px; background: var(--border-strong); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
    .m-avatar img { width: 100%; height: 100%; border-radius: 16px; object-fit: cover; }
    .m-info { flex: 1; min-width: 0; }
    .m-name { font-size: 15px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
    .m-role { font-size: 13px; color: var(--muted); }
    
    .pulse-card {
      padding: 24px; border-radius: 24px; border: 1px dashed var(--border-strong); background: var(--surface); backdrop-filter: var(--blur);
      display: flex; align-items: flex-start; gap: 16px; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .pulse-card:hover { border-style: solid; border-color: var(--cyan); background: var(--surface2); transform: translateY(-4px); box-shadow: 0 15px 30px color-mix(in srgb, var(--cyan) 15%, transparent); }
    .pulse-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--cyan); margin-top: 4px; box-shadow: 0 0 12px var(--cyan); animation: pulseGreen 2s infinite; flex-shrink: 0; }
    .pulse-body { flex: 1; }
    .pulse-text { font-size: 14.5px; font-weight: 500; line-height: 1.6; color: var(--text); }
    .pulse-time { font-size: 12px; color: var(--muted2); font-weight: 600; margin-top: 8px; letter-spacing: 0.05em; text-transform: uppercase; }
  `, []);

  return (
    <div className={`dashboard-root ${isDarkMode ? '' : 'light'}`}>
      <style dangerouslySetInnerHTML={{ __html: cssString }} />

      <div className="wrap">
        <header className="stagger" style={{animationDelay:'.02s'}}>
          <div className="who" onClick={onOpenProfile}>
            <div className="avatar">
              {profile.avatarUrl ? <img src={profile.avatarUrl} alt="Avatar" /> : profile.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <div className="greet">Good day,</div>
              <div className="name">{profile.name || "Ayyappa"}</div>
            </div>
          </div>
          <button className="ai-btn" onClick={onOpenAIChat}><span className="dot-icon">✦</span> AI Coach</button>
        </header>

        <div className="bento">
          <div 
            className="glass tilt radar-card stagger" 
            id="tiltCard" 
            style={{animationDelay:'.08s', transform: tilt}}
            onMouseMove={handleTilt}
            onMouseLeave={resetTilt}
          >
            <div className="card-top">
              <div>
                <div className="eyebrow">Career Genome Rating</div>
                <div className="tier">{tier}</div>
              </div>
              <div 
                className="sync-badge" 
                style={{
                  background: activeMods > 0 ? 'color-mix(in srgb,var(--green) 14%, transparent)' : 'color-mix(in srgb,var(--amber) 14%, transparent)',
                  borderColor: activeMods > 0 ? 'color-mix(in srgb,var(--green) 28%, transparent)' : 'color-mix(in srgb,var(--amber) 28%, transparent)'
                }}
              >
                <div className="dot" style={{ background: activeMods > 0 ? 'var(--green)' : 'var(--amber)' }}></div>
                <span style={{ color: activeMods > 0 ? 'var(--green)' : 'var(--amber)' }}>{activeMods}/4 active</span>
              </div>
            </div>
            
            {activeMods === 0 ? (
              <div className="hero-empty">
                <div className="hero-empty-icon">🧬</div>
                <div>
                  <div className="hero-empty-title">Your Genome hasn't been sequenced yet</div>
                  <div className="hero-empty-sub">Connect at least one module below — Resume, GitHub, ThoughtPrint, or EmotionPrint — to calculate your live Career Genome Score.</div>
                  <button className="hero-empty-cta" onClick={onOpenUploadResume}>Upload Resume →</button>
                </div>
              </div>
            ) : (
              <div className="radar-body">
                <div className="radar-svg-wrap">
                  {drawRadar()}
                  <div className="radar-center-score">
                    <div className="radar-center-num">{displayScore}</div>
                    <div className="radar-center-lbl">GENOME / 100</div>
                  </div>
                </div>
                <div className="radar-legend">
                  {currentModules.map(m => (
                    <div key={m.id} className="rl-item" style={{'--rl-accent': m.accent}}>
                      <div className="rl-dot"></div>
                      <div className="rl-name">{m.label}</div>
                      <div className="rl-score">{m.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="glass stat-card stagger" style={{animationDelay:'.15s'}}>
            <div className="snap-title">Profile Snapshot</div>
            <div className="stat-row"><span className="stat-label">Parsed Skills</span><span className="stat-value">{extractedResume.length < 10 ? '0'+extractedResume.length : extractedResume.length}</span></div>
            <div className="stat-row"><span className="stat-label">GitHub Repos</span><span className="stat-value">{githubAnalysis?.publicRepos ?? "—"}</span></div>
            <div className="stat-row"><span className="stat-label">Journal Scans</span><span className="stat-value">{journalEntries.length < 10 ? '0'+journalEntries.length : journalEntries.length}</span></div>
            <div className="stat-row"><span className="stat-label">EQ Sessions</span><span className="stat-value">{isEmotionCompleted ? "01" : "—"}</span></div>
            <div className="stat-row"><span className="stat-label">Modules Active</span><span className="stat-value">{activeMods} / 4</span></div>
            <button className="snap-cta" onClick={onOpenAIChat}>Open AI Career Coach <span>→</span></button>
          </div>
        </div>

        {nextMod ? (
          <div className="nudge stagger" style={{animationDelay:'.18s'}}>
            <div className="nudge-icon">{nextMod.icon}</div>
            <div className="nudge-text"><div className="nudge-eyebrow">Next step</div><div className="nudge-title">{nextMod.desc}</div></div>
            <button className="nudge-cta" onClick={() => props[nextMod.onOpen] && props[nextMod.onOpen]()}>{nextMod.action} →</button>
          </div>
        ) : (
          <div className="nudge stagger" style={{animationDelay:'.18s'}}>
            <div className="nudge-icon">✦</div>
            <div className="nudge-text"><div className="nudge-eyebrow">All dimensions synced</div><div className="nudge-title">You're fully indexed — explore live recruiter matches.</div></div>
            <button className="nudge-cta" onClick={onOpenExplore}>Explore Matches →</button>
          </div>
        )}

        <div className="section-head stagger" style={{animationDelay:'.2s'}}>
          <div><div className="section-eyebrow">Genome Core</div><div className="section-title">Your 4 Neural Dimensions</div></div>
        </div>
        <div className="dims">
          {currentModules.map((m, i) => (
            <div 
              key={m.id}
              className={`dim-row stagger ${m.done ? '' : 'empty'}`} 
              style={{'--dr-accent': m.accent, animationDelay: `${0.22 + i*0.05}s`}}
              onClick={() => props[m.onOpen] && props[m.onOpen]()}
            >
              <div className="dim-icon">{m.icon}</div>
              <div className="dim-text">
                <div className="dim-label">{m.label}</div>
                <div className="dim-status">{m.done ? '✓ Connected' : 'Tap to start →'}</div>
              </div>
              <div className="dim-ring" style={{'--dr-pct': displayRingPcts[i]}}><span>{m.done ? m.score : '—'}</span></div>
              <div className="dim-chev">›</div>
            </div>
          ))}
        </div>

        <div className="section-head stagger" style={{animationDelay:'.28s'}}>
          <div><div className="section-eyebrow">Tools</div><div className="section-title">Quick Actions</div></div>
        </div>
        <div className="actions-grid">
          {ACTIONS.map((a, i) => (
            <div 
              key={i} 
              className="action-tile stagger" 
              style={{'--a-accent': a.accent, animationDelay: `${0.3 + i*0.04}s`}}
              onClick={() => props[a.actionKey] && props[a.actionKey]()}
            >
              <div className="action-icon">{a.icon}</div>
              <div className="action-label">{a.label}</div>
            </div>
          ))}
        </div>

        <div className="section-head stagger" style={{animationDelay:'.34s'}}>
          <div><div className="section-eyebrow">Resume DNA</div><div className="section-title">Top Detected Skills</div><div className="section-sub">Based on your uploaded resume, these are your strongest detected skills.</div></div>
        </div>
        <div>
          {isResumeCompleted ? (
            <div className="skills">
              {extractedResume.slice(0, 8).map((s, i) => {
                const accents = ["var(--violet)", "var(--cyan)", "var(--rose)", "var(--green)", "var(--amber)", "var(--purple)"];
                const accent = accents[i % accents.length];
                return (
                  <div 
                    key={i} 
                    className="pill stagger" 
                    style={{
                      '--p-border': `color-mix(in srgb, ${accent} 35%, transparent)`,
                      '--p-bg': `color-mix(in srgb, ${accent} 10%, transparent)`,
                      '--p-color': accent,
                      '--p-badge': `color-mix(in srgb, ${accent} 18%, transparent)`,
                      animationDelay: `${0.42 + i*0.04}s`
                    }}
                  >
                    <span className="n">{s.name}</span><span className="s">{s.score || 85}%</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-card stagger" style={{animationDelay:'.42s'}}>
              <div className="empty-card-icon">🔍</div>
              <div style={{flex:1}}><div className="empty-card-title">No skills parsed yet</div><div className="empty-card-sub">Tap "Upload Resume" above to initialize your Career Genome Score.</div></div>
              <button className="empty-card-cta" onClick={onOpenUploadResume}>Upload Resume</button>
            </div>
          )}
        </div>

        <div className="section-head stagger" style={{animationDelay:'.4s'}}>
          <div><div className="section-eyebrow">Developer Signal</div><div className="section-title">GitHub Repository Insights</div><div className="section-sub">Connect GitHub to analyze your repositories and unlock dev ratings.</div></div>
        </div>
        <div>
          {isGitHubCompleted ? (
            <div className="gh-stats">
              <div className="gh-stat stagger" style={{animationDelay:'.48s'}}><div className="gh-stat-val">{githubAnalysis.publicRepos ?? 0}</div><div className="gh-stat-lbl">PUBLIC REPOS</div></div>
              <div className="gh-stat stagger" style={{animationDelay:'.52s'}}><div className="gh-stat-val">{githubAnalysis.totalStars ?? 0}</div><div className="gh-stat-lbl">TOTAL STARS</div></div>
              <div className="gh-stat stagger" style={{animationDelay:'.56s'}}><div className="gh-stat-val">{githubAnalysis.topLanguage || "N/A"}</div><div className="gh-stat-lbl">TOP LANGUAGE</div></div>
            </div>
          ) : (
            <div className="empty-card stagger" style={{animationDelay:'.48s'}}>
              <div className="empty-card-icon">⚙️</div>
              <div style={{flex:1}}><div className="empty-card-title">No GitHub account connected</div><div className="empty-card-sub">Connect GitHub to analyze your repositories and unlock developer ratings.</div></div>
              <button className="empty-card-cta" onClick={onOpenGitHubConnect}>Connect GitHub</button>
            </div>
          )}
        </div>

        <div className="section-head stagger" style={{animationDelay:'.6s'}}>
          <div><div className="section-eyebrow">Momentum</div><div className="section-title">Learning Streak</div></div>
        </div>
        <div className="streak-card stagger" style={{animationDelay:'.64s'}} onClick={onOpenStudyGroup}>
          <div className="streak-icon">🔥</div>
          <div className="streak-body">
            <div className="streak-title">3 Day Streak Active</div>
            <div className="streak-sub">Join your study group to maintain your momentum and earn genome points.</div>
          </div>
          <div className="dim-chev" style={{color:'var(--amber)'}}>›</div>
        </div>

        <div className="section-head stagger" style={{animationDelay:'.68s'}}>
          <div><div className="section-eyebrow">Network</div><div className="section-title">Career Mentors</div></div>
        </div>
        <div className="mentors-row">
          <div className="mentor-card stagger" style={{animationDelay:'.72s'}} onClick={onOpenMentors}>
            <div className="m-avatar">👩‍💻</div>
            <div className="m-info">
              <div className="m-name">Sarah Chen</div>
              <div className="m-role">Senior React Eng</div>
            </div>
          </div>
          <div className="mentor-card stagger" style={{animationDelay:'.76s'}} onClick={onOpenMentors}>
            <div className="m-avatar">👨‍🔬</div>
            <div className="m-info">
              <div className="m-name">Arjun Mehta</div>
              <div className="m-role">ML Systems Eng</div>
            </div>
          </div>
        </div>

        <div className="section-head stagger" style={{animationDelay:'.8s'}}>
          <div><div className="section-eyebrow">Feed</div><div className="section-title">Community Pulse</div></div>
        </div>
        <div className="pulse-card stagger" style={{animationDelay:'.84s'}} onClick={onOpenCommunity}>
          <div className="pulse-dot"></div>
          <div className="pulse-body">
            <div className="pulse-text">Emma Watson just published a new ThoughtPrint journal and leveled up her Adaptability score!</div>
            <div className="pulse-time">22 mins ago</div>
          </div>
        </div>

      </div>

      <div className="navbar">
        <div className="navbar-inner">
          <div className="nav-indicator" style={{ transform: `translateX(${navPositions[navIndex]}px)` }}></div>
          <div className={`nav-item ${navIndex === 0 ? 'active' : ''}`} onClick={() => handleNavClick(0)}>
            <span className="nav-icon"><svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></span><span className="nav-lbl">Home</span>
          </div>
          <div className={`nav-item ${navIndex === 1 ? 'active' : ''}`} onClick={() => handleNavClick(1, onOpenExplore)}>
            <span className="nav-icon"><svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg></span><span className="nav-lbl">Explore</span>
          </div>
          <div className="nav-center" onClick={onOpenAIChat}>
            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
          </div>
          <div className={`nav-item ${navIndex === 2 ? 'active' : ''}`} onClick={() => handleNavClick(2, onOpenCommunity)}>
            <span className="nav-icon"><svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></span><span className="nav-lbl">Network</span>
          </div>
          <div className={`nav-item ${navIndex === 3 ? 'active' : ''}`} onClick={() => handleNavClick(3, onOpenSettings)}>
            <span className="nav-icon"><svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></span><span className="nav-lbl">Settings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Screen11Web;
