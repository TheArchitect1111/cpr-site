'use client';

import type { OptimisticSaveStatus } from './useOptimisticSave';

type Props = {
  status: OptimisticSaveStatus;
  error?: string;
  className?: string;
};

const LABEL: Record<OptimisticSaveStatus, string | null> = {
  idle: null,
  saving: 'Saving…',
  saved: '✓ Saved',
  error: 'Could not save',
};

export function OptimisticSaveBadge({ status, error, className = '' }: Props) {
  const label = status === 'error' && error ? error : LABEL[status];
  if (!label) return null;

  return (
    <span
      className={`pc-save-badge pc-save-badge-${status} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      {label}
    </span>
  );
}
