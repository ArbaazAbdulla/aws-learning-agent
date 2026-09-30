import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Award, 
  RotateCcw, 
  ArrowRight, 
  HelpCircle, 
  BookOpen, 
  ChevronRight,
  Flame,
  BrainCircuit
} from 'lucide-react';
import { QuizQuestion } from '../types';
import { CLOUD_PRACTITIONER_QUESTIONS, SOLUTIONS_ARCHITECT_QUESTIONS } from '../data/presetQuizzes';

interface QuizSimulatorProps {
  onAskTutor: (prompt: string) => void;
  onConceptLearned: () => void;
}

export const QuizSimulator: React.FC<QuizSimulatorProps> = ({ onAskTutor, onConceptLearned }) => {
  const [activeBank, setActiveBank] = useState<'clf' | 'saa' | 'ai'>('clf');
  const [customTopic, setCustomTopic] = useState('Amazon VPC, Subnets & Routing');
  const [questions, setQuestions] = useState<QuizQuestion[]>(CLOUD_PRACTITIONER_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [answeredState, setAnsweredState] = useState<Record<number, { selected: number; correct: boolean }>>({});

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
      onConceptLearned();
    }

    setAnsweredState(prev => ({
      ...prev,
      [currentIndex]: { selected: selectedOption, correct: isCorrect }
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizCompleted(false);
    setAnsweredState({});
  };

  const switchBank = (bank: 'clf' | 'saa') => {
    setActiveBank(bank);
    setQuestions(bank === 'clf' ? CLOUD_PRACTITIONER_QUESTIONS : SOLUTIONS_ARCHITECT_QUESTIONS);
    handleRestartQuiz();
  };

  const generateAIQuiz = async () => {
    if (!customTopic.trim() || isGenerating) return;
    setIsGenerating(true);
    setActiveBank('ai');
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: customTopic,
          difficulty: 'Intermediate',
          count: 5
        })
      });

      if (!res.ok) throw new Error('Failed to generate AI quiz');
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        handleRestartQuiz();
      }
    } catch (err: any) {
      console.error('Quiz generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      {/* Quiz Selector Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              AWS Practice Quizzes & Exam Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Realistic, scenario-based practice questions designed for CLF-C02 & SAA-C03 certifications.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => switchBank('clf')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                activeBank === 'clf'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Cloud Practitioner (CLF-C02)
            </button>
            <button
              onClick={() => switchBank('saa')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                activeBank === 'saa'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Solutions Architect (SAA-C03)
            </button>
          </div>
        </div>

        {/* AI Custom Quiz Generator Bar */}
        <div className="mt-4 pt-1 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <BrainCircuit className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Generate custom quiz on any AWS topic (e.g. SQS vs SNS, KMS, CloudFront OAC)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-amber-500"
            />
          </div>
          <button
            onClick={generateAIQuiz}
            disabled={isGenerating || !customTopic.trim()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 whitespace-nowrap active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating 5 Questions...' : 'Generate AI Quiz'}</span>
          </button>
        </div>
      </div>

      {/* Quiz Progress & Question Box */}
      {!isQuizCompleted && currentQuestion && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-amber-400 font-bold">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-slate-600">•</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono text-[11px]">
                {currentQuestion.service}
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-300 font-medium">
              <span>Score:</span>
              <span className="font-bold text-amber-400">{score}</span> / {currentIndex + (isAnswerSubmitted ? 1 : 0)}
            </div>
          </div>

          {/* Scenario Context (if present) */}
          {currentQuestion.scenario && (
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                Scenario Context:
              </span>
              {currentQuestion.scenario}
            </div>
          )}

          {/* Question Text */}
          <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
            {currentQuestion.question}
          </h3>

          {/* Options List */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((opt, oIdx) => {
              const isSelected = selectedOption === oIdx;
              const isCorrectAnswer = oIdx === currentQuestion.correctIndex;

              let optionClasses = 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800/50';

              if (isAnswerSubmitted) {
                if (isCorrectAnswer) {
                  optionClasses = 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 font-semibold shadow-inner';
                } else if (isSelected && !isCorrectAnswer) {
                  optionClasses = 'bg-rose-950/40 border-rose-500/80 text-rose-200 font-semibold shadow-inner';
                } else {
                  optionClasses = 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-60';
                }
              } else if (isSelected) {
                optionClasses = 'bg-amber-500/20 border-amber-500/70 text-amber-200 font-semibold shadow-md';
              }

              return (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => handleSelectOption(oIdx)}
                  disabled={isAnswerSubmitted}
                  className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all ${optionClasses}`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5 ${
                    isAnswerSubmitted && isCorrectAnswer
                      ? 'bg-emerald-500 text-slate-950'
                      : isAnswerSubmitted && isSelected && !isCorrectAnswer
                      ? 'bg-rose-500 text-white'
                      : isSelected
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + oIdx)}
                  </span>
                  <span className="text-xs sm:text-sm leading-relaxed flex-1">
                    {opt}
                  </span>
                  {isAnswerSubmitted && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Buttons: Submit / Next */}
          <div className="pt-2 flex items-center justify-between">
            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <div className="w-full flex items-center justify-between gap-3 flex-wrap">
                <button
                  onClick={() => onAskTutor(`In AWS, explain this question in detail: "${currentQuestion.question}". The correct answer is: "${currentQuestion.options[currentQuestion.correctIndex]}". Why is this the best choice and why are the alternatives not recommended?`)}
                  className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 font-medium"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Ask Tutor for Deep Breakdown</span>
                </button>

                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-md shadow-orange-500/20 ml-auto"
                >
                  <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Finish & View Score'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Explanation Box (Revealed after submission) */}
          {isAnswerSubmitted && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 mt-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                {selectedOption === currentQuestion.correctIndex ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Correct! Great cloud instincts.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-sm">
                    <XCircle className="w-4 h-4" />
                    <span>Incorrect. Review the explanation below.</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-slate-100">Why this is correct: </strong>
                {currentQuestion.explanation}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 flex items-start gap-2 text-xs text-amber-200">
                <Award className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">Certification Exam Pattern: </strong>
                  {currentQuestion.examTip}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion Summary Card */}
      {isQuizCompleted && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30">
            <Award className="w-8 h-8 text-slate-950 stroke-[2.2]" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-100">Quiz Completed!</h3>
            <p className="text-sm text-slate-400 mt-1">Here is how you performed on this drill:</p>
          </div>

          <div className="flex items-center justify-center gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-6 py-4">
              <div className="text-3xl font-black text-amber-400">{score} / {questions.length}</div>
              <div className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Correct Answers</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl px-6 py-4">
              <div className="text-3xl font-black text-orange-400">
                {Math.round((score / questions.length) * 100)}%
              </div>
              <div className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Score Percentage</div>
            </div>
          </div>

          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            {score === questions.length
              ? "🌟 Perfect score! You have solid mastery of these cloud architecture concepts."
              : score >= Math.ceil(questions.length * 0.7)
              ? "👏 Great job! You passed the standard 70% AWS certification threshold. Keep practicing edge-cases."
              : "💪 Good effort! Cloud computing takes repetition. Ask the AI Tutor to explain the questions you missed."}
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestartQuiz}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Drill</span>
            </button>
            <button
              onClick={() => onAskTutor(`I just completed an AWS practice quiz on ${activeBank.toUpperCase()} and scored ${score}/${questions.length}. Can you give me a personalized study recommendation and test me on my weakest areas?`)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-orange-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Review Weak Spots with Tutor</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
