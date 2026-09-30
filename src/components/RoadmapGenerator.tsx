import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  Award, 
  ExternalLink, 
  RotateCcw,
  ArrowRight,
  Flame,
  Check
} from 'lucide-react';
import { LearningPath, RoadmapModule } from '../types';

interface RoadmapGeneratorProps {
  onSelectTopicForTutor: (prompt: string) => void;
  onConceptLearned: () => void;
}

export const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({ 
  onSelectTopicForTutor,
  onConceptLearned
}) => {
  const [background, setBackground] = useState('Beginner');
  const [goal, setGoal] = useState('AWS Certified Cloud Practitioner (CLF-C02)');
  const [hours, setHours] = useState('5');
  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<LearningPath | null>(() => {
    const saved = localStorage.getItem('aws_learning_roadmap');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return null;
  });

  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('aws_roadmap_completed');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {};
  });

  // Save roadmap and completions to localStorage
  useEffect(() => {
    if (roadmap) {
      localStorage.setItem('aws_learning_roadmap', JSON.stringify(roadmap));
    }
  }, [roadmap]);

  useEffect(() => {
    localStorage.setItem('aws_roadmap_completed', JSON.stringify(completedModules));
  }, [completedModules]);

  const toggleModuleComplete = (id: string) => {
    setCompletedModules(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) onConceptLearned();
      return next;
    });
  };

  const generateRoadmap = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          background,
          goal,
          hoursPerWeek: Number(hours),
          experienceLevel: background.includes('Beginner') ? 'Beginner' : 'Intermediate',
        })
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data: LearningPath = await res.json();
      setRoadmap(data);
      setCompletedModules({});
    } catch (err: any) {
      console.error('Roadmap generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const completedCount = roadmap?.modules?.filter(m => completedModules[m.id])?.length || 0;
  const totalCount = roadmap?.modules?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 border border-amber-500/30 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold text-slate-100">Personalized AWS Learning Roadmap</h2>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Tell the AI agent your background, target cloud certification or project goals, and available study hours. It generates an interactive step-by-step curriculum with hands-on free-tier labs and exam tips.
            </p>
          </div>
          {roadmap && (
            <div className="flex flex-col items-center justify-center bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 min-w-[140px]">
              <div className="text-2xl font-black text-amber-400">{progressPercent}%</div>
              <div className="text-xs text-slate-400 font-medium">Path Completed</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generator Configuration Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Background */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              1. Your Background
            </label>
            <div className="space-y-1.5">
              {[
                'Absolute Beginner / Non-Tech',
                'Frontend / Web Developer',
                'Backend / Python / Node Dev',
                'DevOps / Linux SysAdmin',
                'College / CS Student'
              ].map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBackground(bg)}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-all ${
                    background === bg
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-semibold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Target Goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              2. Target Cloud Goal
            </label>
            <div className="space-y-1.5">
              {[
                'AWS Certified Cloud Practitioner (CLF-C02)',
                'AWS Solutions Architect Associate (SAA-C03)',
                'Serverless & Fullstack Cloud Apps',
                'DevOps, CI/CD & Terraform on AWS'
              ].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-all ${
                    goal === g
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-semibold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Time Commitment & CTA */}
          <div className="flex flex-col justify-between">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                3. Study Time Commitment
              </label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {['3', '5', '10', '15'].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(h)}
                    className={`text-xs py-2 rounded-lg border text-center font-medium transition-all ${
                      hours === h
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-bold'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {h} hrs/week
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateRoadmap}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Custom Path...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{roadmap ? 'Regenerate Curriculum' : 'Generate My Learning Path'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Render Roadmap Modules */}
      {roadmap && (
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>{roadmap.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {roadmap.totalWeeks} Weeks
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{roadmap.description}</p>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Target: <span className="text-amber-400 font-semibold">{roadmap.certificationTarget}</span>
            </div>
          </div>

          <div className="space-y-4">
            {roadmap.modules.map((mod: RoadmapModule, index: number) => {
              const isDone = !!completedModules[mod.id];
              return (
                <div
                  key={mod.id}
                  className={`bg-slate-900 border rounded-2xl p-5 transition-all shadow-md ${
                    isDone 
                      ? 'border-emerald-500/40 bg-slate-900/50' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleModuleComplete(mod.id)}
                        className={`mt-1 p-1 rounded-lg transition-colors ${
                          isDone 
                            ? 'text-emerald-400 hover:text-emerald-300' 
                            : 'text-slate-600 hover:text-amber-400'
                        }`}
                        title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-6 h-6 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            {mod.week}
                          </span>
                          <h4 className={`text-base font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                            {mod.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {mod.summary}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectTopicForTutor(`Teach me ${mod.title} (${mod.week}). Services covered: ${mod.services.join(', ')}. Break down the key concepts with an intuitive analogy, architecture flow, and guide me through the hands-on project: "${mod.handsOnLab}".`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold whitespace-nowrap transition-all shadow-sm"
                      title="Open full lesson with AI tutor"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Learn with Tutor</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Badges for Services */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Services:</span>
                    {mod.services.map((srv, sIdx) => (
                      <span key={sIdx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                        {srv}
                      </span>
                    ))}
                  </div>

                  {/* Core Concepts */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
                      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        Key Concepts to Master
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                        {mod.keyConcepts.map((kc, kIdx) => (
                          <li key={kIdx} className="leading-snug">{kc}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
                      <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Award className="w-3 h-3 text-emerald-400" />
                        Hands-On Free Tier Lab
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">
                        {mod.handsOnLab}
                      </p>
                    </div>
                  </div>

                  {/* Exam Tip */}
                  <div className="mt-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-2.5 flex items-start gap-2 text-xs text-amber-200/90">
                    <Award className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-400">Exam Trap Insight: </strong>
                      {mod.examTip}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
