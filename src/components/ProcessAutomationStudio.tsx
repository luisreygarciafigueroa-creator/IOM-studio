import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Zap,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingDown,
  Layers,
  Activity,
  Terminal,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import {
  AutomationLogEntry,
  ProcessPipeline,
  ProcessTask,
  RelationType,
} from '../types/iom';
import {
  processAutomationEngine,
  PRESET_PIPELINES,
} from '../services/processEngine';

interface ProcessAutomationStudioProps {
  onOpenGeminiOptimizer: (pipeline: ProcessPipeline) => void;
}

export const ProcessAutomationStudio: React.FC<ProcessAutomationStudioProps> = ({
  onOpenGeminiOptimizer,
}) => {
  const [pipeline, setPipeline] = useState<ProcessPipeline>(processAutomationEngine.getPipeline());
  const [logs, setLogs] = useState<AutomationLogEntry[]>([]);
  const [speed, setSpeed] = useState<number>(1);
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);
  const [selectedTask, setSelectedTask] = useState<ProcessTask | null>(null);

  useEffect(() => {
    const unsubscribe = processAutomationEngine.subscribe((updatedPipeline, updatedLogs) => {
      setPipeline({ ...updatedPipeline });
      setLogs([...updatedLogs]);
    });
    return unsubscribe;
  }, []);

  const handleSelectPreset = (index: number) => {
    setActivePresetIndex(index);
    const chosen = PRESET_PIPELINES[index];
    processAutomationEngine.setPipeline(chosen);
    setSelectedTask(null);
  };

  const handleStart = () => {
    processAutomationEngine.start();
  };

  const handlePause = () => {
    processAutomationEngine.pause();
  };

  const handleReset = () => {
    processAutomationEngine.resetTasks();
  };

  const handleStep = () => {
    processAutomationEngine.step();
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    processAutomationEngine.setSpeed(newSpeed);
  };

  const handleOptimizeMl = () => {
    processAutomationEngine.optimizePipelineWithMl();
  };

  const advTasks = pipeline.tasks.filter(t => t.phase === 'adv');
  const retTasks = pipeline.tasks.filter(t => t.phase === 'ret');

  // Baseline vs optimized calculation
  const timeSavedPct = Math.round(
    ((pipeline.metrics.baselineCycleTimeMs - pipeline.metrics.totalCycleTimeMs) /
      pipeline.metrics.baselineCycleTimeMs) *
      100
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header & Preset Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Activity className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
                Automatización de Procesos con IOM ML
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {pipeline.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {pipeline.description}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOptimizeMl}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 text-emerald-200" />
              <span>Optimizar con IOM ML</span>
            </button>

            <button
              onClick={() => onOpenGeminiOptimizer(pipeline)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Asesor Gemini IA</span>
            </button>
          </div>
        </div>

        {/* Preset Selector Tabs */}
        <div className="flex items-center gap-2 pt-6 border-t border-slate-800/80 mt-6 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 font-mono shrink-0">Plantillas:</span>
          {PRESET_PIPELINES.map((preset, idx) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                activePresetIndex === idx
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-800/80 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Comparison Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-400 block">Tiempo de Ciclo</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {pipeline.metrics.totalCycleTimeMs} ms
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold flex items-center">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              -{timeSavedPct}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Línea Base: {pipeline.metrics.baselineCycleTimeMs} ms
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-400 block">Tasa de Cuellos de Botella</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {pipeline.metrics.bottleneckRate}%
            </span>
            <span className="text-xs text-emerald-400 font-mono">Neutralizados</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Resueltos vía espejo de compensación
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-400 block">Eficiencia de Costos</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-purple-400">
              +{pipeline.metrics.costEfficiency}%
            </span>
            <span className="text-xs text-purple-300 font-mono">ROI Óptimo</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Deduplicación por operador S_fwd
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-400 block">Auto-Recuperación (Self-Healing)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {pipeline.metrics.selfHealingRate}%
            </span>
            <span className="text-xs text-amber-300 font-mono">mirrorOf</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Sin intervención humana requerida
          </span>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {pipeline.status === 'running' ? (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-md active:scale-95"
            >
              <Pause className="w-4 h-4" />
              <span>Pausar</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md active:scale-95"
            >
              <Play className="w-4 h-4" />
              <span>{pipeline.status === 'paused' ? 'Reanudar' : 'Iniciar Flujo'}</span>
            </button>
          )}

          <button
            onClick={handleStep}
            disabled={pipeline.status === 'running'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-40"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Paso Individual</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span className="text-slate-400">Velocidad:</span>
          {[0.5, 1, 2, 4].map(s => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                speed === s
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Visual Process Pipeline: Advance Phase (Evolución) vs Retreat Phase (Involución) */}
      <div className="space-y-6">
        {/* Advance Phase (Evolución) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                Fase de Avance (→) · Evolución / Proyección
              </span>
              <span className="text-xs text-slate-400">
                Mictecacíhuatl: Expande, recombina y ejecuta el valor operacional
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">P0 → P1 → P2</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {advTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isSelected={selectedTask?.id === task.id}
                onClick={() => setSelectedTask(task)}
              />
            ))}
          </div>
        </div>

        {/* Inter-Phase Dynamics Indicator */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="h-0.5 flex-1 bg-gradient-to-r from-cyan-900/50 to-indigo-900/50"></div>
          <div className="px-4 py-1.5 rounded-full bg-slate-900 border border-indigo-800/80 text-xs font-mono text-indigo-300 flex items-center gap-2 shadow-lg">
            <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Reglas ML IOM: 'mirrorOf' (Compensación) & 'creates' (Generación Causal)</span>
          </div>
          <div className="h-0.5 flex-1 bg-gradient-to-r from-indigo-900/50 to-purple-900/50"></div>
        </div>

        {/* Retreat Phase (Involución) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-950 text-purple-400 border border-purple-800">
                Fase de Retroceso (←) · Involución / Auto-Sanación & Cierre
              </span>
              <span className="text-xs text-slate-400">
                Mictlantecuhtli: Despoja anomalías, neutraliza fallos y retorna al vacío V_t
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">P2 ← P1 ← P0</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {retTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isSelected={selectedTask?.id === task.id}
                onClick={() => setSelectedTask(task)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Task Inspector & Live Automation Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Detail Inspector */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-cyan-400" />
            Inspector de Tarea Informativa
          </h3>

          {selectedTask ? (
            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">Nombre de Tarea</span>
                <span className="font-bold text-white text-sm block font-sans">{selectedTask.name}</span>
                <p className="text-slate-300 font-sans text-xs pt-1">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] block">Perspectiva</span>
                  <span className="text-indigo-400 font-semibold">{selectedTask.perspective}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Fase & Posición</span>
                  <span className="text-cyan-400 font-semibold">{selectedTask.phase} (P{selectedTask.positionIndex})</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Tiempo de Ejecución</span>
                  <span className="text-white">{selectedTask.executionTimeMs} ms</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Costo / Token</span>
                  <span className="text-white">${selectedTask.cost}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-500 text-[10px] block mb-1">Relaciones Salientes Automatizadas</span>
                {pipeline.relations.filter(r => r.sourceTaskId === selectedTask.id).length > 0 ? (
                  <div className="space-y-1">
                    {pipeline.relations
                      .filter(r => r.sourceTaskId === selectedTask.id)
                      .map(r => (
                        <div key={r.id} className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px] flex items-center justify-between">
                          <span>Hacia: <strong className="text-slate-200">{r.targetTaskId.slice(-6)}</strong></span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.relationType === 'mirrorOf'
                              ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                              : r.relationType === 'creates'
                              ? 'bg-purple-950 text-purple-300 border border-purple-700'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {r.relationType}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <span className="text-slate-500 text-[11px]">Sin aristas salientes</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs text-center py-8">
              Haz clic en cualquier tarea del diagrama para inspeccionar su trazabilidad y relaciones operativas.
            </div>
          )}
        </div>

        {/* Live Event Terminal */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-white text-xs flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Telemetría y Registro de Decisiones Autónomas en Vivo
            </h3>
            <span className="text-[11px] text-slate-400">{logs.length} eventos registrados</span>
          </div>

          <div className="h-64 overflow-y-auto space-y-2 pr-1 text-xs">
            {logs.length > 0 ? (
              logs.map(log => (
                <div
                  key={log.id}
                  className="p-2 rounded bg-slate-900/70 border border-slate-800/80 flex items-start gap-3"
                >
                  <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      log.action === 'TRIGGER'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : log.action === 'COMPENSATE'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : log.action === 'PURIFY'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : log.action === 'ANOMALY_RESOLVED'
                        ? 'bg-teal-950 text-teal-300 border border-teal-800'
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    }`}
                  >
                    [{log.action}]
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 leading-snug">{log.details}</p>
                    {log.kpiImpact && (
                      <span className="text-[10px] text-emerald-400 block mt-0.5">
                        ↳ Impacto KPI: {log.kpiImpact}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-600 text-center py-12 text-xs">
                Inicia la simulación para observar los disparadores causales 'creates' y las auto-compensaciones 'mirrorOf' en tiempo real.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TaskCardProps {
  task: ProcessTask;
  isSelected: boolean;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isSelected, onClick }) => {
  const getStatusColor = () => {
    switch (task.status) {
      case 'running':
        return 'border-cyan-500 shadow-cyan-500/10 bg-slate-900';
      case 'completed':
        return 'border-emerald-600/70 bg-slate-900/90';
      case 'bottleneck':
        return 'border-amber-500 shadow-amber-500/20 bg-amber-950/20 animate-pulse';
      case 'compensated':
        return 'border-indigo-500 bg-indigo-950/20';
      case 'failed':
        return 'border-rose-500 bg-rose-950/20';
      default:
        return 'border-slate-800 bg-slate-950';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 border transition-all cursor-pointer relative ${getStatusColor()} ${
        isSelected ? 'ring-2 ring-indigo-500 scale-[1.02]' : 'hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
          {task.perspective} (P{task.positionIndex})
        </span>

        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold capitalize ${
            task.status === 'completed'
              ? 'text-emerald-400 bg-emerald-950 border border-emerald-800'
              : task.status === 'running'
              ? 'text-cyan-400 bg-cyan-950 border border-cyan-800'
              : task.status === 'bottleneck'
              ? 'text-amber-400 bg-amber-950 border border-amber-800'
              : 'text-slate-500 bg-slate-900'
          }`}
        >
          {task.status}
        </span>
      </div>

      <h4 className="font-semibold text-white text-xs mb-1 line-clamp-1">{task.name}</h4>
      <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">{task.description}</p>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-2">
        <div
          style={{ width: `${task.progress}%` }}
          className={`h-full transition-all duration-150 ${
            task.status === 'completed'
              ? 'bg-emerald-500'
              : task.status === 'bottleneck'
              ? 'bg-amber-500'
              : 'bg-cyan-500'
          }`}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>{task.executionTimeMs} ms</span>
        <span>${task.cost}</span>
      </div>
    </div>
  );
};
