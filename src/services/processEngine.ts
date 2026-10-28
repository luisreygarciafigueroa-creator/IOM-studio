/**
 * Process Automation & Optimization Engine powered by IOM Machine Learning
 * Maps business & engineering workflows into IOM Informational Units,
 * predicts transition dynamics, executes automated triggers, and computes KPI optimizations.
 */

import {
  AutomationLogEntry,
  ProcessPipeline,
  ProcessRelation,
  ProcessTask,
  RelationType,
  TriadPhase,
  LocalPosition,
} from '../types/iom';
import { evaluateCanonicalRelation } from '../data/iomCanonicalData';
import { iomMlEngine } from './iomMlEngine';

export const PRESET_PIPELINES: ProcessPipeline[] = [
  {
    id: 'pipeline_devops',
    name: 'CI/CD & Auto-Healing de Incidentes Cloud',
    category: 'devops',
    description: 'Automatización de compilación, canary deployment y auto-recuperación ante anomalías mediante espejos de compensación involutiva.',
    metrics: {
      totalCycleTimeMs: 1420,
      baselineCycleTimeMs: 4600,
      bottleneckRate: 3.2,
      costEfficiency: 69.1,
      selfHealingRate: 98.7,
      activeTasks: 0,
      completedCycles: 0,
    },
    status: 'idle',
    tasks: [
      {
        id: 'task_dev_01',
        name: 'Ingesta de Código & Linting Estructural',
        description: 'Singularidad inicial: verifica sintaxis y contratos en fase de avance.',
        perspective: 'Ind',
        phase: 'adv',
        positionIndex: 0,
        triadMapping: 2, // hardware | virtual | software
        executionTimeMs: 220,
        cost: 4.5,
        errorRisk: 0.05,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: ['task_dev_02'],
        compensatoryTasks: [],
      },
      {
        id: 'task_dev_02',
        name: 'Compilación & Test de Integración Dual',
        description: 'Polaridad dialéctica: confronta especificaciones y evalúa cobertura.',
        perspective: 'D',
        phase: 'adv',
        positionIndex: 1,
        triadMapping: 2,
        executionTimeMs: 480,
        cost: 12.0,
        errorRisk: 0.12,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: ['task_dev_03'],
        compensatoryTasks: ['task_dev_05'],
      },
      {
        id: 'task_dev_03',
        name: 'Canary Deploy & Síntesis Sistémica',
        description: 'Totalidad en avance: despliegue progresivo en entorno distribuido.',
        perspective: 'Tot',
        phase: 'adv',
        positionIndex: 2,
        triadMapping: 2,
        executionTimeMs: 350,
        cost: 18.5,
        errorRisk: 0.08,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: ['task_dev_04'],
        compensatoryTasks: [],
      },
      {
        id: 'task_dev_04',
        name: 'Telemetría de Rendimiento & Detección de Anomalías',
        description: 'Totalidad en retroceso: auditoría de estabilidad en tráfico real.',
        perspective: 'Tot',
        phase: 'ret',
        positionIndex: 2,
        triadMapping: 2,
        executionTimeMs: 290,
        cost: 8.0,
        errorRisk: 0.15,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: ['task_dev_06'],
        compensatoryTasks: ['task_dev_05'],
      },
      {
        id: 'task_dev_05',
        name: 'Auto-Rollback Compensatorio (Mictlantecuhtli)',
        description: 'Dualidad de involución: disolución instantánea del fallo sin residuo.',
        perspective: 'D',
        phase: 'ret',
        positionIndex: 1,
        triadMapping: 2,
        executionTimeMs: 190,
        cost: 6.0,
        errorRisk: 0.02,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: ['task_dev_06'],
        compensatoryTasks: [],
      },
      {
        id: 'task_dev_06',
        name: 'Purificación de Estado & Cierre Invariante',
        description: 'Individualidad de retroceso: limpia recursos efímeros y restaura el vacío base.',
        perspective: 'Ind',
        phase: 'ret',
        positionIndex: 0,
        triadMapping: 2,
        executionTimeMs: 110,
        cost: 2.0,
        errorRisk: 0.01,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: [],
        compensatoryTasks: [],
      },
    ],
    relations: [
      {
        id: 'rel_01',
        sourceTaskId: 'task_dev_01',
        targetTaskId: 'task_dev_02',
        relationType: 'none',
        autoExecute: true,
        latencyPenaltyMs: 15,
      },
      {
        id: 'rel_02',
        sourceTaskId: 'task_dev_02',
        targetTaskId: 'task_dev_03',
        relationType: 'none',
        autoExecute: true,
        latencyPenaltyMs: 20,
      },
      {
        id: 'rel_03',
        sourceTaskId: 'task_dev_01',
        targetTaskId: 'task_dev_05',
        relationType: 'creates',
        autoExecute: true,
        condition: 'adv_P0 -> ret_P1 genera auto-compensador en fallo',
        latencyPenaltyMs: 5,
      },
      {
        id: 'rel_04',
        sourceTaskId: 'task_dev_02',
        targetTaskId: 'task_dev_05',
        relationType: 'mirrorOf',
        autoExecute: true,
        condition: 'Espejo centro-centro (adv_P1 <-> ret_P1) para rollback seguro',
        latencyPenaltyMs: 0,
      },
      {
        id: 'rel_05',
        sourceTaskId: 'task_dev_03',
        targetTaskId: 'task_dev_04',
        relationType: 'none',
        autoExecute: true,
        latencyPenaltyMs: 25,
      },
      {
        id: 'rel_06',
        sourceTaskId: 'task_dev_03',
        targetTaskId: 'task_dev_06',
        relationType: 'mirrorOf',
        autoExecute: true,
        condition: 'Espejo lateral (adv_P2 <-> ret_P0) para conservación de identidad',
        latencyPenaltyMs: 0,
      },
      {
        id: 'rel_07',
        sourceTaskId: 'task_dev_04',
        targetTaskId: 'task_dev_05',
        relationType: 'creates',
        autoExecute: true,
        condition: 'ret_P2 -> adv_P1 / ret_P1 en anomalía de tráfico',
        latencyPenaltyMs: 8,
      },
      {
        id: 'rel_08',
        sourceTaskId: 'task_dev_05',
        targetTaskId: 'task_dev_06',
        relationType: 'creates',
        autoExecute: true,
        condition: 'ret_P1 -> ret_P0 para purificación final',
        latencyPenaltyMs: 10,
      },
    ],
  },
  {
    id: 'pipeline_supply_chain',
    name: 'Balance Inteligente de Cadena de Suministro',
    category: 'supply_chain',
    description: 'Armonización entre predicción de demanda, despacho holístico y reabastecimiento adaptativo sin sobrestock.',
    metrics: {
      totalCycleTimeMs: 1850,
      baselineCycleTimeMs: 5200,
      bottleneckRate: 4.8,
      costEfficiency: 64.4,
      selfHealingRate: 95.2,
      activeTasks: 0,
      completedCycles: 0,
    },
    status: 'idle',
    tasks: [
      {
        id: 'task_scm_01',
        name: 'Monitoreo de Demanda & Órdenes Entrantes',
        description: 'Singularidad en avance: captura fluctuaciones del consumidor.',
        perspective: 'Ind',
        phase: 'adv',
        positionIndex: 0,
        triadMapping: 8, // receptor | supraconsciente | emisor
        executionTimeMs: 260,
        cost: 6.0,
        errorRisk: 0.04,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: ['task_scm_02'],
        compensatoryTasks: [],
      },
      {
        id: 'task_scm_02',
        name: 'Balance Dual de Inventario vs Costo de Almacén',
        description: 'Dualidad: tensión entre disponibilidad inmediata y capital inmovilizado.',
        perspective: 'D',
        phase: 'adv',
        positionIndex: 1,
        triadMapping: 8,
        executionTimeMs: 510,
        cost: 14.5,
        errorRisk: 0.09,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: ['task_scm_03'],
        compensatoryTasks: ['task_scm_05'],
      },
      {
        id: 'task_scm_03',
        name: 'Ruteo Dinámico & Despacho de Flota Multimodal',
        description: 'Totalidad de avance: optimización combinatoria global del tránsito.',
        perspective: 'Tot',
        phase: 'adv',
        positionIndex: 2,
        triadMapping: 8,
        executionTimeMs: 440,
        cost: 26.0,
        errorRisk: 0.11,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: ['task_scm_04'],
        compensatoryTasks: [],
      },
      {
        id: 'task_scm_04',
        name: 'Confirmación IoT en Destino & Telemetría de Entrega',
        description: 'Totalidad de retroceso: verificación del estado recibido en el mundo real.',
        perspective: 'Tot',
        phase: 'ret',
        positionIndex: 2,
        triadMapping: 8,
        executionTimeMs: 310,
        cost: 9.0,
        errorRisk: 0.07,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: ['task_scm_06'],
        compensatoryTasks: ['task_scm_05'],
      },
      {
        id: 'task_scm_05',
        name: 'Ajuste Involutivo de Stock & Redirección de Envíos',
        description: 'Dualidad de retroceso: compensa discrepancias de demanda al instante.',
        perspective: 'D',
        phase: 'ret',
        positionIndex: 1,
        triadMapping: 8,
        executionTimeMs: 240,
        cost: 7.5,
        errorRisk: 0.03,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: ['task_scm_06'],
        compensatoryTasks: [],
      },
      {
        id: 'task_scm_06',
        name: 'Conciliación Contable & Reabsorción de Ciclo',
        description: 'Individualidad de retroceso: estabiliza libro mayor y vacía la orden activa.',
        perspective: 'Ind',
        phase: 'ret',
        positionIndex: 0,
        triadMapping: 8,
        executionTimeMs: 150,
        cost: 3.5,
        errorRisk: 0.01,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: [],
        compensatoryTasks: [],
      },
    ],
    relations: [
      { id: 'scm_r1', sourceTaskId: 'task_scm_01', targetTaskId: 'task_scm_02', relationType: 'none', autoExecute: true, latencyPenaltyMs: 12 },
      { id: 'scm_r2', sourceTaskId: 'task_scm_02', targetTaskId: 'task_scm_03', relationType: 'none', autoExecute: true, latencyPenaltyMs: 18 },
      { id: 'scm_r3', sourceTaskId: 'task_scm_01', targetTaskId: 'task_scm_05', relationType: 'creates', autoExecute: true, latencyPenaltyMs: 6 },
      { id: 'scm_r4', sourceTaskId: 'task_scm_02', targetTaskId: 'task_scm_05', relationType: 'mirrorOf', autoExecute: true, latencyPenaltyMs: 0 },
      { id: 'scm_r5', sourceTaskId: 'task_scm_03', targetTaskId: 'task_scm_06', relationType: 'mirrorOf', autoExecute: true, latencyPenaltyMs: 0 },
      { id: 'scm_r6', sourceTaskId: 'task_scm_04', targetTaskId: 'task_scm_05', relationType: 'creates', autoExecute: true, latencyPenaltyMs: 8 },
      { id: 'scm_r7', sourceTaskId: 'task_scm_05', targetTaskId: 'task_scm_06', relationType: 'creates', autoExecute: true, latencyPenaltyMs: 5 },
    ],
  },
  {
    id: 'pipeline_finance',
    name: 'Evaluación y Desembolso Financiero con Escudo Anti-Fraude',
    category: 'finance',
    description: 'Automatización de underwriting crediticio, verificación dual y liquidación con compensación instantánea ante fraude.',
    metrics: {
      totalCycleTimeMs: 1290,
      baselineCycleTimeMs: 3900,
      bottleneckRate: 2.5,
      costEfficiency: 72.8,
      selfHealingRate: 99.1,
      activeTasks: 0,
      completedCycles: 0,
    },
    status: 'idle',
    tasks: [
      {
        id: 'task_fin_01',
        name: 'Ingesta de Solicitud & Perfil de Solicitante',
        description: 'Singularidad en avance: identidad y monto solicitado.',
        perspective: 'Ind',
        phase: 'adv',
        positionIndex: 0,
        triadMapping: 9, // lógica | inteligencia | libertad
        executionTimeMs: 180,
        cost: 3.0,
        errorRisk: 0.03,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: ['task_fin_02'],
        compensatoryTasks: [],
      },
      {
        id: 'task_fin_02',
        name: 'Scoring Dual de Riesgo & Validación KYC',
        description: 'Dualidad: tensión entre inclusión crediticia y exposición a impago.',
        perspective: 'D',
        phase: 'adv',
        positionIndex: 1,
        triadMapping: 9,
        executionTimeMs: 420,
        cost: 11.0,
        errorRisk: 0.10,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: ['task_fin_03'],
        compensatoryTasks: ['task_fin_05'],
      },
      {
        id: 'task_fin_03',
        name: 'Aprobación Algorítmica & Desembolso Inmediato',
        description: 'Totalidad de avance: emisión del activo líquido y formalización.',
        perspective: 'Tot',
        phase: 'adv',
        positionIndex: 2,
        triadMapping: 9,
        executionTimeMs: 310,
        cost: 16.0,
        errorRisk: 0.04,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: ['task_fin_04'],
        compensatoryTasks: [],
      },
      {
        id: 'task_fin_04',
        name: 'Auditoría Continua de Patrones Transaccionales',
        description: 'Totalidad de retroceso: vigilancia post-desembolso en tiempo real.',
        perspective: 'Tot',
        phase: 'ret',
        positionIndex: 2,
        triadMapping: 9,
        executionTimeMs: 230,
        cost: 7.0,
        errorRisk: 0.08,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: ['task_fin_06'],
        compensatoryTasks: ['task_fin_05'],
      },
      {
        id: 'task_fin_05',
        name: 'Congelamiento Cautelar & Bloqueo Espejado',
        description: 'Dualidad de retroceso: anula el riesgo antes de fuga de capital.',
        perspective: 'D',
        phase: 'ret',
        positionIndex: 1,
        triadMapping: 9,
        executionTimeMs: 160,
        cost: 5.0,
        errorRisk: 0.01,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: ['task_fin_06'],
        compensatoryTasks: [],
      },
      {
        id: 'task_fin_06',
        name: 'Liquidación Contable y Asiento Definitivo',
        description: 'Individualidad de retroceso: conciliación neta y liberación de garantías.',
        perspective: 'Ind',
        phase: 'ret',
        positionIndex: 0,
        triadMapping: 9,
        executionTimeMs: 120,
        cost: 2.5,
        errorRisk: 0.01,
        status: 'idle',
        progress: 0,
        logs: [],
        autoTriggers: [],
        compensatoryTasks: [],
      },
    ],
    relations: [
      { id: 'fin_r1', sourceTaskId: 'task_fin_01', targetTaskId: 'task_fin_02', relationType: 'none', autoExecute: true, latencyPenaltyMs: 10 },
      { id: 'fin_r2', sourceTaskId: 'task_fin_02', targetTaskId: 'task_fin_03', relationType: 'none', autoExecute: true, latencyPenaltyMs: 15 },
      { id: 'fin_r3', sourceTaskId: 'task_fin_01', targetTaskId: 'task_fin_05', relationType: 'creates', autoExecute: true, latencyPenaltyMs: 4 },
      { id: 'fin_r4', sourceTaskId: 'task_fin_02', targetTaskId: 'task_fin_05', relationType: 'mirrorOf', autoExecute: true, latencyPenaltyMs: 0 },
      { id: 'fin_r5', sourceTaskId: 'task_fin_03', targetTaskId: 'task_fin_06', relationType: 'mirrorOf', autoExecute: true, latencyPenaltyMs: 0 },
      { id: 'fin_r6', sourceTaskId: 'task_fin_04', targetTaskId: 'task_fin_05', relationType: 'creates', autoExecute: true, latencyPenaltyMs: 6 },
      { id: 'fin_r7', sourceTaskId: 'task_fin_05', targetTaskId: 'task_fin_06', relationType: 'creates', autoExecute: true, latencyPenaltyMs: 5 },
    ],
  },
];

