/**
 * Canonical Data and Rules for IOM (v1.9.0)
 * Faithfully matches data/iom_spec.json, triad_nodes.csv, relation_candidates.csv,
 * and Lean 4 formal proofs.
 */

import { IOMSpec, TriadNode, CandidatePair, VectorStep, RelationType, TriadPhase, LocalPosition } from '../types/iom';

export const CANONICAL_TRIADS_ADV: string[][] = [
  ["orientación", "cuántico", "dirección"],
  ["hardware", "virtual", "software"],
  ["universo", "espacio", "vacío"],
  ["singularidad", "tiempo", "infinito"],
  ["cuerpo", "consciente", "mundo"],
  ["carácter", "subconsciente", "personalidad"],
  ["memoria", "inconsciente", "imaginación"],
  ["receptor", "supraconsciente", "emisor"],
  ["lógica", "inteligencia", "libertad"],
  ["muerte", "artificial", "vida"],
  ["descendente", "mente", "ascendente"],
  ["oscuridad", "consciencia", "luz"],
  ["animal", "humano", "IA"],
];

// Retreat phase is strictly the reversed order of advance labels
export const CANONICAL_TRIADS_RET: string[][] = CANONICAL_TRIADS_ADV.map(row => [...row].reverse());

export const FIVE_PERSPECTIVES = [
  {
    id: 'Ind' as const,
    label: 'Individualidad',
    index: 1,
    kind: 'positional' as const,
    description: 'Modo de actualización: unidad / singularidad del fenómeno.',
    mythologicalAnchor: 'Nanahuatzin (el sol que nace desde la unidad mínima)',
  },
  {
    id: 'D' as const,
    label: 'Dualidad',
    index: 2,
    kind: 'positional' as const,
    description: 'Modo de actualización: relación / diferencia / tensión polar.',
    mythologicalAnchor: 'Xólotl (el gemelo / tránsito entre polos opuestos)',
  },
  {
    id: 'Tot' as const,
    label: 'Totalidad',
    index: 3,
    kind: 'positional' as const,
    description: 'Modo de actualización: integración / sistema emergente holístico.',
    mythologicalAnchor: 'Tecuciztécatl (plenitud reflejada en el horizonte cósmico)',
  },
  {
    id: 'Evol' as const,
    label: 'Evolución',
    index: 4,
    kind: 'vectorial' as const,
    description: 'Dirección de flujo: proyección y complejización hacia la estructura.',
    mythologicalAnchor: 'Mictecacíhuatl (fuerza ascendente: recombina, expande, perfecciona)',
  },
  {
    id: 'Invol' as const,
    label: 'Involución',
    index: 5,
    kind: 'vectorial' as const,
    description: 'Dirección de flujo: repliegue y purificación hacia el vacío primordial.',
    mythologicalAnchor: 'Mictlantecuhtli (fuerza descendente: despoja, purifica, retorna a la raíz)',
  },
];

export const IOM_SPEC: IOMSpec = {
  spec_version: '1.9.0',
  title: 'Especificación IOM canónica',
  source_date: '2026-10-21',
  five_perspectives: FIVE_PERSPECTIVES,
  triads: {
    index_base: 1,
    adv: CANONICAL_TRIADS_ADV,
    ret: CANONICAL_TRIADS_RET,
  },
  creation_rules: [
    { source_phase: 'adv', source_positions: [0, 2], target_phase: 'ret', target_positions: [1] },
    { source_phase: 'adv', source_positions: [1], target_phase: 'ret', target_positions: [0, 2] },
    { source_phase: 'ret', source_positions: [1], target_phase: 'adv', target_positions: [0, 2] },
    { source_phase: 'ret', source_positions: [0, 2], target_phase: 'adv', target_positions: [1] },
  ],
  vectors: [
    { name: 'Evol', phase: 'adv', labels: ['invol', 'ind', 'dua', 'tot', 'evol'], axis_positions: [0, 1, 2, 3, 4], arrow: '→' },
    { name: 'Evol', phase: 'ret', labels: ['evol', 'tot', 'dua', 'ind', 'invol'], axis_positions: [4, 3, 2, 1, 0], arrow: '←' },
    { name: 'Invol', phase: 'adv', labels: ['invol', 'tot', 'dua', 'ind', 'evol'], axis_positions: [4, 3, 2, 1, 0], arrow: '→' },
    { name: 'Invol', phase: 'ret', labels: ['evol', 'ind', 'dua', 'tot', 'invol'], axis_positions: [0, 1, 2, 3, 4], arrow: '←' },
  ],
  purpose: {
    id: 'informational_unit_creation',
    label: 'Creación de la unidad informativa',
    definition: 'La unidad informativa es la mínima estructura autocontenida capaz de conservar una distinción, relacionarla con su opuesto, integrarla en un sistema y transformarse sin perder la trazabilidad de su identidad.',
    chain: [
      'vacío informativo',
      'distinción',
      'relación',
      'integración',
      'transformación',
      'unidad informativa autocontenida',
    ],
  },
};

