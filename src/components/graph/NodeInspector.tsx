'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, ArrowRight, BookOpen, Layers, Sparkles, Folder, Tag, Network } from 'lucide-react';
import type { GraphNode, GraphLink } from '@/app/api/graph/route';

interface NodeInspectorProps {
  selectedNode: GraphNode | null;
  allNodes: GraphNode[];
  links: GraphLink[];
  onClose: () => void;
  onSelectNeighbor: (node: GraphNode) => void;
}

export default function NodeInspector({
  selectedNode,
  allNodes,
  links,
  onClose,
  onSelectNeighbor,
}: NodeInspectorProps) {
  if (!selectedNode) return null;

  // Find connected neighbor nodes
  const connectedNodeIds = new Set<string>();
  links.forEach((link) => {
    const sId = typeof link.source === 'object' ? (link.source as { id: string }).id : link.source;
    const tId = typeof link.target === 'object' ? (link.target as { id: string }).id : link.target;

    if (sId === selectedNode.id) connectedNodeIds.add(tId);
    if (tId === selectedNode.id) connectedNodeIds.add(sId);
  });

  const neighbors = allNodes.filter((n) => connectedNodeIds.has(n.id) && n.id !== selectedNode.id);

  // Type-specific icons & colors
  const typeConfig = {
    subject: {
      icon: Folder,
      badgeClass: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
      label: 'Subject Vault',
    },
    deck: {
      icon: Layers,
      badgeClass: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
      label: 'Flashcard Deck',
    },
    note: {
      icon: BookOpen,
      badgeClass: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
      label: 'Study Note',
    },
    concept: {
      icon: Sparkles,
      badgeClass: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      label: 'Concept / Topic',
    },
  }[selectedNode.type] || {
    icon: Network,
    badgeClass: 'bg-muted border-border text-foreground',
    label: 'Knowledge Node',
  };

  const Icon = typeConfig.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 20, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        className="absolute top-20 right-4 sm:right-6 w-85 sm:w-95 max-h-[calc(100vh-160px)] glass-panel bg-card/95 border border-border/80 rounded-3xl p-6 shadow-2xl overflow-y-auto z-20 flex flex-col justify-between backdrop-blur-xl"
      >
        <div>
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${typeConfig.badgeClass}`}>
                <Icon className="h-3 w-3" /> {typeConfig.label}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground/70">
                {selectedNode.group}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              aria-label="Close details"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Node Title */}
          <div className="mt-4">
            <h3 className="text-xl font-black tracking-tight text-foreground wrap-break-word">
              {selectedNode.label}
            </h3>
            {selectedNode.meta?.description && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {selectedNode.meta.description}
              </p>
            )}
            {selectedNode.meta?.contentSnippet && (
              <blockquote className="text-xs text-muted-foreground/90 mt-3 p-3 rounded-xl bg-muted/30 border-l-2 border-indigo-500/50 italic leading-relaxed line-clamp-4">
                &ldquo;{selectedNode.meta.contentSnippet}...&rdquo;
              </blockquote>
            )}
          </div>

          {/* Metadata tags */}
          {selectedNode.meta?.tags && selectedNode.meta.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {selectedNode.meta.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground font-mono"
                >
                  <Tag className="h-2.5 w-2.5" /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* Connected Network Neighbors */}
          <div className="mt-6 pt-4 border-t border-border/40">
            <div className="flex items-center justify-between text-xs font-bold text-foreground mb-2.5">
              <span className="flex items-center gap-1.5">
                <Network className="h-3.5 w-3.5 text-indigo-400" /> Connected Nodes
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {neighbors.length} {neighbors.length === 1 ? 'connection' : 'connections'}
              </span>
            </div>

            {neighbors.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 italic">No direct connections.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {neighbors.map((neighbor) => (
                  <button
                    key={neighbor.id}
                    onClick={() => onSelectNeighbor(neighbor)}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-muted/20 hover:bg-indigo-500/10 border border-border/40 hover:border-indigo-500/30 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: neighbor.color }}
                      />
                      <span className="text-xs font-medium text-foreground group-hover:text-indigo-400 truncate">
                        {neighbor.label}
                      </span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Deep Link Action */}
        <div className="mt-6 pt-4 border-t border-border/40 flex flex-col gap-2">
          {selectedNode.type === 'note' && (
            <Link
              href="/dashboard/notes"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Open in Notes Vault</span>
              <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-80" />
            </Link>
          )}

          {selectedNode.type === 'deck' && (
            <Link
              href="/dashboard/flashcards?action=practice"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Practice Flashcards</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 opacity-80" />
            </Link>
          )}

          {selectedNode.type === 'subject' && (
            <Link
              href="/dashboard/notes"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-foreground font-semibold text-xs transition-all cursor-pointer"
            >
              <Folder className="h-3.5 w-3.5 text-indigo-400" />
              <span>Browse Subject Notes</span>
            </Link>
          )}

          {selectedNode.type === 'concept' && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-[11px] text-amber-300 font-medium">
              Concept Node · Formulates structural knowledge topology
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
