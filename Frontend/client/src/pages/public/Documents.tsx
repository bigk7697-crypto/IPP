import React, { useEffect, useState } from 'react';
import { FileText, Download, Search, Filter } from 'lucide-react';
import { documentService } from '../../services/document.service';
import { useRealtime } from '../../hooks/useRealtime';
import { DocumentItem } from '../../types';

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [rtick, setRtick] = useState(0);

  useRealtime('documents', undefined, () => setRtick((t) => t + 1), true);

  useEffect(() => {
    async function load() {
      const data = await documentService.getDocuments();
      setDocuments(data);
      setLoading(false);
    }
    load();
  }, [rtick]);

  const categories = ['Tous', 'Règlement', 'Administratif', 'Pédagogique', 'Formulaire'];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) || (doc.description && doc.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'Tous' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleDownload = (id: string, name: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      alert(`Téléchargement simulé réussi pour : ${name}`);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Documents & Téléchargements</h1>
        <p className="text-slate-600 mt-2">Accédez aux règlements intérieurs, formulaires officiels et documents pédagogiques de l'école.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">Aucun document trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full uppercase">
                    {doc.category}
                  </span>
                  <FileText className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{doc.title}</h3>
                <p className="text-slate-600 text-xs line-clamp-2">{doc.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">PDF • Sécurisé</span>
                <button
                  onClick={() => handleDownload(doc.id, doc.file_name)}
                  disabled={downloadingId === doc.id}
                  className="flex items-center gap-2 px-3 py-2 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingId === doc.id ? 'Téléchargement...' : 'Télécharger'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