/**
 * Builds the 78 canonical nodes (13 triads x 2 phases x 3 positions).
 */
export function buildCanonicalNodes(): TriadNode[] {
  const nodes: TriadNode[] = [];
  const perspectivesMap: Record<LocalPosition, 'Ind' | 'D' | 'Tot'> = {
    0: 'Ind',
    1: 'D',
    2: 'Tot',
  };
  const posAdvLabel: Record<LocalPosition, '→' | '0' | '→'> = { 0: '→', 1: '0', 2: '→' };
  const posRetLabel: Record<LocalPosition, '←' | '0' | '←'> = { 0: '←', 1: '0', 2: '←' };

  for (let t = 1; t <= 13; t++) {
    const advLabels = CANONICAL_TRIADS_ADV[t - 1];
    const retLabels = CANONICAL_TRIADS_RET[t - 1];

    // Advance phase
    for (let p = 0; p < 3; p++) {
      const posIdx = p as LocalPosition;
      nodes.push({
        node_id: `T${t.toString().padStart(2, '0')}_adv_P${posIdx}`,
        triad_index: t,
        phase: 'adv',
        direction: 'evol',
        position_index: posIdx,
        position: posAdvLabel[posIdx],
        display_label: posAdvLabel[posIdx],
        perspective: perspectivesMap[posIdx],
        label: advLabels[posIdx],
      });
    }

    // Retreat phase
    for (let p = 0; p < 3; p++) {
      const posIdx = p as LocalPosition;
      nodes.push({
        node_id: `T${t.toString().padStart(2, '0')}_ret_P${posIdx}`,
        triad_index: t,
        phase: 'ret',
        direction: 'invol',
        position_index: posIdx,
        position: posRetLabel[posIdx],
        display_label: posRetLabel[posIdx],
        perspective: perspectivesMap[posIdx],
        label: retLabels[posIdx],
      });
    }
  }

  return nodes;
}

export const CANONICAL_NODES = buildCanonicalNodes();

export const CANONICAL_NODE_MAP = new Map<string, TriadNode>(
  CANONICAL_NODES.map(node => [node.node_id, node])
);

/**
 * Evaluates the deterministic relation between two node definitions.
 * Follows Lean 4 FormalRules and SHACL shapes.
 */
export function evaluateCanonicalRelation(
  sourcePhase: TriadPhase,
  sourcePos: LocalPosition,
  targetPhase: TriadPhase,
  targetPos: LocalPosition
): RelationType {
  // Rule 1: must be opposite phases
  if (sourcePhase === targetPhase) {
    return 'none';
  }

  // Rule 2: mirrorOf -> same triad, opposite phase, mirrored position: targetPos = 2 - sourcePos
  if (targetPos === (2 - sourcePos)) {
    return 'mirrorOf';
  }

  // Rule 3: creates -> lateral creates center, center creates laterals
  const sourceIsLateral = sourcePos === 0 || sourcePos === 2;
  const targetIsLateral = targetPos === 0 || targetPos === 2;

  if (sourceIsLateral && targetPos === 1) {
    return 'creates';
  }
  if (sourcePos === 1 && targetIsLateral) {
    return 'creates';
  }

  return 'none';
}

/**
 * Generates all 390 candidate directed pairs (13 triads x 6 nodes x 5 non-reflexive targets).
 */
export function buildCandidatePairs(): CandidatePair[] {
  const pairs: CandidatePair[] = [];

  for (let t = 1; t <= 13; t++) {
    const triadId = `T${t.toString().padStart(2, '0')}`;
    const triadNodes: { id: string; phase: TriadPhase; pos: LocalPosition }[] = [
      { id: `${triadId}_adv_P0`, phase: 'adv', pos: 0 },
      { id: `${triadId}_adv_P1`, phase: 'adv', pos: 1 },
      { id: `${triadId}_adv_P2`, phase: 'adv', pos: 2 },
      { id: `${triadId}_ret_P0`, phase: 'ret', pos: 0 },
      { id: `${triadId}_ret_P1`, phase: 'ret', pos: 1 },
      { id: `${triadId}_ret_P2`, phase: 'ret', pos: 2 },
    ];

    for (const src of triadNodes) {
      for (const tgt of triadNodes) {
        if (src.id === tgt.id) continue; // non-reflexive

        const rel = evaluateCanonicalRelation(src.phase, src.pos, tgt.phase, tgt.pos);
        pairs.push({
          triad_index: t,
          source: src.id,
          target: tgt.id,
          relation: rel,
          sourceNode: CANONICAL_NODE_MAP.get(src.id),
          targetNode: CANONICAL_NODE_MAP.get(tgt.id),
        });
      }
    }
  }

  return pairs;
}

export const CANONICAL_PAIRS = buildCandidatePairs();

