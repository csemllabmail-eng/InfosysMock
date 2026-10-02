import React from 'react';
import { 
  Sun, Moon, Menu, X, BookOpen, Search, Maximize2, Minimize2
} from 'lucide-react';

export default function Navbar({ 
  darkMode, 
  setDarkMode, 
  sidebarOpen, 
  setSidebarOpen, 
  dailyGoal,
  onNavigate,
  onOpenSearch,
  isZeroDistraction,
  onToggleZeroDistraction
}) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              SE
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                PrepForge <span className="text-brand-600 dark:text-brand-400 text-xs px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800">Infosys SE</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Hiring Assessment Prep Suite
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search trigger */}
        <div className="hidden md:flex items-center">
          <button 
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 rounded-full w-64 text-left transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search 810+ questions, rules...</span>
            <kbd className="ml-auto text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-mono">
              /
            </kbd>
          </button>
        </div>

        {/* Right: Quick Links & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Mock Test Button */}
          <button
            onClick={() => onNavigate('mock')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:hover:bg-brand-900/80 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Take Test</span>
          </button>

          {/* Study Notes quick link */}
          <button
            onClick={() => onNavigate('notes')}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors hidden sm:block cursor-pointer"
            title="Formula & Study Notes"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Zero Distraction / Full Screen Mode Toggle */}
          <button
            onClick={onToggleZeroDistraction}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isZeroDistraction 
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/25 ring-2 ring-purple-400/40' 
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 dark:text-purple-300 border-purple-200/80 dark:border-purple-800'
            }`}
            title={isZeroDistraction ? "Exit Zero Distraction Full Screen Mode (Esc)" : "Enter Zero Distraction Full Screen Mode"}
          >
            {isZeroDistraction ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline font-bold">Zero Distraction</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Candidate Profile Avatar */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-slate-900 shadow-sm">
              C
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
