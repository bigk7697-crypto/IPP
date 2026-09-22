import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, CheckCircle2, Copy, ArrowRight, LogIn } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { inscriptionService, NIVEAUX } from '../../services/inscription.service';
import { orientationService, OrientationTopic } from '../../services/orientation.service';

const ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp';
const MAX_FILES = 6;

export const PreInscription: React.FC = () => {
  const { user, isLoading } = useAuthStore();
  const [filieres, setFilieres] = useState<OrientationTopic[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [niveau, setNiveau] = useState('Seconde');
  const [filiere, setFiliere] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    orientationService.getTopics('filieres').then(setFilieres).catch(() => {});
  }, []);

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const kept = [...files, ...Array.from(list)].slice(0, MAX_FILES);
    setFiles(kept);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length < 1) {
      setError('Joignez au moins une pièce (acte de naissance, bulletins, photo…).');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('first_name', firstName);
      form.append('last_name', lastName);
      if (birthDate) form.append('birth_date', birthDate);
      form.append('email', email);
      form.append('phone', phone);
      form.append('parent_name', parentName);
      form.append('niveau', niveau);
      if (filiere) form.append('filiere_slug', filiere);
      if (message) form.append('message', message);
      files.forEach((f) => form.append('pieces', f));
      const res = await inscriptionService.submit(form);
      setReference(res.reference);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Envoi impossible. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // presse-papiers indisponible : la référence reste affichée
    }
  };

  if (!isLoading && !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <LogIn className="w-12 h-12 text-brand-700 mx-auto" />
        <h1 className="text-3xl font-extrabold text-slate-900">Connectez-vous pour déposer un dossier</h1>
        <p className="text-slate-600 text-sm">La pré-inscription en ligne nécessite un compte : votre dossier y sera lié et vous recevrez une notification du site à chaque étape (vérification, convocation).</p>
        <div className="flex justify-center gap-3">
          <Link to="/connexion" className="px-6 py-3 bg-brand-900 hover:bg-brand-950 text-white text-sm font-bold rounded-2xl transition-colors">Se connecter</Link>
          <Link to="/inscription" className="px-6 py-3 bg-white border border-slate-200 hover:border-brand-400 text-slate-800 text-sm font-bold rounded-2xl transition-colors">Créer un compte</Link>
        </div>
      </div>
    );
  }

  if (reference) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-6 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
        <h1 className="text-3xl font-extrabold text-slate-900">Dossier envoyé !</h1>
        <p className="text-slate-600">Gardez précieusement cette référence — elle permet de suivre votre dossier sans compte :</p>
        <div className="bg-brand-900 text-white rounded-3xl p-8 space-y-3">
          <p className="text-xs uppercase tracking-widest text-slate-300">Référence dossier</p>
          <p className="text-3xl font-extrabold tracking-wider">{reference}</p>
          <button onClick={copyRef} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors">
            <Copy className="w-4 h-4" /> {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>
        <p className="text-sm text-slate-500">Le secrétariat vérifie les pièces puis vous convoque. Vous recevrez une notification du site à chaque étape.</p>
        <Link to="/suivi-dossier" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-900 hover:bg-brand-950 text-white text-sm font-bold rounded-2xl transition-colors">
          Suivre mon dossier <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const inputCls = 'w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-900 text-slate-900 shadow-sm';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-900 text-xs font-bold tracking-wide uppercase border border-brand-100">
          Rentrée — dossier 100 % en ligne
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Pré-inscription</h1>
        <p className="text-slate-600">Déposez le dossier, recevez une référence, suivez la vérification puis la convocation.</p>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-5">
        <h2 className="font-bold text-slate-900">1. L’élève</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom de l’élève" className={inputCls} />
          <input required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom de l’élève" className={inputCls} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Date de naissance</label>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Niveau demandé</label>
            <select value={niveau} onChange={(e) => setNiveau(e.target.value)} className={inputCls}>
              {NIVEAUX.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">Filière souhaitée (optionnel)</label>
          <select value={filiere} onChange={(e) => setFiliere(e.target.value)} className={inputCls}>
            <option value="">— Indifférent / à orienter —</option>
            {filieres.map((f) => <option key={f.slug} value={f.slug}>{f.title}</option>)}
          </select>
        </div>

        <h2 className="font-bold text-slate-900 pt-2">2. Parent / tuteur</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <input required value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="Nom du parent / tuteur" className={inputCls} />
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone (+228 …)" className={inputCls} />
        </div>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (convocation envoyée ici)" className={inputCls} />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message au secrétariat (optionnel)" rows={3} className={inputCls}></textarea>

        <h2 className="font-bold text-slate-900 pt-2">3. Pièces (PDF ou images, max {MAX_FILES})</h2>
        <label className="flex flex-col items-center gap-2 p-8 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-brand-500 hover:bg-brand-50/50 transition-colors">
          <UploadCloud className="w-8 h-8 text-brand-700" />
          <span className="text-sm font-semibold text-slate-700">Acte de naissance, bulletins, photo…</span>
          <span className="text-xs text-slate-400">Cliquez pour ajouter ({files.length}/{MAX_FILES})</span>
          <input type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => onFiles(e.target.files)} />
        </label>
        {files.length > 0 && (
          <ul className="space-y-1">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <span className="font-semibold text-slate-700 truncate">{f.name}</span>
                <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-red-600 font-bold ml-2">Retirer</button>
              </li>
            ))}
          </ul>
        )}

        <button type="submit" disabled={loading} className="w-full py-3.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50">
          {loading ? 'Envoi en cours…' : 'Envoyer mon dossier'}
        </button>
        <p className="text-xs text-slate-400 text-center">En envoyant, vous recevrez une référence de suivi. Réponse du secrétariat après vérification.</p>
      </form>
    </div>
  );
};
