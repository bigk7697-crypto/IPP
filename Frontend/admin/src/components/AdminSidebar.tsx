import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Newspaper, Calendar, FileSpreadsheet, FolderOpen, Image, Users, Settings, LogOut, ShieldCheck, Sun, Moon } from 'lucide-react';

interface AdminSidebarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Actualités', path: '/news', icon: Newspaper },
    { name: 'Événements', path: '/events', icon: Calendar },
    { name: 'Résultats', path: '/results', icon: FileSpreadsheet },
    { name: 'Documents', path: '/documents', icon: FolderOpen },
    { name: 'Galerie', path: '/gallery', icon: Image },
    { name: 'Classes', path: '/classes', icon: Users },
    { name: 'Paramètres', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_logged');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  return (
    <aside className={`w-64 min-h-screen flex flex-col justify-between transition-colors duration-200 ${
      darkMode ? 'bg-slate-900 border-r border-slate-800 text-slate-200' : 'bg-white border-r border-slate-200 text-slate-700 shadow-sm'
    }`}>
      <div>
        <div className={`p-6 border-b flex items-center gap-3 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="w-10 h-10 bg-brand-900 text-white rounded-xl flex items-center justify-center shadow-md shadow-brand-900/20">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className={`text-sm font-bold block ${darkMode ? 'text-white' : 'text-slate-900'}`}>Administration V1</span>
            <span className="text-xs text-brand-600 font-medium">Portail Officiel</span>
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
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${isActive 
                    ? (darkMode ? 'bg-brand-900/40 text-brand-300 font-semibold border border-brand-700/50' : 'bg-brand-50 text-brand-900 font-semibold border border-brand-100') 
                    : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')}
                `}
              >
                <Icon className={`w-5 h-5 ${darkMode ? 'text-brand-400' : 'text-brand-700'}`} />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className={`p-4 border-t space-y-3 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            darkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span className="flex items-center gap-2">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{darkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-mono">
            {darkMode ? 'Dark' : 'Light'}
          </span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion Admin</span>
        </button>
      </div>
    </aside>
  );
};
