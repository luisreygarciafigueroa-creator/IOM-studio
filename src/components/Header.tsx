import React from 'react';
import {
  Brain,
  Cpu,
  Sparkles,
  Layers,
  Activity,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRightLeft
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'training' | 'process' | 'gemini' | 'vault';
  setActiveTab: (tab: 'training' | 'process' | 'gemini' | 'vault') => void;
  isModelTrained: boolean;
  trainingAccuracy: number;
  activeProcessCycles: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isModelTrained,
  trainingAccuracy,
  activeProcessCycles,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">IOM Neural AutoFlow</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  v1.9.0 Canónico
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Emulación Neuronal de la Unidad Informativa & Automatización de Procesos
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>78 Nodos / 13 Tríadas</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Modelo:</span>
              <span className={isModelTrained ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                {isModelTrained ? `${(trainingAccuracy * 100).toFixed(1)}% Acc` : 'No entrenado'}
              </span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Ciclos Auto:</span>
              <span className="text-cyan-300 font-semibold">{activeProcessCycles}</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('training')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'training'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Entrenador ML</span>
            </button>

            <button
              onClick={() => setActiveTab('process')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'process'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Automatización</span>
            </button>

            <button
              onClick={() => setActiveTab('gemini')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'gemini'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Gemini IA</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'vault'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Bóveda IOM</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
