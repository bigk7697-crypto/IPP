import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { PublicLayout } from './layouts/PublicLayout';
import { UserLayout } from './layouts/UserLayout';

import { Home } from './pages/public/Home';
import { School } from './pages/public/School';
import { Formations } from './pages/public/Formations';
import { NewsList } from './pages/public/NewsList';
import { NewsDetail } from './pages/public/NewsDetail';
import { EventsList } from './pages/public/EventsList';
import { EventDetail } from './pages/public/EventDetail';
import { Gallery } from './pages/public/Gallery';
import { Documents } from './pages/public/Documents';
import { Calendar } from './pages/public/Calendar';
import { Contact } from './pages/public/Contact';
import { Orientation } from './pages/public/Orientation';
import { OrientationWidget } from './components/OrientationWidget';
import { PreInscription } from './pages/public/PreInscription';
import { SuiviDossier } from './pages/public/SuiviDossier';

import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

import { UserDashboard } from './pages/user/UserDashboard';
import { Results } from './pages/user/Results';
import { Notifications } from './pages/user/Notifications';
import { Profile } from './pages/user/Profile';
import { Settings } from './pages/user/Settings';

import { useAuthStore } from './store/authStore';
import { useNotificationStore } from './store/notificationStore';

export function App() {
  const initAuth = useAuthStore(state => state.initAuth);
  const fetchNotifications = useNotificationStore(state => state.fetchNotifications);

  useEffect(() => {
    initAuth();
    // Pas de polling notifications pour les visiteurs déconnectés
    // (évite les 401 en boucle sur /connexion et /inscription).
    const hasSession = () => !!localStorage.getItem('school_token');
    if (hasSession()) fetchNotifications().catch(() => {});
    const id = setInterval(() => {
      if (hasSession()) fetchNotifications().catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, []);

  const basename = import.meta.env.PROD ? '/IPP' : undefined;
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* Standalone Auth Routes (No Navbar / Footer) */}
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Register />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/reinitialisation" element={<ResetPassword />} />

        {/* Public Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/ecole" element={<School />} />
          <Route path="/formations" element={<Formations />} />
          <Route path="/actualites" element={<NewsList />} />
          <Route path="/actualites/:id" element={<NewsDetail />} />
          <Route path="/evenements" element={<EventsList />} />
          <Route path="/evenements/:id" element={<EventDetail />} />
          <Route path="/galerie" element={<Gallery />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/calendrier" element={<Calendar />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/orientation" element={<Orientation />} />
          {/* Anciennes URLs publiques → espace connecté (compte requis) */}
          <Route path="/pre-inscription" element={<Navigate to="/espace/pre-inscription" replace />} />
          <Route path="/suivi-dossier" element={<Navigate to="/espace/suivi-dossier" replace />} />
        </Route>

        {/* User Space Routes */}
        <Route element={<UserLayout />}>
          <Route path="/espace/dashboard" element={<UserDashboard />} />
          <Route path="/espace/resultats" element={<Results />} />
          <Route path="/espace/notifications" element={<Notifications />} />
          <Route path="/espace/calendrier" element={<Calendar />} />
          <Route path="/espace/profil" element={<Profile />} />
          <Route path="/espace/parametres" element={<Settings />} />
          <Route path="/espace/pre-inscription" element={<PreInscription />} />
          <Route path="/espace/suivi-dossier" element={<SuiviDossier />} />
        </Route>
      </Routes>
      <OrientationWidget />
    </BrowserRouter>
  );
}

export default App;
