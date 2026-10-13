import type { Node, Edge, Viewport } from '@xyflow/react';

export type MindMapNodeData = {
  label: string;
  isRoot?: boolean;
  collapsed?: boolean;
  color?: string;
  branchColor?: string;
  note?: string;
  childCount?: number;
};

export type MindMapNode = Node<MindMapNodeData, 'mindmap'>;
export type MindMapEdge = Edge;

export type BoardContent = {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  viewport: Viewport;
};

export type Board = {
  id: string;
  name: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BoardWithContent = Board & {
  content: BoardContent;
};

export type Folder = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  boards: Board[];
};

export type HistoryEntry = {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
};
