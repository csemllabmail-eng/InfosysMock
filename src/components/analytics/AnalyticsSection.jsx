import React, { useState, useEffect } from 'react';
import { 
  RiBarChartBoxLine, RiLineChartLine, RiAwardLine, RiTimeLine, 
  RiFocus3Line, RiCheckboxCircleLine, RiAlertLine, 
  RiArrowRightUpLine, RiArrowRightLine, RiFireLine, RiLightbulbLine, RiBookOpenLine, RiRestartLine 
} from '@remixicon/react';
import { fetchAnalyticsData, clearAllUserData } from '../../services/api';

export default function AnalyticsSection({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const analytics = await fetchAnalyticsData();
      setData(analytics);
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Real weekly activity computed from user attempts and practice
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const weeklyMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayStr = daysOfWeek[d.getDay()];
    weeklyMap[dayStr] = 0;
  }

  // Count today's completed
  const currentDayName = daysOfWeek[today.getDay()];
  if (data.dailyGoal?.completedToday) {
    weeklyMap[currentDayName] = data.dailyGoal.completedToday;
  }

  const weeklyActivity = Object.keys(weeklyMap).map(day => ({
    day,
    count: weeklyMap[day]
  }));

  const maxWeeklyCount = Math.max(1, ...weeklyActivity.map(w => w.count));

  const avgSpeed = data.totalQuestionsAttempted > 0 && data.totalPracticeTimeMinutes > 0
    ? (data.totalPracticeTimeMinutes / data.totalQuestionsAttempted).toFixed(1)
    : "—";

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="glass-card p-6 border-brand-200/50 dark:border-brand-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/25">
              <RiBarChartBoxLine className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Preparation Analytics & Insights
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real performance benchmarks, section accuracy breakdown, and personalized diagnostic recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5">
            <RiAwardLine className="w-4 h-4 text-brand-600" />
            Benchmark Target: 80% Accuracy
          </span>
          <button
            onClick={() => {
              if (window.confirm("Reset your local device data? This will clear your attempts, bookmarks, and test history on this device and start you completely fresh.")) {
                clearAllUserData();
                window.location.reload();
              }
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:border-rose-800 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset practice history on this device"
          >
            <RiRestartLine className="w-3.5 h-3.5" />
            <span>Reset My Data</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-slate-400">Overall Accuracy</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {data.totalQuestionsAttempted > 0 ? `${data.overallAccuracy}%` : '0%'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {data.totalQuestionsAttempted > 0 ? 'Across completed sessions' : 'No questions attempted yet'}
          </div>
        </div>

        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-slate-400">Questions Solved</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {data.totalQuestionsAttempted}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {data.totalCorrect} solved correctly
          </div>
        </div>

        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-slate-400">Average Solving Speed</span>
          <div className="text-2xl sm:text-3xl font-black text-brand-600 dark:text-brand-400 mt-1">
            {avgSpeed} <span className="text-sm font-normal text-slate-400">{avgSpeed !== '—' ? 'min/Q' : ''}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Infosys Target: &lt; 1.6 min/Q
          </div>
        </div>

        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-slate-400">Current Streak</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 mt-1 flex items-center gap-1">
            <RiFireLine className="w-6 h-6 fill-amber-500" />
            {data.streakDays} {data.streakDays === 1 ? 'Day' : 'Days'}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            {data.streakDays > 0 ? 'Active streak' : 'Practice to start streak'}
          </div>
        </div>
      </div>

      {/* Analytical Recommendations Section */}
      <div className="bg-white dark:bg-[#0d1522] border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded bg-brand-600 text-white">
            <RiLightbulbLine className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Analytical Diagnostic Recommendations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized action items derived directly from your test logs and error frequencies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.recommendations.map((rec, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  {rec.section}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {rec.message}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onNavigate(rec.targetTab)}
                  className="px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 hover:bg-brand-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>{rec.action}</span>
                  <RiArrowRightLine className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section-Wise Mastery Comparison & Weekly Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section Accuracy Comparison */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Section Accuracy vs. 80% Benchmark
            </h3>
            <span className="text-[11px] text-slate-400">Infosys Target</span>
          </div>

          <div className="space-y-4">
            {data.sectionPerformance.map((sec, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{sec.section}</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">{sec.accuracy}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                  {/* 80% benchmark target marker line */}
                  <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-slate-400 z-10 opacity-70" title="80% Target Line" />
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      sec.accuracy >= 80 ? 'bg-emerald-500' : sec.accuracy >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${sec.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Above Target (&ge;80%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Borderline (70-79%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical (&lt;70%)
            </span>
          </div>
        </div>

        {/* Weekly Question Volume Activity */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Weekly Question Activity (Last 7 Days)
            </h3>
            <span className="text-[11px] text-slate-400">Total: {weeklyActivity.reduce((acc, curr) => acc + curr.count, 0)} Questions</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4">
            {weeklyActivity.map((w, idx) => {
              const heightPct = Math.round((w.count / maxWeeklyCount) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {w.count}
                  </span>
                  <div 
                    className="w-full bg-brand-600 dark:bg-brand-500 rounded-t transition-all duration-300 group-hover:bg-brand-700"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-xs font-semibold text-slate-400">
                    {w.day}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            Your weekly practice activity updates dynamically with each question solved.
          </p>
        </div>

      </div>

      {/* Weakest vs Strongest Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weak Topics */}
        <div className="glass-card p-6 space-y-4 border-rose-200/40 dark:border-rose-900/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600">
              <RiAlertLine className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Top Weak Areas Requiring Revision
            </h3>
          </div>

          <div className="space-y-3">
            {data.weakTopics && data.weakTopics.length > 0 ? (
              data.weakTopics.map((w, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{w.name}</div>
                    <div className="text-[11px] text-slate-400">{w.section}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-rose-500">{w.accuracy}%</div>
                    <div className="text-[10px] text-slate-400">Accuracy</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                Attempt practice questions or mock tests to identify your weak topics.
              </div>
            )}
          </div>
        </div>

        {/* Strong Topics */}
        <div className="glass-card p-6 space-y-4 border-emerald-200/40 dark:border-emerald-900/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <RiCheckboxCircleLine className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Strongest Mastery Areas
            </h3>
          </div>

          <div className="space-y-3">
            {data.strongTopics && data.strongTopics.length > 0 ? (
              data.strongTopics.map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{s.name}</div>
                    <div className="text-[11px] text-slate-400">{s.section}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-600">{s.accuracy}%</div>
                    <div className="text-[10px] text-slate-400">Accuracy</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                Attempt practice questions or mock tests to identify your strongest areas.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
