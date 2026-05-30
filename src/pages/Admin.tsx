import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff, Users, Clock, BarChart3, AlertTriangle, Ban } from 'lucide-react';

const API_BASE = '/api';

interface VisitData {
  sessionId: string;
  ip: string;
  browser: string;
  startTime: string;
  duration: number | null;
  pages: string[];
}

interface StatsData {
  totalVisitors: number;
  totalVisits: number;
  avgDuration: number;
  lastVisits: VisitData[];
  blockedIPs: { ip: string; blockedAt: string }[];
}

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === 0) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Admin() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [blocked, setBlocked] = useState(false);

  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Verify existing token
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/admin/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          setToken(null);
          localStorage.removeItem('admin_token');
        }
      })
      .catch(() => {
        setToken(null);
        localStorage.removeItem('admin_token');
      });
  }, [token]);

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loginLoading || cooldown > 0 || blocked) return;

    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToken(data.token);
        localStorage.setItem('admin_token', data.token);
        setPassword('');
        setLoginError(null);
      } else if (res.status === 429) {
        if (data.blocked) {
          setBlocked(true);
          setLoginError(data.message);
        } else if (data.cooldown) {
          setCooldown(data.cooldownRemaining || 120);
          setLoginError(data.message);
        }
      } else {
        setLoginError(data.message || 'Invalid password');
        setAttemptsRemaining(data.attemptsRemaining ?? null);
      }
    } catch {
      setLoginError('Server not reachable. Make sure the analytics server is running.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!token) return;
    setStatsLoading(true);
    setStatsError(null);

    try {
      const res = await fetch(`${API_BASE}/analytics/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setToken(null);
          localStorage.removeItem('admin_token');
          return;
        }
        throw new Error('Failed to fetch stats');
      }

      const data = await res.json();
      setStats(data.data);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchStats();
  }, [token, fetchStats]);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('admin_token');
    setStats(null);
  };

  // ─── LOGIN SCREEN ───
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mx-4"
        >
          <div className="liquid-glass p-8 md:p-10">
            <div className="flex items-center justify-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(167, 139, 250, 0.08) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)',
                }}
              >
                <Shield className="w-8 h-8 text-neon-violet" />
              </div>
            </div>

            <h1 className="text-section-h3 text-center mb-2" style={{ fontSize: '22px' }}>
              ADMIN ACCESS
            </h1>
            <p className="text-center mb-8" style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.35)' }}>
              Portfolio Analytics Dashboard
            </p>

            <form onSubmit={handleLogin}>
              <div className="relative mb-4">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.25)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError(null); }}
                  placeholder="Enter password"
                  disabled={blocked || cooldown > 0}
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl text-white text-sm outline-none transition-all duration-300 focus:ring-1 focus:ring-purple-500 disabled:opacity-40"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(255, 255, 255, 0.25)' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={!password || loginLoading || cooldown > 0 || blocked}
                className="w-full pill-button-filled text-cta py-3.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loginLoading ? 'VERIFYING...' : cooldown > 0 ? `COOLDOWN (${cooldown}s)` : blocked ? 'BLOCKED' : 'AUTHENTICATE'}
              </button>
            </form>

            {/* Error messages */}
            <AnimatePresence>
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 flex items-start gap-2 p-3 rounded-xl"
                  style={{
                    background: blocked ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                    border: `1px solid ${blocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                  }}
                >
                  {blocked ? (
                    <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p style={{ fontSize: '12px', color: blocked ? '#ef4444' : '#f59e0b' }}>
                      {loginError}
                    </p>
                    {attemptsRemaining !== null && !blocked && cooldown === 0 && (
                      <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.25)', marginTop: '4px' }}>
                        {attemptsRemaining} attempt(s) remaining in this set
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── DASHBOARD ───
  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f', paddingTop: '80px' }}>
      <div className="content-container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-label text-neon-violet tracking-widest">ANALYTICS</span>
            <h1 className="text-section-h2 mt-1" style={{ fontSize: '32px' }}>ADMIN DASHBOARD</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchStats}
              className="pill-button-outline text-cta px-4 py-2"
              disabled={statsLoading}
            >
              {statsLoading ? 'LOADING...' : 'REFRESH'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-pill text-cta transition-all duration-300"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
              }}
            >
              LOGOUT
            </button>
          </div>
        </div>

        {statsError && (
          <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p style={{ fontSize: '13px', color: '#ef4444' }}>{statsError}</p>
          </div>
        )}

        {stats && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                {
                  icon: Users,
                  label: 'TOTAL VISITORS',
                  value: stats.totalVisitors.toString(),
                  sub: `${stats.totalVisits} total visits`,
                },
                {
                  icon: Clock,
                  label: 'AVG. TIME SPENT',
                  value: formatDuration(stats.avgDuration),
                  sub: 'across all visits',
                },
                {
                  icon: BarChart3,
                  label: 'TOTAL VISITS',
                  value: stats.totalVisits.toString(),
                  sub: 'all sessions',
                },
              ].map((card) => {
                const CardIcon = card.icon;
                return (
                  <div key={card.label} className="liquid-glass p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'rgba(139, 92, 246, 0.1)',
                          border: '1px solid rgba(139, 92, 246, 0.15)',
                        }}
                      >
                        <CardIcon className="w-5 h-5 text-neon-violet" />
                      </div>
                      <span className="text-label tracking-widest" style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)' }}>
                        {card.label}
                      </span>
                    </div>
                    <p className="text-neon-violet font-display" style={{ fontSize: '36px', lineHeight: 1, textShadow: '0 0 20px rgba(167, 139, 250, 0.4)' }}>
                      {card.value}
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.25)', marginTop: '4px' }}>
                      {card.sub}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Last 5 visits */}
            <div className="liquid-glass p-6 md:p-8 mb-8">
              <h2 className="text-section-h3 mb-6" style={{ fontSize: '18px' }}>RECENT VISITS</h2>

              {stats.lastVisits.length === 0 ? (
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.3)' }}>No visits recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        {['IP Address', 'Browser', 'Time', 'Duration', 'Pages'].map((h) => (
                          <th
                            key={h}
                            className="text-label tracking-widest pb-3 pr-4"
                            style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)', fontWeight: 500 }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.lastVisits.map((visit) => (
                        <tr
                          key={visit.sessionId}
                          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}
                        >
                          <td className="py-3 pr-4 font-mono" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            {visit.ip}
                          </td>
                          <td className="py-3 pr-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            {visit.browser}
                          </td>
                          <td className="py-3 pr-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                            {formatDate(visit.startTime)}
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className="px-2 py-0.5 rounded-pill"
                              style={{
                                fontSize: '11px',
                                background: 'rgba(139, 92, 246, 0.1)',
                                color: '#a78bfa',
                              }}
                            >
                              {formatDuration(visit.duration)}
                            </span>
                          </td>
                          <td className="py-3" style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
                            {(visit.pages || []).join(', ') || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Blocked IPs */}
            {stats.blockedIPs.length > 0 && (
              <div className="liquid-glass p-6 md:p-8">
                <h2 className="text-section-h3 mb-4 flex items-center gap-2" style={{ fontSize: '18px' }}>
                  <Ban className="w-5 h-5 text-red-400" />
                  BLOCKED IPS
                </h2>
                <div className="flex flex-wrap gap-3">
                  {stats.blockedIPs.map((entry) => (
                    <div
                      key={entry.ip}
                      className="px-4 py-2 rounded-xl font-mono"
                      style={{
                        fontSize: '13px',
                        background: 'rgba(239, 68, 68, 0.06)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                      }}
                    >
                      {entry.ip}
                      <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.2)', marginLeft: '8px' }}>
                        {formatDate(entry.blockedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
