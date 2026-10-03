import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import QuantSection from './components/aptitude/QuantSection';
import VerbalSection from './components/verbal/VerbalSection';
import ReasoningSection from './components/reasoning/ReasoningSection';
import PseudocodeSection from './components/pseudocode/PseudocodeSection';
import MockTestsSection from './components/mock/MockTestsSection';
import ExamInterface from './components/mock/ExamInterface';
import AnalyticsSection from './components/analytics/AnalyticsSection';
import QuestionBankSection from './components/questionBank/QuestionBankSection';
import BookmarksSection from './components/bookmarks/BookmarksSection';
import StudyNotesSection from './components/notes/StudyNotesSection';
import { fetchDailyGoal, fetchBookmarks, fetchMockTestDetails } from './services/api';
import { 
  RiSearchLine, 
  RiCloseLine, 
  RiArrowRightLine, 
  RiFullscreenExitLine, 
  RiSunLine, 
  RiMoonLine,
  RiFocus2Line
} from '@remixicon/react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('prepforge_dark_mode') === 'true';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(null);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  // Focus / Examination Full Screen Mode state
  const [isZeroDistraction, setIsZeroDistraction] = useState(false);

  // Active exam session (when taking a full mock test or sectional test)
  const [activeExamTest, setActiveExamTest] = useState(null);

  // Global search modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('prepforge_dark_mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    async function loadMeta() {
      const dg = await fetchDailyGoal();
      const bm = await fetchBookmarks();
      setDailyGoal(dg);
      setBookmarkCount(bm.length);
    }
    loadMeta();
  }, [currentTab, activeExamTest]);

  // Sync focus state with browser fullscreen events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isZeroDistraction) {
        setIsZeroDistraction(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isZeroDistraction]);

  // Global keyboard shortcuts: '/' for search, 'Escape' to exit search or focus mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        } else if (isZeroDistraction) {
          handleToggleZeroDistraction();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isZeroDistraction]);

  const handleToggleZeroDistraction = () => {
    if (!isZeroDistraction) {
      setIsZeroDistraction(true);
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      setIsZeroDistraction(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleLaunchTest = (testObj) => {
    setActiveExamTest(testObj);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchTestById = async (testId) => {
    const test = await fetchMockTestDetails(testId);
    if (test) {
      setActiveExamTest(test);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExitTest = () => {
    setActiveExamTest(null);
    setCurrentTab('mock');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tabId) => {
    setActiveExamTest(null);
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If candidate is actively taking an exam, render dedicated exam interface
  if (activeExamTest) {
    return (
      <ExamInterface
        test={activeExamTest}
        onExitTest={handleExitTest}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090e17] text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Formal Examination Focus Header vs Standard Navbar */}
      {isZeroDistraction ? (
        <div className="sticky top-0 z-50 bg-[#0f172a] text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <RiFocus2Line className="w-4 h-4 text-emerald-400" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs tracking-wider uppercase text-slate-200">Formal Examination Focus Mode</span>
              <span className="text-slate-400 text-xs hidden sm:inline">| Standard testing environment · Sidebars suspended</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Toggle Dark Mode"
            >
              {darkMode ? <RiSunLine className="w-4 h-4 text-amber-400" /> : <RiMoonLine className="w-4 h-4" />}
            </button>
            <button
              onClick={handleToggleZeroDistraction}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
              title="Exit Full Screen Mode (or press Esc)"
            >
              <RiFullscreenExitLine className="w-3.5 h-3.5" />
              <span>Exit Focus Mode (Esc)</span>
            </button>
          </div>
        </div>
      ) : (
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          dailyGoal={dailyGoal}
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          isZeroDistraction={isZeroDistraction}
          onToggleZeroDistraction={handleToggleZeroDistraction}
        />
      )}

      <div className="flex">
        {/* Sidebar - Suspended in Focus Mode */}
        {!isZeroDistraction && (
          <Sidebar
            currentTab={currentTab}
            onNavigate={handleNavigate}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            bookmarkCount={bookmarkCount}
          />
        )}

        {/* Main Content Area */}
        <main className={`
          flex-1 transition-all duration-200 min-h-[calc(100vh-3.5rem)]
          ${isZeroDistraction ? 'max-w-5xl mx-auto w-full p-4 sm:p-8' : `${isCollapsed ? 'lg:ml-16' : 'lg:ml-60'} p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full`}
        `}>
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigate={handleNavigate}
              onStartTest={handleLaunchTestById}
            />
          )}

          {currentTab === 'quant' && <QuantSection />}

          {currentTab === 'verbal' && <VerbalSection />}

          {currentTab === 'reasoning' && <ReasoningSection />}

          {currentTab === 'pseudocode' && <PseudocodeSection />}

          {currentTab === 'mock' && (
            <MockTestsSection
              onLaunchTest={handleLaunchTest}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsSection
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'questions' && <QuestionBankSection />}

          {currentTab === 'bookmarks' && (
            <BookmarksSection
              onLaunchCustomQuiz={handleLaunchTest}
            />
          )}

          {currentTab === 'notes' && <StudyNotesSection />}
        </main>
      </div>

      {/* Global Command / Curriculum Search Modal */}
      {isSearchOpen && (
        <div 
          onClick={() => setIsSearchOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-[#0d1522] rounded-xl p-6 shadow-xl space-y-4 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <RiSearchLine className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search curriculum modules, topics, formulas..."
                className="flex-1 bg-transparent text-sm focus:outline-none text-slate-800 dark:text-white"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Assessment Modules
              </span>
              {[
                { title: "Quantitative Aptitude & Numerical Reasoning", tab: "quant" },
                { title: "Verbal Ability & Grammar Compendium", tab: "verbal" },
                { title: "Logical Reasoning & Deductive Puzzles", tab: "reasoning" },
                { title: "Pseudocode Execution & Memory Tracing", tab: "pseudocode" },
                { title: "Official Full-Length Mock Examinations (15 Blueprints)", tab: "mock" },
                { title: "Diagnostic Performance Audit & Recommendations", tab: "analytics" },
                { title: "Formulas, Standard Shortcuts & Syllabus Notes", tab: "notes" },
                { title: "Candidate Saved Question Dossier", tab: "bookmarks" },
                { title: "Curriculum Repository & Question Manager", tab: "questions" }
              ]
                .filter(item => !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      handleNavigate(item.tab);
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left font-medium text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <span>{item.title}</span>
                    <RiArrowRightLine className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
