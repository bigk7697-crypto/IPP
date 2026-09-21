import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Compass, MessageCircle, LayoutGrid, ArrowLeft, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import { orientationService, searchTopics, OrientationTopic } from '../../services/orientation.service';
import { QUIZ_QUESTIONS, scoreQuiz } from '../../data/orientationQuiz';

type Tab = 'quiz' | 'assistant' | 'filieres';

const FALLBACK_TITLES: Record<string, string> = {
  a4: 'Série A4', d: 'Série D', f2: 'Série F2', f3: 'Série F3', f4: 'Série F4',
  g1: 'Série G1', g2: 'Série G2', g3: 'Série G3',
  'cap-maconnerie': 'CAP Maçonnerie', 'cap-electricite': 'CAP Électricité',
};

export const Orientation: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'assistant' || params.get('tab') === 'filieres' ? (params.get('tab') as Tab) : 'quiz';
  const setTab = (t: Tab) => setParams(t === 'quiz' ? {} : { tab: t });

  const [topics, setTopics] = useState<OrientationTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orientationService.getTopics().then((t) => { setTopics(t); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const bySlug = useMemo(() => {
    const m: Record<string, OrientationTopic> = {};
    for (const t of topics) m[t.slug] = t;
    return m;
  }, [topics]);

  const filieres = useMemo(() => topics.filter((t) => t.category === 'filieres'), [topics]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <span className="px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-900 text-xs font-bold tracking-wide uppercase border border-brand-100">
          Orientation — sans compte, gratuit
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Trouve ta voie à IPP La Paix</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">Quiz de 2 minutes, assistant qui répond à tes questions, et fiches détaillées de nos 10 formations.</p>
      </div>

      <div className="flex justify-center gap-2">
        {([
          { id: 'quiz', label: 'Quiz (2 min)', icon: Compass },
          { id: 'assistant', label: 'Assistant', icon: MessageCircle },
          { id: 'filieres', label: 'Filières', icon: LayoutGrid },
        ] as { id: Tab; label: string; icon: any }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-colors ${
              tab === t.id ? 'bg-brand-900 text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {tab === 'quiz' && <QuizBlock bySlug={bySlug} />}
          {tab === 'assistant' && <AssistantBlock topics={topics} />}
          {tab === 'filieres' && <FilieresBlock filieres={filieres} />}
        </>
      )}
    </div>
  );
};

// ---------------- Quiz ----------------
function QuizBlock({ bySlug }: { bySlug: Record<string, OrientationTopic> }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  const results = useMemo(() => (done ? scoreQuiz(answers) : []), [done, answers]);
  const q = QUIZ_QUESTIONS[step];

  const choose = (optIdx: number) => {
    const next = { ...answers, [q.id]: optIdx };
    setAnswers(next);
    if (step + 1 >= QUIZ_QUESTIONS.length) {
      setDone(true);
    } else {
      setStep(step + 1);
    }
  };

  const reset = () => { setStep(0); setAnswers({}); setDone(false); };

  // Si une filière CAP gagne, on affiche les deux fiches CAP.
  const slugsToShow = useMemo(() => {
    const out: string[] = [];
    for (const r of results) {
      out.push(r.slug);
      if (r.slug === 'cap-maconnerie' && !out.includes('cap-electricite')) out.push('cap-electricite');
      if (r.slug === 'cap-electricite' && !out.includes('cap-maconnerie')) out.push('cap-maconnerie');
    }
    return out.slice(0, 3);
  }, [results]);

  if (done) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-3xl p-6 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
          <h2 className="text-2xl font-extrabold text-slate-900">Ton profil est prêt !</h2>
          <p className="text-sm text-slate-600">Voici les filières qui te correspondent le mieux :</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {slugsToShow.map((slug, i) => {
            const t = bySlug[slug];
            return (
              <div key={slug} className={`bg-white rounded-3xl border-2 p-6 space-y-3 ${i === 0 ? 'border-brand-600 shadow-lg' : 'border-slate-200'}`}>
                {i === 0 && <span className="text-xs font-bold text-white bg-brand-600 px-3 py-1 rounded-full">N°1 — Idéal pour toi</span>}
                <h3 className="text-lg font-extrabold text-slate-900">{t ? t.title : FALLBACK_TITLES[slug] || slug}</h3>
                <p className="text-sm text-slate-600 whitespace-pre-line line-clamp-6">{t ? t.content : 'Fiche en cours de rédaction — demande au secrétariat.'}</p>
                <div className="flex gap-2 pt-1">
                  <Link to="/formations" className="text-xs font-bold text-brand-800 hover:underline">Voir les formations</Link>
                  <Link to="/inscription" className="text-xs font-bold text-brand-800 hover:underline">Se pré-inscrire →</Link>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center">
          <button onClick={reset} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-2xl transition-colors">
            <RotateCcw className="w-4 h-4" /> Refaire le quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
      <div className="flex gap-1.5">
        {QUIZ_QUESTIONS.map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-slate-200'}`}></div>
        ))}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase">Question {step + 1} / {QUIZ_QUESTIONS.length}</p>
      <h2 className="text-xl font-extrabold text-slate-900">{q.text}</h2>
      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => choose(i)}
            className="w-full text-left px-5 py-3.5 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 rounded-2xl text-sm font-semibold text-slate-800 transition-colors"
          >
            {opt.label}
          </button>
        ))}
      </div>
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour
        </button>
      )}
    </div>
  );
}

