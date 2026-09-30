import React from 'react';
import { 
  Cloud, 
  MessageSquare, 
  Compass, 
  CheckCircle, 
  Layers, 
  BookOpen, 
  ShieldAlert, 
  Flame,
  Sparkles
} from 'lucide-react';

export type ActiveTab = 'chat' | 'roadmap' | 'quiz' | 'architecture' | 'services' | 'scenarios';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  streakCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, streakCount }) => {
  const tabs = [
    { id: 'chat', label: 'AI Tutor', icon: MessageSquare, badge: 'Live AI' },
    { id: 'roadmap', label: 'Learning Path', icon: Compass, badge: 'Custom' },
    { id: 'quiz', label: 'Practice Exam', icon: CheckCircle, badge: 'Prep' },
    { id: 'architecture', label: 'Architecture Lab', icon: Layers, badge: 'Interactive' },
    { id: 'services', label: 'Service Catalog', icon: BookOpen, badge: '50+' },
    { id: 'scenarios', label: 'Cloud Challenges', icon: ShieldAlert, badge: 'Real-world' },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
              <Cloud className="w-6 h-6 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                  AWS Learning Agent
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI Tutor
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Master Amazon Web Services & Certification Prep
              </p>
            </div>
          </div>

          {/* Right Header Status: Learning Streak & Cert Targets */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-full text-xs font-semibold text-amber-300 shadow-inner">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
              <span>{streakCount} {streakCount === 1 ? 'Concept' : 'Concepts'} Mastered</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 border border-slate-700/60 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-mono text-slate-300">CLF-C02 & SAA-C03 Ready</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none text-xs font-medium">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950 stroke-[2.2]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase tracking-wider ${
                      isActive
                        ? 'bg-slate-900/30 text-slate-900 font-bold'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
