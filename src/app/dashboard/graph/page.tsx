'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import NodeInspector from '@/components/graph/NodeInspector';
import GraphHUD from '@/components/graph/GraphHUD';
import KnowledgeGraphSvgFallback from '@/components/graph/KnowledgeGraphSvgFallback';
import type { GraphCanvasRef } from '@/components/graph/KnowledgeGraphCanvas';
import type { GraphNode, GraphLink } from '@/app/api/graph/route';

// Lazy-load Three.js WebGL Canvas with loading skeleton (Rule 5)
const KnowledgeGraphCanvas = dynamic(
  () => import('@/components/graph/KnowledgeGraphCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10">
        <Loader2 className="h-7 w-7 text-indigo-500 animate-spin mb-2" />
        <p className="text-xs font-semibold text-muted-foreground">Initializing WebGL Engine...</p>
      </div>
    ),
  }
);

export default function KnowledgeGraphPage() {
  const canvasRef = useRef<GraphCanvasRef>(null);

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isWebGLSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
      return false;
    }
  });

  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    async function fetchGraphData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/graph');
        if (res.ok) {
          const data = await res.json();
          setNodes(data.graph.nodes || []);
          setLinks(data.graph.links || []);
        } else {
          throw new Error('Could not load knowledge graph.');
        }
      } catch (err: unknown) {
        const msg = (err as Error).message || 'Failed to fetch graph data.';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGraphData();
  }, []);

  const handleSelectNode = (node: GraphNode | null) => {
    setSelectedNode(node);
    if (node && canvasRef.current) {
      canvasRef.current.focusNode(node);
    }
  };

  const handleToggleViewMode = () => {
    setViewMode((prev) => (prev === '3D' ? '2D' : '3D'));
    if (canvasRef.current) {
      canvasRef.current.resetCamera();
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-100px)] rounded-3xl overflow-hidden border border-border/80 glass-panel shadow-2xl flex flex-col">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md z-30">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
          <p className="text-sm font-semibold text-foreground">Assembling Knowledge Topology...</p>
          <p className="text-xs text-muted-foreground mt-1">Connecting notes, decks, and conceptual hubs</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-30 p-6 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <h3 className="text-lg font-bold text-foreground">Could not load Knowledge Graph</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-500 text-white font-semibold text-xs shadow-md cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* HUD Controls */}
      <GraphHUD
        nodes={nodes}
        viewMode={viewMode}
        selectedType={selectedType}
        onToggleViewMode={handleToggleViewMode}
        onSelectType={setSelectedType}
        onSelectNode={handleSelectNode}
        onZoomIn={() => canvasRef.current?.zoomIn()}
        onZoomOut={() => canvasRef.current?.zoomOut()}
        onResetCamera={() => canvasRef.current?.resetCamera()}
        totalLinksCount={links.length}
      />

      {/* Canvas View: WebGL 3D/2D or SVG Fallback */}
      {!isLoading && !error && (
        isWebGLSupported ? (
          <KnowledgeGraphCanvas
            ref={canvasRef}
            nodes={nodes}
            links={links}
            selectedType={selectedType}
            viewMode={viewMode}
            selectedNode={selectedNode}
            onSelectNode={handleSelectNode}
          />
        ) : (
          <KnowledgeGraphSvgFallback
            nodes={nodes}
            links={links}
            selectedType={selectedType}
            selectedNode={selectedNode}
            onSelectNode={handleSelectNode}
          />
        )
      )}

      {/* Floating Node Inspector Drawer */}
      <NodeInspector
        selectedNode={selectedNode}
        allNodes={nodes}
        links={links}
        onClose={() => setSelectedNode(null)}
        onSelectNeighbor={handleSelectNode}
      />
    </div>
  );
}
