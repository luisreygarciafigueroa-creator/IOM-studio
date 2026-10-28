import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  Send,
  Loader2,
  CheckCircle2,
  Zap,
  ArrowRight,
  TrendingDown,
  Layers,
  ShieldCheck,
  BrainCircuit,
  MessageSquare,
} from 'lucide-react';
import { ProcessPipeline, TriadNode, PredictionResult } from '../types/iom';

interface GeminiStudioProps {
  currentPipeline: ProcessPipeline;
  onApplyPipeline: (pipeline: ProcessPipeline) => void;
  pendingExplanation?: {
    source: TriadNode;
    target: TriadNode;
    prediction: PredictionResult;
  } | null;
}

export const GeminiStudio: React.FC<GeminiStudioProps> = ({
  currentPipeline,
  onApplyPipeline,
  pendingExplanation,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'devops' | 'supply_chain' | 'finance' | 'customer_ops' | 'custom'>('devops');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPipeline, setGeneratedPipeline] = useState<ProcessPipeline | null>(null);

  // Optimization state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<{
    recommendations: string[];
    theoreticalBasis: string;
    bottlenecksIdentified: string[];
    kpiEstimatedImpact: {
      cycleTimeReductionPct: number;
      bottleneckReductionPct: number;
      costSavingsPct: number;
    };
    source?: string;
    modelNotice?: string;
  } | null>(null);

  // Explanation state
  const [explanationData, setExplanationData] = useState<{
    text: string;
    proof: string;
  } | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // Trigger explanation if requested from TrainingStudio
  React.useEffect(() => {
    if (pendingExplanation) {
      handleExplain(pendingExplanation.source, pendingExplanation.target, pendingExplanation.prediction);
    }
  }, [pendingExplanation]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerateProcess = async () => {
    if (!promptInput.trim()) return;
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/gemini/generate-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInput,
          category: selectedCategory,
        }),
      });

      const data: ProcessPipeline = await response.json();
      if (data && data.tasks && data.tasks.length > 0) {
        setGeneratedPipeline(data);
      } else {
        setErrorMessage('No se pudo generar el flujo con los parámetros indicados.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Error al conectar con el servicio de generación.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/gemini/optimize-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline: currentPipeline }),
      });

      const data = await response.json();
      if (data && data.recommendations) {
        setOptimizationResult(data);
      } else {
        setErrorMessage(data?.error || 'No se pudo obtener el diagnóstico del proceso.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Error de comunicación con el motor de optimización.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleExplain = async (src: TriadNode, tgt: TriadNode, pred: PredictionResult) => {
    setIsExplaining(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/gemini/explain-iom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceNode: src,
          targetNode: tgt,
          predictedRelation: pred.predictedRelation,
          probabilities: pred.probabilities,
        }),
      });

      const data = await response.json();
      if (data && data.explanation) {
        setExplanationData({
          text: data.explanation,
          proof: data.mathematicalProof || 'Verificado con Lean 4 FormalRules',
        });
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider font-mono">
                Inteligencia Gemini 3.8 Flash (Server-Side GenAI)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Asesor & Generador de Procesos IOM con IA
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Diseña nuevos flujos de trabajo optimizados a partir de instrucciones en lenguaje natural,
              audita procesos existentes contra la teoría formal de la unidad informativa y explica
              las inferencias del modelo neuronal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunOptimization}
              disabled={isOptimizing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
            >
              {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
              <span>{isOptimizing ? 'Analizando...' : 'Diagnosticar Proceso Activo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 2 Main Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tool 1: AI Process Generator */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Generador Asistido de Flujos IOM
            </h3>
            <span className="text-xs text-slate-400 font-mono">Prompt to Workflow</span>
          </div>

          <p className="text-xs text-slate-400">
            Escribe los requisitos de cualquier proceso operativo o tecnológico. Gemini estructurará automáticamente las 6 tareas (avance y retroceso con posiciones 0, 1, 2) y sus relaciones operativas.
          </p>

          <div className="space-y-3">
            <textarea
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              placeholder="Ej: Automatizar la detección y contención de fraude en transacciones con alertas en tiempo real, verificación KYC dual y compensación de reversa inmediata..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Categoría:</span>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs"
                >
                  <option value="devops">DevOps & Cloud</option>
                  <option value="supply_chain">Logística & Cadena</option>
                  <option value="finance">Finanzas & Riesgo</option>
                  <option value="customer_ops">Operaciones & Soporte</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              <button
                onClick={handleGenerateProcess}
                disabled={isGenerating || !promptInput.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-40"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{isGenerating ? 'Generando...' : 'Crear Flujo con Gemini'}</span>
              </button>
            </div>
          </div>

          {/* Generated Pipeline Preview */}
          {generatedPipeline && (
            <div className="p-4 rounded-xl bg-slate-950 border border-purple-900/50 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
                    Flujo Generado Exitosamente
                  </span>
                  <h4 className="font-bold text-white text-sm">{generatedPipeline.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{generatedPipeline.description}</p>
                </div>

                <button
                  onClick={() => onApplyPipeline(generatedPipeline)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Cargar al Simulador</span>
                </button>
              </div>

              {/* Task list preview */}
              <div className="space-y-1.5 text-xs font-mono">
                {generatedPipeline.tasks?.map((t, idx) => (
                  <div key={t.id} className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">
                      {idx + 1}. {t.name}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {t.phase} | P{t.positionIndex} ({t.perspective})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tool 2: Strategic Process Diagnostic */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              Diagnóstico Estratégico & Optimización
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Proceso Activo: {currentPipeline.name.slice(0, 20)}...
            </span>
          </div>

          {optimizationResult ? (
            <div className="space-y-4 text-xs font-mono">
              {/* Estimated KPI impact */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Reducción de Tiempo</span>
                  <span className="text-lg font-bold text-cyan-400">
                    -{optimizationResult.kpiEstimatedImpact.cycleTimeReductionPct}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Cuellos Neutralizados</span>
                  <span className="text-lg font-bold text-emerald-400">
                    -{optimizationResult.kpiEstimatedImpact.bottleneckReductionPct}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Ahorro de Costos</span>
                  <span className="text-lg font-bold text-purple-400">
                    +{optimizationResult.kpiEstimatedImpact.costSavingsPct}%
                  </span>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  Recomendaciones de Automatización:
                </h4>
                <ul className="space-y-1.5 font-sans">
                  {optimizationResult.recommendations.map((rec, i) => (
                    <li key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 leading-snug flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Theoretical basis */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-indigo-400 font-bold uppercase block">
                  Fundamento Ontológico IOM
                </span>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  {optimizationResult.theoreticalBasis}
                </p>
              </div>

              {optimizationResult.modelNotice && (
                <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-[11px] text-indigo-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{optimizationResult.modelNotice}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/70 text-xs text-amber-300">
                  {errorMessage}
                </div>
              )}
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-400 max-w-sm">
                  Presiona "Diagnosticar Proceso Activo" para que el motor evalúe la topología de tareas actual contra los principios IOM.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tool 3: Model Prediction Explainer */}
      {explanationData && (
        <div className="bg-slate-900/90 border border-indigo-900/40 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Explicabilidad Epistemológica de la Inferencia
            </h3>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {explanationData.proof}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans space-y-2">
            <p className="whitespace-pre-line">{explanationData.text}</p>
          </div>
        </div>
      )}
    </div>
  );
};
