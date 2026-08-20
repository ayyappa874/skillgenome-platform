import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#090b12; --bg2:#0d1019; --text:#f3f4f8; --muted:#8d93a8;
    --violet:#8b6bff; --teal:#2dd4bf; --amber:#f0b429; --rose:#fb5c7a; --purple:#b073ff;
    --border:rgba(255,255,255,0.1);
  }
  html.light{
    --bg:#f6f5fb; --bg2:#efeefa; --text:#14141f; --muted:#63667a;
    --violet:#7c4dff; --teal:#0b9488; --amber:#b45309; --rose:#e11d48; --purple:#9333ea;
    --border:rgba(20,20,35,0.1);
  }
  *{ box-sizing:border-box; margin:0; padding:0; }
  html, body { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }
  body{
    background:linear-gradient(180deg,var(--bg),var(--bg2));
    color:var(--text); font-family:'Inter',sans-serif; position:relative;
    transition:background .3s ease, color .3s ease;
  }
  .mono{ font-family:'JetBrains Mono',monospace; }

  .toggle{ display: none; }

  .stage{ position:absolute; top:0; left:0; right:0; bottom:0; display:flex; align-items:center; justify-content:center; }
  #dnaCanvas{ position:absolute; top:0; left:0; width:100%; height:100%; }

  .hero-copy{
    position:relative; z-index:2; text-align:center; max-width:560px; padding:0 24px; pointer-events:none;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  
  /* Initial hidden state, controlled by JS */
  #hero-copy { display: none; }
  
  .eyebrow{ font-size:12px; font-weight:700; letter-spacing:0.14em; color:var(--muted); text-transform:uppercase; margin-bottom:14px; }
  h1{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:clamp(34px,6vw,56px); line-height:1.06; letter-spacing:-0.03em; }
  h1 .accent{ background:linear-gradient(100deg,var(--violet),var(--teal)); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .sub{ margin-top:16px; font-size:15.5px; color:var(--muted); line-height:1.6; }
</style>
</head>
<body>

<div class="stage">
  <canvas id="dnaCanvas"></canvas>
  <div class="hero-copy" id="hero-copy">
    <div class="eyebrow mono">// sequencing career.dna</div>
    <h1>Your career,<br><span class="accent">decoded by AI.</span></h1>
    <div class="sub">Every skill, every repo, every signal — mapped into a living genome that grows with you.</div>
  </div>
</div>

<script>
  const root = document.documentElement;
  
  window.setTheme = function(isDark) {
    if (isDark) {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
  };
  
  window.showText = function(show) {
    document.getElementById('hero-copy').style.display = show ? 'flex' : 'none';
  };

  const canvas = document.getElementById('dnaCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, DPR;
  let RADIUS = 92; // Will be updated on resize

  function cssVar(name){ return getComputedStyle(root).getPropertyValue(name).trim(); }
  function hexToRgb(hex){
    hex = hex.replace('#','');
    if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
    const n = parseInt(hex,16);
    return [(n>>16)&255,(n>>8)&255,n&255];
  }

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    // Fallback to 400 if window.innerWidth is 0 (WebView initial load)
    W = canvas.clientWidth = window.innerWidth || 400;
    H = canvas.clientHeight = window.innerHeight || 800;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
    
    // Dynamically calculate radius so it's never 0
    RADIUS = Math.min(92, Math.max(50, W * 0.25));
  }
  window.addEventListener('resize', resize);
  // Also call resize after a short delay in case WebView layout was delayed
  setTimeout(resize, 100);
  resize();

  const N = 34;                 
  const SPACING = 34;           
  const SKILLS = ["React","Python","System Design","Leadership","Node.js","SQL","Communication","ML Ops"];

  const ACCENT_KEYS = ['--violet','--teal','--amber','--rose','--purple'];

  let angleOffset = 0;
  let mouseX = 0.5;
  let autoSway = 0;

  function draw(){
    ctx.clearRect(0,0,W,H);
    
    // Auto drift mouseX for a fluid, living feel since mobile has no mouse hover
    autoSway += 0.003;
    const currentMouseX = mouseX + (Math.sin(autoSway) * 0.15);

    const cx = W/2 + (currentMouseX - 0.5) * 40;
    const topY = H/2 - (N*SPACING)/2;
    const violet = hexToRgb(cssVar('--violet'));
    const teal = hexToRgb(cssVar('--teal'));

    const pts = [];
    for (let i=0;i<N;i++){
      const angle = i*0.42 + angleOffset;
      const y = topY + i*SPACING;
      const xA = cx + Math.cos(angle)*RADIUS;
      const zA = Math.sin(angle);
      const xB = cx + Math.cos(angle+Math.PI)*RADIUS;
      const zB = -zA;
      pts.push({ i, y, xA, zA, xB, zB });
    }

    const items = [];
    for (let i=0;i<N;i++){
      const p = pts[i];
      const scaleA = 0.55 + (p.zA+1)/2*0.75;
      const scaleB = 0.55 + (p.zB+1)/2*0.75;
      const alphaA = 0.35 + (p.zA+1)/2*0.65;
      const alphaB = 0.35 + (p.zB+1)/2*0.65;

      const accentKey = ACCENT_KEYS[i % ACCENT_KEYS.length];
      const accentRgb = hexToRgb(cssVar(accentKey));
      const rungAlpha = (0.12 + (Math.max(p.zA,p.zB)+1)/2*0.35);
      
      items.push({
        z: (p.zA+p.zB)/2, draw: () => {
          ctx.strokeStyle = \`rgba(\${accentRgb[0]},\${accentRgb[1]},\${accentRgb[2]},\${rungAlpha})\`;
          ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(p.xA,p.y); ctx.lineTo(p.xB,p.y); ctx.stroke();
        }
      });

      if (i < N-1){
        const p2 = pts[i+1];
        items.push({ z:(p.zA+p2.zA)/2, draw:() => {
          ctx.strokeStyle = \`rgba(\${violet[0]},\${violet[1]},\${violet[2]},0.5)\`;
          ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(p.xA,p.y); ctx.lineTo(p2.xA,p2.y); ctx.stroke();
        }});
        items.push({ z:(p.zB+p2.zB)/2, draw:() => {
          ctx.strokeStyle = \`rgba(\${teal[0]},\${teal[1]},\${teal[2]},0.5)\`;
          ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(p.xB,p.y); ctx.lineTo(p2.xB,p2.y); ctx.stroke();
        }});
      }

      items.push({ z:p.zA, draw:() => {
        ctx.save();
        ctx.shadowColor = \`rgba(\${violet[0]},\${violet[1]},\${violet[2]},0.9)\`;
        ctx.shadowBlur = 10*scaleA;
        ctx.fillStyle = \`rgba(\${violet[0]},\${violet[1]},\${violet[2]},\${alphaA})\`;
        ctx.beginPath(); ctx.arc(p.xA,p.y, 4.2*scaleA, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }});
      items.push({ z:p.zB, draw:() => {
        ctx.save();
        ctx.shadowColor = \`rgba(\${teal[0]},\${teal[1]},\${teal[2]},0.9)\`;
        ctx.shadowBlur = 10*scaleB;
        ctx.fillStyle = \`rgba(\${teal[0]},\${teal[1]},\${teal[2]},\${alphaB})\`;
        ctx.beginPath(); ctx.arc(p.xB,p.y, 4.2*scaleB, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }});

      if (i % 4 === 1 && p.zA > 0.55){
        const label = SKILLS[(i>>2) % SKILLS.length];
        const side = p.xA > cx ? 1 : -1;
        items.push({ z:p.zA+0.01, draw:() => {
          const lx = p.xA + side*26;
          ctx.globalAlpha = (p.zA-0.55)/0.45;
          ctx.strokeStyle = \`rgba(\${violet[0]},\${violet[1]},\${violet[2]},0.5)\`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.xA,p.y); ctx.lineTo(lx,p.y); ctx.stroke();
          ctx.font = '600 11px Inter, sans-serif';
          ctx.fillStyle = cssVar('--text');
          ctx.textAlign = side > 0 ? 'left' : 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, lx + side*4, p.y);
          ctx.globalAlpha = 1;
        }});
      }
    }

    items.sort((a,b) => a.z - b.z);
    items.forEach(it => it.draw());

    angleOffset += 0.006;
    requestAnimationFrame(draw);
  }
  
  requestAnimationFrame(draw);
</script>

</body>
</html>
`;

export default function DNABackground({ isDarkMode, showText = false }) {
  const webViewRef = useRef(null);

  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.setTheme(${isDarkMode});
        window.showText(${showText});
        true;
      `);
    }
  }, [isDarkMode, showText]);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        originWhitelist={['*']}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onLoad={() => {
          webViewRef.current.injectJavaScript(`
            window.setTheme(${isDarkMode});
            window.showText(${showText});
            true;
          `);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  }
});
