import 'dotenv/config';
import { env } from './config/env.js';
import { createApp } from './app.js';
import { INACTIVE_DAYS, purgeInactiveUsers } from './services/maintenance.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(`[backend] listening on :${env.port}`);
});

// Purge auto des comptes inactifs (60+ jours, hors admins) :
// un passage 90 s après le démarrage, puis toutes les 24 h.
// (Sur hébergeur gratuit l'instance dort/redémarre : chaque réveil repurge,
// ce qui suffit amplement pour une tâche de ménage non urgente.)
async function runPurge(source: string) {
  try {
    const r = await purgeInactiveUsers();
    console.log(
      `[maintenance:${source}] inactifs ${INACTIVE_DAYS}j+ : ${r.deleted} supprimés / ${r.checked} vérifiés / ${r.skippedAdmins} admins épargnés` +
        (r.errors.length ? ` / erreurs: ${r.errors.join(' | ')}` : '')
    );
  } catch (e: any) {
    console.warn('[maintenance] purge échouée:', e?.message ?? e);
  }
}

setTimeout(() => runPurge('boot'), 90_000);
setInterval(() => runPurge('daily'), 24 * 3600 * 1000);
