import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

const API_BASE = '/api/analytics';

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR/')) return 'Opera';
  return 'Unknown';
}

export function useAnalytics() {
  const location = useLocation();
  const sessionId = useRef<string>('');
  const startTime = useRef<number>(0);
  const pagesVisited = useRef<string[]>([]);

  // Initialize session
  useEffect(() => {
    // Skip if already tracked this session
    if (sessionStorage.getItem('analytics_session_id')) {
      sessionId.current = sessionStorage.getItem('analytics_session_id')!;
      startTime.current = parseInt(sessionStorage.getItem('analytics_start_time') || '0');
      return;
    }

    const sid = generateSessionId();
    sessionId.current = sid;
    startTime.current = Date.now();

    sessionStorage.setItem('analytics_session_id', sid);
    sessionStorage.setItem('analytics_start_time', String(Date.now()));

    // Record visit
    fetch(`${API_BASE}/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sid,
        browser: getBrowserName(),
        pages: [window.location.pathname],
        referrer: document.referrer || '',
      }),
    }).catch(() => {
      // Analytics failure should never break the site
    });

    // Update duration on unload
    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      // Use sendBeacon for reliability during unload
      const data = JSON.stringify({ duration, pages: pagesVisited.current });
      navigator.sendBeacon(`${API_BASE}/visit/${sid}`, new Blob([data], { type: 'application/json' }));
    };

    window.addEventListener('beforeunload', handleUnload);
    // Also handle visibility change for mobile browsers
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Track page changes
  useEffect(() => {
    const page = location.pathname;
    if (!pagesVisited.current.includes(page)) {
      pagesVisited.current.push(page);
    }
  }, [location.pathname]);
}
