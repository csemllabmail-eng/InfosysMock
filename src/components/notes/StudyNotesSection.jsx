import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, BookOpen, Sparkles, 
  Lightbulb, AlertCircle, CheckCircle2, Copy, Check
} from 'lucide-react';
import { fetchStudyNotes } from '../../services/api';

export default function StudyNotesSection() {
  const [notesData, setNotesData] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState('quant');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await fetchStudyNotes();
      setNotesData(data);
    }
    load();
  }, []);

  const activeSection = notesData.find(s => s.id === activeSectionId) || notesData[0];

  const filteredTopics = activeSection?.topics.filter(t => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return t.title.toLowerCase().includes(term) || t.plainText.toLowerCase().includes(term);
  }) || [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-card p-6 border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              PrepHIT Study Notes & Formula Vault
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              30+ High-Yield Formulas & Rules
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            High-yield formulas, subject-verb rules, speed calculation shortcuts, and exam-day pacing strategies.
          </p>
        </div>

        {/* Search Notes Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search formulas, traps, rules..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2">
        {notesData.map((sec) => (
          <button
            key={sec.id}
            onClick={() => { setActiveSectionId(sec.id); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSectionId === sec.id 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                : 'glass-card text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{sec.section}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeSectionId === sec.id ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
            }`}>
              {sec.topics.length}
            </span>
          </button>
        ))}
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTopics.map((topic, idx) => (
          <div 
            key={idx}
            className="glass-card p-6 flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {activeSection?.section} Note #{idx + 1}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(topic.plainText);
                    setCopiedIdx(idx);
                    setTimeout(() => setCopiedIdx(null), 1500);
                  }}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                  title="Copy note text to clipboard"
                >
                  {copiedIdx === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div 
                className="prose dark:prose-invert text-xs leading-relaxed max-w-none [&_h3]:text-sm [&_h3]:font-black [&_h3]:text-slate-900 [&_h3]:dark:text-white [&_h4]:text-xs [&_h4]:font-bold [&_h4]:text-slate-800 [&_h4]:dark:text-slate-200 [&_h4]:mt-2 [&_.formula]:p-3 [&_.formula]:rounded-xl [&_.formula]:bg-blue-50 [&_.formula]:dark:bg-blue-950/40 [&_.formula]:border-l-4 [&_.formula]:border-blue-500 [&_.formula]:font-mono [&_.formula]:my-2 [&_.tip]:p-3 [&_.tip]:rounded-xl [&_.tip]:bg-emerald-50 [&_.tip]:dark:bg-emerald-950/40 [&_.tip]:border-l-4 [&_.tip]:border-emerald-500 [&_.tip]:my-2 [&_.trap]:p-3 [&_.trap]:rounded-xl [&_.trap]:bg-amber-50 [&_.trap]:dark:bg-amber-950/40 [&_.trap]:border-l-4 [&_.trap]:border-amber-500 [&_.trap]:my-2 [&_.danger-note]:p-3 [&_.danger-note]:rounded-xl [&_.danger-note]:bg-rose-50 [&_.danger-note]:dark:bg-rose-950/40 [&_.danger-note]:border-l-4 [&_.danger-note]:border-rose-500 [&_.danger-note]:my-2 [&_table]:w-full [&_table]:my-2 [&_th]:border [&_th]:border-slate-200 [&_th]:dark:border-slate-700 [&_th]:p-1.5 [&_th]:bg-slate-100 [&_th]:dark:bg-slate-800 [&_td]:border [&_td]:border-slate-200 [&_td]:dark:border-slate-700 [&_td]:p-1.5 [&_.checklist]:grid [&_.checklist]:grid-cols-2 [&_.checklist]:gap-1.5 [&_.check]:p-2 [&_.check]:rounded [&_.check]:bg-slate-100 [&_.check]:dark:bg-slate-800 [&_.check]:text-[11px]"
                dangerouslySetInnerHTML={{ __html: topic.rawHtml }}
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
