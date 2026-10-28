/**
 * Machine Learning Engine for IOM (Perspective-Informed Graph Attention & Neural MLP)
 * Emulates the PI-HGAT-T architecture and baseline classifiers from the IOM framework.
 * Supports live training, step-by-step progress, Leave-One-Triad-Out cross-validation,
 * ablation testing, and real-time inference for process automation.
 */

import {
  CandidatePair,
  ConfusionMatrix,
  EpochLog,
  ModelMetrics,
  PredictionResult,
  RelationType,
  TrainingConfig,
  TriadNode,
} from '../types/iom';
import { CANONICAL_PAIRS, CANONICAL_NODE_MAP, evaluateCanonicalRelation } from '../data/iomCanonicalData';

export const CLASS_NAMES: RelationType[] = ['none', 'mirrorOf', 'creates'];
export const CLASS_INDEX: Record<RelationType, number> = {
  none: 0,
  mirrorOf: 1,
  creates: 2,
};

export interface ProcessedSample {
  triadIndex: number;
  sourceId: string;
  targetId: string;
  features: number[];
  label: number; // 0, 1, 2
}

/**
 * Extracts normalized feature vector for a given pair.
 */
export function extractFeatures(
  source: TriadNode,
  target: TriadNode,
  config: TrainingConfig
): number[] {
  const sPhaseAdv = source.phase === 'adv' ? 1 : 0;
  const sPhaseRet = source.phase === 'ret' ? 1 : 0;
  const sPos0 = source.position_index === 0 ? 1 : 0;
  const sPos1 = source.position_index === 1 ? 1 : 0;
  const sPos2 = source.position_index === 2 ? 1 : 0;

  const tPhaseAdv = target.phase === 'adv' ? 1 : 0;
  const tPhaseRet = target.phase === 'ret' ? 1 : 0;
  const tPos0 = target.position_index === 0 ? 1 : 0;
  const tPos1 = target.position_index === 1 ? 1 : 0;
  const tPos2 = target.position_index === 2 ? 1 : 0;

  if (config.modelType === 'ablation_no_phase') {
    // Only position features
    return [sPos0, sPos1, sPos2, tPos0, tPos1, tPos2];
  }

  if (config.modelType === 'ablation_no_pos') {
    // Only phase features
    return [sPhaseAdv, sPhaseRet, tPhaseAdv, tPhaseRet];
  }

  // Full features: source (5) + target (5) + interaction terms (5)
  const full = [
    sPhaseAdv, sPhaseRet, sPos0, sPos1, sPos2,
    tPhaseAdv, tPhaseRet, tPos0, tPos1, tPos2,
  ];

  if (config.modelType === 'pi_hgat_t') {
    // Add interaction features for Graph Attention representation
    const interactions = [
      sPhaseAdv * tPhaseRet, // opposite phase forward
      sPhaseRet * tPhaseAdv, // opposite phase reverse
      sPos0 * tPos2,         // lateral mirror (0 -> 2)
      sPos2 * tPos0,         // lateral mirror (2 -> 0)
      sPos1 * tPos1,         // center mirror (1 -> 1)
    ];
    return [...full, ...interactions];
  }

  return full;
}

/**
 * Dense Neural Network Layer
 */
class DenseLayer {
  weights: number[][]; // [inDim][outDim]
  biases: number[];    // [outDim]
  m_w: number[][];     // Adam 1st moment
  v_w: number[][];     // Adam 2nd moment
  m_b: number[];
  v_b: number[];

  constructor(public inDim: number, public outDim: number) {
    // He initialization
    const std = Math.sqrt(2 / inDim);
    this.weights = Array.from({ length: inDim }, () =>
      Array.from({ length: outDim }, () => (Math.random() * 2 - 1) * std)
    );
    this.biases = Array.from({ length: outDim }, () => 0.01);

    this.m_w = Array.from({ length: inDim }, () => Array(outDim).fill(0));
    this.v_w = Array.from({ length: inDim }, () => Array(outDim).fill(0));
    this.m_b = Array(outDim).fill(0);
    this.v_b = Array(outDim).fill(0);
  }

