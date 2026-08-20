import * as React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";

/**
 * HelixBackground
 * Ambient animated "DNA" double-helix made of two sine-wave dot strands
 * with periodic connecting rungs — pure Views, no canvas/SVG/extra deps.
 *
 * Usage:
 *   <View style={{ flex: 1 }}>
 *     <HelixBackground />           // put first so it sits behind content
 *     <YourScreenContent />
 *   </View>
 *
 * Props:
 *   dotColorA   color of strand 1 dots        (default violet)
 *   dotColorB   color of strand 2 dots        (default teal)
 *   rungColor   color of connecting lines     (default faint violet)
 *   opacity     overall opacity of the effect (default 0.55)
 *   side        "left" | "right" | "center" — where the helix sits (default "right")
 *   fps         throttles updates for perf, lower = cheaper (default 30)
 */
export default function HelixBackground({
  dotColorA = "rgba(178,150,255,0.55)",
  dotColorB = "rgba(34,211,200,0.5)",
  rungColor = "rgba(124,92,252,0.12)",
  opacity = 0.55,
  side = "right",
  fps = 30,
}) {
  const { width, height } = useWindowDimensions();
  const [, forceTick] = React.useState(0);
  const tRef = React.useRef(0);
  const rafRef = React.useRef(null);
  const lastFrameRef = React.useRef(0);

  React.useEffect(() => {
    const frameInterval = 1000 / fps;
    const loop = (now) => {
      if (now - lastFrameRef.current >= frameInterval) {
        lastFrameRef.current = now;
        tRef.current += 1;
        forceTick((n) => n + 1);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [fps]);

  const t = tRef.current;
  const cx =
    side === "left" ? width * 0.22 : side === "center" ? width * 0.5 : width * 0.78;
  const amp = Math.min(width * 0.16, 220);
  const spacing = 26;
  const count = Math.ceil(height / spacing) + 4;

  const strandA = [];
  const strandB = [];
  for (let i = 0; i < count; i++) {
    const y = i * spacing - (t % spacing);
    const phase = y * 0.02 + t * 0.06;
    strandA.push({ x: cx + Math.sin(phase) * amp, y });
    strandB.push({ x: cx + Math.sin(phase + Math.PI) * amp, y });
  }

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity, overflow: "hidden" }]}>
      {strandA.map(
        (p, i) =>
          i % 3 === 0 &&
          strandB[i] && <Rung key={`r${i}`} p1={p} p2={strandB[i]} color={rungColor} />
      )}
      {strandA.map((p, i) => (
        <Dot key={`a${i}`} x={p.x} y={p.y} color={dotColorA} />
      ))}
      {strandB.map((p, i) => (
        <Dot key={`b${i}`} x={p.x} y={p.y} color={dotColorB} />
      ))}
    </View>
  );
}

function Dot({ x, y, color }) {
  return (
    <View
      style={{
        position: "absolute",
        left: x - 2,
        top: y - 2,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: color,
      }}
    />
  );
}

function Rung({ p1, p2, color }) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  return (
    <View
      style={{
        position: "absolute",
        left: p1.x,
        top: p1.y,
        width: length,
        height: 1,
        backgroundColor: color,
        transform: [{ rotate: `${angle}rad` }],
        transformOrigin: "left center", // RN 0.71+ / Expo SDK 49+
      }}
    />
  );
}
