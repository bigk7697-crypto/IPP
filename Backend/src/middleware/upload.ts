import multer from 'multer';
import { LIMITS } from '../utils/files.js';

function make(maxBytes: number) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes, files: 1 },
  });
}

export const uploadResult = make(LIMITS.resultMaxBytes);
export const uploadDocument = make(LIMITS.documentMaxBytes);
export const uploadImage = make(LIMITS.imageMaxBytes);
