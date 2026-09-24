'use client';

import React, { useState } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import { DecisionNode } from '@/types/strategy';
import { CheckCircle2, Radio } from 'lucide-react';

export const VisualDecisionGraph: React.FC = () => {
  const { project } = useBrandStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const nodes = Object.values(project.decisionGraph.nodes);
  const edges = project.decisionGraph.edges;

  if (nodes.length === 0) {
    return null;
  }

  // Group nodes by category to lay them out across sequential columns (DAG progression)
  // Columns:
  // 1: Foundation / Brief (brief_review, intake)
  // 2: Strategy / Positioning (positioning_world, strategic_baseline)
  // 3: Identity & Voice (brand_name, voice_system, visual_style, creative_identity)
  // 4: Quality & Evolution (guardian_lock, scenario_approval, launch_kit)

  const getStageColumn = (category: string): number => {
    switch (category) {
      case 'brief_review':
      case 'intake':
      case 'foundation':
        return 0;
      case 'positioning_world':
      case 'strategic_baseline':
      case 'positioning':
        return 1;
      case 'brand_name':
      case 'personality':
      case 'voice_system':
      case 'visual_style':
      case 'creative_identity':
        return 2;
      case 'guardian_lock':
      case 'scenario_approval':
      case 'launch_kit':
      default:
        return 3;
    }
  };

  const columns: DecisionNode[][] = [[], [], [], []];
  nodes.forEach((n) => {
    const colIdx = getStageColumn(n.category);
    columns[colIdx].push(n);
  });

  const columnWidth = 260;
  const nodeHeight = 110;
  const verticalSpacing = 28;
  const paddingX = 40;
  const paddingY = 40;

  // Compute (x, y) positions for each node
  const nodePositions: Record<string, { x: number; y: number }> = {};
  let maxColumnHeight = 0;

  columns.forEach((colNodes, colIdx) => {
    const colHeight = colNodes.length * (nodeHeight + verticalSpacing);
    if (colHeight > maxColumnHeight) {
      maxColumnHeight = colHeight;
    }

    colNodes.forEach((node, rowIdx) => {
      const x = paddingX + colIdx * (columnWidth + 80);
      const y = paddingY + rowIdx * (nodeHeight + verticalSpacing);
      nodePositions[node.id] = { x, y };
    });
  });

  const totalWidth = paddingX * 2 + 3 * (columnWidth + 80) + columnWidth;
  const totalHeight = Math.max(maxColumnHeight + paddingY * 2, 340);

  // Identify connected nodes for highlight
  const connectedEdgeIds = new Set<string>();
  const connectedNodeIds = new Set<string>();

  if (selectedNodeId) {
    connectedNodeIds.add(selectedNodeId);
    edges.forEach((edge) => {
      if (edge.fromNodeId === selectedNodeId || edge.toNodeId === selectedNodeId) {
        connectedEdgeIds.add(edge.id);
        connectedNodeIds.add(edge.fromNodeId);
        connectedNodeIds.add(edge.toNodeId);
      }
    });
  }

  const columnTitles = [
    { title: '1. Epistemic Baseline', subtitle: 'Facts & Strategic Scope' },
    { title: '2. Positioning World', subtitle: 'Chosen Differentiator & Tradeoffs' },
    { title: '3. Creative Expression', subtitle: 'Name, Voice & Visual Lexicon' },
    { title: '4. Governance & Execution', subtitle: 'Guardian Gate & Launch Kit' },
  ];

  return (
    <div className="monolith-card rounded-2xl p-6 overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-champagne-500/10 border border-champagne-500/30 flex items-center justify-center text-champagne-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>Interactive Strategic Causal DAG</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-champagne-500/10 text-champagne-400 border border-champagne-500/25">
                Live Lineage
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Visualizes how founder decisions propagate causally across stages with strict dependency validation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian-900 border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-champagne-400 animate-pulse" />
            {nodes.length} Decisions
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian-900 border border-white/[0.06]">
            {edges.length} Causal Edges
          </span>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative mt-4 overflow-x-auto pb-4 scrollbar-thin">
        {/* Column Stage Headers */}
        <div
          className="flex justify-between pb-3 mb-2 border-b border-white/[0.04] text-xs font-medium text-zinc-400"
          style={{ width: `${totalWidth}px` }}
        >
          {columnTitles.map((col, idx) => (
            <div
              key={idx}
              className="px-4"
              style={{ width: `${columnWidth}px`, marginLeft: idx === 0 ? `${paddingX}px` : '80px' }}
            >
              <div className="text-[11px] font-mono uppercase tracking-wider text-champagne-400/90 font-semibold">
                {col.title}
              </div>
              <div className="text-[10px] text-zinc-500 truncate">{col.subtitle}</div>
            </div>
          ))}
        </div>

        <div className="relative" style={{ width: `${totalWidth}px`, height: `${totalHeight}px` }}>
          {/* SVG Connector Lines */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={totalWidth}
            height={totalHeight}
          >
            <defs>
              <linearGradient id="goldSplineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d4b483" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#e2c9a0" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="dimSplineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b4356" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#282e3c" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {edges.map((edge) => {
              const from = nodePositions[edge.fromNodeId];
              const to = nodePositions[edge.toNodeId];
              if (!from || !to) return null;

              const isHighlighted =
                selectedNodeId === null || connectedEdgeIds.has(edge.id);

              const startX = from.x + columnWidth;
              const startY = from.y + nodeHeight / 2;
              const endX = to.x;
              const endY = to.y + nodeHeight / 2;

              const deltaX = (endX - startX) * 0.5;
              const pathD = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${
                endX - deltaX
              } ${endY}, ${endX} ${endY}`;

              return (
                <g key={edge.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHighlighted && selectedNodeId ? 'url(#goldSplineGrad)' : isHighlighted ? 'rgba(212, 180, 131, 0.35)' : 'rgba(255, 255, 255, 0.05)'}
                    strokeWidth={isHighlighted && selectedNodeId ? 2.5 : 1.5}
                    strokeDasharray={edge.isExplicitTradeoff ? '4,4' : undefined}
                    className="transition-all duration-300"
                  />
                  {/* Subtle directional pulse dot on active path */}
                  {isHighlighted && selectedNodeId && (
                    <circle
                      r="3"
                      fill="#e2c9a0"
                      className="animate-ping"
                      cx={(startX + endX) / 2}
                      cy={(startY + endY) / 2}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Node Cards */}
          {nodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const isSelected = selectedNodeId === node.id;
            const isConnected = selectedNodeId === null || connectedNodeIds.has(node.id);

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${columnWidth}px`,
                  height: `${nodeHeight}px`,
                }}
                className={`rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none flex flex-col justify-between ${
                  isSelected
                    ? 'monolith-card-gold ring-1 ring-champagne-400 scale-[1.02] z-20'
                    : isConnected
                    ? 'monolith-card hover:border-champagne-500/40 z-10'
                    : 'bg-obsidian-950/60 border border-white/[0.03] opacity-40 hover:opacity-75 z-0'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.04]">
                      {node.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Locked
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-champagne-300 transition-colors">
                    {node.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                    {node.approvedValue}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/[0.05] text-[10px] text-zinc-500 font-mono">
                  <span className="truncate max-w-[140px]">
                    {node.tradeoff ? `Tradeoff: ${node.tradeoff}` : 'Root Anchor'}
                  </span>
                  <span>v{node.version}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Inspector Footnote */}
      {selectedNodeId && (
        <div className="mt-3 p-3 rounded-xl bg-obsidian-900 border border-champagne-500/30 flex items-start justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-champagne-300">
                Selected: {project.decisionGraph.nodes[selectedNodeId]?.title}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-champagne-500/10 text-champagne-400 font-mono">
                {project.decisionGraph.nodes[selectedNodeId]?.category}
              </span>
            </div>
            <p className="text-zinc-300 text-[11px]">
              <strong>Rationale:</strong> {project.decisionGraph.nodes[selectedNodeId]?.rationale}
            </p>
            {project.decisionGraph.nodes[selectedNodeId]?.tradeoff && (
              <p className="text-amber-300/90 text-[11px]">
                <strong>Explicit Sacrifice:</strong> {project.decisionGraph.nodes[selectedNodeId]?.tradeoff}
              </p>
            )}
          </div>
          <button
            onClick={() => setSelectedNodeId(null)}
            className="text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded bg-obsidian-800 border border-white/[0.06] shrink-0"
          >
            Clear Focus
          </button>
        </div>
      )}
    </div>
  );
};