  forward(input: number[]): number[] {
    const out = new Array(this.outDim).fill(0);
    for (let j = 0; j < this.outDim; j++) {
      let sum = this.biases[j];
      for (let i = 0; i < this.inDim; i++) {
        sum += input[i] * this.weights[i][j];
      }
      out[j] = sum;
    }
    return out;
  }
}

/**
 * Trainable Neural Network Architecture for IOM
 */
export class IOMNeuralClassifier {
  layer1: DenseLayer;
  layer2: DenseLayer;
  layerOut: DenseLayer;
  stepCount = 0;

  constructor(public inputDim: number, public hiddenDim: number = 32, public outputDim: number = 3) {
    this.layer1 = new DenseLayer(inputDim, hiddenDim);
    this.layer2 = new DenseLayer(hiddenDim, hiddenDim);
    this.layerOut = new DenseLayer(hiddenDim, outputDim);
  }

  private gelu(x: number): number {
    return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))));
  }

  private geluDerivative(x: number): number {
    const tanhArg = Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3));
    const tanhVal = Math.tanh(tanhArg);
    const sech2 = 1 - tanhVal * tanhVal;
    const innerDeriv = Math.sqrt(2 / Math.PI) * (1 + 3 * 0.044715 * x * x);
    return 0.5 * (1 + tanhVal) + 0.5 * x * sech2 * innerDeriv;
  }

  private softmax(logits: number[]): number[] {
    const max = Math.max(...logits);
    const exp = logits.map(x => Math.exp(x - max));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map(x => x / Math.max(sum, 1e-12));
  }

  forward(input: number[]): {
    h1Raw: number[];
    h1: number[];
    h2Raw: number[];
    h2: number[];
    logits: number[];
    probs: number[];
  } {
    const h1Raw = this.layer1.forward(input);
    const h1 = h1Raw.map(x => this.gelu(x));

    const h2Raw = this.layer2.forward(h1);
    const h2 = h2Raw.map(x => this.gelu(x));

    const logits = this.layerOut.forward(h2);
    const probs = this.softmax(logits);

    return { h1Raw, h1, h2Raw, h2, logits, probs };
  }

  trainStep(
    samples: ProcessedSample[],
    lr: number = 0.005,
    weightDecay: number = 0.0001,
    classWeights: number[] = [1.0, 1.0, 1.0]
  ): { loss: number; correct: number } {
    this.stepCount++;
    const beta1 = 0.9;
    const beta2 = 0.999;
    const eps = 1e-8;

    // Gradients accumulators
    const gradW1 = Array.from({ length: this.layer1.inDim }, () => Array(this.layer1.outDim).fill(0));
    const gradB1 = Array(this.layer1.outDim).fill(0);
    const gradW2 = Array.from({ length: this.layer2.inDim }, () => Array(this.layer2.outDim).fill(0));
    const gradB2 = Array(this.layer2.outDim).fill(0);
    const gradWOut = Array.from({ length: this.layerOut.inDim }, () => Array(this.layerOut.outDim).fill(0));
    const gradBOut = Array(this.layerOut.outDim).fill(0);

    let totalLoss = 0;
    let correct = 0;
    const N = samples.length;

    for (const sample of samples) {
      const { h1Raw, h1, h2Raw, h2, probs } = this.forward(sample.features);
      const y = sample.label;
      const weight = classWeights[y];

      // Cross entropy loss
      const p = Math.max(probs[y], 1e-12);
      totalLoss += -Math.log(p) * weight;

      const pred = probs.indexOf(Math.max(...probs));
      if (pred === y) correct++;

      // Gradient of loss w.r.t logits
      const gradLogits = probs.map((prob, idx) => (idx === y ? prob - 1 : prob) * weight);

      // Backprop through layerOut
      for (let j = 0; j < this.layerOut.outDim; j++) {
        gradBOut[j] += gradLogits[j];
        for (let i = 0; i < this.layerOut.inDim; i++) {
          gradWOut[i][j] += h2[i] * gradLogits[j];
        }
      }

      // Backprop to h2
      const gradH2 = new Array(this.layer2.outDim).fill(0);
      for (let i = 0; i < this.layer2.outDim; i++) {
        let sum = 0;
        for (let j = 0; j < this.layerOut.outDim; j++) {
          sum += gradLogits[j] * this.layerOut.weights[i][j];
        }
        gradH2[i] = sum * this.geluDerivative(h2Raw[i]);
      }

      // Backprop through layer2
      for (let j = 0; j < this.layer2.outDim; j++) {
        gradB2[j] += gradH2[j];
        for (let i = 0; i < this.layer2.inDim; i++) {
          gradW2[i][j] += h1[i] * gradH2[j];
        }
      }

      // Backprop to h1
      const gradH1 = new Array(this.layer1.outDim).fill(0);
      for (let i = 0; i < this.layer1.outDim; i++) {
        let sum = 0;
        for (let j = 0; j < this.layer2.outDim; j++) {
          sum += gradH2[j] * this.layer2.weights[i][j];
        }
        gradH1[i] = sum * this.geluDerivative(h1Raw[i]);
      }

      // Backprop through layer1
      for (let j = 0; j < this.layer1.outDim; j++) {
        gradB1[j] += gradH1[j];
        for (let i = 0; i < this.layer1.inDim; i++) {
          gradW1[i][j] += sample.features[i] * gradH1[j];
        }
      }
    }

    // Adam update helper
    const updateAdam = (
      w: number[][],
      gradW: number[][],
      m_w: number[][],
      v_w: number[][],
      b: number[],
      gradB: number[],
      m_b: number[],
      v_b: number[]
    ) => {
      const correction1 = 1 - Math.pow(beta1, this.stepCount);
      const correction2 = 1 - Math.pow(beta2, this.stepCount);

      for (let i = 0; i < w.length; i++) {
        for (let j = 0; j < w[0].length; j++) {
          const g = gradW[i][j] / N + weightDecay * w[i][j];
          m_w[i][j] = beta1 * m_w[i][j] + (1 - beta1) * g;
          v_w[i][j] = beta2 * v_w[i][j] + (1 - beta2) * g * g;
          const mHat = m_w[i][j] / correction1;
          const vHat = v_w[i][j] / correction2;
          w[i][j] -= (lr * mHat) / (Math.sqrt(vHat) + eps);
        }
      }

      for (let j = 0; j < b.length; j++) {
        const g = gradB[j] / N;
        m_b[j] = beta1 * m_b[j] + (1 - beta1) * g;
        v_b[j] = beta2 * v_b[j] + (1 - beta2) * g * g;
        const mHat = m_b[j] / correction1;
        const vHat = v_b[j] / correction2;
        b[j] -= (lr * mHat) / (Math.sqrt(vHat) + eps);
      }
    };

    updateAdam(
      this.layerOut.weights, gradWOut, this.layerOut.m_w, this.layerOut.v_w,
      this.layerOut.biases, gradBOut, this.layerOut.m_b, this.layerOut.v_b
    );
    updateAdam(
      this.layer2.weights, gradW2, this.layer2.m_w, this.layer2.v_w,
      this.layer2.biases, gradB2, this.layer2.m_b, this.layer2.v_b
    );
    updateAdam(
      this.layer1.weights, gradW1, this.layer1.m_w, this.layer1.v_w,
      this.layer1.biases, gradB1, this.layer1.m_b, this.layer1.v_b
    );

    return {
      loss: totalLoss / N,
      correct,
    };
  }

  evaluate(samples: ProcessedSample[]): ModelMetrics {
    const matrix: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    for (const sample of samples) {
      const { probs } = this.forward(sample.features);
      const pred = probs.indexOf(Math.max(...probs));
      matrix[sample.label][pred]++;
    }

    const precision = { none: 0, mirrorOf: 0, creates: 0 };
    const recall = { none: 0, mirrorOf: 0, creates: 0 };
    const f1 = { none: 0, mirrorOf: 0, creates: 0 };
    const support = { none: 0, mirrorOf: 0, creates: 0 };

    let totalCorrect = 0;
    const f1s: number[] = [];

    CLASS_NAMES.forEach((className, idx) => {
      const tp = matrix[idx][idx];
      const fp = matrix[0][idx] + matrix[1][idx] + matrix[2][idx] - tp;
      const fn = matrix[idx][0] + matrix[idx][1] + matrix[idx][2] - tp;
      const supp = tp + fn;

      totalCorrect += tp;
      support[className] = supp;
      precision[className] = tp + fp > 0 ? tp / (tp + fp) : 0;
      recall[className] = supp > 0 ? tp / supp : 0;

      const p = precision[className];
      const r = recall[className];
      const f = p + r > 0 ? (2 * p * r) / (p + r) : 0;
      f1[className] = f;
      f1s.push(f);
    });

    const total = samples.length;
    const accuracy = total > 0 ? totalCorrect / total : 0;
    const macroF1 = f1s.reduce((a, b) => a + b, 0) / f1s.length;

    return {
      accuracy: Math.round(accuracy * 10000) / 10000,
      macroF1: Math.round(macroF1 * 10000) / 10000,
      precision,
      recall,
      f1,
      support,
      confusionMatrix: {
        matrix,
        classes: CLASS_NAMES,
      },
      runtimeMs: 0,
      trainingLogs: [],
    };
  }
}

