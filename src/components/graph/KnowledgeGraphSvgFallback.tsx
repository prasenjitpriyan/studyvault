'use client';

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Info } from 'lucide-react';
import type { GraphNode, GraphLink } from '@/app/api/graph/route';

interface KnowledgeGraphSvgFallbackProps {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedType: string;
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode | null) => void;
}

export default function KnowledgeGraphSvgFallback({
  nodes,
  links,
  selectedType,
  selectedNode,
  onSelectNode,
}: KnowledgeGraphSvgFallbackProps) {
  const shouldReduceMotion = useReducedMotion();

  // Filter visible nodes based on HUD selection
  const visibleNodes = useMemo(() => {
    return nodes.filter((n) => selectedType === 'all' || n.type === selectedType);
  }, [nodes, selectedType]);

  const visibleNodeMap = useMemo(() => {
    const map = new Map<string, (typeof nodes)[0] & { x: number; y: number }>();
    const count = visibleNodes.length;
    const centerX = 450;
    const centerY = 320;
    const radius = Math.min(centerX, centerY) * 0.72;

    visibleNodes.forEach((node, i) => {
      // Golden angle distribution for pleasant topological spacing
      const angle = i * 2.3999632;
      const r = radius * Math.sqrt((i + 1) / count);
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      map.set(node.id, { ...node, x, y });
    });

    return map;
  }, [visibleNodes]);

  const visibleLinks = useMemo(() => {
    return links
      .map((link) => {
        const sId = typeof link.source === 'object' ? (link.source as { id: string }).id : link.source;
        const tId = typeof link.target === 'object' ? (link.target as { id: string }).id : link.target;
        const sourceNode = visibleNodeMap.get(sId);
        const targetNode = visibleNodeMap.get(tId);
        if (sourceNode && targetNode) {
          return { id: `${sId}-${tId}`, source: sourceNode, target: targetNode, link };
        }
        return null;
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);
  }, [links, visibleNodeMap]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden bg-radial from-card/60 via-background to-background p-4">
      {/* Informative Fallback Pill Banner */}
      <div className="absolute top-20 left-6 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-card/90 border border-border/80 text-[11px] text-muted-foreground shadow-md backdrop-blur-md">
        <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
        <span>2D Vector Network Fallback active (WebGL accelerated mode bypassed)</span>
      </div>

      <svg
        viewBox="0 0 900 640"
        className="w-full h-full max-w-5xl max-h-175 overflow-visible"
      >
        <defs>
          <radialGradient id="fallbackNodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Links */}
        <g className="links opacity-60">
          {visibleLinks.map((item) => {
            const isConnected =
              selectedNode &&
              (selectedNode.id === item.source.id || selectedNode.id === item.target.id);

            return (
              <line
                key={item.id}
                x1={item.source.x}
                y1={item.source.y}
                x2={item.target.x}
                y2={item.target.y}
                stroke={isConnected ? '#818cf8' : '#64748b'}
                strokeWidth={isConnected ? 2 : 1}
                strokeOpacity={isConnected ? 0.9 : 0.3}
                strokeDasharray={item.link.type === 'contains' ? '3 3' : undefined}
                className="transition-all duration-200"
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g className="nodes">
          {Array.from(visibleNodeMap.values()).map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const r = Math.max(8, Math.min(node.val * 1.8, 20));

            return (
              <g
                key={node.id}
                onClick={() => onSelectNode(isSelected ? null : node)}
                className="cursor-pointer group"
              >
                {/* Halo if selected */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r * 1.8}
                    fill="url(#fallbackNodeGlow)"
                    className="animate-pulse"
                  />
                )}

                {/* Main Node Circle */}
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={r}
                  fill={node.color}
                  stroke={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.2)'}
                  strokeWidth={isSelected ? 3 : 1.5}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.25 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  className="shadow-md"
                />

                {/* Node Label */}
                <text
                  x={node.x}
                  y={node.y + r + 14}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : 'currentColor'}
                  className={`text-[11px] font-semibold select-none pointer-events-none transition-colors ${
                    isSelected ? 'fill-indigo-300 font-bold' : 'fill-foreground/80 group-hover:fill-foreground'
                  }`}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
