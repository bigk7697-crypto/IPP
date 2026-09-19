import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, LogIn } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://knmxosdfxxzjagqyhkcc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const API_BASE = import.meta.env.VITE_API_URL || 'https://ipp-backend.onrender.com/api';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@ecole.com');
  const [password, setPassword] = useState('adminsecure2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw new Error(authErr.message);

      const token = authData.session?.access_token;
      if (!token) throw new Error('Session non établie');

      // Verify admin role via backend /api/auth/me
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      const user = json.data || json;

      if (!user || user.role !== 'admin') {
        throw new Error('Accès refusé : ce compte ne possède pas les privilèges administrateur.');
      }

      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      localStorage.setItem('admin_logged', 'true');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Identifiants administrateur invalides.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl shadow-2xl space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-brand-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-brand-900/30">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Administration V1</h2>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Portail Gouvernance & Établissement</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email Administrateur</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl shadow-lg shadow-brand-900/30 transition-all disabled:opacity-50"
          >
            <LogIn className="w-4 h-4 text-amber-400" />
            <span>{loading ? 'Vérification...' : 'Accéder à l’Administration'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
