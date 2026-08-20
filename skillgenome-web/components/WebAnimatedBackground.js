import React from 'react';
import { Platform } from 'react-native';

const WebAnimatedBackground = ({ isDarkMode = true }) => {
  if (Platform.OS !== 'web') return null;

  // Theme variables that swap cleanly between light and dark modes
  const theme = {
    bg: isDarkMode ? '#090b12' : '#f8fafc',
    bg2: isDarkMode ? '#0d1019' : '#f1f5f9',
    gridLine: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
    violetOpacity: isDarkMode ? 0.20 : 0.08,
    tealOpacity: isDarkMode ? 0.14 : 0.06,
    amberOpacity: isDarkMode ? 0.08 : 0.04,
  };

  const css = `
    .wab-backdrop {
      position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
      background:
        radial-gradient(1100px 700px at 15% -10%, rgba(139,92,246,${theme.violetOpacity}), transparent 60%),
        radial-gradient(900px 600px at 100% 10%, rgba(45,212,191,${theme.tealOpacity}), transparent 55%),
        radial-gradient(700px 500px at 50% 120%, rgba(240,180,41,${theme.amberOpacity}), transparent 60%),
        linear-gradient(180deg, ${theme.bg} 0%, ${theme.bg2} 100%);
    }
    .wab-grid-lines { position: absolute; inset: 0; opacity: 1; }
    .wab-grid-lines svg { width: 100%; height: 100%; }

    .wab-helix-wrap {
      position: absolute; top: -6%; right: -14%; width: 60vw; max-width: 820px;
      opacity: ${isDarkMode ? 0.55 : 0.35};
      animation: wab-drift 26s ease-in-out infinite;
    }
    @keyframes wab-drift {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(24px) rotate(1.5deg); }
    }
    .wab-helix-wrap.lower {
      top: auto; bottom: -18%; right: auto; left: -18%; width: 46vw; max-width: 640px;
      opacity: ${isDarkMode ? 0.35 : 0.25};
      animation-duration: 34s; animation-direction: reverse;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="wab-backdrop">
        <div className="wab-grid-lines">
          <svg><defs><pattern id="wab-gridpat" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke={theme.gridLine} strokeWidth="1"/>
          </pattern></defs><rect width="100%" height="100%" fill="url(#wab-gridpat)"/></svg>
        </div>
        
        <div className="wab-helix-wrap">
          <svg viewBox="0 0 400 700" fill="none">
            <path d="M40 0 C160 90 -80 180 40 270 C160 360 -80 450 40 540 C160 630 -80 700 40 700" stroke="url(#wab-g1)" strokeWidth="2" opacity="0.7"/>
            <path d="M360 0 C240 90 480 180 360 270 C240 360 480 450 360 540 C240 630 480 700 360 700" stroke="url(#wab-g2)" strokeWidth="2" opacity="0.7"/>
            <defs>
              <linearGradient id="wab-g1" x1="0" y1="0" x2="0" y2="700" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6"/><stop offset="1" stopColor="#2dd4bf" stopOpacity="0.2"/>
              </linearGradient>
              <linearGradient id="wab-g2" x1="0" y1="0" x2="0" y2="700" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2dd4bf"/><stop offset="1" stopColor="#8b5cf6" stopOpacity="0.2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="wab-helix-wrap lower">
          <svg viewBox="0 0 400 700" fill="none">
            <path d="M40 0 C160 90 -80 180 40 270 C160 360 -80 450 40 540" stroke="#f0b429" strokeWidth="1.5" opacity="0.4"/>
            <path d="M360 0 C240 90 480 180 360 270 C240 360 480 450 360 540" stroke="#f0b429" strokeWidth="1.5" opacity="0.4"/>
          </svg>
        </div>
      </div>
    </>
  );
};

export default WebAnimatedBackground;
