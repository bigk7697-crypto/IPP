import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X, User, Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { notifications } = useNotificationStore();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'L’Institut', path: '/ecole' },
    { name: 'Formations & Filières', path: '/formations' },
    { name: 'Orientation', path: '/orientation' },
    { name: 'Actualités', path: '/actualites' },
    { name: 'Événements', path: '/evenements' },
    { name: 'Galerie', path: '/galerie' },
    { name: 'Documents', path: '/documents' },
    { name: 'Calendrier', path: '/calendrier' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-brand-900 rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-900/20">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight block">IPP LA PAIX</span>
              <span className="text-[10px] text-brand-700 uppercase tracking-widest font-bold">Institut Polytechnique</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-brand-900 hover:bg-slate-50 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action / Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/espace/notifications"
                  className="relative p-2 text-slate-600 hover:text-brand-900 rounded-full hover:bg-slate-100 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/espace/dashboard"
                  title={`Mon espace (${user.first_name})`}
                  className="block rounded-full ring-2 ring-brand-100 hover:ring-brand-400 transition"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.first_name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-brand-900 text-white flex items-center justify-center text-xs font-extrabold">
                      {(user.first_name?.[0] || '') + (user.last_name?.[0] || '') || <User className="w-4 h-4" />}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Se déconnecter"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/connexion"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-900 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-900 hover:bg-brand-950 rounded-xl shadow-sm transition-all shadow-brand-900/20"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            {user && (
              <Link
                to="/espace/notifications"
                className="relative p-2 text-slate-600"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-900"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to="/espace/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 bg-brand-50 text-brand-900 font-medium rounded-xl"
                >
                  Mon Espace ({user.first_name})
                </Link>
                <button
                  onClick={() => { logout(); setIsOpen(false); navigate('/'); }}
                  className="w-full py-2.5 text-center text-red-600 font-medium rounded-xl hover:bg-red-50"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/connexion"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl"
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 bg-brand-900 text-white font-medium rounded-xl shadow-sm"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
