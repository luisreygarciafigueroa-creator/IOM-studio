import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TrainingStudio } from './components/TrainingStudio';
import { ProcessAutomationStudio } from './components/ProcessAutomationStudio';
import { GeminiStudio } from './components/GeminiStudio';
import { OntologyVault } from './components/OntologyVault';
import { ModelMetrics, ProcessPipeline, TriadNode, PredictionResult } from './types/iom';
import { iomMlEngine } from './services/iomMlEngine';
import { processAutomationEngine, PRESET_PIPELINES } from './services/processEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<'training' | 'process' | 'gemini' | 'vault'>('process');
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [activeCycles, setActiveCycles] = useState<number>(0);

  // Cross-component communication
  const [pendingExplanation, setPendingExplanation] = useState<{
    source: TriadNode;
    target: TriadNode;
    prediction: PredictionResult;
  } | null>(null);

  // Initialize and run a fast baseline training on mount
  useEffect(() => {
    let isMounted = true;

    async function initBaseline() {
      try {
        const initialMetrics = await iomMlEngine.train({
          modelType: 'pi_hgat_t',
          learningRate: 0.005,
          epochs: 25,
          hiddenDim: 32,
          weightDecay: 0.0001,
          batchSize: 32,
          lossWeighted: true,
          validationMode: 'split',
        });
        if (isMounted) {
          setMetrics(initialMetrics);
        }
      } catch (err) {
        console.error('Error during initial baseline training:', err);
      }
    }

    initBaseline();

    const unsubscribe = processAutomationEngine.subscribe(pipeline => {
      if (isMounted) {
        setActiveCycles(pipeline.metrics.completedCycles);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleAskGeminiExplain = (source: TriadNode, target: TriadNode, prediction: PredictionResult) => {
    setPendingExplanation({ source, target, prediction });
    setActiveTab('gemini');
  };

  const handleOpenGeminiOptimizer = (_pipeline: ProcessPipeline) => {
    setActiveTab('gemini');
  };

  const handleApplyGeneratedPipeline = (pipeline: ProcessPipeline) => {
    processAutomationEngine.setPipeline(pipeline);
    setActiveTab('process');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isModelTrained={iomMlEngine.hasTrainedModel()}
        trainingAccuracy={metrics ? metrics.accuracy : 0}
        activeProcessCycles={activeCycles}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'training' && (
          <TrainingStudio
            metrics={metrics}
            setMetrics={setMetrics}
            onAskGeminiExplain={handleAskGeminiExplain}
          />
        )}

        {activeTab === 'process' && (
          <ProcessAutomationStudio
            onOpenGeminiOptimizer={handleOpenGeminiOptimizer}
          />
        )}

        {activeTab === 'gemini' && (
          <GeminiStudio
            currentPipeline={processAutomationEngine.getPipeline()}
            onApplyPipeline={handleApplyGeneratedPipeline}
            pendingExplanation={pendingExplanation}
          />
        )}

        {activeTab === 'vault' && <OntologyVault />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300">IOM Neural AutoFlow</span>
            <span>·</span>
            <span>Marco Formal de la Unidad Informativa</span>
            <span>·</span>
            <span>5 Perspectivas & 13 Tríadas</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Punto Fijo Estricto Demostrado en Lean 4</span>
            <span>·</span>
            <span>Autonomía Absoluta sin Contenedor Exterior</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
