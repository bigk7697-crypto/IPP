import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, LogIn, Smartphone } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://knmxosdfxxzjagqyhkcc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const API_BASE = import.meta.env.VITE_API_URL || 'https://ipp-2mdf.onrender.com/api';

type Step = 'login' | 'enroll' | 'verify';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@ipp.tg');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('login');
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  async function finishLogin(token: string) {
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
  }

  async function afterSignIn() {
    // Le backend exige aal2 (MFA vérifié) sur /api/admin/*
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal.currentLevel === 'aal2') {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Session non établie');
      await finishLogin(session.access_token);
      return;
    }
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const verified = factors.totp.filter((f) => f.status === 'verified');
    if (verified.length > 0) {
      setFactorId(verified[0].id);
      setStep('verify');
      return;
    }
    // Premier login : enrôlement TOTP (Google Authenticator, etc.)
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) throw error;
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setStep('enroll');
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const captcha = (window as any).__hcaptchaToken as string | undefined;
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captcha ? { captchaToken: captcha } : undefined,
      });
      if (authErr) throw new Error(authErr.message);
      if (!authData.session?.access_token) throw new Error('Session non établie');
      await afterSignIn();
    } catch (err: any) {
      setError(err.message || 'Identifiants administrateur invalides.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
      if (error) throw error;
      if (!data?.access_token) throw new Error('Vérification échouée');
      await finishLogin(data.access_token);
    } catch (err: any) {
      setError(err.message || 'Code invalide. Réessayez.');
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

        {step === 'login' && (
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
        )}

        {step === 'enroll' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Smartphone className="w-8 h-8 mx-auto text-brand-700" />
              <h3 className="font-bold text-slate-900">Activez la double authentification</h3>
              <p className="text-xs text-slate-500">Scannez ce QR avec Google Authenticator / Microsoft Authenticator, puis entrez le code à 6 chiffres.</p>
            </div>
            {qrCode.startsWith('data:') ? (
              <img src={qrCode} alt="QR TOTP" className="w-48 h-48 mx-auto border rounded-xl" />
            ) : (
              <p className="text-xs font-mono bg-slate-100 p-3 rounded-xl break-all text-center">{secret}</p>
            )}
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                required
                inputMode="numeric"
                maxLength={8}
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Code à 6 chiffres"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl disabled:opacity-50">
                {loading ? 'Vérification...' : 'Activer et se connecter'}
              </button>
            </form>
          </div>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="text-center space-y-2">
              <Smartphone className="w-8 h-8 mx-auto text-brand-700" />
              <h3 className="font-bold text-slate-900">Vérification en 2 étapes</h3>
              <p className="text-xs text-slate-500">Entrez le code de votre application d'authentification.</p>
            </div>
            <input
              type="text"
              required
              inputMode="numeric"
              maxLength={8}
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Code à 6 chiffres"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl disabled:opacity-50">
              {loading ? 'Vérification...' : 'Vérifier et se connecter'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
