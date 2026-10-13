'use client';

import React, { useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import { useEditorStore } from '@/store/editorStore';
import { useAutosave } from '@/hooks/useAutosave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePasteImport } from '@/hooks/usePasteImport';
import { Plus } from 'lucide-react';
import { MindMapNodeComponent } from './MindMapNode';
import { MindMapEdge } from './MindMapEdge';
import { Toolbar } from './Toolbar';
import { NodeSidebar } from './NodeSidebar';

function FlowCanvas() {
  const { fitView, setViewport } = useReactFlow();
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);
  const viewport = useEditorStore((s) => s.viewport);
  const onNodesChange = useEditorStore((s) => s.onNodesChange);
  const onEdgesChange = useEditorStore((s) => s.onEdgesChange);
  const setSelectedNodeId = useEditorStore((s) => s.setSelectedNodeId);
  const addRootNode = useEditorStore((s) => s.addRootNode);
  const setStoreViewport = useEditorStore((s) => s.setViewport);

  // Autosave, Shortcuts, and Paste Import hooks
  useAutosave();
  useKeyboardShortcuts();
  const { toast } = usePasteImport();

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      mindmap: MindMapNodeComponent,
    }),
    []
  );

  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      mindmap: MindMapEdge,
    }),
    []
  );

  // On initial mount, fit view or apply saved viewport
  useEffect(() => {
    if (viewport && (viewport.x !== 0 || viewport.y !== 0)) {
      setViewport(viewport);
    } else {
      setTimeout(() => fitView({ padding: 0.3, duration: 400 }), 100);
    }
  }, [setViewport, fitView]);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div className="relative w-full h-full select-none bg-slate-50 overflow-hidden">
      {nodes.length === 0 && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-xl text-center max-w-sm pointer-events-auto">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Canvas is Empty</h3>
            <p className="text-xs text-slate-500 mb-4">The root node was deleted. Click below to add a new root node.</p>
            <button
              onClick={() => addRootNode()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm transition-colors w-full"
            >
              Add Root Node
            </button>
          </div>
        </div>
      )}
      <Toolbar />
      <NodeSidebar />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStart={() => useEditorStore.getState().pushHistory()}
        onPaneClick={handlePaneClick}
        onMoveEnd={(_, vp) => setStoreViewport(vp)}
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2.5}
        defaultEdgeOptions={{ type: 'mindmap' }}
        deleteKeyCode={null} // Handled by our custom keyboard shortcuts hook
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="#cbd5e1"
        />
        <MiniMap
          position="bottom-left"
          nodeColor={(node) => (node.data?.isRoot ? '#6366f1' : '#cbd5e1')}
          maskColor="rgba(241, 245, 249, 0.7)"
          className="!bg-white !rounded-xl !border !border-slate-200 !shadow-sm !overflow-hidden !m-4"
          zoomable
          pannable
        />
      </ReactFlow>
      {/* Paste-import toast */}
      {toast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50
          flex items-center gap-2 px-4 py-2.5
          bg-slate-900/90 text-white text-sm font-medium
          rounded-2xl shadow-xl backdrop-blur-md
          animate-fade-in pointer-events-none select-none"
        >
          <span>✨</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

export function MindMapEditor({ boardId }: { boardId: string }) {
  const fetchAndLoadBoard = useEditorStore((s) => s.fetchAndLoadBoard);
  const isLoading = useEditorStore((s) => s.isLoading);
  const error = useEditorStore((s) => s.error);

  useEffect(() => {
    fetchAndLoadBoard(boardId);
  }, [boardId, fetchAndLoadBoard]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-slate-500">Loading board...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="text-rose-500 text-sm font-medium">{error}</div>
        <a
          href="/"
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          Return to boards
        </a>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="w-screen h-screen">
        <FlowCanvas />
      </div>
    </ReactFlowProvider>
  );
}
