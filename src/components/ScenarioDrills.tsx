import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  HelpCircle, 
  Award,
  AlertTriangle,
  Lightbulb,
  Workflow
} from 'lucide-react';
import { PRESET_SCENARIOS } from '../data/presetScenarios';
import { ScenarioChallenge } from '../types';

interface ScenarioDrillsProps {
  onAskTutor: (prompt: string) => void;
  onConceptLearned: () => void;
}

export const ScenarioDrills: React.FC<ScenarioDrillsProps> = ({ onAskTutor, onConceptLearned }) => {
  const [scenarios, setScenarios] = useState<ScenarioChallenge[]>(PRESET_SCENARIOS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentScenario = scenarios[currentIndex];

  const handleSelectOption = (id: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(id);
  };

  const handleSubmit = () => {
    if (!selectedOptionId || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    const chosen = currentScenario.options.find(o => o.id === selectedOptionId);
    if (chosen?.isBestSolution) {
      onConceptLearned();
    }
  };

  const handleNext = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    }
  };

  const generateNewScenario = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/scenario-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'Reliability and Cost Optimization' })
      });

      if (!res.ok) throw new Error('Failed to generate challenge');
      const data: ScenarioChallenge = await res.json();
      setScenarios(prev => [...prev, data]);
      setCurrentIndex(scenarios.length);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedOption = currentScenario.options.find(o => o.id === selectedOptionId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-slate-100">Fix the Cloud Architecture Challenge</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-world AWS production incidents, surprise bills, and outages. Diagnose the root cause and choose the Well-Architected fix!
          </p>
        </div>

        <button
          onClick={generateNewScenario}
          disabled={isGenerating}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 disabled:opacity-50 whitespace-nowrap"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Synthesizing Incident...' : 'Generate New Incident'}</span>
        </button>
      </div>

      {/* Scenario Challenge Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Incident Badge & Title */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono text-amber-400 font-bold">
              Incident Simulation {currentIndex + 1} of {scenarios.length}
            </span>
            <span className="bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono text-[11px] border border-slate-700">
              {currentScenario.wellArchitectedPillar}
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <span>{currentScenario.title}</span>
          </h3>
        </div>

        {/* Incident Context */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Incident Description:
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {currentScenario.context}
          </p>
        </div>

        {/* Observed Symptoms */}
        <div>
          <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Observed Production Symptoms:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentScenario.symptoms.map((sym, sIdx) => (
              <div key={sIdx} className="bg-rose-950/20 border border-rose-500/20 text-xs text-rose-200/90 p-2.5 rounded-lg flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span className="leading-snug">{sym}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Existing Architecture */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-2">
          <Workflow className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-100">Current Setup: </strong>
            {currentScenario.architecture}
          </div>
        </div>

        {/* Candidate Solutions Options */}
        <div className="space-y-3 pt-1">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            How would you architecturally resolve this issue?
          </div>

          <div className="space-y-2.5">
            {currentScenario.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800/50';

              if (isAnswerSubmitted) {
                if (opt.isBestSolution) {
                  btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-semibold shadow-inner';
                } else if (isSelected && !opt.isBestSolution) {
                  btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-200 font-semibold shadow-inner';
                } else {
                  btnStyle = 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-60';
                }
              } else if (isSelected) {
                btnStyle = 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold shadow-md';
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={isAnswerSubmitted}
                  className={`w-full text-left p-4 rounded-xl border flex items-start gap-3 transition-all ${btnStyle}`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5 ${
                    isAnswerSubmitted && opt.isBestSolution
                      ? 'bg-emerald-500 text-slate-950'
                      : isAnswerSubmitted && isSelected && !opt.isBestSolution
                      ? 'bg-rose-500 text-white'
                      : isSelected
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {opt.id}
                  </span>
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm font-semibold">{opt.title}</div>
                    {isAnswerSubmitted && (
                      <div className="text-xs text-slate-300 mt-2 pt-2 border-t border-slate-800 leading-relaxed">
                        <strong className="text-slate-100">Analysis: </strong>
                        {opt.explanation}
                        <div className="mt-1 text-[11px] text-slate-400">
                          <strong>Trade-offs: </strong> {opt.tradeOffs}
                        </div>
                      </div>
                    )}
                  </div>
                  {isAnswerSubmitted && opt.isBestSolution && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !opt.isBestSolution && (
                    <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
          {!isAnswerSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOptionId}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Verify Architectural Solution
            </button>
          ) : (
            <>
              <button
                onClick={() => onAskTutor(`Provide a comprehensive post-mortem for the AWS incident: "${currentScenario.title}". The context was: "${currentScenario.context}". The optimal resolution was: "${currentScenario.options.find(o => o.isBestSolution)?.title}". Explain the deep architectural principles and how to prevent this with automated CloudWatch alarms.`)}
                className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Ask Tutor for Full Post-Mortem</span>
              </button>

              {currentIndex < scenarios.length - 1 && (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-orange-500/20 ml-auto"
                >
                  <span>Next Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Engineering Takeaway Box */}
        {isAnswerSubmitted && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-1.5 animate-in fade-in duration-200">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Core AWS Well-Architected Takeaway:
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              {currentScenario.takeaway}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
