import { randomUUID } from 'node:crypto';

export const LIMITS = {
  resultMaxBytes: 15 * 1024 * 1024, // 15 Mo — PDF/XLSX
  documentMaxBytes: 15 * 1024 * 1024,
  imageMaxBytes: 5 * 1024 * 1024, // 5 Mo — news/gallery/events
};

export const MIME = {
  result: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/plain',
  ],
  image: ['image/jpeg', 'image/png', 'image/webp'],
};

function extOf(originalName: string, fallback = 'bin') {
  const parts = originalName.split('.');
  if (parts.length < 2) return fallback;
  return parts.pop()!.toLowerCase().replace(/[^a-z0-9]/g, '') || fallback;
}

function slug(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

// results/2025-2026/terminale-d/uuid.pdf — jamais le nom d'origine
export function buildResultPath(academicYear: string, className: string, originalName: string) {
  return `private-results/${slug(academicYear)}/${slug(className)}/${randomUUID()}.${extOf(originalName, 'pdf')}`;
}

export function buildDocumentPath(category: string, originalName: string) {
  const cat = slug(category || 'divers') || 'divers';
  return `private-documents/${cat}/${randomUUID()}.${extOf(originalName)}`;
}

export function buildPublicImagePath(folder: 'news' | 'gallery' | 'events', originalName: string) {
  return `public-assets/${folder}/${randomUUID()}.${extOf(originalName, 'jpg')}`;
}

// "private-results/xxx/yyy.pdf" → { bucket, path }
export function splitBucketPath(full: string): { bucket: string; path: string } {
  const i = full.indexOf('/');
  if (i === -1) throw new Error('file_path invalide');
  return { bucket: full.slice(0, i), path: full.slice(i + 1) };
}
