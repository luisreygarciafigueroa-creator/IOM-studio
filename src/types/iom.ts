/**
 * Canonical Types for IOM (Informational Unit Model)
 * 5 Perspectives, 13 Triads, 78 Nodes, Formal Operators, and ML Process Automation
 */

export type PerspectiveId = 'Ind' | 'D' | 'Tot' | 'Evol' | 'Invol';
export type TriadPhase = 'adv' | 'ret';
export type LocalPosition = 0 | 1 | 2; // 0: lateral, 1: center, 2: lateral
export type RelationType = 'none' | 'mirrorOf' | 'creates';

export interface Perspective {
  id: PerspectiveId;
  label: string;
  index: number;
  kind: 'positional' | 'vectorial';
  description: string;
  mythologicalAnchor?: string;
}

export interface TriadNode {
  node_id: string; // e.g. "T01_adv_P0"
  triad_index: number; // 1 to 13
  phase: TriadPhase;
  direction: 'evol' | 'invol';
  position_index: LocalPosition;
  position: '→' | '0' | '←';
  display_label: '→' | '0' | '←';
  perspective: 'Ind' | 'D' | 'Tot';
  label: string; // lexical concept e.g. "orientación"
}

export interface CandidatePair {
  triad_index: number;
  source: string;
  target: string;
  relation: RelationType;
  sourceNode?: TriadNode;
  targetNode?: TriadNode;
}

export interface VectorStep {
  step_id: string;
  vector: 'Evol' | 'Invol';
  phase: TriadPhase;
  step_index: number;
  axis_position: number;
  label: string;
  arrow: '→' | '←';
}

export interface CreationRule {
  source_phase: TriadPhase;
  source_positions: LocalPosition[];
  target_phase: TriadPhase;
  target_positions: LocalPosition[];
}

export interface IOMSpec {
  spec_version: string;
  title: string;
  source_date: string;
  five_perspectives: Perspective[];
  triads: {
    index_base: number;
    adv: string[][];
    ret: string[][];
  };
  creation_rules: CreationRule[];
  vectors: {
    name: 'Evol' | 'Invol';
    phase: TriadPhase;
    labels: string[];
    axis_positions: number[];
    arrow: string;
  }[];
  purpose: {
    id: string;
    label: string;
    definition: string;
    chain: string[];
  };
}

// Machine Learning Types
export interface TrainingConfig {
  modelType: 'pi_hgat_t' | 'mlp' | 'oracle' | 'ablation_no_phase' | 'ablation_no_pos' | 'negative_control';
  learningRate: number;
  epochs: number;
  hiddenDim: number;
  weightDecay: number;
  batchSize: number;
  lossWeighted: boolean;
  validationMode: 'loo' | 'split';
}

export interface EpochLog {
  epoch: number;
  loss: number;
  accuracy: number;
  macroF1: number;
  mirrorF1: number;
  createsF1: number;
  noneF1: number;
}

export interface ConfusionMatrix {
  // [actual][predicted] for ['none', 'mirrorOf', 'creates']
  matrix: number[][];
  classes: RelationType[];
}

export interface ModelMetrics {
  accuracy: number;
  macroF1: number;
  precision: { none: number; mirrorOf: number; creates: number };
  recall: { none: number; mirrorOf: number; creates: number };
  f1: { none: number; mirrorOf: number; creates: number };
  support: { none: number; mirrorOf: number; creates: number };
  confusionMatrix: ConfusionMatrix;
  foldAccuracies?: { fold: number; accuracy: number; heldOutTriad: number }[];
  runtimeMs: number;
  trainingLogs: EpochLog[];
}

export interface PredictionResult {
  source: string;
  target: string;
  predictedRelation: RelationType;
  confidence: number;
  probabilities: {
    none: number;
    mirrorOf: number;
    creates: number;
  };
  features: number[];
  ruleConformant: boolean;
  explanation?: string;
}

// Process Automation Types
export type ProcessTaskStatus = 'idle' | 'running' | 'completed' | 'bottleneck' | 'compensated' | 'failed';

export interface ProcessTask {
  id: string;
  name: string;
  description: string;
  perspective: 'Ind' | 'D' | 'Tot';
  phase: TriadPhase;
  positionIndex: LocalPosition;
  triadMapping?: number;
  executionTimeMs: number;
  cost: number;
  errorRisk: number; // 0 to 1
  status: ProcessTaskStatus;
  progress: number; // 0 to 100
  logs: string[];
  autoTriggers: string[]; // target task IDs
  compensatoryTasks: string[]; // mirrorOf targets
}

export interface ProcessRelation {
  id: string;
  sourceTaskId: string;
  targetTaskId: string;
  relationType: RelationType;
  autoExecute: boolean;
  condition?: string;
  latencyPenaltyMs: number;
}

export interface ProcessPipeline {
  id: string;
  name: string;
  category: 'devops' | 'supply_chain' | 'finance' | 'customer_ops' | 'custom';
  description: string;
  tasks: ProcessTask[];
  relations: ProcessRelation[];
  metrics: {
    totalCycleTimeMs: number;
    baselineCycleTimeMs: number;
    bottleneckRate: number; // percentage
    costEfficiency: number; // percentage
    selfHealingRate: number; // percentage
    activeTasks: number;
    completedCycles: number;
  };
  status: 'idle' | 'running' | 'paused' | 'completed';
}

export interface AutomationLogEntry {
  id: string;
  timestamp: string;
  taskId: string;
  taskName: string;
  action: 'TRIGGER' | 'COMPENSATE' | 'PURIFY' | 'COMPLETE' | 'ANOMALY_RESOLVED' | 'ML_DECISION';
  relationType?: RelationType;
  details: string;
  kpiImpact: string;
}
