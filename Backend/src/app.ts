import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRouter from './routes/health.js';
import newsRouter from './routes/news.js';
import eventsRouter from './routes/events.js';
import resultsRouter from './routes/results.js';
import notificationsRouter from './routes/notifications.js';
import authRouter from './routes/auth.js';
import profileRouter from './routes/profile.js';
import preferencesRouter from './routes/preferences.js';
import classesRouter from './routes/classes.js';
import documentsRouter from './routes/documents.js';
import galleryRouter from './routes/gallery.js';
import settingsRouter from './routes/settings.js';
import orientationRouter from './routes/orientation.js';
import inscriptionsRouter from './routes/inscriptions.js';
import adminNewsRouter from './routes/admin.news.js';
import adminEventsRouter from './routes/admin.events.js';
import adminClassesRouter from './routes/admin.classes.js';
import adminDocumentsRouter from './routes/admin.documents.js';
import adminGalleryRouter from './routes/admin.gallery.js';
import adminResultsRouter from './routes/admin.results.js';
import adminSettingsRouter from './routes/admin.settings.js';
import pushRouter from './routes/push.js';
import adminOrientationRouter from './routes/admin.orientation.js';
import adminInscriptionsRouter from './routes/admin.inscriptions.js';
import adminMaintenanceRouter from './routes/admin.maintenance.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(
    cors({
      origin: env.allowedOrigins,
      credentials: true,
    })
  );
  app.use(morgan('dev'));

  // Public / user
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/notification-preferences', preferencesRouter);
  app.use('/api/news', newsRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/classes', classesRouter);
  app.use('/api/documents', documentsRouter);
  app.use('/api/gallery', galleryRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/results', resultsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/push', pushRouter);
  app.use('/api/orientation', orientationRouter);
  app.use('/api/inscriptions', inscriptionsRouter);

  // Admin (auth + role=admin vérifiés côté serveur)
  app.use('/api/admin/news', adminNewsRouter);
  app.use('/api/admin/events', adminEventsRouter);
  app.use('/api/admin/classes', adminClassesRouter);
  app.use('/api/admin/documents', adminDocumentsRouter);
  app.use('/api/admin/gallery', adminGalleryRouter);
  app.use('/api/admin/results', adminResultsRouter);
  app.use('/api/admin/settings', adminSettingsRouter);
  app.use('/api/admin/orientation', adminOrientationRouter);
  app.use('/api/admin/inscriptions', adminInscriptionsRouter);
  app.use('/api/admin/maintenance', adminMaintenanceRouter);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Ressource introuvable.' },
    });
  });

  app.use(errorHandler);
  return app;
}
