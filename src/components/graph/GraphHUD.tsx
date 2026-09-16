'use client';

import React, { useState } from 'react';
import { Search, Plus, Minus, RotateCcw, Box, Compass, Filter } from 'lucide-react';
import type { GraphNode } from '@/app/api/graph/route';

interface GraphHUDProps {
  nodes: GraphNode[];
  viewMode: '3D' | '2D';
  selectedType: string;
  onToggleViewMode: () => void;
  onSelectType: (type: string) => void;
  onSelectNode: (node: GraphNode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetCamera: () => void;
  totalLinksCount: number;
}

export default function GraphHUD({
  nodes,
  viewMode,
  selectedType,
  onToggleViewMode,
  onSelectType,
  onSelectNode,
  onZoomIn,
  onZoomOut,
  onResetCamera,
  totalLinksCount,
}: GraphHUDProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredSearchResults = searchQuery.trim()
    ? nodes.filter((n) =>
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.group.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const types = [
    { key: 'all', label: 'All' },
    { key: 'subject', label: 'Subjects' },
    { key: 'deck', label: 'Decks' },
    { key: 'note', label: 'Notes' },
    { key: 'concept', label: 'Concepts' },
  ];

  return (
    <>
      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pointer-events-none z-10">
        {/* Search Node with Autocomplete */}
        <div className="relative pointer-events-auto w-full sm:w-72">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl glass-panel bg-card/90 border border-border/80 shadow-lg backdrop-blur-md">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search concepts or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[10px] text-muted-foreground hover:text-foreground font-mono"
              >
                esc
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {searchFocused && filteredSearchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 p-1.5 rounded-2xl glass-panel bg-card/95 border border-border/80 shadow-2xl backdrop-blur-xl z-30 space-y-1">
              {filteredSearchResults.map((node) => (
                <button
                  key={node.id}
                  onClick={() => {
                    onSelectNode(node);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: node.color }}
                    />
                    <span className="text-xs font-medium text-foreground group-hover:text-indigo-400 truncate">
                      {node.label}
                    </span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono ml-2 shrink-0">
                    {node.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Pills and 2D/3D Mode Switcher */}
        <div className="flex items-center gap-2 pointer-events-auto self-start sm:self-auto flex-wrap">
          {/* Type filters */}
          <div className="flex items-center p-1 rounded-2xl glass-panel bg-card/90 border border-border/80 shadow-lg backdrop-blur-md gap-1">
            <span className="px-2 text-muted-foreground">
              <Filter className="h-3 w-3" />
            </span>
            {types.map((t) => (
              <button
                key={t.key}
                onClick={() => onSelectType(t.key)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  selectedType === t.key
                    ? 'bg-indigo-500 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 2D / 3D Toggle */}
          <button
            onClick={onToggleViewMode}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl glass-panel bg-card/90 border border-border/80 hover:border-indigo-500/40 text-foreground font-bold text-xs shadow-lg backdrop-blur-md transition-all cursor-pointer"
            title={`Switch to ${viewMode === '3D' ? '2D Top-Down' : '3D Constellation'} view`}
          >
            {viewMode === '3D' ? (
              <>
                <Box className="h-3.5 w-3.5 text-indigo-400" />
                <span>3D Space</span>
              </>
            ) : (
              <>
                <Compass className="h-3.5 w-3.5 text-purple-400" />
                <span>2D Plane</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Left: Legend */}
      <div className="absolute bottom-4 left-4 sm:left-6 pointer-events-auto z-10 hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-2xl glass-panel bg-card/90 border border-border/80 text-[11px] shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#6366f1]" />
          <span className="text-muted-foreground font-medium">Subject</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#8b5cf6]" />
          <span className="text-muted-foreground font-medium">Deck</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
          <span className="text-muted-foreground font-medium">Note</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
          <span className="text-muted-foreground font-medium">Concept</span>
        </div>
      </div>

      {/* Bottom Right: Zoom & Navigation Controls */}
      <div className="absolute bottom-4 right-4 sm:right-6 pointer-events-auto z-10 flex flex-col items-end gap-2">
        <div className="text-[10px] font-mono text-muted-foreground/80 px-2.5 py-1 rounded-lg glass-panel bg-card/80 border border-border/50">
          {nodes.length} nodes · {totalLinksCount} connections
        </div>

        <div className="flex items-center p-1 rounded-2xl glass-panel bg-card/90 border border-border/80 shadow-xl backdrop-blur-md gap-1">
          <button
            onClick={onZoomIn}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer"
            title="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={onZoomOut}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer"
            title="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-border/60 mx-0.5" />
          <button
            onClick={onResetCamera}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer"
            title="Reset camera perspective"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
