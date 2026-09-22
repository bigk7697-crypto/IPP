import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { orientationService, searchTopics, OrientationTopic } from '../services/orientation.service';

const QUICK = ['frais', 'inscription', 'contact', 'examens', 'choisir'];

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
        <div className="w-[330px] max-w-[calc(100vw-2.5rem)] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
          <div className="bg-brand-900 text-white px-5 py-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm font-bold">Assistant Orientation</p>
              <p className="text-[11px] text-slate-300">Filières, frais, inscription…</p>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {QUICK.map((k) => (
                <button
                  key={k}
                  onClick={() => { setQuery(k); ask(k); }}
                  className="px-3 py-1.5 bg-brand-50 text-brand-900 text-xs font-semibold rounded-full hover:bg-brand-100 transition-colors"
                >
                  {k}
                </button>
              ))}
            </div>
            {answer && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <p className="text-sm font-bold text-slate-900">{answer.title}</p>
                <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-6">{answer.content}</p>
              </div>
            )}
            {noMatch && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 space-y-1">
                <p className="font-bold">Je n’ai pas la réponse pour le moment.</p>
                <p>Ta question a été transmise à l’équipe — essaie « frais », « inscription » ou « contact ».</p>
              </div>
            )}
            <Link
              to="/orientation"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-bold text-brand-800 hover:underline"
            >
              Faire le quiz d’orientation (2 min) →
            </Link>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); ask(query); }}
            className="p-3 border-t border-slate-100 flex gap-2"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pose ta question…"
              className="flex-1 px-3 py-2 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-900"
            />
            <button type="submit" className="p-2 bg-brand-900 text-white rounded-xl hover:bg-brand-950 transition-colors" title="Envoyer">
              <Send className="w-4 h-4" />
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
