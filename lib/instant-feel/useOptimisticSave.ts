'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type OptimisticSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type Options = {
  savedMs?: number;
};

export function useOptimisticSave(options: Options = {}) {
  const savedMs = options.savedMs ?? 2400;
  const [status, setStatus] = useState<OptimisticSaveStatus>('idle');
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const run = useCallback(
    async <T>(work: () => Promise<T>, onOptimistic?: () => void): Promise<T | undefined> => {
      setError('');
      setStatus('saving');
      onOptimistic?.();
      try {
        const result = await work();
        setStatus('saved');
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setStatus('idle'), savedMs);
        return result;
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Save failed');
        return undefined;
      }
    },
    [savedMs],
  );

  return { status, error, run };
}
