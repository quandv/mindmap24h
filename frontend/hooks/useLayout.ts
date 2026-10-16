import { useCallback } from 'react';
import dagre from '@dagrejs/dagre';
import { useReactFlow } from '@xyflow/react';
import { useEditorStore } from '@/store/editorStore';
import { getNodeWidth, getNodeHeight, VERTICAL_NODE_GAP } from '@/lib/mindmap';

export function useLayout() {
  const { fitView } = useReactFlow();
  const { nodes, edges, setNodesAndEdges, pushHistory } = useEditorStore();

  const applyLayout = useCallback(
    (direction: 'LR' | 'TB' = 'LR') => {
      // Only layout visible nodes & edges
      const visibleNodes = nodes.filter((n) => !n.hidden);
      const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
      const visibleEdges = edges.filter(
        (e) => !e.hidden && visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
      );

      if (visibleNodes.length === 0) return;

      const g = new dagre.graphlib.Graph();
      g.setGraph({
        rankdir: direction,
        ranksep: 80,
        nodesep: VERTICAL_NODE_GAP, // Always 20px apart
        marginx: 50,
        marginy: 50,
      });
      g.setDefaultEdgeLabel(() => ({}));

      visibleNodes.forEach((node) => {
        g.setNode(node.id, {
          width: getNodeWidth(node),
          height: getNodeHeight(node),
        });
      });

      visibleEdges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
      });

      dagre.layout(g);

      pushHistory();

      const updatedNodes = nodes.map((node) => {
        if (!visibleNodeIds.has(node.id)) return node;
        const nodeWithPosition = g.node(node.id);
        if (!nodeWithPosition) return node;

        const w = getNodeWidth(node);
        const h = getNodeHeight(node);

        return {
          ...node,
          position: {
            x: nodeWithPosition.x - w / 2,
            y: nodeWithPosition.y - h / 2,
          },
        };
      });

      setNodesAndEdges(updatedNodes, edges);
      setTimeout(() => {
        fitView({ padding: 0.25, duration: 400 });
      }, 50);
    },
    [nodes, edges, setNodesAndEdges, pushHistory, fitView]
  );

  return { applyLayout };
}