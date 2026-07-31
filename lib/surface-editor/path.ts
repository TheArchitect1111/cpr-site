export function getAtPath(value: Record<string, unknown>, path: string): unknown {
  return path.split('.').filter(Boolean).reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[key];
  }, value);
}

export function setAtPath(
  source: Record<string, unknown>,
  path: string,
  nextValue: unknown,
): Record<string, unknown> {
  const keys = path.split('.').filter(Boolean);
  if (!keys.length) return source;
  const root = structuredClone(source);
  let cursor: Record<string, unknown> = root;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = nextValue;
      return;
    }
    const child = cursor[key];
    cursor[key] = child && typeof child === 'object' && !Array.isArray(child) ? child : {};
    cursor = cursor[key] as Record<string, unknown>;
  });
  return root;
}