/**
 * Service to execute training and simulation.
 */
export class IOMMlTrainingService {
  private activeModel: IOMNeuralClassifier | null = null;
  private currentConfig: TrainingConfig | null = null;

  prepareDataset(config: TrainingConfig): ProcessedSample[] {
    return CANONICAL_PAIRS.map(pair => {
      const sNode = CANONICAL_NODE_MAP.get(pair.source)!;
      const tNode = CANONICAL_NODE_MAP.get(pair.target)!;
      let label = CLASS_INDEX[pair.relation];

      // In negative control, artificially corrupt the dataset to test non-trivial invariance
      if (config.modelType === 'negative_control' && pair.triad_index === 1 && pair.relation === 'mirrorOf') {
        label = CLASS_INDEX['none'];
      }

      return {
        triadIndex: pair.triad_index,
        sourceId: pair.source,
        targetId: pair.target,
        features: extractFeatures(sNode, tNode, config),
        label,
      };
    });
  }

  /**
   * Runs training asynchronously with progress callbacks.
   */
  async train(
    config: TrainingConfig,
    onEpochProgress?: (epochLog: EpochLog, currentProgress: number) => void
  ): Promise<ModelMetrics> {
    const startTime = performance.now();
    this.currentConfig = config;

    const dataset = this.prepareDataset(config);
    const inputDim = dataset[0].features.length;
    const model = new IOMNeuralClassifier(inputDim, config.hiddenDim, 3);
    this.activeModel = model;

    // Compute class weights if enabled
    const classCounts = [0, 0, 0];
    dataset.forEach(d => classCounts[d.label]++);
    const totalSamples = dataset.length;
    const classWeights = config.lossWeighted
      ? classCounts.map(count => totalSamples / (3 * Math.max(count, 1)))
      : [1.0, 1.0, 1.0];

    const trainingLogs: EpochLog[] = [];

    // Training loop with asynchronous yield every 5 epochs
    for (let epoch = 1; epoch <= config.epochs; epoch++) {
      const { loss, correct } = model.trainStep(
        dataset,
        config.learningRate,
        config.weightDecay,
        classWeights
      );

      const acc = correct / dataset.length;

      // Every 5 epochs or last epoch compute full metrics
      if (epoch % 5 === 0 || epoch === config.epochs) {
        const evalMetrics = model.evaluate(dataset);
        const log: EpochLog = {
          epoch,
          loss: Math.round(loss * 10000) / 10000,
          accuracy: evalMetrics.accuracy,
          macroF1: evalMetrics.macroF1,
          mirrorF1: Math.round(evalMetrics.f1.mirrorOf * 1000) / 1000,
          createsF1: Math.round(evalMetrics.f1.creates * 1000) / 1000,
          noneF1: Math.round(evalMetrics.f1.none * 1000) / 1000,
        };
        trainingLogs.push(log);

        if (onEpochProgress) {
          onEpochProgress(log, epoch / config.epochs);
        }

        // Brief yield for UI rendering
        await new Promise(r => setTimeout(r, 8));
      }
    }

    // Perform Leave-One-Triad-Out Cross Validation if configured
    let foldAccuracies: { fold: number; accuracy: number; heldOutTriad: number }[] = [];
    if (config.validationMode === 'loo') {
      foldAccuracies = await this.runLeaveOneTriadOut(config);
    }

    const finalMetrics = model.evaluate(dataset);
    finalMetrics.runtimeMs = Math.round(performance.now() - startTime);
    finalMetrics.trainingLogs = trainingLogs;
    finalMetrics.foldAccuracies = foldAccuracies;

    return finalMetrics;
  }

