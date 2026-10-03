import React from 'react';
import { 
  RiSunLine, 
  RiMoonLine, 
  RiMenuLine, 
  RiCloseLine, 
  RiSearchLine, 
  RiFullscreenLine, 
  RiFullscreenExitLine, 
  RiGraduationCapFill
} from '@remixicon/react';

export default function Navbar({ 
  darkMode, 
  setDarkMode, 
  sidebarOpen, 
  setSidebarOpen, 
  onNavigate,
  onOpenSearch,
  isZeroDistraction,
  onToggleZeroDistraction
}) {
  return (
    <header className="sticky top-0 z-30 h-14 bg-white dark:bg-[#0d1522] border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {sidebarOpen ? <RiCloseLine className="w-5 h-5" /> : <RiMenuLine className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-brand-600 dark:bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
              <RiGraduationCapFill className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight text-slate-900 dark:text-white">
                PrepHIT
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Infosys Assessment Portal
              </p>
            </div>
          </button>
        </div>

        {/* Center: Search trigger */}
        <div className="hidden md:flex items-center">
          <button 
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-md w-72 text-left transition-colors cursor-pointer"
          >
            <RiSearchLine className="w-4 h-4 text-slate-400" />
            <span className="truncate">Search syllabus, questions, topics...</span>
            <kbd className="ml-auto text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-400">
              /
            </kbd>
          </button>
        </div>

        {/* Right: Functional Controls Only (No duplicate action buttons) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Examination Fullscreen Focus Mode */}
          <button
            onClick={onToggleZeroDistraction}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all cursor-pointer ${
              isZeroDistraction 
                ? 'bg-slate-900 text-white border-slate-800 dark:bg-brand-600 dark:border-brand-500' 
                : 'bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title={isZeroDistraction ? "Exit Focus Mode (Esc)" : "Fullscreen Focus Mode"}
          >
            {isZeroDistraction ? <RiFullscreenExitLine className="w-3.5 h-3.5" /> : <RiFullscreenLine className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Focus Mode</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            title={darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label="Toggle Theme"
          >
            {darkMode ? <RiSunLine className="w-4 h-4 text-amber-400" /> : <RiMoonLine className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
}
