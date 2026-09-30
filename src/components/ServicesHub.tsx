import React, { useState } from 'react';
import { 
  Search, 
  Lightbulb, 
  Terminal, 
  Award, 
  ArrowRight, 
  Copy, 
  Check, 
  BookOpen,
  Sparkles,
  Server,
  HardDrive,
  ShieldCheck,
  Zap,
  Network,
  Database,
  Layers,
  Globe,
  Compass,
  ListOrdered,
  Bell,
  Activity
} from 'lucide-react';
import { AWS_SERVICES_DATA } from '../data/awsServices';
import { AWSService } from '../types';

interface ServicesHubProps {
  onAskTutor: (prompt: string) => void;
}

const CATEGORIES = [
  'All',
  'Compute',
  'Storage',
  'Database',
  'Networking',
  'Security & IAM',
  'Serverless & Integration',
  'Monitoring & Management'
];

const ICONS: Record<string, React.ElementType> = {
  Server,
  HardDrive,
  ShieldCheck,
  Zap,
  Network,
  Database,
  Layers,
  Globe,
  Compass,
  ListOrdered,
  Bell,
  Activity
};

export const ServicesHub: React.FC<ServicesHubProps> = ({ onAskTutor }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedCli, setCopiedCli] = useState<string | null>(null);

  const filteredServices = AWS_SERVICES_DATA.filter(service => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesSearch = 
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.code.toLowerCase().includes(search.toLowerCase()) ||
      service.tagline.toLowerCase().includes(search.toLowerCase()) ||
      service.analogy.toLowerCase().includes(search.toLowerCase()) ||
      service.keyFeatures.some(f => f.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const copyCli = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCli(id);
    setTimeout(() => setCopiedCli(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Header & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-400" />
              AWS Service Catalog & Cheat Sheets
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Curated breakdowns of core AWS services with real-world analogies, free tier limits, and exam tips.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services, analogies, features..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-medium pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredServices.map((service: AWSService) => {
          const Icon = ICONS[service.iconName] || Server;
          return (
            <div
              key={service.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-100">{service.code}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                          {service.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">{service.name}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onAskTutor(`Explain ${service.code} (${service.name}) in depth. Break down its architecture, common architectural patterns, security gotchas, and typical exam questions.`)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700 border border-slate-700 transition-colors"
                    title="Ask AI Tutor"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {service.tagline}
                </p>

                {/* Real-World Metaphor / Analogy Card */}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Real-World Analogy:</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed italic">
                    "{service.analogy}"
                  </p>
                </div>

                {/* Free Tier Info */}
                <div className="text-[11px] text-slate-400 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                  <strong className="text-slate-300">AWS Free Tier: </strong>
                  {service.freeTier}
                </div>

                {/* Key Features */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Key Architectural Capabilities:
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {service.keyFeatures.slice(0, 3).map((f, fIdx) => (
                      <li key={fIdx} className="leading-snug">{f}</li>
                    ))}
                  </ul>
                </div>

                {/* CLI Command Box */}
                <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                  <div className="flex items-center justify-between px-2.5 py-1 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-amber-400" />
                      AWS CLI Sample
                    </span>
                    <button
                      onClick={() => copyCli(service.cliExample, service.id)}
                      className="hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedCli === service.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-2 text-[11px] font-mono text-emerald-400/90 overflow-x-auto whitespace-pre">
                    <code>{service.cliExample}</code>
                  </pre>
                </div>

                {/* Exam Tip */}
                <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-2.5 text-xs text-slate-300 flex items-start gap-2">
                  <Award className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-400">Exam Note: </strong>
                    {service.examTip}
                  </div>
                </div>
              </div>

              {/* Bottom Tutor CTA */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {service.commonUseCases[0]}
                </span>
                <button
                  onClick={() => onAskTutor(`Tell me a fun interactive story about how a web developer uses ${service.code} with an analogy and a step-by-step beginner lab tutorial.`)}
                  className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <span>Interactive Deep Dive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <p>No AWS services found matching "{search}".</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('All'); }}
            className="text-xs text-amber-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