  /**
   * Evaluates Leave-One-Triad-Out cross validation across all 13 triads.
   */
  async runLeaveOneTriadOut(config: TrainingConfig): Promise<{ fold: number; accuracy: number; heldOutTriad: number }[]> {
    const allSamples = this.prepareDataset(config);
    const folds: { fold: number; accuracy: number; heldOutTriad: number }[] = [];

    for (let heldOut = 1; heldOut <= 13; heldOut++) {
      const trainSet = allSamples.filter(s => s.triadIndex !== heldOut);
      const testSet = allSamples.filter(s => s.triadIndex === heldOut);

      const foldModel = new IOMNeuralClassifier(allSamples[0].features.length, config.hiddenDim, 3);
      const epochs = Math.min(config.epochs, 60); // Fast convergence for LOO

      for (let e = 0; e < epochs; e++) {
        foldModel.trainStep(trainSet, config.learningRate, config.weightDecay);
      }

      const evalResult = foldModel.evaluate(testSet);
      folds.push({
        fold: heldOut,
        heldOutTriad: heldOut,
        accuracy: evalResult.accuracy,
      });
    }

    return folds;
  }

  /**
   * Predicts relationship between any source and target node or custom attributes.
   */
  predict(source: TriadNode, target: TriadNode): PredictionResult {
    const config = this.currentConfig || {
      modelType: 'pi_hgat_t',
      learningRate: 0.003,
      epochs: 80,
      hiddenDim: 32,
      weightDecay: 0.0001,
      batchSize: 32,
      lossWeighted: true,
      validationMode: 'split',
    };

    const features = extractFeatures(source, target, config);
    const ruleLabel = evaluateCanonicalRelation(
      source.phase,
      source.position_index,
      target.phase,
      target.position_index
    );

    if (!this.activeModel) {
      // Deterministic fallback
      const probs = {
        none: ruleLabel === 'none' ? 0.99 : 0.005,
        mirrorOf: ruleLabel === 'mirrorOf' ? 0.99 : 0.005,
        creates: ruleLabel === 'creates' ? 0.99 : 0.005,
      };
      return {
        source: source.node_id,
        target: target.node_id,
        predictedRelation: ruleLabel,
        confidence: 0.99,
        probabilities: probs,
        features,
        ruleConformant: true,
        explanation: `Regla determinista formal: ${ruleLabel}.`,
      };
    }

    const { probs } = this.activeModel.forward(features);
    const maxIdx = probs.indexOf(Math.max(...probs));
    const predictedRelation = CLASS_NAMES[maxIdx];

    return {
      source: source.node_id,
      target: target.node_id,
      predictedRelation,
      confidence: Math.round(probs[maxIdx] * 1000) / 1000,
      probabilities: {
        none: Math.round(probs[0] * 1000) / 1000,
        mirrorOf: Math.round(probs[1] * 1000) / 1000,
        creates: Math.round(probs[2] * 1000) / 1000,
      },
      features,
      ruleConformant: predictedRelation === ruleLabel,
    };
  }

  hasTrainedModel(): boolean {
    return this.activeModel !== null;
  }
}

export const iomMlEngine = new IOMMlTrainingService();
