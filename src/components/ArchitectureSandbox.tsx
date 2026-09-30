import React, { useState } from 'react';
import { 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle, 
  DollarSign, 
  Workflow, 
  Server, 
  HardDrive, 
  Globe, 
  Zap, 
  Database, 
  Compass, 
  ListOrdered, 
  Bell, 
  Shuffle, 
  ArrowUpRight,
  Info,
  CheckCircle2
} from 'lucide-react';
import { ARCHITECTURE_BLUEPRINTS } from '../data/architectures';
import { ArchitectureBlueprint, ArchitectureNode } from '../types';

interface ArchitectureSandboxProps {
  onAskTutor: (prompt: string) => void;
}

const ICONS_MAP: Record<string, React.ElementType> = {
  Compass,
  Globe,
  HardDrive,
  Workflow,
  ShieldCheck,
  Zap,
  Database,
  Shuffle,
  ArrowUpRight,
  Server,
  ListOrdered,
  Bell,
};

export const ArchitectureSandbox: React.FC<ArchitectureSandboxProps> = ({ onAskTutor }) => {
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>(ARCHITECTURE_BLUEPRINTS[0].id);
  const currentBlueprint: ArchitectureBlueprint = 
    ARCHITECTURE_BLUEPRINTS.find(b => b.id === selectedBlueprintId) || ARCHITECTURE_BLUEPRINTS[0];

  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(currentBlueprint.nodes[0]);

  const handleSelectBlueprint = (blueprint: ArchitectureBlueprint) => {
    setSelectedBlueprintId(blueprint.id);
    setSelectedNode(blueprint.nodes[0]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Blueprint Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-6 h-6 text-amber-400" />
              Interactive AWS Architecture Blueprints
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Explore how production AWS services connect together. Click any node to inspect traffic flow, security, and costs.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {ARCHITECTURE_BLUEPRINTS.map((bp) => (
              <button
                key={bp.id}
                onClick={() => handleSelectBlueprint(bp)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                  selectedBlueprintId === bp.id
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {bp.title.split(' ')[0]} {bp.title.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Architecture Visualizer Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Visual Canvas */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100">{currentBlueprint.title}</h3>
                <span className="text-[11px] text-amber-400 font-mono font-medium">
                  Well-Architected: {currentBlueprint.wellArchitectedPillar}
                </span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {currentBlueprint.difficulty}
              </span>
            </div>

            {/* Interactive Node Grid Canvas */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-6 relative min-h-[300px] flex flex-col justify-center">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1 font-semibold">
                <Info className="w-3.5 h-3.5 text-amber-500" />
                Click any service node below to inspect details:
              </div>

              {/* Grid of Nodes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {currentBlueprint.nodes.map((node) => {
                  const Icon = ICONS_MAP[node.iconName] || Server;
                  const isSelected = selectedNode.id === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10 scale-102 ring-1 ring-amber-500'
                          : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-amber-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold truncate">{node.service}</div>
                        <div className="text-[10px] text-slate-400 truncate">{node.category}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Connections Legend */}
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-400 mb-2">Inter-Service Connections:</div>
                <div className="flex flex-wrap gap-2">
                  {currentBlueprint.connections.map((conn, cIdx) => (
                    <span key={cIdx} className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-1 rounded border border-slate-800 flex items-center gap-1">
                      <span>{conn.from.replace('node-', '')}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-amber-500" />
                      <span>{conn.to.replace('node-', '')}</span>
                      <span className="text-slate-500 font-sans">({conn.label})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Data Flow Steps */}
          <div className="mt-5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Workflow className="w-4 h-4" />
              Step-by-Step Request Flow:
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              {currentBlueprint.dataFlowSteps.map((step, sIdx) => (
                <div key={sIdx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-200">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Node Inspector Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {React.createElement(ICONS_MAP[selectedNode.iconName] || Server, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{selectedNode.name}</h4>
                  <span className="text-[11px] text-amber-400 font-mono">{selectedNode.category}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Architectural Role
              </label>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                {selectedNode.role}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Configuration Details
              </label>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                {selectedNode.details}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Security Best Practice
              </label>
              <p className="text-xs text-emerald-200/90 leading-relaxed bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl">
                {selectedNode.securityTip}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                Estimated Cost Profile
              </label>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                {currentBlueprint.costEstimator}
              </p>
            </div>
          </div>

          {/* Ask AI Tutor CTA */}
          <button
            onClick={() => onAskTutor(`In the "${currentBlueprint.title}" architecture, explain the exact role of ${selectedNode.name}. How does it securely interact with other services, what are the key trade-offs, and what common traps should I avoid in production?`)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            <HelpCircle className="w-4 h-4 stroke-[2.2]" />
            <span>Ask Tutor to Teach this Node</span>
          </button>
        </div>
      </div>
    </div>
  );
};
