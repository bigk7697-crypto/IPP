export function escapeIlike(s: string): string {
  return s.replace(/[%_\\]/g, '\\$&');
}

export function normalizeQuery(q: unknown): string {
  if (typeof q !== 'string') return '';
  const t = q.trim().slice(0, 100);
  return t;
}
