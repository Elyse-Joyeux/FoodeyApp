import { useState, useEffect } from 'react';

const GATEWAY = (typeof process !== 'undefined' && process.env && process.env.BACKEND_URL)
  ? process.env.BACKEND_URL
  : '';
const BASE = `${GATEWAY}/foodey-service/api`;

/**
 * Generic data hook that fetches JSON from the Foodey backend.
 * Falls back to the provided default data when the request fails,
 * so the UI always renders (useful in previews and offline mode).
 */
export function useApi<T>(path: string, fallback: T): { data: T; loading: boolean } {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`${BASE}/${path}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => { if (active) { setData(json); setLoading(false); } })
      .catch(() => { if (active) { setData(fallback); setLoading(false); } });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return { data, loading };
}
