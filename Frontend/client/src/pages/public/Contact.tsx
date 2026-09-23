import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Navigation, ExternalLink, Clock } from 'lucide-react';

const IPP_LAT = 6.2208914;
const IPP_LNG = 1.1994968;
const MAPS_EMBED = `https://www.google.com/maps?q=${IPP_LAT},${IPP_LNG}&z=18&output=embed`;
const MAPS_PLACE = 'https://www.google.com/maps/place/INSTITUT+POLYTECHNIQUE+%22LA+PAIX%22/@6.2209306,1.1991094,115m';
const MAPS_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${IPP_LAT},${IPP_LNG}`;

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || message.length < 10) {
      setError('Veuillez remplir tous les champs correctement (message minimum 10 caractères).');
      return;
    }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Contactez l'Établissement</h1>
        <p className="text-lg text-slate-600">
          Notre équipe administrative est à votre disposition pour répondre à toutes vos questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Info Box */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Informations Pratiques</h3>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <span>Rue BKS, en face de l'Auberge Bar Restaurant "LE PRINCE", B.P. 10085, Agoè-Nyivé – Lomé, Togo</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-400 shrink-0" />
                <span>+228 90 12 47 93 / 93 13 95 58</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-400 shrink-0" />
                <span>contact@saintexupery.edu</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-800 rounded-2xl text-xs text-slate-400">
            Horaires d'ouverture du secrétariat : Lundi au Vendredi de 07h30 à 17h30.
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          {submitted ? (
            <div className="py-16 text-center space-y-4 animate-fadeIn">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
              <h3 className="text-2xl font-bold text-slate-900">Message envoyé avec succès !</h3>
              <p className="text-slate-600">Notre équipe vous répondra dans les plus brefs délais.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nom complet</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Adresse e-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="jean@exemple.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Sujet de votre demande</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Ex: Renseignements inscriptions 2026"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Votre message</label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Écrivez votre message ici..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Envoi en cours...' : 'Envoyer le message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Nous trouver */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-900 text-xs font-bold tracking-wide uppercase border border-brand-100">
            Nous trouver
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Venez nous rencontrer</h2>
          <p className="text-slate-600">Rue BKS, en face de l'Auberge Bar Restaurant « LE PRINCE », Agoè-Nyivé – Lomé.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          <div className="lg:col-span-2 bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between gap-8">
            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Adresse</p>
                  <p className="text-slate-300">Rue BKS, en face de l'Auberge Bar Restaurant « LE PRINCE », B.P. 10085, Agoè-Nyivé – Lomé, Togo</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Téléphones</p>
                  <p>
                    <a href="tel:+22890124793" className="text-slate-300 hover:text-white transition-colors">+228 90 12 47 93</a>
                    <span className="text-slate-500"> / </span>
                    <a href="tel:+22893139558" className="text-slate-300 hover:text-white transition-colors">93 13 95 58</a>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Horaires</p>
                  <p className="text-slate-300">Lun – Ven : 07h30 – 17h30 • Sam : 08h00 – 12h00</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <a
                href={MAPS_DIRECTIONS}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-brand-950 text-sm font-bold rounded-2xl transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>Itinéraire</span>
              </a>
              <a
                href={MAPS_PLACE}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-2xl border border-white/20 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Voir sur Google Maps</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-3 rounded-3xl overflow-hidden border border-slate-200 shadow-sm min-h-[380px]">
            <iframe
              title="Carte — IPP La Paix, Agoè-Nyivé"
              src={MAPS_EMBED}
              className="w-full h-full min-h-[380px] grayscale-[15%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
};
