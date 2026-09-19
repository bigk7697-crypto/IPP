import { Router } from 'express';
import { getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// GET /api/results/:classId — auth requise, retourne métadonnées + URL signée temporaire.
// Le fichier reste en bucket privé, jamais d'URL publique permanente.
router.get('/:classId', auth, async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { data: results, error } = await svc
      .from('results')
      .select('id,class_id,academic_year,result_type,file_path,status,published_at')
      .eq('class_id', req.params.classId)
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    if (error) throw error;
    if (!results?.length) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Aucun résultat disponible pour cette classe.' },
      });
      return;
    }

    const latest = results[0];
    const [bucket, ...rest] = latest.file_path.split('/');
    const path = rest.join('/');
    const { data: signed, error: signError } = await svc.storage
      .from(bucket)
      .createSignedUrl(path, 3600); // 1h
    if (signError) throw signError;

    res.json({ success: true, data: { ...latest, downloadUrl: signed.signedUrl, expiresIn: 3600 } });
  } catch (e) {
    next(e);
  }
});

export default router;