/**
 * Process Automation Execution Engine
 */
export class ProcessAutomationEngine {
  private activePipeline: ProcessPipeline;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private speedMultiplier: number = 1.0;
  private logs: AutomationLogEntry[] = [];
  private stepCallbacks: ((pipeline: ProcessPipeline, logs: AutomationLogEntry[]) => void)[] = [];

  constructor(pipeline?: ProcessPipeline) {
    this.activePipeline = JSON.parse(JSON.stringify(pipeline || PRESET_PIPELINES[0]));
  }

  setPipeline(pipeline: ProcessPipeline) {
    this.stop();
    this.activePipeline = JSON.parse(JSON.stringify(pipeline));
    this.resetTasks();
    this.notify();
  }

  getPipeline(): ProcessPipeline {
    return this.activePipeline;
  }

  getLogs(): AutomationLogEntry[] {
    return this.logs;
  }

  setSpeed(multiplier: number) {
    this.speedMultiplier = Math.max(0.2, Math.min(10, multiplier));
  }

  subscribe(callback: (pipeline: ProcessPipeline, logs: AutomationLogEntry[]) => void) {
    this.stepCallbacks.push(callback);
    return () => {
      this.stepCallbacks = this.stepCallbacks.filter(c => c !== callback);
    };
  }

  private notify() {
    this.stepCallbacks.forEach(cb => cb(this.activePipeline, this.logs));
  }

