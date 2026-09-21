// Résout n'importe quelle référence d'image renvoyée par l'API en URL affichable :
// - URL http(s) / data: / blob: → inchangée
// - chemin Storage ("public-assets/news/x.jpg" ou "news/x.jpg") → URL publique
// - vide → '' (l'appelant affiche un placeholder au lieu d'un <img> cassé)
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const BUCKET = 'public-assets';

export function resolveImageUrl(raw?: string | null): string {
  if (!raw) return '';
  const v = raw.trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v) || v.startsWith('data:') || v.startsWith('blob:')) return v;
  const path = v.startsWith(`${BUCKET}/`) ? v.slice(BUCKET.length + 1) : v.replace(/^\/+/, '');
  const base = SUPABASE_URL.replace(/\/+$/, '');
  if (!base) return '';
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}
