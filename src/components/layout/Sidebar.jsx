import React from 'react';
import { 
  RiDashboardLine, 
  RiCalculatorLine, 
  RiTranslate2, 
  RiBrainLine, 
  RiTerminalBoxLine, 
  RiFileCheckLine, 
  RiBarChartBoxLine, 
  RiDatabase2Line, 
  RiBookmarkLine, 
  RiFileTextLine, 
  RiArrowRightSLine, 
  RiArrowLeftSLine 
} from '@remixicon/react';

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
    { id: 'dashboard', label: 'Practice Center', icon: RiDashboardLine },
    { id: 'quant', label: 'Quantitative Aptitude', icon: RiCalculatorLine, badge: 'Sec I' },
    { id: 'verbal', label: 'Verbal Ability', icon: RiTranslate2, badge: 'Sec II' },
    { id: 'reasoning', label: 'Logical Reasoning', icon: RiBrainLine, badge: 'Sec III' },
    { id: 'pseudocode', label: 'Pseudocode & Logic', icon: RiTerminalBoxLine, badge: 'Sec IV' },
    { id: 'mock', label: 'Mock Examinations', icon: RiFileCheckLine, count: '15' },
    { id: 'notes', label: 'Formulas & Notes', icon: RiFileTextLine },
    { id: 'bookmarks', label: 'Saved Questions', icon: RiBookmarkLine, count: bookmarkCount > 0 ? bookmarkCount : null },
    { id: 'questions', label: 'Question Repository', icon: RiDatabase2Line },
    { id: 'analytics', label: 'Performance Audit', icon: RiBarChartBoxLine }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside className={`
        fixed top-14 bottom-0 left-0 z-40 
        bg-white dark:bg-[#0d1522] border-r border-slate-200 dark:border-slate-800
        transition-all duration-200 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-16' : 'lg:w-60 w-64'}
      `}>
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          
          <div className={`px-2.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ${isCollapsed ? 'hidden' : 'block'}`}>
            Navigation
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
                  w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium
                  transition-colors group relative cursor-pointer
                  ${isActive 
                    ? 'bg-brand-600 text-white font-semibold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`} />
                
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">
                    {item.label}
                  </span>
                )}

                {!isCollapsed && item.count && (
                  <span className={`px-1.5 py-0.2 text-[10px] rounded font-semibold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    {item.count}
                  </span>
                )}

                {!isCollapsed && item.badge && !item.count && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    {item.badge}
                  </span>
                )}

                {/* Collapsed active indicator */}
                {isCollapsed && isActive && (
                  <div className="absolute right-1 w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Collapse toggle button at bottom on desktop */}
        <div className="hidden lg:flex items-center justify-end p-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <RiArrowRightSLine className="w-4 h-4" /> : <RiArrowLeftSLine className="w-4 h-4" />}
          </button>
        </div>

      </aside>
    </>
  );
}
