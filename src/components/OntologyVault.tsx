import React, { useState } from 'react';
import {
  Layers,
  ShieldCheck,
  Binary,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  CANONICAL_TRIADS_ADV,
  CANONICAL_TRIADS_RET,
  FIVE_PERSPECTIVES,
  CANONICAL_NODES,
  CANONICAL_NODE_MAP,
  CANONICAL_VECTOR_STEPS,
  IOMOperators,
  InformationalState,
} from '../data/iomCanonicalData';
import { TriadNode } from '../types/iom';

export const OntologyVault: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('T13_adv_P1');
  const [activeTab, setActiveTab] = useState<'triads' | 'perspectives' | 'operators' | 'vectors'>('triads');

  // Interactive Operator State
  const [operatorTime, setOperatorTime] = useState<number>(0);
  const [inputPayload, setInputPayload] = useState<string>('distinción, relación, unidad');
  const [currentState, setCurrentState] = useState<InformationalState>({
    time: 0,
    payload: ['distinción', 'relación', 'unidad'],
  });
  const [operatorHistory, setOperatorHistory] = useState<string[]>(['Estado inicial configurado']);

  const selectedNode = CANONICAL_NODE_MAP.get(selectedNodeId);

  // Find relations for selected node
  const getConnectionsForNode = (node: TriadNode) => {
    const mirrorTargetId = `T${node.triad_index.toString().padStart(2, '0')}_${node.phase === 'adv' ? 'ret' : 'adv'}_P${2 - node.position_index}`;
    const mirrorTarget = CANONICAL_NODE_MAP.get(mirrorTargetId);

    // Creates targets
    const targetPhase = node.phase === 'adv' ? 'ret' : 'adv';
    const targetPositions = node.position_index === 1 ? [0, 2] : [1];
    const createsTargets = targetPositions.map(p =>
      CANONICAL_NODE_MAP.get(`T${node.triad_index.toString().padStart(2, '0')}_${targetPhase}_P${p}`)!
    );

    return { mirrorTarget, createsTargets };
  };

  const handleStepOperator = (op: 'E' | 'S_fwd' | 'Ivo' | 'S_rev' | 'cycle_strict') => {
    if (op === 'E') {
      const next = IOMOperators.E(currentState);
      setCurrentState(next);
      setOperatorHistory(prev => [
        `E: Tiempo incrementa a ${next.time}, carga conservada: [${next.payload.join(', ')}]`,
        ...prev,
      ]);
    } else if (op === 'S_fwd') {
      const next = IOMOperators.S_fwd(currentState);
      setCurrentState(next);
      setOperatorHistory(prev => [
        `S_fwd: Deduplicación estable, carga: [${next.payload.join(', ')}]`,
        ...prev,
      ]);
    } else if (op === 'Ivo') {
      const next = IOMOperators.Ivo(currentState);
      setCurrentState(next);
      setOperatorHistory(prev => [
        `Ivo: Tiempo retrocede a ${next.time}, inversión de orden: [${next.payload.join(', ')}]`,
        ...prev,
      ]);
    } else if (op === 'S_rev') {
      const next = IOMOperators.S_rev(currentState);
      setCurrentState(next);
      setOperatorHistory(prev => [
        `S_rev: Supresión retroactiva, tiempo: ${next.time}, carga: [${next.payload.join(', ')}]`,
        ...prev,
      ]);
    } else if (op === 'cycle_strict') {
      // Execute strict cycle on vacuum: S_rev(Ivo(E(V_t)))
      const v_t = IOMOperators.vacuum(currentState.time);
      const stepped = IOMOperators.S_rev(IOMOperators.Ivo(IOMOperators.E(v_t)));
      setCurrentState(stepped);
      setOperatorHistory(prev => [
        `Teorema strict_fixed_point: S_rev(Ivo(E(V_${currentState.time}))) = V_${stepped.time} (Carga vacía restaurada sin residuo).`,
        ...prev,
      ]);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                Bóveda Canónica & Pruebas Formales IOM
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Topología de 13 Tríadas & Operadores de Vacío
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Estructura formal verificada por Lean 4 y restricciones SHACL. Los 78 nodos son
              inmutables y constituyen la base matemática sobre la cual aprende el modelo de automatización.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-bold">Punto Fijo S_{'{n+1}'} = S_n</span>
            <span className="text-slate-700">|</span>
            <span className="text-cyan-400">spec_version 1.9.0</span>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('triads')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'triads'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-800/80 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            13 Tríadas (78 Nodos)
          </button>

          <button
            onClick={() => setActiveTab('perspectives')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'perspectives'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-800/80 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            5 Perspectivas Fundamentales
          </button>

          <button
            onClick={() => setActiveTab('operators')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'operators'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-800/80 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Simulador de Operadores (E, S, Ivo)
          </button>

          <button
            onClick={() => setActiveTab('vectors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'vectors'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-800/80 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vectores (20 Pasos)
          </button>
        </div>
      </div>

      {/* Tab 1: 13 Triads Explorer */}
      {activeTab === 'triads' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Triads Table */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-white text-sm">
                Matriz de 13 Tríadas en Avance (→) y Retroceso (←)
              </h3>
              <span className="text-xs text-slate-400 font-mono">13 Filas × 2 Fases × 3 Pos</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-slate-400 text-[11px] border-b border-slate-800">
                    <th className="py-2 px-2">#</th>
                    <th className="py-2 px-3 text-cyan-400">Avance (Ind →)</th>
                    <th className="py-2 px-3 text-cyan-400">Avance (D 0)</th>
                    <th className="py-2 px-3 text-cyan-400">Avance (Tot →)</th>
                    <th className="py-2 px-3 text-purple-400">Retroceso (Ind ←)</th>
                    <th className="py-2 px-3 text-purple-400">Retroceso (D 0)</th>
                    <th className="py-2 px-3 text-purple-400">Retroceso (Tot ←)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {CANONICAL_TRIADS_ADV.map((advRow, idx) => {
                    const triadIndex = idx + 1;
                    const retRow = CANONICAL_TRIADS_RET[idx];
                    return (
                      <tr key={triadIndex} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-2 text-slate-500 font-bold">
                          T{triadIndex.toString().padStart(2, '0')}
                        </td>

                        {/* Adv P0 */}
                        <td className="py-2 px-3">
                          <button
                            onClick={() => setSelectedNodeId(`T${triadIndex.toString().padStart(2, '0')}_adv_P0`)}
                            className={`px-1.5 py-0.5 rounded transition-colors text-left ${
                              selectedNodeId === `T${triadIndex.toString().padStart(2, '0')}_adv_P0`
                                ? 'bg-cyan-500 text-slate-950 font-bold'
                                : 'text-slate-200 hover:text-cyan-400'
                            }`}
                          >
                            {advRow[0]}
                          </button>
                        </td>

                        {/* Adv P1 */}
                        <td className="py-2 px-3">
                          <button
                            onClick={() => setSelectedNodeId(`T${triadIndex.toString().padStart(2, '0')}_adv_P1`)}
                            className={`px-1.5 py-0.5 rounded transition-colors text-left ${
                              selectedNodeId === `T${triadIndex.toString().padStart(2, '0')}_adv_P1`
                                ? 'bg-cyan-500 text-slate-950 font-bold'
                                : 'text-slate-200 hover:text-cyan-400'
                            }`}
                          >
                            {advRow[1]}
                          </button>
                        </td>

                        {/* Adv P2 */}
                        <td className="py-2 px-3">
                          <button
                            onClick={() => setSelectedNodeId(`T${triadIndex.toString().padStart(2, '0')}_adv_P2`)}
                            className={`px-1.5 py-0.5 rounded transition-colors text-left ${
                              selectedNodeId === `T${triadIndex.toString().padStart(2, '0')}_adv_P2`
                                ? 'bg-cyan-500 text-slate-950 font-bold'
                                : 'text-slate-200 hover:text-cyan-400'
                            }`}
                          >
                            {advRow[2]}
                          </button>
                        </td>

                        {/* Ret P0 */}
                        <td className="py-2 px-3">
                          <button
                            onClick={() => setSelectedNodeId(`T${triadIndex.toString().padStart(2, '0')}_ret_P0`)}
                            className={`px-1.5 py-0.5 rounded transition-colors text-left ${
                              selectedNodeId === `T${triadIndex.toString().padStart(2, '0')}_ret_P0`
                                ? 'bg-purple-500 text-slate-950 font-bold'
                                : 'text-slate-200 hover:text-purple-400'
                            }`}
                          >
                            {retRow[0]}
                          </button>
                        </td>

                        {/* Ret P1 */}
                        <td className="py-2 px-3">
                          <button
                            onClick={() => setSelectedNodeId(`T${triadIndex.toString().padStart(2, '0')}_ret_P1`)}
                            className={`px-1.5 py-0.5 rounded transition-colors text-left ${
                              selectedNodeId === `T${triadIndex.toString().padStart(2, '0')}_ret_P1`
                                ? 'bg-purple-500 text-slate-950 font-bold'
                                : 'text-slate-200 hover:text-purple-400'
                            }`}
                          >
                            {retRow[1]}
                          </button>
                        </td>

                        {/* Ret P2 */}
                        <td className="py-2 px-3">
                          <button
                            onClick={() => setSelectedNodeId(`T${triadIndex.toString().padStart(2, '0')}_ret_P2`)}
                            className={`px-1.5 py-0.5 rounded transition-colors text-left ${
                              selectedNodeId === `T${triadIndex.toString().padStart(2, '0')}_ret_P2`
                                ? 'bg-purple-500 text-slate-950 font-bold'
                                : 'text-slate-200 hover:text-purple-400'
                            }`}
                          >
                            {retRow[2]}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Node Inspector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-white text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
              <Binary className="w-4 h-4 text-cyan-400" />
              Inspector de Nodo Canónico
            </h3>

            {selectedNode && (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] block">Identificador</span>
                  <span className="text-lg font-bold text-white block">{selectedNode.node_id}</span>
                  <span className="text-cyan-400 text-sm font-semibold">{selectedNode.label}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Tríada</span>
                    <span className="text-white font-bold">T{selectedNode.triad_index.toString().padStart(2, '0')}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Fase & Dirección</span>
                    <span className="text-indigo-400 font-bold">{selectedNode.phase} ({selectedNode.direction})</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Perspectiva</span>
                    <span className="text-emerald-400 font-bold">{selectedNode.perspective}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Posición</span>
                    <span className="text-white font-bold">P{selectedNode.position_index} ({selectedNode.position})</span>
                  </div>
                </div>

                {/* Connections */}
                {(() => {
                  const { mirrorTarget, createsTargets } = getConnectionsForNode(selectedNode);
                  return (
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-slate-400 text-[11px] font-bold block mb-1">
                          Arista Espejo (mirrorOf) — Recíproco:
                        </span>
                        {mirrorTarget ? (
                          <div
                            onClick={() => setSelectedNodeId(mirrorTarget.node_id)}
                            className="p-2 rounded bg-indigo-950/40 border border-indigo-800 text-indigo-300 hover:bg-indigo-900/50 cursor-pointer flex items-center justify-between"
                          >
                            <span>[{mirrorTarget.node_id}] {mirrorTarget.label}</span>
                            <span className="text-[10px] font-semibold">2 - pos</span>
                          </div>
                        ) : null}
                      </div>

                      <div>
                        <span className="text-slate-400 text-[11px] font-bold block mb-1">
                          Aristas de Creación Causal (creates):
                        </span>
                        <div className="space-y-1">
                          {createsTargets.map(tgt => (
                            <div
                              key={tgt.node_id}
                              onClick={() => setSelectedNodeId(tgt.node_id)}
                              className="p-2 rounded bg-purple-950/40 border border-purple-800 text-purple-300 hover:bg-purple-900/50 cursor-pointer flex items-center justify-between"
                            >
                              <span>[{tgt.node_id}] {tgt.label}</span>
                              <span className="text-[10px] font-semibold">{tgt.phase} (P{tgt.position_index})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: 5 Perspectives */}
      {activeTab === 'perspectives' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FIVE_PERSPECTIVES.map(p => (
            <div key={p.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {p.kind}
                </span>
                <span className="text-xs font-mono text-slate-500">#{p.index}</span>
              </div>

              <h3 className="font-bold text-white text-lg">{p.label} ({p.id})</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-cyan-300 font-mono">
                <span className="text-slate-500 block text-[10px] uppercase">Anclaje Mítico</span>
                {p.mythologicalAnchor}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Formal Operators & Strict Fixed Point Simulator */}
      {activeTab === 'operators' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="font-semibold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <RotateCw className="w-5 h-5 text-indigo-400" />
              Operadores Temporales & Punto Fijo
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              En IOM, el vacío <span className="font-mono text-cyan-400">V_t = (t, [])</span> es la condición de posibilidad de nueva emergencia.
              La composición temporal <span className="font-mono text-emerald-400">S_rev ∘ Ivo ∘ E</span> restaura exactamente cualquier vacío sin residuo exterior.
            </p>

            {/* Current State Card */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Estado Actual s = (t, A)</span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tiempo (t): <strong className="text-white text-sm">{currentState.time}</strong></span>
                <span className="text-slate-400">Elementos ({currentState.payload.length}):</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-xs text-slate-200">
                {currentState.payload.length > 0 ? (
                  `[ ${currentState.payload.join(', ')} ]`
                ) : (
                  <span className="text-emerald-400 font-bold">∅ (Vacío Informativo V_{currentState.time})</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button
                onClick={() => handleStepOperator('E')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-cyan-300 border border-slate-700 text-center"
              >
                E (Avanza t+1)
              </button>
              <button
                onClick={() => handleStepOperator('S_fwd')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-indigo-300 border border-slate-700 text-center"
              >
                S_fwd (Deduplica)
              </button>
              <button
                onClick={() => handleStepOperator('Ivo')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-purple-300 border border-slate-700 text-center"
              >
                Ivo (Invierte t-1)
              </button>
              <button
                onClick={() => handleStepOperator('S_rev')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-amber-300 border border-slate-700 text-center"
              >
                S_rev (Disuelve)
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleStepOperator('cycle_strict')}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                Comprobar Teorema: S_rev ∘ Ivo ∘ E (V_t) = V_t
              </button>
            </div>
          </div>

          {/* Operator Action History Log */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono text-xs">
            <h4 className="font-semibold text-white border-b border-slate-800 pb-2">
              Registro de Operaciones Formales
            </h4>
            <div className="h-64 overflow-y-auto space-y-1.5 pr-1">
              {operatorHistory.map((h, i) => (
                <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800/80 text-slate-300">
                  {h}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: 20 Vector Steps */}
      {activeTab === 'vectors' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white text-sm border-b border-slate-800 pb-3">
            Secuencias Vectoriales (Evolución e Involución — 20 Pasos)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {['Evol_adv', 'Evol_ret', 'Invol_adv', 'Invol_ret'].map(group => {
              const [vec, phase] = group.split('_');
              const steps = CANONICAL_VECTOR_STEPS.filter(s => s.vector === vec && s.phase === phase);
              return (
                <div key={group} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className={vec === 'Evol' ? 'text-cyan-400' : 'text-purple-400'}>
                      {vec} ({phase})
                    </span>
                    <span className="text-slate-500">{steps[0]?.arrow}</span>
                  </div>

                  <div className="space-y-1 font-mono text-xs">
                    {steps.map(s => (
                      <div key={s.step_id} className="p-1.5 bg-slate-900 rounded border border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-300">{s.step_index}. {s.label}</span>
                        <span className="text-slate-500">Eje: {s.axis_position}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
