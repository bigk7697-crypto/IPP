import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Mail, Lock, LogIn, Award, Wrench, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { detectFetchTampering } from '../../utils/envCheck';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tampered, setTampered] = useState<string[]>([]);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  useEffect(() => {
    const offenders = detectFetchTampering();
    setTampered(offenders);
    if (offenders.length > 0) {
      console.warn('[IPP] réseau navigateur modifié par un tiers :', offenders.join(', '));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/espace/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans text-slate-900">
      {/* Left Banner */}
      <div className="hidden md:flex md:w-1/2 bg-brand-900 text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
            <GraduationCap className="w-6 h-6 text-amber-400" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">IPP LA PAIX</span>
        </div>

        <div className="relative z-10 space-y-8 max-w-lg my-auto">
          <blockquote className="space-y-4">
            <p className="text-2xl lg:text-3xl font-serif italic font-medium leading-relaxed text-slate-100">
              "L'éducation est l'arme la plus puissante qu'on puisse utiliser pour changer le monde."
            </p>
            <footer className="text-sm font-medium text-slate-400">
              — Nelson Mandela
            </footer>
          </blockquote>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="bg-brand-950/60 border border-white/10 p-4 rounded-2xl space-y-2 backdrop-blur-sm">
              <Award className="w-5 h-5 text-amber-400" />
              <p className="text-xs font-bold text-white">Excellence</p>
              <p className="text-[11px] text-slate-400">Formations générales et techniques de pointe</p>
            </div>
            <div className="bg-brand-950/60 border border-white/10 p-4 rounded-2xl space-y-2 backdrop-blur-sm">
              <Wrench className="w-5 h-5 text-amber-400" />
              <p className="text-xs font-bold text-white">Pratique</p>
              <p className="text-[11px] text-slate-400">Ateliers spécialisés et laboratoires modernes</p>
            </div>
            <div className="bg-brand-950/60 border border-white/10 p-4 rounded-2xl space-y-2 backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <p className="text-xs font-bold text-white">Sécurité</p>
              <p className="text-[11px] text-slate-400">Espace numérique et suivi personnalisé</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          © 2026 Institut Polytechnique LA PAIX. Tous droits réservés.
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-white">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au site</span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto space-y-8 my-auto py-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Connexion</h2>
            <p className="text-sm text-slate-500">Rejoignez la communauté IPP LA PAIX</p>
          </div>

          {tampered.length > 0 && (
            <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
              Une extension modifie vos requêtes réseau ({tampered.join(', ')} non natif).
              Si la connexion échoue, désactivez vos extensions ou essayez une fenêtre de navigation privée.
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-900 text-slate-900 shadow-sm"
                placeholder="vous@exemple.fr"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
                <Link to="/mot-de-passe-oublie" className="text-xs font-semibold text-brand-800 hover:underline">Mot de passe oublié ?</Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-900 text-slate-900 shadow-sm"
                placeholder="8 caractères minimum"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl shadow-lg shadow-brand-900/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div className="text-center text-sm text-slate-600 pt-2">
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="font-semibold text-brand-900 hover:underline">S'inscrire</Link>
          </div>
        </div>

        <div className="text-right">
          <button className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center shadow">
            ?
          </button>
        </div>
      </div>
    </div>
  );
};
