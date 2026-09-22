import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Newspaper, Calendar, FileSpreadsheet, FolderOpen,
  Image, Users, Compass, ClipboardList, Settings, LogOut,
} from 'lucide-react';

interface Props {
  darkMode: boolean;
  unseen: number;
}

const TABS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Actus', path: '/news', icon: Newspaper },
  { name: 'Events', path: '/events', icon: Calendar },
  { name: 'Résultats', path: '/results', icon: FileSpreadsheet },
  { name: 'Docs', path: '/documents', icon: FolderOpen },
  { name: 'Galerie', path: '/gallery', icon: Image },
  { name: 'Classes', path: '/classes', icon: Users },
  { name: 'Orient.', path: '/orientation', icon: Compass },
  { name: 'Inscrip.', path: '/inscriptions', icon: ClipboardList },
  { name: 'Réglages', path: '/settings', icon: Settings },
];

// Barre du bas façon app mobile : reprend TOUS les liens de la sidebar
// (défilement horizontal) + badge rouge des dossiers non vus + déconnexion.
export const AdminBottomNav: React.FC<Props> = ({ darkMode, unseen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_logged');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-30 border-t flex items-stretch overflow-x-auto py-1.5 px-2 gap-0.5 ${
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {TABS.map((t) => {
        const Icon = t.icon;
        const showBadge = t.path === '/inscriptions' && unseen > 0;
        return (
          <NavLink
            key={t.path}
            to={t.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[9px] font-semibold min-w-[54px] shrink-0 ${
                isActive
                  ? 'text-amber-500 bg-amber-500/10'
                  : darkMode ? 'text-slate-400' : 'text-slate-500'
              }`
            }
          >
            <span className="relative">
              <Icon className="w-5 h-5" />
              {showBadge && (
                <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {unseen}
                </span>
              )}
            </span>
            <span className="whitespace-nowrap">{t.name}</span>
          </NavLink>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[9px] font-semibold min-w-[54px] shrink-0 text-red-500"
        title="Déconnexion"
      >
        <LogOut className="w-5 h-5" />
        <span className="whitespace-nowrap">Quitter</span>
      </button>
    </nav>
  );
};
