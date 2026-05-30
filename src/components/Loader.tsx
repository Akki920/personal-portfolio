import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoaderProps {
  onComplete: () => void;
}

function getBrowserInfo(): { name: string; version: string } {
  const ua = navigator.userAgent;
  let name = 'Unknown';
  let version = '';

  if ((navigator as any).brave !== undefined) {
    name = 'Brave';
    version = ua.split('Chrome/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Firefox/')) {
    name = 'Firefox';
    version = ua.split('Firefox/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Edg/')) {
    name = 'Microsoft Edge';
    version = ua.split('Edg/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    name = 'Google Chrome';
    version = ua.split('Chrome/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    name = 'Safari';
    version = ua.split('Version/')[1]?.split(' ')[0] || '';
  } else if (ua.includes('Opera') || ua.includes('OPR/')) {
    name = 'Opera';
    version = ua.split('OPR/')[1]?.split(' ')[0] || ua.split('Opera/')[1]?.split(' ')[0] || '';
  }

  return { name, version: version.split('.')[0] || '' };
}



// Neural network node positions for the animation
const NODES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: 15 + (i % 6) * 14 + (Math.random() - 0.5) * 6,
  y: 15 + Math.floor(i / 6) * 18 + (Math.random() - 0.5) * 6,
  delay: Math.random() * 2,
  size: 2 + Math.random() * 3,
}));

// Create connections between nearby nodes
const CONNECTIONS: [number, number][] = [];
for (let i = 0; i < NODES.length; i++) {
  for (let j = i + 1; j < NODES.length; j++) {
    const dx = NODES[i].x - NODES[j].x;
    const dy = NODES[i].y - NODES[j].y;
    if (Math.sqrt(dx * dx + dy * dy) < 22) {
      CONNECTIONS.push([i, j]);
    }
  }
}

export function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [browserInfo, setBrowserInfo] = useState({ name: '...', version: '' });
  const [visible, setVisible] = useState(true);
  const hasCompleted = useRef(false);

  const phases = [
    'INITIALIZING SYSTEM...',
    'LOADING NEURAL NETWORKS...',
    'ANALYZING CONNECTION...',
    'SYSTEM READY',
  ];

  const completeLoader = useCallback(() => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    setPhase(3);
    setProgress(100);
    setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 600);
    }, 500);
  }, [onComplete]);

  useEffect(() => {
    setBrowserInfo(getBrowserInfo());
  }, []);

  useEffect(() => {
    let raf: number;
    const startTime = Date.now();
    const duration = 2800;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (pct < 35) setPhase(0);
      else if (pct < 65) setPhase(1);
      else if (pct < 90) setPhase(2);
      else setPhase(3);

      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        completeLoader();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [completeLoader]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.45, 0, 0.55, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: '#0a0a0f' }}
        >
          {/* Neural network animation */}
          <div className="relative w-80 h-64 md:w-96 md:h-72 mb-8">
            <svg
              viewBox="0 0 100 80"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.2))' }}
            >
              {/* Connections */}
              {CONNECTIONS.map(([a, b], idx) => (
                <line
                  key={`conn-${idx}`}
                  x1={NODES[a].x}
                  y1={NODES[a].y}
                  x2={NODES[b].x}
                  y2={NODES[b].y}
                  stroke="rgba(139, 92, 246, 0.15)"
                  strokeWidth="0.3"
                  className="loader-connection"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                />
              ))}

              {/* Pulse along connections */}
              {CONNECTIONS.filter((_, idx) => idx % 3 === 0).map(([a, b], idx) => (
                <circle
                  key={`pulse-${idx}`}
                  r="0.8"
                  fill="#a78bfa"
                  className="loader-data-pulse"
                  style={{ animationDelay: `${idx * 0.3}s` }}
                >
                  <animateMotion
                    dur={`${1.5 + idx * 0.2}s`}
                    repeatCount="indefinite"
                    path={`M${NODES[a].x},${NODES[a].y} L${NODES[b].x},${NODES[b].y}`}
                  />
                </circle>
              ))}

              {/* Nodes */}
              {NODES.map((node) => (
                <g key={node.id}>
                  {/* Glow */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size * 1.5}
                    fill="rgba(139, 92, 246, 0.08)"
                    className="loader-node-glow"
                    style={{ animationDelay: `${node.delay}s` }}
                  />
                  {/* Core */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size * 0.4}
                    fill="#8b5cf6"
                    className="loader-node"
                    style={{ animationDelay: `${node.delay}s` }}
                  />
                </g>
              ))}

              {/* Scanning line */}
              <line
                x1="0"
                y1="0"
                x2="100"
                y2="0"
                stroke="url(#scanGradient)"
                strokeWidth="0.4"
                className="loader-scan-line"
              />
              <defs>
                <linearGradient id="scanGradient" x1="0" x2="1">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="40%" stopColor="rgba(167, 139, 250, 0.6)" />
                  <stop offset="50%" stopColor="rgba(139, 92, 246, 0.9)" />
                  <stop offset="60%" stopColor="rgba(167, 139, 250, 0.6)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Phase text */}
          <div className="text-center mb-8">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-label tracking-[0.25em]"
              style={{ color: '#a78bfa', fontSize: '12px' }}
            >
              {phases[phase]}
            </motion.p>
          </div>

          {/* Progress bar */}
          <div className="w-64 md:w-80 mb-8">
            <div
              className="h-[2px] rounded-full overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.06)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #8b5cf6, #a78bfa, #c084fc)',
                  boxShadow: '0 0 12px rgba(139, 92, 246, 0.6)',
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.25)' }}>
                {Math.round(progress)}%
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.25)' }}>
                PORTFOLIO v2.0
              </span>
            </div>
          </div>

          {/* System info */}
          <div className="flex items-center gap-6 md:gap-10">
            <div className="text-center">
              <span
                className="block text-label tracking-widest mb-1"
                style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.3)' }}
              >
                BROWSER
              </span>
              <span
                className="block font-mono"
                style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}
              >
                {browserInfo.name} {browserInfo.version}
              </span>
            </div>
            <div
              className="w-px h-8"
              style={{ background: 'rgba(255, 255, 255, 0.08)' }}
            />
            <div className="text-center">
              <span
                className="block text-label tracking-widest mb-1"
                style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.3)' }}
              >
                STATUS
              </span>
              <span
                className="block font-mono text-green-400"
                style={{ fontSize: '12px' }}
              >
                SECURE
              </span>
            </div>
          </div>

          {/* Corner markers */}
          <div className="absolute top-6 left-6 w-5 h-5 border-l border-t" style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }} />
          <div className="absolute top-6 right-6 w-5 h-5 border-r border-t" style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }} />
          <div className="absolute bottom-6 left-6 w-5 h-5 border-l border-b" style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }} />
          <div className="absolute bottom-6 right-6 w-5 h-5 border-r border-b" style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