// ---------------- Assistant ----------------
function AssistantBlock({ topics }: { topics: OrientationTopic[] }) {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<OrientationTopic[] | null>(null);
  const loggedRef = useRef<Set<string>>(new Set());

  const ask = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const found = searchTopics(topics, q);
    setHits(found);
    if (found.length === 0 && !loggedRef.current.has(q.toLowerCase())) {
      loggedRef.current.add(q.toLowerCase());
      orientationService.logUnanswered(q, 'assistant');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); ask(query); }} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex : frais en F2, pièces du dossier, contact…"
          className="flex-1 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-900 shadow-sm"
        />
        <button type="submit" className="px-6 py-3.5 bg-brand-900 hover:bg-brand-950 text-white text-sm font-bold rounded-2xl transition-colors">
          Chercher
        </button>
      </form>
      {hits !== null && hits.length === 0 && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800 space-y-1">
          <p className="font-bold">Je n’ai pas encore la réponse.</p>
          <p>Ta question a été transmise à l’équipe. En attendant, contacte le secrétariat ou fais le quiz.</p>
        </div>
      )}
      {(hits || []).slice(0, 4).map((t) => (
        <div key={t.slug} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <p className="text-xs font-bold uppercase text-brand-700">{t.category === 'filieres' ? 'Filière' : 'Info pratique'}</p>
          <h3 className="font-extrabold text-slate-900">{t.title}</h3>
          <p className="text-sm text-slate-600 whitespace-pre-line">{t.content}</p>
        </div>
      ))}
      {hits === null && (
        <div className="flex flex-wrap gap-2 justify-center pt-2">
          {['frais de scolarité', 'inscription BEPC', 'contact', 'examens BAC', 'CAP'].map((s) => (
            <button key={s} onClick={() => { setQuery(s); ask(s); }} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700 hover:border-brand-400 hover:text-brand-900">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- Filières ----------------
function FilieresBlock({ filieres }: { filieres: OrientationTopic[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (filieres.length === 0) {
    return <p className="text-center text-sm text-slate-500 py-10">Fiches en cours de publication.</p>;
  }
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {filieres.map((t) => {
        const expanded = open === t.slug;
        return (
          <div key={t.slug} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
            <h3 className="font-extrabold text-slate-900">{t.title}</h3>
            <p className={`text-sm text-slate-600 whitespace-pre-line ${expanded ? '' : 'line-clamp-4'}`}>{t.content}</p>
            <button onClick={() => setOpen(expanded ? null : t.slug)} className="inline-flex items-center gap-1 text-xs font-bold text-brand-800 hover:underline">
              {expanded ? 'Réduire' : 'Lire la fiche complète'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
