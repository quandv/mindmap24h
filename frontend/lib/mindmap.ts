import type { MindMapNode, MindMapEdge } from '@/types';

export function newNodeId(): string {
  return `node-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function newEdgeId(source: string, target: string): string {
  return `edge-${source}-${target}`;
}

/** Recursively collect all descendant node IDs of a given node */
export function getDescendantIds(nodeId: string, edges: MindMapEdge[]): string[] {
  const directChildren = edges
    .filter((e) => e.source === nodeId)
    .map((e) => e.target);
  
  const allDescendants: string[] = [...directChildren];
  for (const childId of directChildren) {
    allDescendants.push(...getDescendantIds(childId, edges));
  }
  return allDescendants;
}

/** Get direct children IDs of a node */
export function getDirectChildrenIds(nodeId: string, edges: MindMapEdge[]): string[] {
  return edges.filter((e) => e.source === nodeId).map((e) => e.target);
}

/** Get parent node ID of a node */
export function getParentId(nodeId: string, edges: MindMapEdge[]): string | null {
  const edge = edges.find((e) => e.target === nodeId);
  return edge ? edge.source : null;
}

export const BRANCH_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#3b82f6', // Blue
  '#84cc16', // Lime
];

/** Estimate node width based on label content and measured dimensions */
export function getNodeWidth(node: MindMapNode): number {
  if (node.measured?.width && node.measured.width > 0) {
    return node.measured.width;
  }
  const label = node.data?.label || '';
  const lines = label.split('\n');
  let maxLineLen = 0;
  for (const line of lines) {
    if (line.length > maxLineLen) maxLineLen = line.length;
  }
  const estimated = Math.max(140, Math.min(360, maxLineLen * 10 + 48));
  return estimated;
}

/** Estimate node height based on label content and measured dimensions */
export function getNodeHeight(node: MindMapNode): number {
  if (node.measured?.height && node.measured.height > 0) {
    return node.measured.height;
  }
  const label = node.data?.label || '';
  const lines = label.split('\n');
  let visualLines = 0;
  for (const line of lines) {
    visualLines += Math.max(1, Math.ceil(line.length / 26));
  }
  const estimated = Math.max(44, visualLines * 26 + 24);
  return estimated;
}

/**
 * Assign sub-branch colors to edges and nodes.
 */
export function assignBranchColors(
  nodes: MindMapNode[],
  edges: MindMapEdge[]
): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  const nodeBranchColorMap = new Map<string, string>();
  const edgeColorMap = new Map<string, string>();

  const targetNodeIds = new Set(edges.map((e) => e.target));
  const rootNodes = nodes.filter((n) => n.data?.isRoot || !targetNodeIds.has(n.id));

  for (const rootNode of rootNodes) {
    const directEdges = edges.filter((e) => e.source === rootNode.id);

    directEdges.forEach((dirEdge, index) => {
      const color = BRANCH_COLORS[index % BRANCH_COLORS.length];
      edgeColorMap.set(dirEdge.id, color);
      nodeBranchColorMap.set(dirEdge.target, color);

      const queue = [dirEdge.target];
      while (queue.length > 0) {
        const currId = queue.shift()!;
        const outgoingEdges = edges.filter((e) => e.source === currId);
        for (const outEdge of outgoingEdges) {
          edgeColorMap.set(outEdge.id, color);
          nodeBranchColorMap.set(outEdge.target, color);
          queue.push(outEdge.target);
        }
      }
    });
  }

  const updatedEdges = edges.map((edge) => {
    const color = edgeColorMap.get(edge.id) || '#94a3b8';
    return {
      ...edge,
      data: {
        ...edge.data,
        color,
      },
    };
  });

  const updatedNodes = nodes.map((node) => {
    const branchColor = nodeBranchColorMap.get(node.id);
    if (!branchColor || node.data?.isRoot) return node;
    return {
      ...node,
      data: {
        ...node.data,
        branchColor,
      },
    };
  });

  return { nodes: updatedNodes, edges: updatedEdges };
}

/**
 * Recalculates layout and alignment for child nodes based on dynamic node dimensions.
 * - Alignment: All child nodes originating from the same parent share the exact same X-axis,
 *   placed beyond the parent node's right edge so children never overlap the parent.
 * - Spacing & Expansion: Vertical spacing between adjacent child nodes (and their subtrees) is
 *   calculated dynamically using actual node heights and subtree bounds to prevent any overlap.
 */
export function recalculateTreeLayout(
  nodes: MindMapNode[],
  edges: MindMapEdge[]
): MindMapNode[] {
  if (nodes.length === 0) return nodes;

  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();
  const nodeMap = new Map<string, MindMapNode>();

  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  for (const edge of edges) {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source)!.push(edge.target);
    parentMap.set(edge.target, edge.source);
  }

  const getVisibleChildren = (nodeId: string): string[] => {
    const parentNode = nodeMap.get(nodeId);
    if (parentNode?.data?.collapsed) return [];
    return childrenMap.get(nodeId) || [];
  };

  const Y_MARGIN = 28;
  const X_MARGIN = 50;
  const MIN_X_GAP = 240;

  const subtreeSpanMap = new Map<string, number>();

  const getSubtreeSpan = (nodeId: string): number => {
    if (subtreeSpanMap.has(nodeId)) {
      return subtreeSpanMap.get(nodeId)!;
    }
    const children = getVisibleChildren(nodeId);
    const node = nodeMap.get(nodeId);
    const selfHeight = node ? getNodeHeight(node) + Y_MARGIN : 44 + Y_MARGIN;

    if (children.length === 0) {
      subtreeSpanMap.set(nodeId, selfHeight);
      return selfHeight;
    }

    let childrenSpanSum = 0;
    for (const childId of children) {
      childrenSpanSum += getSubtreeSpan(childId);
    }

    const span = Math.max(selfHeight, childrenSpanSum);
    subtreeSpanMap.set(nodeId, span);
    return span;
  };

  const rootNodes = nodes.filter((n) => n.data?.isRoot || !parentMap.has(n.id));

  const newPositions = new Map<string, { x: number; y: number }>();

  const positionChildren = (parentId: string, parentPos: { x: number; y: number }) => {
    const children = getVisibleChildren(parentId);
    if (children.length === 0) return;

    const parentNode = nodeMap.get(parentId);
    const parentWidth = parentNode ? getNodeWidth(parentNode) : 160;

    const childX = parentPos.x + Math.max(MIN_X_GAP, parentWidth + X_MARGIN);

    const totalSpan = children.reduce((sum, childId) => sum + getSubtreeSpan(childId), 0);
    let currentY = parentPos.y - totalSpan / 2;

    for (const childId of children) {
      const childSpan = getSubtreeSpan(childId);
      const childY = currentY + childSpan / 2;

      const pos = { x: childX, y: childY };
      newPositions.set(childId, pos);

      positionChildren(childId, pos);

      currentY += childSpan;
    }
  };

  for (const root of rootNodes) {
    const rootPos = newPositions.get(root.id) || root.position;
    positionChildren(root.id, rootPos);
  }

  return nodes.map((node) => {
    const pos = newPositions.get(node.id);
    if (pos) {
      return {
        ...node,
        position: pos,
      };
    }
    return node;
  });
}

/**
 * Apply collapse states and recalculate tree layout to prevent overlaps.
 */
export function syncVisibility(
  nodes: MindMapNode[],
  edges: MindMapEdge[]
): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  const hiddenNodeIds = new Set<string>();

  for (const node of nodes) {
    if (node.data.collapsed) {
      const descendants = getDescendantIds(node.id, edges);
      for (const dId of descendants) {
        hiddenNodeIds.add(dId);
      }
    }
  }

  const relaidNodes = recalculateTreeLayout(nodes, edges);

  const updatedNodes = relaidNodes.map((node) => {
    const direct = getDirectChildrenIds(node.id, edges);
    const isHidden = hiddenNodeIds.has(node.id);
    return {
      ...node,
      hidden: isHidden,
      data: {
        ...node.data,
        childCount: direct.length,
      },
    };
  });

  const updatedEdges = edges.map((edge) => ({
    ...edge,
    type: 'mindmap',
    hidden: hiddenNodeIds.has(edge.source) || hiddenNodeIds.has(edge.target),
  }));

  return assignBranchColors(updatedNodes, updatedEdges);
}

/** Create a new child node connected to parent */
export function createChild(
  parent: MindMapNode,
  existingNodes: MindMapNode[],
  existingEdges: MindMapEdge[]
): { node: MindMapNode; edge: MindMapEdge } {
  const id = newNodeId();
  const parentWidth = getNodeWidth(parent);
  const xOffset = Math.max(240, parentWidth + 50);

  const node: MindMapNode = {
    id,
    type: 'mindmap',
    position: {
      x: parent.position.x + xOffset,
      y: parent.position.y,
    },
    data: {
      label: 'New Idea',
      isRoot: false,
      collapsed: false,
      childCount: 0,
    },
  };

  const edge: MindMapEdge = {
    id: newEdgeId(parent.id, id),
    source: parent.id,
    target: id,
    type: 'mindmap',
  };

  return { node, edge };
}

/** Create a new sibling node (shares the same parent) */
export function createSibling(
  current: MindMapNode,
  existingNodes: MindMapNode[],
  existingEdges: MindMapEdge[]
): { node: MindMapNode; edge: MindMapEdge } | null {
  if (current.data.isRoot) return null;

  const parentId = getParentId(current.id, existingEdges);
  if (!parentId) return null;

  const parent = existingNodes.find((n) => n.id === parentId);
  if (!parent) return null;

  const id = newNodeId();
  const node: MindMapNode = {
    id,
    type: 'mindmap',
    position: {
      x: current.position.x,
      y: current.position.y + 65,
    },
    data: {
      label: 'New Idea',
      isRoot: false,
      collapsed: false,
      childCount: 0,
    },
  };

  const edge: MindMapEdge = {
    id: newEdgeId(parentId, id),
    source: parentId,
    target: id,
    type: 'mindmap',
  };

  return { node, edge };
}
