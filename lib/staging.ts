function enabled(value: string | undefined): boolean {
  return value === '1' || value?.toLowerCase() === 'true';
}

export function isOpenStaging(): boolean {
  return (
    enabled(process.env.CPR_STAGING_OPEN) ||
    enabled(process.env.NEXT_PUBLIC_CPR_STAGING_OPEN)
  );
}

