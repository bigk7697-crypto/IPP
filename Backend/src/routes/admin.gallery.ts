import { Router } from 'express';
import { getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { uploadImage } from '../middleware/upload.js';
import { MIME, buildPublicImagePath } from '../utils/files.js';
import { removeFile, uploadBuffer } from '../services/storage.js';
import { albumPatchSchema, albumSchema, imageMetaSchema } from '../validators/gallery.js';

const router = Router();
router.use(auth, requireAdmin);

// POST /api/admin/gallery/albums
router.post('/albums', async (req, res, next) => {
  try {
    const parsed = albumSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Album invalide.', details: parsed.error.flatten() },
      });
      return;
    }
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('gallery_albums')
      .insert({ ...parsed.data, created_by: req.user!.id })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

  router.put('/albums/:id', async (req, res, next) => {
  try {
    const parsed = albumPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Données invalides.' },
      });
      return;
    }
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('gallery_albums')
      .update(parsed.data)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.delete('/albums/:id', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    // Supprime les fichiers Storage des images avant (évite les orphelins)
    const { data: images } = await svc
      .from('gallery_images')
      .select('image_path')
      .eq('album_id', req.params.id);
    for (const img of images ?? []) {
      try {
        await removeFile(img.image_path);
      } catch {
        // ignore : fichier déjà absent
      }
    }
    const { error } = await svc.from('gallery_albums').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, data: { id: req.params.id } });
  } catch (e) {
    next(e);
  }
});

// POST /api/admin/gallery/albums/:id/images — multipart file=image
router.post('/albums/:id/images', uploadImage.single('image'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Fichier image requis (champ "image").' },
      });
      return;
    }
    if (!MIME.image.includes(file.mimetype)) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Image JPEG/PNG/WebP uniquement.' },
      });
      return;
    }
    const meta = imageMetaSchema.safeParse(req.body);
    if (!meta.success) {
      res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Métadonnées image invalides.', details: meta.error.flatten() } });
      return;
    }
    const caption = meta.data.caption ?? null;
    const sort_order = meta.data.sort_order;

    const fullPath = buildPublicImagePath('gallery', file.originalname);
    await uploadBuffer(fullPath, file.buffer, file.mimetype);

    const svc = getServiceClient();
    const { data, error } = await svc
      .from('gallery_images')
      .insert({
        album_id: req.params.id,
        image_path: fullPath,
        caption,
        sort_order,
        created_by: req.user!.id,
      })
      .select()
      .single();
    if (error) {
      await removeFile(fullPath).catch(() => {});
      throw error;
    }
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/admin/gallery/images/:imageId — DB + Storage
router.delete('/images/:imageId', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { data: row } = await svc
      .from('gallery_images')
      .select('image_path')
      .eq('id', req.params.imageId)
      .single();
    const { error } = await svc.from('gallery_images').delete().eq('id', req.params.imageId);
    if (error) throw error;
    if (row?.image_path) await removeFile(row.image_path).catch(() => {});
    res.json({ success: true, data: { id: req.params.imageId } });
  } catch (e) {
    next(e);
  }
});

export default router;
