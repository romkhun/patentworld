'use client';

import { useState, useEffect } from 'react';

const cache = new Map<string, any>();

export function useChapterData<T>(path: string): {
  data: T | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<T | null>(cache.get(path) ?? null);
  const [loading, setLoading] = useState(!cache.has(path));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache.has(path)) {
      setData(cache.get(path));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/data/${path}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        const payload = json.data ?? json;
        cache.set(path, payload);
        setData(payload);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [path]);

  return { data, loading, error };
}