  resetTasks() {
    this.activePipeline.tasks.forEach(t => {
      t.status = 'idle';
      t.progress = 0;
      t.logs = [];
    });
    this.activePipeline.status = 'idle';
    this.activePipeline.metrics.activeTasks = 0;
    this.logs = [];
    this.notify();
  }

  private addLog(
    taskId: string,
    action: AutomationLogEntry['action'],
    details: string,
    kpiImpact: string,
    relationType?: RelationType
  ) {
    const task = this.activePipeline.tasks.find(t => t.id === taskId);
    const entry: AutomationLogEntry = {
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('es-ES', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }),
      taskId,
      taskName: task ? task.name : taskId,
      action,
      details,
      kpiImpact,
      relationType,
    };
    this.logs.unshift(entry);
    if (this.logs.length > 80) this.logs.pop();
    this.notify();
  }

  /**
   * Evaluates IOM Machine Learning transition prediction between two tasks.
   */
  evaluateTaskTransition(sourceTask: ProcessTask, targetTask: ProcessTask): RelationType {
    return evaluateCanonicalRelation(
      sourceTask.phase,
      sourceTask.positionIndex,
      targetTask.phase,
      targetTask.positionIndex
    );
  }

  /**
   * Starts full automated simulation loop.
   */
  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.activePipeline.status = 'running';

    this.addLog(
      this.activePipeline.tasks[0]?.id || 'init',
      'TRIGGER',
      `Iniciando ciclo de automatización IOM: ${this.activePipeline.name}.`,
      'Latencia inicial calibrada'
    );

    // Start with the first task if all are idle
    const hasActiveOrDone = this.activePipeline.tasks.some(t => t.status !== 'idle');
    if (!hasActiveOrDone && this.activePipeline.tasks.length > 0) {
      this.activePipeline.tasks[0].status = 'running';
      this.activePipeline.metrics.activeTasks = 1;
      this.notify();
    }

    while (this.isRunning) {
      if (this.isPaused) {
        await new Promise(r => setTimeout(r, 100));
        continue;
      }

      const didStep = await this.step();
      if (!didStep) {
        // All tasks completed!
        this.activePipeline.status = 'completed';
        this.activePipeline.metrics.completedCycles++;
        this.addLog(
          this.activePipeline.tasks[this.activePipeline.tasks.length - 1]?.id || 'end',
          'COMPLETE',
          `Ciclo IOM completado exitosamente. Se alcanzó el estado de vacío invariable V_t sin anomalías residuales.`,
          `Tiempo total: ${this.activePipeline.metrics.totalCycleTimeMs} ms (-${Math.round(
            (1 - this.activePipeline.metrics.totalCycleTimeMs / this.activePipeline.metrics.baselineCycleTimeMs) * 100
          )}% optimización)`
        );
        this.isRunning = false;
        break;
      }

      await new Promise(r => setTimeout(r, 80 / this.speedMultiplier));
    }
  }

  pause() {
    this.isPaused = true;
    this.activePipeline.status = 'paused';
    this.notify();
  }

  resume() {
    this.isPaused = false;
    this.activePipeline.status = 'running';
    this.notify();
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.activePipeline.status = 'idle';
    this.notify();
  }

  /**
   * Performs a single discrete step in the process pipeline.
   * Advances progress of running tasks, simulates IOM ML triggers, and handles compensations.
   */
  async step(): Promise<boolean> {
    const tasks = this.activePipeline.tasks;
    let anyRunning = false;

    // Advance progress on running tasks
    for (const task of tasks) {
      if (task.status === 'running') {
        anyRunning = true;
        const progressIncrement = Math.max(12, Math.floor(100 / Math.max(1, (task.executionTimeMs / 100) * (1 / this.speedMultiplier))));
        task.progress = Math.min(100, task.progress + progressIncrement);

        // Check for simulated bottleneck / anomaly
        const isAnomalyOccurring = Math.random() < task.errorRisk * 0.15;
        if (isAnomalyOccurring) {
          task.status = 'bottleneck';
          this.addLog(
            task.id,
            'ML_DECISION',
            `Alerta de cuello de botella detectada en '${task.name}'. Discrepancia temporal registrada.`,
            `Riesgo de latencia: +${task.executionTimeMs * 0.6} ms`
          );

          // Find compensatory mirror task (mirrorOf)
          const mirrorRelation = this.activePipeline.relations.find(
            r => r.sourceTaskId === task.id && r.relationType === 'mirrorOf'
          );
          if (mirrorRelation) {
            const mirrorTask = tasks.find(t => t.id === mirrorRelation.targetTaskId);
            if (mirrorTask && mirrorTask.status === 'idle') {
              mirrorTask.status = 'running';
              this.addLog(
                mirrorTask.id,
                'COMPENSATE',
                `IOM ML activó espejo compensatorio 'mirrorOf' (${task.name} <-> ${mirrorTask.name}) para mitigar cuello de botella.`,
                `Auto-recuperación activa: -${Math.round(task.executionTimeMs * 0.45)} ms`
              );
            }
          }
        }

        if (task.progress >= 100) {
          task.status = 'completed';
          this.addLog(
            task.id,
            'COMPLETE',
            `Tarea '${task.name}' finalizada con éxito bajo perspectiva '${task.perspective}' (${task.phase}).`,
            `Costo: $${task.cost}`
          );

          // Automated trigger of downstream tasks via IOM relations
          this.triggerDownstream(task);
        }
      } else if (task.status === 'bottleneck') {
        anyRunning = true;
        // In bottleneck, auto-resolution occurs when compensatory task engages
        const hasCompensatorRunning = tasks.some(
          t => task.compensatoryTasks.includes(t.id) && (t.status === 'running' || t.status === 'completed')
        );
        if (hasCompensatorRunning || Math.random() < 0.4) {
          task.status = 'running';
          task.progress = Math.min(100, task.progress + 25);
          this.addLog(
            task.id,
            'ANOMALY_RESOLVED',
            `Cuello de botella en '${task.name}' neutralizado por dinamismo de retroceso involutivo.`,
            `Salud de proceso restaurada (99.8%)`
          );
        }
      }
    }

    // Update pipeline metrics
    this.activePipeline.metrics.activeTasks = tasks.filter(t => t.status === 'running' || t.status === 'bottleneck').length;

    this.notify();
    return anyRunning || tasks.some(t => t.status === 'idle');
  }

  private triggerDownstream(completedTask: ProcessTask) {
    const tasks = this.activePipeline.tasks;
    const relations = this.activePipeline.relations.filter(
      r => r.sourceTaskId === completedTask.id && r.autoExecute
    );

    for (const rel of relations) {
      const targetTask = tasks.find(t => t.id === rel.targetTaskId);
      if (!targetTask || targetTask.status !== 'idle') continue;

      if (rel.relationType === 'creates') {
        targetTask.status = 'running';
        this.addLog(
          targetTask.id,
          'TRIGGER',
          `Regla 'creates' activó automáticamente tarea subsiguiente '${targetTask.name}'.`,
          `Despacho instantáneo: 0 ms delay`
        );
      } else if (rel.relationType === 'none' && !tasks.some(t => t.phase === 'adv' && t.status === 'running')) {
        // Linear pipeline progression
        targetTask.status = 'running';
        this.addLog(
          targetTask.id,
          'TRIGGER',
          `Flujo operacional avanzó hacia '${targetTask.name}'.`,
          `Throughput óptimo`
        );
      }
    }

    // Check if next sequential task should start if none was triggered
    const currentIndex = tasks.findIndex(t => t.id === completedTask.id);
    if (currentIndex >= 0 && currentIndex < tasks.length - 1) {
      const nextTask = tasks[currentIndex + 1];
      if (nextTask.status === 'idle') {
        nextTask.status = 'running';
        this.addLog(
          nextTask.id,
          'TRIGGER',
          `Iniciando siguiente etapa ordinal: '${nextTask.name}'.`,
          `Continuidad garantizada`
        );
      }
    }
  }

  /**
   * Applies IOM automated optimization:
   * Recalculates pipeline metrics and predicts optimal shortcuts & compensatory hooks.
   */
  optimizePipelineWithMl(): {
    latencySavedMs: number;
    bottleneckReductionPct: number;
    recommendedRelations: ProcessRelation[];
  } {
    const tasks = this.activePipeline.tasks;
    const recommended: ProcessRelation[] = [];
    let latencySaved = 0;

    for (let i = 0; i < tasks.length; i++) {
      for (let j = 0; j < tasks.length; j++) {
        if (i === j) continue;
        const s = tasks[i];
        const t = tasks[j];

        // Evaluate using IOM ML rules
        const rel = this.evaluateTaskTransition(s, t);
        if (rel !== 'none') {
          const existing = this.activePipeline.relations.find(
            r => r.sourceTaskId === s.id && r.targetTaskId === t.id
          );
          if (!existing) {
            recommended.push({
              id: `opt_rel_${s.id}_${t.id}`,
              sourceTaskId: s.id,
              targetTaskId: t.id,
              relationType: rel,
              autoExecute: true,
              condition: `Generado por IOM ML (${rel}): optimización de transición ${s.phase} -> ${t.phase}`,
              latencyPenaltyMs: 0,
            });
            latencySaved += 280;
          }
        }
      }
    }

    // Add recommended relations to active pipeline
    this.activePipeline.relations = [...this.activePipeline.relations, ...recommended];
    this.activePipeline.metrics.totalCycleTimeMs = Math.max(600, this.activePipeline.metrics.totalCycleTimeMs - latencySaved);
    this.activePipeline.metrics.bottleneckRate = Math.max(1.2, this.activePipeline.metrics.bottleneckRate - 6.5);
    this.activePipeline.metrics.costEfficiency = Math.min(88.5, this.activePipeline.metrics.costEfficiency + 14.2);

    this.addLog(
      tasks[0]?.id || 'opt',
      'PURIFY',
      `Optimización de Aprendizaje Automático IOM aplicada: ${recommended.length} conexiones dinámicas agregadas.`,
      `Ahorro de latencia: -${latencySaved} ms | Eficiencia: +14.2%`
    );

    this.notify();
    return {
      latencySavedMs: latencySaved,
      bottleneckReductionPct: 6.5,
      recommendedRelations: recommended,
    };
  }
}

export const processAutomationEngine = new ProcessAutomationEngine();
