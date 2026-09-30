import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ChatTutor } from './components/ChatTutor';
import { RoadmapGenerator } from './components/RoadmapGenerator';
import { QuizSimulator } from './components/QuizSimulator';
import { ArchitectureSandbox } from './components/ArchitectureSandbox';
import { ServicesHub } from './components/ServicesHub';
import { ScenarioDrills } from './components/ScenarioDrills';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [activePrompt, setActivePrompt] = useState<string>('');
  const [streakCount, setStreakCount] = useState<number>(() => {
    const saved = localStorage.getItem('aws_agent_streak');
    return saved ? Math.max(Number(saved), 3) : 3;
  });

  useEffect(() => {
    localStorage.setItem('aws_agent_streak', streakCount.toString());
  }, [streakCount]);

  const handleConceptLearned = () => {
    setStreakCount(prev => prev + 1);
  };

  const handlePromptFromChild = (prompt: string) => {
    setActivePrompt(prompt);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streakCount={streakCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-10">
        {activeTab === 'chat' && (
          <ChatTutor
            initialPrompt={activePrompt}
            onClearInitialPrompt={() => setActivePrompt('')}
            onConceptLearned={handleConceptLearned}
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapGenerator
            onSelectTopicForTutor={handlePromptFromChild}
            onConceptLearned={handleConceptLearned}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizSimulator
            onAskTutor={handlePromptFromChild}
            onConceptLearned={handleConceptLearned}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureSandbox
            onAskTutor={handlePromptFromChild}
          />
        )}

        {activeTab === 'services' && (
          <ServicesHub
            onAskTutor={handlePromptFromChild}
          />
        )}

        {activeTab === 'scenarios' && (
          <ScenarioDrills
            onAskTutor={handlePromptFromChild}
            onConceptLearned={handleConceptLearned}
          />
        )}
      </main>

      {/* Simple Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-slate-400">AWS Learning Agent</span>
            <span>— Interactive AI Cloud Tutor & Certification Companion</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            AWS Certified Cloud Practitioner (CLF-C02) & Solutions Architect (SAA-C03)
          </div>
        </div>
      </footer>
    </div>
  );
}
