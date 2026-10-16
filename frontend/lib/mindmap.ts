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

export const VERTICAL_NODE_GAP = 20; // Exact 20px gap between adjacent nodes/subtrees
export const HORIZONTAL_X_GAP = 60;  // Room for connector curves and buttons
export const MIN_HORIZONTAL_GAP = 220;

/** Estimate node width based on label content and measured dimensions */
export function getNodeWidth(node: MindMapNode): number {
  if (node.measured?.width && node.measured.width > 0) {
    return node.measured.width;
  }
  const label = node.data?.label || '';
  const lines = label.split(String.fromCharCode(10));
  let maxLineLen = 0;
  for (const line of lines) {
    if (line.length > maxLineLen) maxLineLen = line.length;
  }
  const estimated = Math.max(140, Math.min(360, maxLineLen * 11 + 48));
  return estimated;
}

/** Estimate node height based on label content and measured dimensions */
export function getNodeHeight(node: MindMapNode): number {
  if (node.measured?.height && node.measured.height > 0) {
    return node.measured.height;
  }
  const label = node.data?.label || '';
  const lines = label.split(String.fromCharCode(10));
  let visualLines = 0;
  for (const line of lines) {
    visualLines += Math.max(1, Math.ceil(line.length / 28));
  }
  // py-2 (16px) + border (2px) + visualLines * lineHeight (28px)
  const estimated = Math.max(46, visualLines * 28 + 18);
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
 * - Spacing: Sibling nodes and adjacent subtrees are always spaced exactly VERTICAL_NODE_GAP (20px) apart
 *   vertically, regardless of how the content inside any node changes.
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

  const subtreeSpanMap = new Map<string, number>();

  const getSubtreeHeight = (nodeId: string): number => {
    if (subtreeSpanMap.has(nodeId)) {
      return subtreeSpanMap.get(nodeId)!;
    }
    const node = nodeMap.get(nodeId);
    const selfHeight = node ? getNodeHeight(node) : 46;
    const children = getVisibleChildren(nodeId);

    if (children.length === 0) {
      subtreeSpanMap.set(nodeId, selfHeight);
      return selfHeight;
    }

    let childrenSpanSum = 0;
    for (let i = 0; i < children.length; i++) {
      childrenSpanSum += getSubtreeHeight(children[i]);
      if (i > 0) {
        childrenSpanSum += VERTICAL_NODE_GAP;
      }
    }

    const span = Math.max(selfHeight, childrenSpanSum);
    subtreeSpanMap.set(nodeId, span);
    return span;
  };

  const newPositions = new Map<string, { x: number; y: number }>();

  const positionChildren = (parentId: string, parentPos: { x: number; y: number }) => {
    const children = getVisibleChildren(parentId);
    if (children.length === 0) return;

    const parentNode = nodeMap.get(parentId);
    const parentWidth = parentNode ? getNodeWidth(parentNode) : 160;
    const parentHeight = parentNode ? getNodeHeight(parentNode) : 46;
    const parentCenterY = parentPos.y + parentHeight / 2;

    const childX = parentPos.x + Math.max(MIN_HORIZONTAL_GAP, parentWidth + HORIZONTAL_X_GAP);

    let totalChildrenHeight = 0;
    for (let i = 0; i < children.length; i++) {
      totalChildrenHeight += getSubtreeHeight(children[i]);
      if (i > 0) {
        totalChildrenHeight += VERTICAL_NODE_GAP;
      }
    }

    let currentY = parentCenterY - totalChildrenHeight / 2;

    for (const childId of children) {
      const childSubtreeH = getSubtreeHeight(childId);
      const childNode = nodeMap.get(childId);
      const childSelfH = childNode ? getNodeHeight(childNode) : 46;

      const childCenterY = currentY + childSubtreeH / 2;
      const childTopY = childCenterY - childSelfH / 2;

      const pos = { x: childX, y: childTopY };
      newPositions.set(childId, pos);

      positionChildren(childId, pos);

      currentY += childSubtreeH + VERTICAL_NODE_GAP;
    }
  };

  const rootNodes = nodes.filter((n) => n.data?.isRoot || !parentMap.has(n.id));

  // Position root nodes and their subtrees with exact VERTICAL_NODE_GAP spacing
  let rootYCursor = 0;
  rootNodes.forEach((root, idx) => {
    const rootSubtreeH = getSubtreeHeight(root.id);
    const rootSelfH = getNodeHeight(root);

    let rootTopY: number;
    const rootX = root.position.x;

    if (idx === 0) {
      rootTopY = root.position.y;
      rootYCursor = rootTopY + rootSelfH / 2 + rootSubtreeH / 2;
    } else {
      const rootCenterY = rootYCursor + VERTICAL_NODE_GAP + rootSubtreeH / 2;
      rootTopY = rootCenterY - rootSelfH / 2;
      rootYCursor = rootCenterY + rootSubtreeH / 2;
    }

    const rootPos = { x: rootX, y: rootTopY };
    newPositions.set(root.id, rootPos);
    positionChildren(root.id, rootPos);
  });

  return nodes.map((node) => {
    const pos = newPositions.get(node.id);
    if (pos) {
      if (
        Math.abs(pos.x - node.position.x) < 0.01 &&
        Math.abs(pos.y - node.position.y) < 0.01
      ) {
        return node;
      }
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
  const xOffset = Math.max(MIN_HORIZONTAL_GAP, parentWidth + HORIZONTAL_X_GAP);

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

  const currentHeight = getNodeHeight(current);
  const id = newNodeId();
  const node: MindMapNode = {
    id,
    type: 'mindmap',
    position: {
      x: current.position.x,
      y: current.position.y + currentHeight + VERTICAL_NODE_GAP,
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