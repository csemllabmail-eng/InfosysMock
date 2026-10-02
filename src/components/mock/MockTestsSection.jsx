import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, PlayCircle, Clock, Award, 
  Settings2, Sparkles, RotateCcw, Shuffle, 
  Sliders, ArrowRight, Layers, CheckCircle2
} from 'lucide-react';
import { 
  fetchMockTests, fetchMockTestDetails, 
  generateCustomTest, generateMistakesTest, 
  getAllQuestions 
} from '../../services/api';

export default function MockTestsSection({ onLaunchTest }) {
  const [mockTests, setMockTests] = useState([]);
  const [activeMode, setActiveMode] = useState('full'); // 'full' | 'sectional' | 'custom'
  const [loading, setLoading] = useState(true);

  // Custom Test Builder state
  const [customSections, setCustomSections] = useState([
    "Quantitative Aptitude", "Verbal Ability", 
    "Logical Reasoning & Puzzles", "Pseudocode & Programming Logic"
  ]);
  const [customCount, setCustomCount] = useState(25);
  const [customDifficulty, setCustomDifficulty] = useState('All');
  const [customDuration, setCustomDuration] = useState(40);
  const [isBuildingCustom, setIsBuildingCustom] = useState(false);

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    setLoading(true);
    const list = await fetchMockTests();
    setMockTests(list);
    setLoading(false);
  }

  const handleStartFullTest = async (testId) => {
    const fullTest = await fetchMockTestDetails(testId);
    if (fullTest) onLaunchTest(fullTest);
  };

  const handleStartSectional = async (sectionName, count = 20, time = 30) => {
    const custom = await generateCustomTest({
      sections: [sectionName],
      questionCount: count,
      difficulty: "All",
      timeLimitMinutes: time
    });
    custom.title = `${sectionName} Sectional Test`;
    onLaunchTest(custom);
  };

  const handleStartCustom = async () => {
    setIsBuildingCustom(true);
    const custom = await generateCustomTest({
      sections: customSections,
      questionCount: customCount,
      difficulty: customDifficulty,
      timeLimitMinutes: customDuration
    });
    setIsBuildingCustom(false);
    onLaunchTest(custom);
  };

  const handleStartMistakes = async () => {
    const mistakesTest = await generateMistakesTest();
    onLaunchTest(mistakesTest);
  };

  const handleStartRandomBlitz = async () => {
    const blitz = await generateCustomTest({
      sections: [],
      questionCount: 15,
      difficulty: "All",
      timeLimitMinutes: 15
    });
    blitz.title = "15-Question Random Speed Blitz";
    onLaunchTest(blitz);
  };

  const toggleCustomSection = (sec) => {
    setCustomSections(prev => 
      prev.includes(sec) ? prev.filter(s => s !== sec) : [...prev, sec]
    );
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="glass-card p-6 border-brand-200/50 dark:border-brand-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/25">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Infosys SE Mock Test Engine
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              15 Full Blueprints
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            54 questions · 90 minutes · Reasoning, Quantitative, Verbal & Pseudocode simulation.
          </p>
        </div>

        {/* Quick Launch Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleStartMistakes}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Previous Mistakes Drill
          </button>
          <button
            onClick={handleStartRandomBlitz}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition-colors cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            15-Question Blitz
          </button>
        </div>
      </div>

      {/* Mode switcher tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveMode('full')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeMode === 'full' 
              ? 'bg-brand-600 text-white shadow-xs' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          Full-Length Mock Tests (15)
        </button>
        <button
          onClick={() => setActiveMode('sectional')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeMode === 'sectional' 
              ? 'bg-brand-600 text-white shadow-xs' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          Sectional Timed Tests
        </button>
        <button
          onClick={() => setActiveMode('custom')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeMode === 'custom' 
              ? 'bg-brand-600 text-white shadow-xs' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          Custom Test Builder
        </button>
      </div>

      {/* ================= 1. FULL MOCK TESTS ================= */}
      {activeMode === 'full' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {mockTests.map((t, idx) => (
            <div
              key={t.id}
              className="glass-card p-6 flex flex-col justify-between hover:border-brand-300 dark:hover:border-brand-700 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    MOCK TEST #{idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    90 Mins
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
                  {t.description}
                </p>

                {/* Section counts */}
                <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 mb-5">
                  <div>
                    <span className="text-slate-400 block">Reasoning & Puzzles</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">19 Questions</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Quantitative Aptitude</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">10 Questions</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Verbal Ability</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">20 Questions</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Pseudocode Logic</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">5 Questions</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartFullTest(t.id)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all cursor-pointer group-hover:scale-[1.01]"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Start Full Exam #{idx + 1}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================= 2. SECTIONAL TIMED TESTS ================= */}
      {activeMode === 'sectional' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              name: "Quantitative Aptitude",
              desc: "15 questions covering Percentages, Work-Time, Trains, Divisibility & Mixtures.",
              count: 15,
              time: 25,
              color: "from-blue-600 to-cyan-600"
            },
            {
              name: "Verbal Ability",
              desc: "20 questions covering Grammar rules, Prepositions, Error Detection & Vocab.",
              count: 20,
              time: 25,
              color: "from-purple-600 to-indigo-600"
            },
            {
              name: "Logical Reasoning & Puzzles",
              desc: "15 questions covering Seating Arrangements, Coding-Decoding, Clocks & Series.",
              count: 15,
              time: 25,
              color: "from-amber-600 to-orange-600"
            },
            {
              name: "Pseudocode & Programming Logic",
              desc: "10 questions covering nested loops, bubble sort tracing, conditionals & operators.",
              count: 10,
              time: 15,
              color: "from-emerald-600 to-teal-600"
            }
          ].map((sec, i) => (
            <div key={i} className="glass-card p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Targeted Sectional Drill
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">
                  {sec.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
                  {sec.desc}
                </p>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-5">
                  <span className="flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-brand-500" />
                    {sec.count} Questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    {sec.time} Minutes
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleStartSectional(sec.name, sec.count, sec.time)}
                className={`w-full py-2.5 px-4 rounded-xl bg-gradient-to-r ${sec.color} text-white font-bold text-xs shadow-md transition-opacity hover:opacity-90 cursor-pointer`}
              >
                Launch {sec.name} Test
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================= 3. CUSTOM TEST BUILDER ================= */}
      {activeMode === 'custom' && (
        <div className="max-w-2xl mx-auto glass-card p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-brand-600" />
              Configure Custom Test Blueprint
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select specific sections, custom question count, difficulty, and timer to tailor your practice session.
            </p>
          </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              1. Sections to Include
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Quantitative Aptitude",
                "Verbal Ability",
                "Logical Reasoning & Puzzles",
                "Pseudocode & Programming Logic"
              ].map(sec => {
                const isSelected = customSections.includes(sec);
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => toggleCustomSection(sec)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-colors ${
                      isSelected 
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-900 dark:text-brand-200' 
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{sec}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of Questions */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>2. Question Count: {customCount} Questions</span>
              <span className="text-slate-400">Range: 10 – 54</span>
            </div>
            <input
              type="range"
              min="10"
              max="54"
              step="5"
              value={customCount}
              onChange={(e) => setCustomCount(parseInt(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
          </div>

          {/* Time Limit */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>3. Time Limit: {customDuration} Minutes</span>
              <span className="text-slate-400">Range: 15 – 90</span>
            </div>
            <input
              type="range"
              min="15"
              max="90"
              step="5"
              value={customDuration}
              onChange={(e) => setCustomDuration(parseInt(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              4. Difficulty Filter
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setCustomDifficulty(diff)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors ${
                    customDifficulty === diff 
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleStartCustom}
              disabled={customSections.length === 0 || isBuildingCustom}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Generate & Launch Custom Test</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
