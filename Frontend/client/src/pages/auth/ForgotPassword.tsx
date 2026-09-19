import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reinitialisation',
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l’envoi de l’e-mail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-brand-900/30">
            <GraduationCap className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Mot de passe oublié</h2>
          <p className="text-sm text-slate-500">Entrez votre email pour recevoir les instructions de réinitialisation</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="space-y-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <p className="text-sm text-slate-600">
              Un e-mail contenant un lien de réinitialisation a été envoyé à <strong>{email}</strong> via Supabase Auth.
            </p>
            <Link to="/connexion" className="block w-full py-3 bg-brand-900 text-white font-semibold rounded-xl text-center">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Adresse e-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-900"
                  placeholder="votre.email@ipp.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl shadow-lg shadow-brand-900/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
            </button>
          </form>
        )}

        <div className="text-center pt-4 border-t border-slate-100">
          <Link to="/connexion" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-900">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à la connexion</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
