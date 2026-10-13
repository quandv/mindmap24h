import type { MindMapNode, MindMapEdge } from '@/types';
import { newNodeId, newEdgeId } from './mindmap';

export interface ParsedNode {
  id: string;
  label: string;
  depth: number;
  parentId: string | null;
}

/**
 * Parse Whimsical copied text / indented markdown outline into ParsedNode array.
 * Whimsical Export Rules:
 * 1. The first line is the root node.
 * 2. Lines starting with a hyphen (-) contain the entire content of a node.
 * 3. Child nodes will be indented one tab from their parent node.
 * 4. The root node's child node will be aligned with the root node.
 */
export function parseIndentedText(raw: string): ParsedNode[] {
  const lines = raw.split(/\r?\n/);
  
  // Find first non-empty line as root
  let rootIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== '') {
      rootIndex = i;
      break;
    }
  }

  if (rootIndex === -1) return [];

  const parsed: ParsedNode[] = [];
  const depthStack: { depth: number; id: string }[] = [];

  // Rule 1: The first line is the root node (depth 0).
  const rootLine = lines[rootIndex];
  const rootLabel = rootLine.replace(/^\s*-\s*/, '').trim();
  if (!rootLabel) return [];

  const rootId = 'root';
  const rootNode: ParsedNode = { id: rootId, label: rootLabel, depth: 0, parentId: null };
  parsed.push(rootNode);
  depthStack.push({ depth: 0, id: rootId });

  let activeNode: ParsedNode = rootNode;

  for (let i = rootIndex + 1; i < lines.length; i++) {
    const rawLine = lines[i];

    // Skip blank lines
    if (rawLine.trim() === '') continue;

    // Check if line starts with hyphen (-) after optional leading whitespace
    const match = rawLine.match(/^(\s*)-(.*)$/);

    if (match) {
      // Rule 2 & 3 & 4: Line starting with hyphen (-) is a new node.
      const leadingSpace = match[1];
      const nodeContent = match[2].trim();

      // Calculate tab count
      let numTabs = 0;
      if (leadingSpace.includes('\t')) {
        numTabs = (leadingSpace.match(/\t/g) || []).length;
      } else if (leadingSpace.length > 0) {
        // Fallback for space indentation (4 spaces or 2 spaces per tab)
        numTabs = Math.floor(leadingSpace.length / 4) || Math.floor(leadingSpace.length / 2);
      }

      // Rule 4: Root node's child node is aligned with root node (0 tabs -> depth 1).
      // Rule 3: Child nodes are indented one tab from their parent node (1 tab -> depth 2, N tabs -> depth N+1).
      const depthLevel = numTabs + 1;

      // Maintain tree hierarchy stack
      while (depthStack.length > 1 && depthStack[depthStack.length - 1].depth >= depthLevel) {
        depthStack.pop();
      }

      const parent = depthStack[depthStack.length - 1];
      const id = newNodeId();

      const newNode: ParsedNode = {
        id,
        label: nodeContent,
        depth: depthLevel,
        parentId: parent.id,
      };

      parsed.push(newNode);
      depthStack.push({ depth: depthLevel, id });
      activeNode = newNode;
    } else {
      // Rule 2: Lines NOT starting with hyphen (-) belong to the active node's content.
      const continuationText = rawLine.trim();
      if (continuationText) {
        activeNode.label = activeNode.label
          ? activeNode.label + '\n' + continuationText
          : continuationText;
      }
    }
  }

  return parsed;
}

/**
 * Build left-to-right tree layout positions.
 * Root is placed at (0, 0). Each level is X_GAP px to the right.
 * Siblings are spaced Y_GAP px vertically (subtree-aware).
 */
function buildLayout(nodes: ParsedNode[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const childrenOf = new Map<string, string[]>();

  for (const n of nodes) {
    if (n.parentId) {
      if (!childrenOf.has(n.parentId)) childrenOf.set(n.parentId, []);
      childrenOf.get(n.parentId)!.push(n.id);
    }
  }

  const X_GAP = 320;
  const Y_GAP = 90;

  const subtreeHeight = (id: string): number => {
    const children = childrenOf.get(id) || [];
    if (children.length === 0) return 1;
    return children.reduce((sum, c) => sum + subtreeHeight(c), 0);
  };

  const place = (id: string, x: number, yCenter: number) => {
    positions.set(id, { x, y: yCenter });
    const children = childrenOf.get(id) || [];
    if (children.length === 0) return;
    const totalSlots = subtreeHeight(id);
    let currentY = yCenter - ((totalSlots - 1) / 2) * Y_GAP;
    for (const childId of children) {
      const cSlots = subtreeHeight(childId);
      const cCenter = currentY + ((cSlots - 1) / 2) * Y_GAP;
      place(childId, x + X_GAP, cCenter);
      currentY += cSlots * Y_GAP;
    }
  };

  if (nodes.length > 0) place(nodes[0].id, 0, 0);
  return positions;
}

/** Convert parsed node list to ReactFlow nodes & edges. */
export function buildNodesAndEdges(
  parsed: ParsedNode[]
): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  if (parsed.length === 0) return { nodes: [], edges: [] };

  const positions = buildLayout(parsed);

  const childCountMap = new Map<string, number>();
  for (const p of parsed) {
    if (p.parentId) {
      childCountMap.set(p.parentId, (childCountMap.get(p.parentId) || 0) + 1);
    }
  }

  const nodes: MindMapNode[] = parsed.map((p) => {
    const pos = positions.get(p.id) || { x: 0, y: 0 };
    return {
      id: p.id,
      type: 'mindmap' as const,
      position: pos,
      data: {
        label: p.label,
        isRoot: p.parentId === null,
        collapsed: false,
        childCount: childCountMap.get(p.id) || 0,
      },
    };
  });

  const edges: MindMapEdge[] = parsed
    .filter((p) => p.parentId !== null)
    .map((p) => ({
      id: newEdgeId(p.parentId!, p.id),
      source: p.parentId!,
      target: p.id,
      type: 'mindmap',
    }));

  return { nodes, edges };
}

/**
 * Main entry point: convert raw Whimsical / indented markdown text to ReactFlow nodes & edges.
 * Returns null if the text cannot be parsed into a valid mindmap.
 */
export function textToMindMap(
  raw: string
): { nodes: MindMapNode[]; edges: MindMapEdge[] } | null {
  const parsed = parseIndentedText(raw);
  if (parsed.length === 0) return null;
  return buildNodesAndEdges(parsed);
}
