import React, { useState, useEffect } from 'react';
import { 
  RiFileCheckLine, 
  RiPlayCircleLine, 
  RiTimeLine, 
  RiSettings4Line, 
  RiRestartLine, 
  RiShuffleLine, 
  RiEqualizerLine, 
  RiCheckboxCircleLine 
} from '@remixicon/react';
import { 
  fetchMockTests, 
  fetchMockTestDetails, 
  generateCustomTest, 
  generateMistakesTest 
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
    if (!mistakesTest) {
      alert("No incorrect questions recorded yet. Complete practice sessions or tests to populate your mistakes bank.");
      return;
    }
    onLaunchTest(mistakesTest);
  };

  const handleStartRandomBlitz = async () => {
    const blitz = await generateCustomTest({
      sections: [
        "Quantitative Aptitude", "Verbal Ability", 
        "Logical Reasoning & Puzzles", "Pseudocode & Programming Logic"
      ],
      questionCount: 15,
      difficulty: "All",
      timeLimitMinutes: 20
    });
    blitz.title = "15-Question Speed Drill";
    onLaunchTest(blitz);
  };

  const toggleCustomSection = (sec) => {
    setCustomSections(prev => 
      prev.includes(sec) ? prev.filter(s => s !== sec) : [...prev, sec]
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="bg-white dark:bg-[#0d1522] border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Mock Examination Series
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              15 Full Blueprints
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Standard 54-question, 90-minute timed simulation matching the Infosys SE hiring pattern.
          </p>
        </div>

        {/* Quick Launch Practice Drills */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStartMistakes}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <RiRestartLine className="w-3.5 h-3.5" />
            Mistakes Re-test
          </button>
          <button
            onClick={handleStartRandomBlitz}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors cursor-pointer"
          >
            <RiShuffleLine className="w-3.5 h-3.5" />
            15-Question Rapid Drill
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveMode('full')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
            activeMode === 'full' 
              ? 'bg-brand-600 text-white' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Full-Length Mock Tests (15)
        </button>
        <button
          onClick={() => setActiveMode('sectional')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
            activeMode === 'sectional' 
              ? 'bg-brand-600 text-white' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Sectional Timed Tests
        </button>
        <button
          onClick={() => setActiveMode('custom')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
            activeMode === 'custom' 
              ? 'bg-brand-600 text-white' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Custom Test Builder
        </button>
      </div>

      {/* ================= 1. FULL MOCK TESTS ================= */}
      {activeMode === 'full' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockTests.map((t, idx) => (
            <div
              key={t.id}
              className="bg-white dark:bg-[#0d1522] border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    PAPER #{idx + 1}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <RiTimeLine className="w-3.5 h-3.5" />
                    90 Mins
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3 leading-relaxed line-clamp-2">
                  {t.description}
                </p>

                {/* Section breakdown */}
                <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 mb-4 border border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Reasoning & Puzzles</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">19 Questions</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Quantitative</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">10 Questions</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Verbal Ability</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">20 Questions</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pseudocode</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">5 Questions</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartFullTest(t.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                <RiPlayCircleLine className="w-4 h-4" />
                <span>Start Test</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================= 2. SECTIONAL TIMED TESTS ================= */}
      {activeMode === 'sectional' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: "Quantitative Aptitude",
              desc: "15 questions covering Percentages, Work-Time, Trains, Divisibility & Mixtures.",
              count: 15,
              time: 25,
              btnClass: "bg-brand-600 hover:bg-brand-700"
            },
            {
              name: "Verbal Ability",
              desc: "20 questions covering Grammar rules, Prepositions, Error Detection & Vocab.",
              count: 20,
              time: 25,
              btnClass: "bg-teal-700 hover:bg-teal-800"
            },
            {
              name: "Logical Reasoning & Puzzles",
              desc: "15 questions covering Seating Arrangements, Coding-Decoding, Clocks & Series.",
              count: 15,
              time: 25,
              btnClass: "bg-amber-600 hover:bg-amber-700"
            },
            {
              name: "Pseudocode & Programming Logic",
              desc: "10 questions covering nested loops, bubble sort tracing, conditionals & operators.",
              count: 10,
              time: 15,
              btnClass: "bg-slate-800 hover:bg-slate-900"
            }
          ].map((sec, i) => (
            <div key={i} className="bg-white dark:bg-[#0d1522] border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Targeted Sectional Drill
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                  {sec.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
                  {sec.desc}
                </p>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-4">
                  <span className="flex items-center gap-1">
                    <RiFileCheckLine className="w-3.5 h-3.5 text-slate-400" />
                    {sec.count} Questions
                  </span>
                  <span className="flex items-center gap-1">
                    <RiTimeLine className="w-3.5 h-3.5 text-slate-400" />
                    {sec.time} Minutes
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleStartSectional(sec.name, sec.count, sec.time)}
                className={`w-full py-2 px-3 rounded ${sec.btnClass} text-white font-medium text-xs transition-colors cursor-pointer`}
              >
                Start Sectional Test
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================= 3. CUSTOM TEST BUILDER ================= */}
      {activeMode === 'custom' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#0d1522] border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-5 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RiEqualizerLine className="w-4 h-4 text-brand-600" />
              Configure Custom Test Blueprint
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select specific sections, question count, difficulty, and timer to build a personalized test.
            </p>
          </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                    className={`p-2.5 rounded border text-xs font-medium text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected 
                        ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/60 text-brand-900 dark:text-brand-200 font-semibold' 
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{sec}</span>
                    {isSelected && <RiCheckboxCircleLine className="w-4 h-4 text-brand-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of Questions */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>2. Question Count: {customCount} Questions</span>
              <span className="text-slate-400 font-normal">Range: 10 – 54</span>
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

          {/* Difficulty and Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                3. Difficulty Level
              </label>
              <select
                value={customDifficulty}
                onChange={(e) => setCustomDifficulty(e.target.value)}
                className="w-full text-xs p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              >
                <option value="All">All Levels (Balanced Blueprint)</option>
                <option value="Easy">Easy (Foundation / Warmup)</option>
                <option value="Medium">Medium (Actual Standard)</option>
                <option value="Hard">Hard (High Difficulty)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                4. Timer (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                step="5"
                value={customDuration}
                onChange={(e) => setCustomDuration(parseInt(e.target.value) || 30)}
                className="w-full text-xs p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Single Launch Action Button */}
          <button
            onClick={handleStartCustom}
            disabled={isBuildingCustom || customSections.length === 0}
            className="w-full py-2.5 px-4 rounded bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isBuildingCustom ? "Generating Custom Test..." : `Launch Custom Test (${customCount} Qs · ${customDuration} Mins)`}
          </button>
        </div>
      )}

    </div>
  );
}
