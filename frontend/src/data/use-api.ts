import { useState, useEffect, useCallback } from 'react';

const GATEWAY = import.meta.env.VITE_BACKEND_URL || '';
/** Base URL for the Foodey service, proxied through the platform gateway. */
export const BASE = `${GATEWAY}/foodey-service/api`;

/**
 * Generic data hook that fetches JSON from the Foodey backend.
 * Falls back to the provided default data when the request fails so the
 * UI always renders (useful in previews and offline mode). Returns a
 * `refetch` callback and a `setData` setter for optimistic updates.
 */
export function useApi<T>(path: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    let active = true;
    setLoading(true);
    fetch(`${BASE}/${path}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => { if (active) { setData(json); setLoading(false); } })
      .catch(() => { if (active) { setLoading(false); } });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => {
    const cancel = refetch();
    return cancel;
  }, [refetch]);

  return { data, setData, loading, refetch };
}

/** POST helper that returns the created/updated resource. */
export async function apiPost<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const r = await fetch(`${BASE}/${path}`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

/** PUT helper for updates. */
export async function apiPut<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const r = await fetch(`${BASE}/${path}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

/** DELETE helper. Returns true on success. */
export async function apiDelete(path: string): Promise<boolean> {
  try {
    const r = await fetch(`${BASE}/${path}`, { method: 'DELETE', credentials: 'include' });
    return r.ok;
  } catch { return false; }
}
