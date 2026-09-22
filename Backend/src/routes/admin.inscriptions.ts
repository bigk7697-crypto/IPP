import { Router } from 'express';
import { getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireMfa } from '../middleware/requireMfa.js';
import { adminLimiter } from '../middleware/rateLimit.js';
import { paginationMeta, paginationParams } from '../utils/errors.js';
import { fileNameOf, removeFile, signedUrl } from '../services/storage.js';
import { sendPushToUsers } from '../services/push.js';
import { ALLOWED_TRANSITIONS, decideSchema } from '../validators/inscription.js';

const router = Router();
router.use(auth, adminLimiter, requireAdmin, requireMfa);

const STATUS_LABEL: Record<string, string> = {
  verifie: 'verifie',
  convoque: 'convoque',
  refuse: 'refuse',
  admis: 'admis',
};

// GET /api/admin/inscriptions (?status=&q=) — q cherche référence, email ou nom
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, from, to } = paginationParams(req.query);
    const svc = getServiceClient();
    let q = svc
      .from('inscription_applications')
      .select(
        'id,reference,first_name,last_name,email,phone,parent_name,niveau,filiere_slug,status,rendez_vous_at,created_at,updated_at',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to);
    const status = String(req.query.status || '');
    if (['soumis', 'verifie', 'convoque', 'refuse', 'admis'].includes(status)) {
      q = q.eq('status', status);
    }
    const search = String(req.query.q || '').trim().slice(0, 80);
    if (search) {
      const e = search.replace(/[%_]/g, '');
      q = q.or(`reference.ilike.%${e}%,email.ilike.%${e}%,last_name.ilike.%${e}%`);
    }
    const { data, error, count } = await q;
    if (error) throw error;
    res.json({ success: true, data, pagination: paginationMeta(page, limit, count ?? 0) });
  } catch (e) {
    next(e);
  }
});

// GET /api/admin/inscriptions/:id — dossier + pièces (URLs signées 1 h)
router.get('/:id', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { data: app, error } = await svc.from('inscription_applications').select('*').eq('id', req.params.id).single();
    if (error || !app) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Dossier introuvable.' } });
      return;
    }
    const { data: docs } = await svc
      .from('inscription_documents')
      .select('id,type_piece,file_name,mime,size_bytes,file_path,created_at')
      .eq('application_id', app.id)
      .order('created_at', { ascending: true });
    const documents = [];
    for (const d of docs || []) {
      let downloadUrl = '';
      try {
        downloadUrl = await signedUrl(d.file_path, 3600, fileNameOf(d.file_path));
      } catch {
        downloadUrl = '';
      }
      documents.push({ ...d, downloadUrl });
    }
    res.json({ success: true, data: { ...app, documents } });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/admin/inscriptions/:id/decide — verifier | convoquer | refuser | admettre
router.patch('/:id/decide', async (req, res, next) => {
  try {
    const parsed = decideSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Décision invalide.', details: parsed.error.flatten() },
      });
      return;
    }
    const svc = getServiceClient();
    const { data: app, error: getErr } = await svc
      .from('inscription_applications')
      .select('id,status,reference,user_id')
      .eq('id', req.params.id)
      .single();
    if (getErr || !app) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Dossier introuvable.' } });
      return;
    }
    const nextStatus = STATUS_LABEL[parsed.data.action];
    if (!ALLOWED_TRANSITIONS[app.status]?.includes(nextStatus)) {
      res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Transition impossible : ${app.status} → ${nextStatus}.`,
        },
      });
      return;
    }
    const patch: Record<string, unknown> = {
      status: nextStatus,
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.action === 'convoquer') {
      patch.rendez_vous_at = parsed.data.rendez_vous_at;
      patch.rendez_vous_message = parsed.data.rendez_vous_message || '';
    }
    if (parsed.data.action === 'refuser') {
      patch.motif_refus = parsed.data.motif_refus;
    }
    const { data, error } = await svc
      .from('inscription_applications')
      .update(patch)
      .eq('id', app.id)
      .select()
      .single();
    if (error) throw error;
    if (app.user_id) {
      notifyApplicant(app.user_id, app.id, app.reference, parsed.data.action, data).catch((e) =>
        console.warn('[inscriptions] notification échouée:', e?.message ?? e)
      );
    }
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/admin/inscriptions/:id — dossier + fichiers Storage
router.delete('/:id', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { data: docs } = await svc
      .from('inscription_documents')
      .select('file_path')
      .eq('application_id', req.params.id);
    for (const d of docs || []) {
      await removeFile(d.file_path).catch(() => {});
    }
    const { error } = await svc.from('inscription_applications').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
});

// Notifie le candidat en base (cloche) + push système si abonné et opt-in.
// Ne bloque jamais la réponse admin : les erreurs sont loggées.
async function notifyApplicant(
  userId: string,
  applicationId: string,
  reference: string,
  action: string,
  row: any
): Promise<void> {
  const rdv = row.rendez_vous_at
    ? new Date(row.rendez_vous_at).toLocaleString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';
  const texts: Record<string, { title: string; body: string }> = {
    verifie: {
      title: 'Dossier vérifié',
      body: `Votre dossier ${reference} a été vérifié. Prochaine étape : la convocation.`,
    },
    convoque: {
      title: 'Convocation — rendez-vous fixé',
      body: `Rendez-vous ${rdv} (dossier ${reference}).${row.rendez_vous_message ? ' ' + row.rendez_vous_message : ''}`,
    },
    refuse: {
      title: 'Dossier refusé',
      body: `Votre dossier ${reference} a été refusé : ${row.motif_refus || 'contactez le secrétariat.'}`,
    },
    admis: {
      title: 'Admis — bienvenue à IPP La Paix !',
      body: `Votre dossier ${reference} est accepté. Présentez-vous au secrétariat pour finaliser.`,
    },
  };
  const t = texts[action];
  if (!t) return;
  const svc = getServiceClient();
  await svc.from('notifications').insert({
    user_id: userId,
    type: 'system',
    title: t.title,
    message: t.body,
    target_type: 'inscription',
    target_id: applicationId,
  });
  const { data: prefs } = await svc
    .from('notification_preferences')
    .select('system_enabled')
    .eq('user_id', userId)
    .maybeSingle();
  if (prefs && prefs.system_enabled === false) return;
  await sendPushToUsers([userId], {
    title: `IPP — ${t.title}`,
    body: t.body,
    url: '/IPP/espace/suivi-dossier',
    tag: `inscription-${applicationId}`,
  });
}

export default router;
