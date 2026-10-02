import React from 'react';
import { 
  LayoutDashboard, Calculator, Languages, 
  BrainCircuit, Terminal, FileCheck2, 
  BarChart3, Database, Bookmark, FileText, 
  ChevronRight, Sparkles, ChevronLeft
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  onNavigate, 
  sidebarOpen, 
  setSidebarOpen,
  isCollapsed,
  setIsCollapsed,
  bookmarkCount = 0
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quant', label: 'Quantitative Aptitude', icon: Calculator, badge: 'Aptitude' },
    { id: 'verbal', label: 'Verbal Ability', icon: Languages, badge: 'Verbal' },
    { id: 'reasoning', label: 'Logical & Puzzles', icon: BrainCircuit, badge: 'Puzzles' },
    { id: 'pseudocode', label: 'Pseudocode & Tracing', icon: Terminal, badge: 'Tracing' },
    { id: 'mock', label: 'Mock Tests', icon: FileCheck2, count: '15' },
    { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, count: bookmarkCount > 0 ? bookmarkCount : null },
    { id: 'questions', label: 'Question Bank & Admin', icon: Database },
    { id: 'notes', label: 'Study Notes & Formulas', icon: FileText }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside className={`
        fixed top-16 bottom-0 left-0 z-40 
        bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800
        transition-all duration-200 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64 w-72'}
      `}>
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          
          <div className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ${isCollapsed ? 'hidden' : 'block'}`}>
            Preparation Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                title={isCollapsed ? item.label : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold
                  transition-all duration-150 group relative
                  ${isActive 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 dark:shadow-none' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:scale-110'}`} />
                
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">
                    {item.label}
                  </span>
                )}

                {!isCollapsed && item.count && (
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${isActive ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    {item.count}
                  </span>
                )}

                {!isCollapsed && item.badge && !item.count && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-950 group-hover:text-brand-600'}`}>
                    {item.badge}
                  </span>
                )}

                {/* Collapsed active dot */}
                {isCollapsed && isActive && (
                  <div className="absolute right-1.5 w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Collapse toggle button at bottom on desktop */}
        <div className="hidden lg:flex items-center justify-end p-2 border-t border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

      </aside>
    </>
  );
}
