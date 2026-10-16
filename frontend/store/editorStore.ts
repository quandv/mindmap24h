import { create } from 'zustand';
import type {
  MindMapNode,
  MindMapEdge,
  BoardContent,
  HistoryEntry,
  MindMapNodeData,
} from '@/types';
import type { Viewport, OnNodesChange, OnEdgesChange, NodeChange, EdgeChange } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import {
  syncVisibility,
  createChild,
  createSibling,
  getDescendantIds,
  newNodeId,
} from '@/lib/mindmap';
import { api } from '@/lib/api';
import { textToMindMap } from '@/lib/textToMindmap';

const MAX_HISTORY = 40;

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type EditorState = {
  boardId: string | null;
  boardName: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  viewport: Viewport;
  selectedNodeId: string | null;
  isDirty: boolean;
  saveStatus: SaveStatus;
  history: HistoryEntry[];
  historyIndex: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAndLoadBoard: (id: string) => Promise<void>;
  setBoardName: (name: string) => void;
  setViewport: (viewport: Viewport) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
  markSaved: () => void;

  // React Flow change handlers
  onNodesChange: OnNodesChange<MindMapNode>;
  onEdgesChange: OnEdgesChange<MindMapEdge>;

  // Mind map structural operations
  updateNodeLabel: (id: string, label: string) => void;
  updateNodeData: (id: string, data: Partial<MindMapNodeData>) => void;
  toggleCollapse: (id: string) => void;
  addRootNode: (label?: string) => string;
  addChildNode: (parentId: string) => string | null;
  addSiblingNode: (nodeId: string) => string | null;
  deleteSelectedNode: () => void;
  deleteNode: (id: string) => void;

  // History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Paste import
  importFromText: (raw: string) => boolean;

  // Layout and export
  setNodesAndEdges: (nodes: MindMapNode[], edges: MindMapEdge[]) => void;
  getContent: () => BoardContent;
};

