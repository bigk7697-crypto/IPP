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

// Vérifie la signature réelle du fichier (magic bytes), pas seulement
// l'en-tête multipart `mimetype` qui est falsifiable par l'attaquant.
// Jette une Error si le contenu ne correspond pas au type déclaré.
export function assertFileSignature(buffer: Buffer, mime: string): void {
  if (!buffer || buffer.length < 4) throw new Error('Fichier vide ou trop petit.');
  const head = buffer.subarray(0, 12);
  const isPdf = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46; // %PDF
  const isZip = head[0] === 0x50 && head[1] === 0x4b && (head[2] === 0x03 || head[2] === 0x05 || head[2] === 0x07); // PK.. (xlsx/docx)
  const isOle = head[0] === 0xd0 && head[1] === 0xcf && head[2] === 0x11 && head[3] === 0xe0; // .doc/.xls legacy
  const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  const isPng =
    head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47 &&
    head[4] === 0x0d && head[5] === 0x0a && head[6] === 0x1a && head[7] === 0x0a;
  const isWebp =
    head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 && // RIFF
    head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50; // WEBP

  switch (mime) {
    case 'application/pdf':
      if (!isPdf) throw new Error('Contenu invalide : PDF attendu.');
      break;
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      if (!isZip) throw new Error('Contenu invalide : document Office (ZIP) attendu.');
      break;
    case 'application/vnd.ms-excel':
    case 'application/msword':
      if (!isZip && !isOle) throw new Error('Contenu invalide : document Excel/Word attendu.');
      break;
    case 'image/jpeg':
      if (!isJpeg) throw new Error('Contenu invalide : image JPEG attendue.');
      break;
    case 'image/png':
      if (!isPng) throw new Error('Contenu invalide : image PNG attendue.');
      break;
    case 'image/webp':
      if (!isWebp) throw new Error('Contenu invalide : image WebP attendue.');
      break;
    case 'text/plain': {
      // Refuse les binaires déguisés : pas d'octet NUL, majorité imprimable
      let printable = 0;
      const sample = buffer.subarray(0, Math.min(buffer.length, 4096));
      for (const b of sample) {
        if (b === 0x00) throw new Error('Contenu invalide : texte attendu.');
        if ((b >= 0x20 && b <= 0x7e) || b === 0x0a || b === 0x0d || b === 0x09 || b >= 0x80) printable++;
      }
      if (printable / sample.length < 0.7) throw new Error('Contenu invalide : texte attendu.');
      break;
    }
    default:
      throw new Error('Type de fichier non autorisé.');
  }
}
