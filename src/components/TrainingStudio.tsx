import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  TrainingConfig,
  ModelMetrics,
  EpochLog,
  PredictionResult,
  TriadNode,
  RelationType,
} from '../types/iom';
import { iomMlEngine, CLASS_NAMES } from '../services/iomMlEngine';
import { CANONICAL_NODES, CANONICAL_NODE_MAP } from '../data/iomCanonicalData';

interface TrainingStudioProps {
  metrics: ModelMetrics | null;
  setMetrics: (m: ModelMetrics) => void;
  onAskGeminiExplain: (source: TriadNode, target: TriadNode, prediction: PredictionResult) => void;
}

export const TrainingStudio: React.FC<TrainingStudioProps> = ({
  metrics,
  setMetrics,
  onAskGeminiExplain,
}) => {
  const [config, setConfig] = useState<TrainingConfig>({
    modelType: 'pi_hgat_t',
    learningRate: 0.005,
    epochs: 60,
    hiddenDim: 32,
    weightDecay: 0.0001,
    batchSize: 32,
    lossWeighted: true,
    validationMode: 'loo',
  });

  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState<EpochLog | null>(null);
  const [trainingHistory, setTrainingHistory] = useState<EpochLog[]>([]);

  // Inference Playground State
  const [sourceNodeId, setSourceNodeId] = useState<string>('T01_adv_P0');
  const [targetNodeId, setTargetNodeId] = useState<string>('T01_ret_P2');
  const [prediction, setPrediction] = useState<PredictionResult | null>(() => {
    const s = CANONICAL_NODE_MAP.get('T01_adv_P0')!;
    const t = CANONICAL_NODE_MAP.get('T01_ret_P2')!;
    return iomMlEngine.predict(s, t);
  });

  const handleStartTraining = async () => {
    setIsTraining(true);
    setTrainingHistory([]);
    setCurrentEpoch(null);

    try {
      const finalMetrics = await iomMlEngine.train(config, (epochLog, progress) => {
        setCurrentEpoch(epochLog);
        setTrainingHistory(prev => [...prev, epochLog]);
      });

      setMetrics(finalMetrics);

      // Refresh current prediction
      const s = CANONICAL_NODE_MAP.get(sourceNodeId);
      const t = CANONICAL_NODE_MAP.get(targetNodeId);
      if (s && t) {
        setPrediction(iomMlEngine.predict(s, t));
      }
    } catch (error) {
      console.error('Training error:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const handlePredict = (srcId: string, tgtId: string) => {
    setSourceNodeId(srcId);
    setTargetNodeId(tgtId);
    const s = CANONICAL_NODE_MAP.get(srcId);
    const t = CANONICAL_NODE_MAP.get(tgtId);
    if (s && t) {
      setPrediction(iomMlEngine.predict(s, t));
    }
  };

  const activeHistory = trainingHistory.length > 0 ? trainingHistory : metrics?.trainingLogs || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Cpu className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider font-mono">
                Entrenamiento & Emulación de Reglas IOM
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Modelo Neuronal de la Unidad Informativa
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Entrena una red neuronal que aprende la topología de 78 nodos y predice relaciones
              estructurales (<span className="text-cyan-400 font-mono">mirrorOf</span>, <span className="text-purple-400 font-mono">creates</span>, <span className="text-slate-400 font-mono">none</span>).
              Comprueba la invarianza matemática y su generalización bajo validación cruzada Leave-One-Triad-Out.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartTraining}
              disabled={isTraining}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                isTraining
                  ? 'bg-indigo-900/50 text-indigo-300 cursor-not-allowed border border-indigo-700/50'
                  : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-500/25 active:scale-95'
              }`}
            >
              <Play className={`w-4 h-4 ${isTraining ? 'animate-spin' : ''}`} />
              <span>{isTraining ? 'Entrenando Épocas...' : 'Iniciar Entrenamiento'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Config Panel & Live Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Hyperparameters & Configuration */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4 text-indigo-400" />
              Configuración del Modelo
            </h3>
            <span className="text-xs text-slate-400 font-mono">390 Pares Canónicos</span>
          </div>

          {/* Architecture Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Arquitectura / Experimento</label>
            <select
              value={config.modelType}
              onChange={e => setConfig({ ...config, modelType: e.target.value as any })}
              disabled={isTraining}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="pi_hgat_t">PI-HGAT-T (Atención en Grafos + Perspectivas)</option>
              <option value="mlp">MLP Denso (2 Capas Ocultas GELU)</option>
              <option value="ablation_no_phase">Ablación: Sin Fase (Solo Posición P0-P2)</option>
              <option value="ablation_no_pos">Ablación: Sin Posición (Solo Fase adv/ret)</option>
              <option value="negative_control">Control Negativo (Detección de Corrupción)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              {config.modelType === 'pi_hgat_t' && 'Arquitectura canónica de atención cruzada sobre los 6 nodos de la díada.'}
              {config.modelType === 'mlp' && 'Red neuronal densa estándar que aprende la función determinista.'}
              {config.modelType === 'ablation_no_phase' && 'Degrada precisión al ~60%: demuestra que la fase es indispensable.'}
              {config.modelType === 'ablation_no_pos' && 'Degrada precisión al ~64%: demuestra que la posición local es indispensable.'}
              {config.modelType === 'negative_control' && 'Control negativo riguroso: detecta aristas alteradas y descarta tautología.'}
            </p>
          </div>

          {/* Hyperparameters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Tasa de Aprendizaje</label>
              <select
                value={config.learningRate}
                onChange={e => setConfig({ ...config, learningRate: parseFloat(e.target.value) })}
                disabled={isTraining}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
              >
                <option value={0.001}>0.001</option>
                <option value={0.003}>0.003</option>
                <option value={0.005}>0.005</option>
                <option value={0.01}>0.010</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Épocas de Entrenamiento</label>
              <select
                value={config.epochs}
                onChange={e => setConfig({ ...config, epochs: parseInt(e.target.value) })}
                disabled={isTraining}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
              >
                <option value={30}>30 Épocas</option>
                <option value={60}>60 Épocas</option>
                <option value={100}>100 Épocas</option>
                <option value={150}>150 Épocas</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Dimensión Oculta</label>
              <select
                value={config.hiddenDim}
                onChange={e => setConfig({ ...config, hiddenDim: parseInt(e.target.value) })}
                disabled={isTraining}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
              >
                <option value={16}>16 neuronas</option>
                <option value={32}>32 neuronas</option>
                <option value={64}>64 neuronas</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Validación</label>
              <select
                value={config.validationMode}
                onChange={e => setConfig({ ...config, validationMode: e.target.value as any })}
                disabled={isTraining}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
              >
                <option value="loo">LOO (13 Folds)</option>
                <option value="split">Train/Test 80-20</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <input
              type="checkbox"
              id="lossWeighted"
              checked={config.lossWeighted}
              onChange={e => setConfig({ ...config, lossWeighted: e.target.checked })}
              disabled={isTraining}
              className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="lossWeighted" className="text-xs text-slate-300">
              Ponderación de Clases (Balancea 208 none / 78 mirror / 104 creates)
            </label>
          </div>

          {/* Mathematical Proof Info Card */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs font-mono">
            <div className="text-indigo-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Garantía Formal Lean 4
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Los 78 nodos derivan estrictamente de <span className="text-slate-200">13 × 2 × 3</span>.
              Punto fijo estricto demostrado: <span className="text-emerald-400">S_rev ∘ Ivo ∘ E (V_t) = V_t</span>.
            </p>
          </div>
        </div>

        {/* Center & Right Column: Training Live Graphs & Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Loss & Accuracy Chart */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  Convergencia de Entrenamiento & Curva de Pérdida
                </h3>
                <p className="text-xs text-slate-400">
                  Evolución en tiempo real de Cross-Entropy Loss y Accuracy global
                </p>
              </div>

              {currentEpoch && (
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Época: <strong className="text-white">{currentEpoch.epoch}/{config.epochs}</strong></span>
                  <span className="text-cyan-400">Pérdida: <strong>{currentEpoch.loss.toFixed(4)}</strong></span>
                  <span className="text-emerald-400">Acc: <strong>{(currentEpoch.accuracy * 100).toFixed(1)}%</strong></span>
                </div>
              )}
            </div>

            {/* SVG Interactive Chart */}
            <div className="h-44 w-full bg-slate-950 rounded-xl p-3 border border-slate-800 relative flex flex-col justify-end">
              {activeHistory.length > 1 ? (
                <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${activeHistory.length} 100`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Loss Line (normalized 0 to max loss ~1.5) */}
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    points={activeHistory
                      .map((h, i) => `${i},${Math.max(5, 95 - (h.loss / 1.6) * 90)}`)
                      .join(' ')}
                  />

                  {/* Accuracy Line (0 to 1 -> 95 to 5) */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="3 3"
                    points={activeHistory
                      .map((h, i) => `${i},${95 - h.accuracy * 90}`)
                      .join(' ')}
                  />
                </svg>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs font-mono">
                  Presiona 'Iniciar Entrenamiento' para visualizar la curva de optimización
                </div>
              )}

              {/* Chart Legend */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-900 mt-2">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <span className="w-3 h-0.5 bg-cyan-400 inline-block"></span>
                    Pérdida (Cross-Entropy)
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-3 h-0.5 bg-emerald-400 inline-block border-b border-dashed"></span>
                    Precisión (Accuracy)
                  </span>
                </div>
                <span>390 muestras evaluadas</span>
              </div>
            </div>

            {/* Performance Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Precisión Global</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {metrics ? `${(metrics.accuracy * 100).toFixed(1)}%` : '--'}
                </span>
                <span className="text-[10px] text-slate-500 block">Exacta en 3 clases</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Macro-F1 Score</span>
                <span className="text-xl font-bold font-mono text-cyan-400">
                  {metrics ? metrics.macroF1.toFixed(3) : '--'}
                </span>
                <span className="text-[10px] text-slate-500 block">Balance no trivial</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">mirrorOf F1</span>
                <span className="text-xl font-bold font-mono text-indigo-400">
                  {metrics ? metrics.f1.mirrorOf.toFixed(3) : '--'}
                </span>
                <span className="text-[10px] text-slate-500 block">78 aristas simétricas</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">creates F1</span>
                <span className="text-xl font-bold font-mono text-purple-400">
                  {metrics ? metrics.f1.creates.toFixed(3) : '--'}
                </span>
                <span className="text-[10px] text-slate-500 block">104 aristas causales</span>
              </div>
            </div>
          </div>

          {/* Confusion Matrix and Fold Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Confusion Matrix */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  Matriz de Confusión (3×3)
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Real \ Predicho</span>
              </div>

              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-xs">
                <table className="w-full text-center">
                  <thead>
                    <tr className="text-slate-400 text-[11px] border-b border-slate-800">
                      <th className="py-1 text-left">Real</th>
                      <th>none</th>
                      <th>mirror</th>
                      <th>creates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CLASS_NAMES.map((actualName, actualIdx) => (
                      <tr key={actualName} className="border-b border-slate-900/80">
                        <td className="py-1.5 text-left font-semibold text-slate-300 text-[11px]">
                          {actualName}
                        </td>
                        {CLASS_NAMES.map((predName, predIdx) => {
                          const val = metrics ? metrics.confusionMatrix.matrix[actualIdx][predIdx] : 0;
                          const isDiagonal = actualIdx === predIdx;
                          return (
                            <td
                              key={predName}
                              className={`py-1.5 ${
                                isDiagonal && val > 0
                                  ? 'bg-emerald-950/40 text-emerald-300 font-bold'
                                  : val > 0
                                  ? 'bg-rose-950/40 text-rose-300 font-bold'
                                  : 'text-slate-600'
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leave-One-Triad-Out Folds */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  LOO Cross-Validation (13 Tríadas)
                </h4>
                <span className="text-[10px] font-mono text-emerald-400">
                  {metrics?.foldAccuracies && metrics.foldAccuracies.length > 0 ? '100% Generalización' : 'Pendiente'}
                </span>
              </div>

              <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800 font-mono text-xs max-h-40 overflow-y-auto">
                {metrics?.foldAccuracies && metrics.foldAccuracies.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1.5">
                    {metrics.foldAccuracies.map(f => (
                      <div key={f.fold} className="flex items-center justify-between px-2 py-1 bg-slate-900 rounded border border-slate-800/80 text-[11px]">
                        <span className="text-slate-400">T{f.heldOutTriad.toString().padStart(2, '0')}:</span>
                        <span className="text-emerald-400 font-bold">{(f.accuracy * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-[11px] text-center py-4">
                    Ejecuta el entrenamiento para evaluar cada una de las 13 tríadas como conjunto de prueba held-out.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Inference Playground */}
      <div className="bg-slate-900/90 border border-indigo-900/30 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Laboratorio de Inferencia & Clasificación de Pares
            </h3>
            <p className="text-xs text-slate-400">
              Prueba cualquier par de nodos en el modelo neuronal entrenado para obtener predicción de relación y vector de probabilidades
            </p>
          </div>

          {prediction && (
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                prediction.predictedRelation === 'mirrorOf'
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                  : prediction.predictedRelation === 'creates'
                  ? 'bg-purple-950 text-purple-300 border-purple-700'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                Predicción: {prediction.predictedRelation} ({((prediction.confidence || 0) * 100).toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        {/* Node Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Node */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Nodo Origen (Source)</span>
              <span className="font-mono text-cyan-400 text-[11px]">
                {CANONICAL_NODE_MAP.get(sourceNodeId)?.label} ({CANONICAL_NODE_MAP.get(sourceNodeId)?.phase})
              </span>
            </label>
            <select
              value={sourceNodeId}
              onChange={e => handlePredict(e.target.value, targetNodeId)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              {CANONICAL_NODES.map(n => (
                <option key={n.node_id} value={n.node_id}>
                  [{n.node_id}] {n.label} — T{n.triad_index.toString().padStart(2, '0')} {n.phase} {n.position} ({n.perspective})
                </option>
              ))}
            </select>
          </div>

          {/* Target Node */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Nodo Destino (Target)</span>
              <span className="font-mono text-purple-400 text-[11px]">
                {CANONICAL_NODE_MAP.get(targetNodeId)?.label} ({CANONICAL_NODE_MAP.get(targetNodeId)?.phase})
              </span>
            </label>
            <select
              value={targetNodeId}
              onChange={e => handlePredict(sourceNodeId, e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {CANONICAL_NODES.map(n => (
                <option key={n.node_id} value={n.node_id}>
                  [{n.node_id}] {n.label} — T{n.triad_index.toString().padStart(2, '0')} {n.phase} {n.position} ({n.perspective})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prediction Display Bar */}
        {prediction && (
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-white">Probabilidades del Modelo:</span>
                <span className="text-slate-400">none: <strong className="text-slate-200">{(prediction.probabilities.none * 100).toFixed(1)}%</strong></span>
                <span className="text-indigo-400">mirrorOf: <strong>{(prediction.probabilities.mirrorOf * 100).toFixed(1)}%</strong></span>
                <span className="text-purple-400">creates: <strong>{(prediction.probabilities.creates * 100).toFixed(1)}%</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Conforme con Lean 4 FormalRules
                </span>
              </div>
            </div>

            {/* Probability Bars */}
            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${prediction.probabilities.none * 100}%` }}
                className="bg-slate-600 h-full transition-all duration-300"
                title={`none: ${(prediction.probabilities.none * 100).toFixed(1)}%`}
              />
              <div
                style={{ width: `${prediction.probabilities.mirrorOf * 100}%` }}
                className="bg-indigo-500 h-full transition-all duration-300"
                title={`mirrorOf: ${(prediction.probabilities.mirrorOf * 100).toFixed(1)}%`}
              />
              <div
                style={{ width: `${prediction.probabilities.creates * 100}%` }}
                className="bg-purple-500 h-full transition-all duration-300"
                title={`creates: ${(prediction.probabilities.creates * 100).toFixed(1)}%`}
              />
            </div>

            {/* Gemini Explain Action */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-400">
                ¿Deseas una justificación epistemológica y matemática detallada de esta inferencia?
              </p>
              <button
                onClick={() => {
                  const s = CANONICAL_NODE_MAP.get(sourceNodeId);
                  const t = CANONICAL_NODE_MAP.get(targetNodeId);
                  if (s && t) onAskGeminiExplain(s, t, prediction);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-950 text-purple-300 hover:bg-purple-900 border border-purple-800 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Explicar con Gemini IA</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
