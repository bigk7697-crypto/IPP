import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminBottomNav } from '../components/AdminBottomNav';
import { adminService } from '../services/admin.service';
import { supabase } from '../services/supabaseClient';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ipp-2mdf.onrender.com/api';

export const AdminLayout: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('admin_dark') === 'true';
  });
  const [unseenInscriptions, setUnseenInscriptions] = useState(0);
  const navigate = useNavigate();

  // Compteur dossiers non vus : partagé entre sidebar (desktop) et barre du bas (mobile).
  useEffect(() => {
    if (!isAuthenticated) return;
    let alive = true;
    const load = async () => {
      try {
        const c = await adminService.getInscriptionCounts();
        if (alive) setUnseenInscriptions(c.unseen);
      } catch {
        // silencieux (token expiré => redirection login déjà gérée)
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => { alive = false; clearInterval(id); };
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('admin_dark', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    async function verifyAdmin() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token || localStorage.getItem('admin_token');

        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        const user = json.data || json;

        if (res.ok && user && user.role === 'admin') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          localStorage.removeItem('admin_logged');
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    verifyAdmin();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-200 ${
      darkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="hidden md:block">
        <AdminSidebar darkMode={darkMode} setDarkMode={setDarkMode} unseen={unseenInscriptions} />
      </div>
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto pb-24 md:pb-8">
        <Outlet />
      </main>
      <AdminBottomNav darkMode={darkMode} unseen={unseenInscriptions} />
    </div>
  );
};
