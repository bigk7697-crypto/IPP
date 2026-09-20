import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileSpreadsheet, Bell, Calendar, User, Settings, LogOut, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

export const Sidebar: React.FC<{ mobileOpen?: boolean; onClose?: () => void }> = ({ mobileOpen = false, onClose }) => {
  const { user, logout } = useAuthStore();
  const { notifications } = useNotificationStore();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const links = [
    { name: 'Tableau de bord', path: '/espace/dashboard', icon: LayoutDashboard },
    { name: 'Résultats', path: '/espace/resultats', icon: FileSpreadsheet },
    { name: 'Notifications', path: '/espace/notifications', icon: Bell, badge: unreadCount },
    { name: 'Calendrier', path: '/espace/calendrier', icon: Calendar },
    { name: 'Profil', path: '/espace/profil', icon: User },
    { name: 'Paramètres', path: '/espace/parametres', icon: Settings },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    onClose?.();
  };

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && <div className="fixed inset-0 bg-slate-900/40 z-30 md:hidden" onClick={onClose} />}
      <aside className={`w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-5rem)] flex flex-col justify-between 
        ${mobileOpen ? 'fixed inset-y-0 left-0 z-40 flex md:static' : 'hidden md:flex'}`}>
      <div>
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 block">Espace Élève / Parent</span>
            <span className="text-xs text-emerald-600 font-medium">● Connecté</span>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `
                  flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-brand-50 text-brand-700 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </div>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="mb-4 px-3 py-2 bg-slate-50 rounded-xl">
          <p className="text-xs text-slate-500">Connecté en tant que</p>
          <p className="text-sm font-semibold text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
    </>
  );
};
