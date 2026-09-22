import React from 'react';
import { Outlet, Navigate, NavLink, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { PushPrompt } from '../components/PushPrompt';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { LayoutDashboard, FileSpreadsheet, Bell, Calendar, User, Settings, ClipboardList, FileText, GraduationCap, ArrowLeft } from 'lucide-react';

export const UserLayout: React.FC = () => {
  const { user, isLoading } = useAuthStore();
  const { notifications } = useNotificationStore();
  const unread = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  const tabs = [
    { name: 'Accueil', path: '/espace/dashboard', icon: LayoutDashboard },
    { name: 'Résultats', path: '/espace/resultats', icon: FileSpreadsheet },
    { name: 'Notifs', path: '/espace/notifications', icon: Bell, badge: unread },
    { name: 'Calendrier', path: '/espace/calendrier', icon: Calendar },
    { name: 'Inscription', path: '/espace/pre-inscription', icon: ClipboardList },
    { name: 'Suivi', path: '/espace/suivi-dossier', icon: FileText },
    { name: 'Profil', path: '/espace/profil', icon: User },
    { name: 'Paramètres', path: '/espace/parametres', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <div className="hidden md:block">
        <Navbar />
      </div>
      {/* Barre haute mobile : logo + retour au site (la navbar est cachée sur mobile) */}
      <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center text-white">
            <GraduationCap className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xs font-extrabold text-slate-900 tracking-tight">IPP LA PAIX</span>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Site</span>
        </Link>
      </div>
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto pb-20 md:pb-10">
          <PushPrompt />
          <Outlet />
        </main>
      </div>
      {/* Bottom nav mobile - méthode 2 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-1.5 z-30">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <NavLink
              key={t.path}
              to={t.path}
              className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold ${isActive ? 'text-brand-700 bg-brand-50' : 'text-slate-500'}`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{t.badge}</span>
                )}
              </div>
              <span>{t.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
