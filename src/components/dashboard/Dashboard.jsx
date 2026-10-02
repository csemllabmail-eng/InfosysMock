import React, { useState, useEffect } from 'react';
import { 
  Calculator, Languages, BrainCircuit, Terminal, 
  ArrowRight, PlayCircle, BookOpen, Zap, Layers, Sparkles
} from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const sectionCards = [
    {
      id: 'quant',
      title: 'Quantitative Aptitude',
      category: 'Arithmetic & Number Systems',
      description: 'Percentages, Profit & Loss, Time & Work, Speed & Distance, Permutations & Probability.',
      icon: Calculator,
      color: 'from-blue-500 to-cyan-500',
      badgeColor: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      examPattern: '10 Qs · 35 Mins',
      inventory: '175 Practice Questions',
      difficulty: 'Moderate to Advanced'
    },
    {
      id: 'verbal',
      title: 'Verbal Ability',
      category: 'Grammar & Reading Skills',
      description: 'Sentence Completion, Error Spotting, Para Jumbles, Reading Comprehension, and Vocabulary.',
      icon: Languages,
      color: 'from-purple-500 to-indigo-500',
      badgeColor: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      examPattern: '20 Qs · 20 Mins',
      inventory: '312 Practice Questions',
      difficulty: 'Easy to Moderate'
    },
    {
      id: 'reasoning',
      title: 'Logical Reasoning & Puzzles',
      category: 'Deductions & Arrangements',
      description: '18 Specialized Topics: Linear & Circular Seating, Floor Puzzles, Blood Relations, Syllogisms, and Speed Drills.',
      icon: BrainCircuit,
      color: 'from-amber-500 to-orange-500',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      examPattern: '15 Qs · 25 Mins',
      inventory: '495 Questions · 18 Topics',
      difficulty: 'High Cognitive Load'
    },
    {
      id: 'pseudocode',
      title: 'Pseudocode & Programming Logic',
      category: 'Conditionals & Tracing',
      description: 'Bitwise Operators, Loop Boundaries, Recursion, Variable State Watches, and Conditional Branches.',
      icon: Terminal,
      color: 'from-emerald-500 to-teal-500',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      examPattern: '9 Qs · 10 Mins',
      inventory: '75 Practice Questions',
      difficulty: 'Moderate'
    }
  ];

  const quickTools = [
    {
      title: 'Interactive Puzzle Studio',
      description: 'Visual drag & arrange workspace for linear seating, circular tables, and floor puzzles.',
      icon: BrainCircuit,
      color: 'from-amber-500 to-orange-600',
      target: 'reasoning',
      actionText: 'Launch Studio'
    },
    {
      title: 'Pseudocode Tracing Lab',
      description: 'Line-by-line pointer execution with real-time variable watch table and step evaluator.',
      icon: Terminal,
      color: 'from-emerald-500 to-teal-600',
      target: 'pseudocode',
      actionText: 'Launch Lab'
    },
    {
      title: 'Aptitude Speed Trainer',
      description: 'Rapid-fire mental math drills to accelerate calculation time per question.',
      icon: Zap,
      color: 'from-blue-500 to-cyan-600',
      target: 'quant',
      actionText: 'Start Drills'
    },
    {
      title: 'Formulas & Study Cheat Sheets',
      description: 'Handy reference cards with formulas, grammar rules, and shortcut algorithms.',
      icon: BookOpen,
      color: 'from-purple-500 to-indigo-600',
      target: 'notes',
      actionText: 'Read Notes'
    }
  ];

  return (
    <div className="space-y-8 pb-12">

      {/* 4 Section Cards Grid - Pure Preparation Modules with ZERO Analytics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Preparation Modules
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official Infosys System Engineer assessment blueprint syllabus and topic-wise practice banks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {sectionCards.map((card) => {
            const Icon = card.icon;

            return (
              <div 
                key={card.id}
                className="glass-card p-5 flex flex-col justify-between group hover:border-brand-300 dark:hover:border-brand-700 transition-all hover:shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`p-2.5 rounded-2xl bg-gradient-to-tr ${card.color} text-white shadow-md shadow-brand-500/10 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                      {card.difficulty}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    {card.category}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Blueprint Specifications */}
                  <div className="space-y-2 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-5 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">Exam Format</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{card.examPattern}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">Question Pool</span>
                      <span className="font-semibold text-brand-600 dark:text-brand-400">{card.inventory}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(card.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-brand-600 dark:bg-slate-800 dark:hover:bg-brand-600 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <span>Start Practice</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Mock Tests & Interactive Tools Grid (Zero Analytics) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Full Mock Tests Section */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Full-Length Mock Tests
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Infosys SE Blueprint · 54 Questions · 90 Minutes · Instant Feedback
              </p>
            </div>
            <button
              onClick={() => onNavigate('mock')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All 15 Tests
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {mockTests.map((test) => (
              <div 
                key={test.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {test.title}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full">
                      54 Qs
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {test.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-xs">
                    <div className="font-bold text-slate-700 dark:text-slate-300">90 Mins</div>
                    <div className="text-[11px] text-slate-400">Standard Test</div>
                  </div>
                  <button
                    onClick={() => onStartTest(test.id)}
                    className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Take Test</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Specialized Interactive Preparation Tools */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-500" />
                Interactive Tools
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                Specialized
              </span>
            </div>

            <div className="space-y-3">
              {quickTools.map((tool, idx) => {
                const ToolIcon = tool.icon;
                return (
                  <div 
                    key={idx} 
                    onClick={() => onNavigate(tool.target)}
                    className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg bg-gradient-to-tr ${tool.color} text-white`}>
                          <ToolIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {tool.title}
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 ml-7">
                      {tool.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate('notes')}
              className="w-full text-center text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
            >
              Browse Complete Syllabus Notes →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
