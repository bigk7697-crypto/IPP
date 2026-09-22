import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, GraduationCap } from 'lucide-react';
import { orientationService, searchTopics, OrientationTopic } from '../services/orientation.service';

const QUICK = [
  { label: 'Frais', query: 'frais' },
  { label: 'Inscription', query: 'inscription' },
  { label: 'Contact', query: 'contact' },
  { label: 'Examens', query: 'examens' },
  { label: 'Choisir ma filière', query: 'choisir' },
];

export const OrientationWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState<OrientationTopic[]>([]);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<OrientationTopic | null>(null);
  const [noMatch, setNoMatch] = useState(false);
  const loggedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (open && topics.length === 0) {
      orientationService.getTopics().then(setTopics).catch(() => {});
    }
  }, [open, topics.length]);

  const ask = (q: string) => {
    const text = q.trim();
    if (!text) return;
    const hits = searchTopics(topics, text);
    if (hits.length > 0) {
      setAnswer(hits[0]);
      setNoMatch(false);
    } else {
      setAnswer(null);
      setNoMatch(true);
      if (!loggedRef.current.has(text.toLowerCase())) {
        loggedRef.current.add(text.toLowerCase());
        orientationService.logUnanswered(text, 'assistant');
      }
    }
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-5 md:right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[340px] max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
          <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Secrétariat virtuel</p>
              <p className="text-[11px] text-slate-400">IPP La Paix — assistance immédiate</p>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto">
            <p className="text-xs text-slate-500">Sélectionnez un sujet ou écrivez votre question :</p>
            <div className="flex flex-wrap gap-2">
              {QUICK.map((k) => (
                <button
                  key={k.query}
                  onClick={() => { setQuery(k.query); ask(k.query); }}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-full hover:border-brand-700 hover:text-brand-900 transition-colors"
                >
                  {k.label}
                </button>
              ))}
            </div>
            {answer && (
              <div className="border-l-2 border-brand-700 pl-3 py-1 space-y-1">
                <p className="text-sm font-bold text-slate-900">{answer.title}</p>
                <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-6">{answer.content}</p>
              </div>
            )}
            {noMatch && (
              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Question transmise au secrétariat.</p>
                <p>Nous n’avons pas encore la réponse automatique — essayez « Frais », « Inscription » ou « Contact ».</p>
              </div>
            )}
            <Link
              to="/orientation"
              onClick={() => setOpen(false)}
              className="block text-center px-4 py-2.5 border border-brand-900 text-brand-900 text-xs font-bold rounded-xl hover:bg-brand-900 hover:text-white transition-colors"
            >
              Quiz d’orientation — 2 minutes
            </Link>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); ask(query); }}
            className="p-3 border-t border-slate-200 bg-slate-50 flex gap-2"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Écrivez votre question…"
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-900"
            />
            <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-xs font-bold" title="Envoyer">
              OK
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-brand-900 hover:bg-brand-950 text-white rounded-full shadow-xl flex items-center justify-center transition-all"
        title="Assistant Orientation"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};