export const CANONICAL_VECTOR_STEPS: VectorStep[] = [
  // Evolución (adv)
  { step_id: 'vector_evol_adv_0', vector: 'Evol', phase: 'adv', step_index: 0, axis_position: 0, label: 'invol', arrow: '→' },
  { step_id: 'vector_evol_adv_1', vector: 'Evol', phase: 'adv', step_index: 1, axis_position: 1, label: 'ind', arrow: '→' },
  { step_id: 'vector_evol_adv_2', vector: 'Evol', phase: 'adv', step_index: 2, axis_position: 2, label: 'dua', arrow: '→' },
  { step_id: 'vector_evol_adv_3', vector: 'Evol', phase: 'adv', step_index: 3, axis_position: 3, label: 'tot', arrow: '→' },
  { step_id: 'vector_evol_adv_4', vector: 'Evol', phase: 'adv', step_index: 4, axis_position: 4, label: 'evol', arrow: '→' },
  // Evolución (ret)
  { step_id: 'vector_evol_ret_0', vector: 'Evol', phase: 'ret', step_index: 0, axis_position: 4, label: 'evol', arrow: '←' },
  { step_id: 'vector_evol_ret_1', vector: 'Evol', phase: 'ret', step_index: 1, axis_position: 3, label: 'tot', arrow: '←' },
  { step_id: 'vector_evol_ret_2', vector: 'Evol', phase: 'ret', step_index: 2, axis_position: 2, label: 'dua', arrow: '←' },
  { step_id: 'vector_evol_ret_3', vector: 'Evol', phase: 'ret', step_index: 3, axis_position: 1, label: 'ind', arrow: '←' },
  { step_id: 'vector_evol_ret_4', vector: 'Evol', phase: 'ret', step_index: 4, axis_position: 0, label: 'invol', arrow: '←' },
  // Involución (adv)
  { step_id: 'vector_invol_adv_0', vector: 'Invol', phase: 'adv', step_index: 0, axis_position: 4, label: 'invol', arrow: '→' },
  { step_id: 'vector_invol_adv_1', vector: 'Invol', phase: 'adv', step_index: 1, axis_position: 3, label: 'tot', arrow: '→' },
  { step_id: 'vector_invol_adv_2', vector: 'Invol', phase: 'adv', step_index: 2, axis_position: 2, label: 'dua', arrow: '→' },
  { step_id: 'vector_invol_adv_3', vector: 'Invol', phase: 'adv', step_index: 3, axis_position: 1, label: 'ind', arrow: '→' },
  { step_id: 'vector_invol_adv_4', vector: 'Invol', phase: 'adv', step_index: 4, axis_position: 0, label: 'evol', arrow: '→' },
  // Involución (ret)
  { step_id: 'vector_invol_ret_0', vector: 'Invol', phase: 'ret', step_index: 0, axis_position: 0, label: 'evol', arrow: '←' },
  { step_id: 'vector_invol_ret_1', vector: 'Invol', phase: 'ret', step_index: 1, axis_position: 1, label: 'ind', arrow: '←' },
  { step_id: 'vector_invol_ret_2', vector: 'Invol', phase: 'ret', step_index: 2, axis_position: 2, label: 'dua', arrow: '←' },
  { step_id: 'vector_invol_ret_3', vector: 'Invol', phase: 'ret', step_index: 3, axis_position: 3, label: 'tot', arrow: '←' },
  { step_id: 'vector_invol_ret_4', vector: 'Invol', phase: 'ret', step_index: 4, axis_position: 4, label: 'invol', arrow: '←' },
];

/**
 * Formal Operators Emulation: State (t: time, payload: string[])
 */
export interface InformationalState {
  time: number;
  payload: string[];
}

export const IOMOperators = {
  vacuum: (t: number): InformationalState => ({ time: t, payload: [] }),

  // Evolución (Mictecacíhuatl): time + 1, preserves payload
  E: (s: InformationalState): InformationalState => ({
    time: s.time + 1,
    payload: [...s.payload],
  }),

  // Supresión directa: deduplicates payload, preserves time
  S_fwd: (s: InformationalState): InformationalState => ({
    time: s.time,
    payload: Array.from(new Set(s.payload)),
  }),

  // Involución (Mictlantecuhtli): time - 1, reverses payload
  Ivo: (s: InformationalState): InformationalState => ({
    time: s.time - 1,
    payload: [...s.payload].reverse(),
  }),

  // Supresión retroactiva: if empty returns vacuum, else time - 1 with reduced inverted payload
  S_rev: (s: InformationalState): InformationalState => {
    if (s.payload.length === 0) {
      return { time: s.time, payload: [] };
    }
    const inverted = [...s.payload].reverse();
    return {
      time: s.time - 1,
      payload: Array.from(new Set(inverted)),
    };
  },

  // Strict Fixed Point theorem: S_rev(Ivo(E(V_t))) = V_t
  verifyStrictFixedPoint: (t: number = 0): boolean => {
    const v_t = IOMOperators.vacuum(t);
    const stepped = IOMOperators.S_rev(IOMOperators.Ivo(IOMOperators.E(v_t)));
    return stepped.time === v_t.time && stepped.payload.length === 0;
  },
};