export const useEditorStore = create<EditorState>((set, get) => ({
  boardId: null,
  boardName: '',
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedNodeId: null,
  isDirty: false,
  saveStatus: 'idle',
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,
  isLoading: false,
  error: null,

  fetchAndLoadBoard: async (id: string) => {
    set({ isLoading: true, error: null, boardId: id });
    try {
      const board = await api.boards.get(id);
      const rawContent = board.content || { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } };
      
      let nodes = rawContent.nodes || [];
      let edges = rawContent.edges || [];

      // If board is empty, initialize with default Central Idea
      if (nodes.length === 0) {
        nodes = [
          {
            id: 'root',
            type: 'mindmap',
            position: { x: 400, y: 300 },
            data: { label: 'Central Idea', isRoot: true, collapsed: false, childCount: 0 },
          },
        ];
        edges = [];
      }

      const synced = syncVisibility(nodes, edges);
      const initialEntry: HistoryEntry = {
        nodes: JSON.parse(JSON.stringify(synced.nodes)),
        edges: JSON.parse(JSON.stringify(synced.edges)),
      };

      set({
        boardId: board.id,
        boardName: board.name,
        nodes: synced.nodes,
        edges: synced.edges,
        viewport: rawContent.viewport ?? { x: 0, y: 0, zoom: 1 },
        selectedNodeId: 'root',
        isDirty: false,
        saveStatus: 'idle',
        history: [initialEntry],
        historyIndex: 0,
        canUndo: false,
        canRedo: false,
        isLoading: false,
      });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  setBoardName: (name: string) => {
    set({ boardName: name });
    const { boardId } = get();
    if (boardId) {
      api.boards.rename(boardId, name).catch(console.error);
    }
  },

  setViewport: (viewport: Viewport) => set({ viewport }),

  setSelectedNodeId: (id: string | null) => set({ selectedNodeId: id }),

  setSaveStatus: (status: SaveStatus) => set({ saveStatus: status }),

  markSaved: () => set({ isDirty: false, saveStatus: 'saved' }),

  onNodesChange: (changes: NodeChange<MindMapNode>[]) => {
    const { nodes: currentNodes, edges } = get();
    let updated = applyNodeChanges(changes, currentNodes) as MindMapNode[];

    // Collect all node IDs that have an explicit position change in this batch
    const explicitlyMovedIds = new Set<string>();
    for (const change of changes) {
      if (change.type === 'position' && change.position) {
        explicitlyMovedIds.add(change.id);
      }
    }

    // For each position change, move its descendants by the same delta (dx, dy)
    for (const change of changes) {
      if (change.type === 'position' && change.position) {
        const oldNode = currentNodes.find((n) => n.id === change.id);
        if (oldNode && oldNode.position) {
          const dx = change.position.x - oldNode.position.x;
          const dy = change.position.y - oldNode.position.y;

          if (dx !== 0 || dy !== 0) {
            const descendantIds = getDescendantIds(change.id, edges);
            const descendantSet = new Set(
              descendantIds.filter((id) => !explicitlyMovedIds.has(id))
            );
            if (descendantSet.size > 0) {
              updated = updated.map((node) => {
                if (descendantSet.has(node.id)) {
                  return {
                    ...node,
                    position: {
                      x: node.position.x + dx,
                      y: node.position.y + dy,
                    },
                  };
                }
                return node;
              });
            }
          }
        }
      }
    }

    // Recalculate layout if node measured dimensions changed
    const hasDimensionChanges = changes.some(
      (c) => c.type === 'dimensions' && (c.dimensions?.width || c.dimensions?.height)
    );
    if (hasDimensionChanges) {
      const synced = syncVisibility(updated, edges);
      updated = synced.nodes;
    }

    // Check if any node was selected/deselected
    for (const change of changes) {
      if (change.type === 'select' && change.selected) {
        set({ selectedNodeId: change.id });
      }
    }

    set({ nodes: updated, isDirty: true });
  },

  onEdgesChange: (changes: EdgeChange<MindMapEdge>[]) => {
    const currentEdges = get().edges;
    const updated = applyEdgeChanges(changes, currentEdges) as MindMapEdge[];
    set({ edges: updated, isDirty: true });
  },

  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const entry: HistoryEntry = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    const trimmed = history.slice(0, historyIndex + 1);
    const newHistory = [...trimmed, entry].slice(-MAX_HISTORY);
    const newIndex = newHistory.length - 1;

    set({
      history: newHistory,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: false,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const entry = history[newIndex];
    const synced = syncVisibility(entry.nodes, entry.edges);
    set({
      nodes: synced.nodes,
      edges: synced.edges,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: true,
      isDirty: true,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const entry = history[newIndex];
    const synced = syncVisibility(entry.nodes, entry.edges);
    set({
      nodes: synced.nodes,
      edges: synced.edges,
      historyIndex: newIndex,
      canUndo: true,
      canRedo: newIndex < history.length - 1,
      isDirty: true,
    });
  },

  updateNodeLabel: (id: string, label: string) => {
    const { nodes, edges } = get();
    get().pushHistory();
    const updatedNodes = nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, label }, measured: undefined } : n
    );
    const synced = syncVisibility(updatedNodes, edges);
    set({ nodes: synced.nodes, edges: synced.edges, isDirty: true });
  },

  updateNodeData: (id: string, data: Partial<MindMapNodeData>) => {
    const { nodes, edges } = get();
    get().pushHistory();
    const updatedNodes = nodes.map((n) =>
      n.id === id
        ? {
            ...n,
            data: { ...n.data, ...data },
            measured:
              data.label !== undefined && data.label !== n.data.label
                ? undefined
                : n.measured,
          }
        : n
    );
    const synced = syncVisibility(updatedNodes, edges);
    set({ nodes: synced.nodes, edges: synced.edges, isDirty: true });
  },

  toggleCollapse: (id: string) => {
    const { nodes, edges } = get();
    get().pushHistory();
    const updatedNodes = nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, collapsed: !n.data.collapsed } } : n
    );
    const synced = syncVisibility(updatedNodes, edges);
    set({ nodes: synced.nodes, edges: synced.edges, isDirty: true });
  },

  addChildNode: (parentId: string) => {
    const { nodes, edges } = get();
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return null;

    get().pushHistory();

    // If parent was collapsed, auto-expand it so new child is visible
    const adjustedNodes = nodes.map((n) =>
      n.id === parentId && n.data.collapsed
        ? { ...n, data: { ...n.data, collapsed: false } }
        : n
    );

    const { node: newChild, edge: newEdge } = createChild(parent, adjustedNodes, edges);
    const nextNodes = [...adjustedNodes, newChild];
    const nextEdges = [...edges, newEdge];

    const synced = syncVisibility(nextNodes, nextEdges);

    set({
      nodes: synced.nodes,
      edges: synced.edges,
      selectedNodeId: newChild.id,
      isDirty: true,
    });

    return newChild.id;
  },

  addSiblingNode: (nodeId: string) => {
    const { nodes, edges } = get();
    const current = nodes.find((n) => n.id === nodeId);
    if (!current || current.data.isRoot) return null;

    const result = createSibling(current, nodes, edges);
    if (!result) return null;

    get().pushHistory();
    const nextNodes = [...nodes, result.node];
    const nextEdges = [...edges, result.edge];

    const synced = syncVisibility(nextNodes, nextEdges);

    set({
      nodes: synced.nodes,
      edges: synced.edges,
      selectedNodeId: result.node.id,
      isDirty: true,
    });

    return result.node.id;
  },

  addRootNode: (label = 'Central Idea') => {
    get().pushHistory();
    const id = newNodeId();
    const rootNode: MindMapNode = {
      id,
      type: 'mindmap',
      position: { x: 0, y: 0 },
      data: {
        label,
        isRoot: true,
        collapsed: false,
        childCount: 0,
      },
    };
    set({
      nodes: [...get().nodes, rootNode],
      selectedNodeId: id,
      isDirty: true,
    });
    return id;
  },

  deleteNode: (id: string) => {
    const { nodes, edges } = get();
    const target = nodes.find((n) => n.id === id);
    if (!target) return;

    get().pushHistory();

    const descendants = new Set(getDescendantIds(id, edges));
    descendants.add(id);

    const nextNodes = nodes.filter((n) => !descendants.has(n.id));
    const nextEdges = edges.filter(
      (e) => !descendants.has(e.source) && !descendants.has(e.target)
    );

    const synced = syncVisibility(nextNodes, nextEdges);

    set({
      nodes: synced.nodes,
      edges: synced.edges,
      selectedNodeId: null,
      isDirty: true,
    });
  },

  deleteSelectedNode: () => {
    const { selectedNodeId, deleteNode } = get();
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
    }
  },

  setNodesAndEdges: (newNodes: MindMapNode[], newEdges: MindMapEdge[]) => {
    const synced = syncVisibility(newNodes, newEdges);
    set({ nodes: synced.nodes, edges: synced.edges, isDirty: true });
  },

  importFromText: (raw: string) => {
    const result = textToMindMap(raw);
    if (!result || result.nodes.length === 0) return false;
    get().pushHistory();
    get().setNodesAndEdges(result.nodes, result.edges);
    set({ selectedNodeId: "root", isDirty: true });
    return true;
  },

  getContent: () => {
    const { nodes, edges, viewport } = get();
    return { nodes, edges, viewport };
  },
}));
