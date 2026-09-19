import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, UserPlus, Award, Wrench, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const registerUser = useAuthStore(state => state.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await registerUser({ first_name: firstName, last_name: lastName, email, password });
      navigate('/espace/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l’inscription');
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
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Créer un compte</h2>
            <p className="text-sm text-slate-500">Rejoignez la communauté IPP LA PAIX</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Prénom</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-900 text-slate-900 shadow-sm"
                  placeholder="Jean"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nom</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-900 text-slate-900 shadow-sm"
                  placeholder="Dupont"
                />
              </div>
            </div>

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
              <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
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
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="text-center text-sm text-slate-600 pt-2">
            Déjà un compte ?{' '}
            <Link to="/connexion" className="font-semibold text-brand-900 hover:underline">Se connecter</Link>
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
