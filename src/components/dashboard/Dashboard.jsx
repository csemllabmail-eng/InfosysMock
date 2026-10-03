import React, { useState, useEffect } from 'react';
import { 
  RiCalculatorLine, 
  RiTranslate2, 
  RiBrainLine, 
  RiTerminalBoxLine, 
  RiArrowRightLine, 
  RiPlayCircleLine, 
  RiBookOpenLine, 
  RiBookmarkLine,
  RiTimeLine,
  RiFileList3Line,
  RiToolsLine
} from '@remixicon/react';
import { fetchMockTests } from '../../services/api';

export default function Dashboard({ onNavigate, onStartTest }) {
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const tests = await fetchMockTests();
      setMockTests(tests.slice(0, 4));
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-7 h-7 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const categories = [
    {
      id: 'quant',
      title: 'Quantitative Aptitude',
      sectionCode: 'Section I',
      topics: 'Percentages, Profit & Loss, Time & Work, Speed & Distance, Probability, Number Systems',
      pattern: '10 Qs · 35 Mins',
      inventory: '175 Questions',
      icon: RiCalculatorLine,
      iconBg: 'bg-brand-600 text-white'
    },
    {
      id: 'verbal',
      title: 'Verbal Ability',
      sectionCode: 'Section II',
      topics: 'Sentence Correction, Error Spotting, Reading Comprehension, Para Jumbles, Vocabulary',
      pattern: '20 Qs · 20 Mins',
      inventory: '312 Questions',
      icon: RiTranslate2,
      iconBg: 'bg-teal-700 text-white'
    },
    {
      id: 'reasoning',
      title: 'Logical Reasoning & Puzzles',
      sectionCode: 'Section III',
      topics: 'Linear & Circular Seating, Floor Puzzles, Blood Relations, Syllogisms, Direction Sense',
      pattern: '15 Qs · 25 Mins',
      inventory: '495 Questions',
      icon: RiBrainLine,
      iconBg: 'bg-amber-600 text-white'
    },
    {
      id: 'pseudocode',
      title: 'Pseudocode & Programming Logic',
      sectionCode: 'Section IV',
      topics: 'Loop Invariants, Bitwise Logic, Variable Tracing, Recursion Stacks, Conditional Branches',
      pattern: '9 Qs · 10 Mins',
      inventory: '75 Questions',
      icon: RiTerminalBoxLine,
      iconBg: 'bg-slate-800 text-white'
    }
  ];

  const quickTools = [
    {
      title: 'Formulas & Study Compendium',
      description: 'Handy formula sheets, shortcut algorithms, and grammar rules.',
      icon: RiBookOpenLine,
      target: 'notes'
    },
    {
      title: 'Visual Seating & Floor Puzzle Studio',
      description: 'Interactive workspace for circular, linear, and floor arrangement problems.',
      icon: RiBrainLine,
      target: 'reasoning'
    },
    {
      title: 'Pseudocode Memory Tracing Lab',
      description: 'Line-by-line pointer execution with live variable memory state table.',
      icon: RiTerminalBoxLine,
      target: 'pseudocode'
    },
    {
      title: 'Saved Question Dossier',
      description: 'Review and re-attempt all questions you flagged during practice.',
      icon: RiBookmarkLine,
      target: 'bookmarks'
    }
  ];

  return (
    <div className="space-y-8 pb-12">

      {/* A. Compact Page Header (No greetings, no slogans, no decorative hero banners) */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Practice Center
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Infosys System Engineer (SE) Examination Pattern · 54 Questions · 100 Minutes Total Blueprint
        </p>
      </div>

      {/* B. Main Practice Categories */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Examination Sections
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            4 Core Modules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div 
                key={cat.id}
                className="bg-white dark:bg-[#0d1522] border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`p-2 rounded ${cat.iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {cat.sectionCode}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {cat.title}
                  </h3>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.topics}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {cat.pattern}
                    </span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      {cat.inventory}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(cat.id)}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-slate-900 hover:bg-brand-600 dark:bg-slate-800 dark:hover:bg-brand-600 text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  <span>Practice Section</span>
                  <RiArrowRightLine className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* C & D. Available Mock Tests & Quick Utilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Available Full Mock Tests */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0d1522] border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Full-Length Mock Examinations
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official timed simulation with 4 sections and live question palette
              </p>
            </div>
            <button
              onClick={() => onNavigate('mock')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all tests</span>
              <RiArrowRightLine className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
            {mockTests.map((test) => (
              <div 
                key={test.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      {test.title}
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                      54 Qs
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {test.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                      <RiTimeLine className="w-3.5 h-3.5 text-slate-400" />
                      90 Mins
                    </span>
                  </div>
                  <button
                    onClick={() => onStartTest(test.id)}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    <RiPlayCircleLine className="w-3.5 h-3.5" />
                    <span>Start Test</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Utilities (Each serving a distinct, non-duplicated purpose) */}
        <div className="bg-white dark:bg-[#0d1522] border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <RiToolsLine className="w-4 h-4 text-slate-500" />
              Reference & Utilities
            </h2>
          </div>

          <div className="space-y-2.5">
            {quickTools.map((tool, idx) => {
              const ToolIcon = tool.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onNavigate(tool.target)}
                  className="w-full text-left p-3 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-0.5">
                      <ToolIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {tool.title}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <RiArrowRightLine className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
