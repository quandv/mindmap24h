import { useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useEditorStore } from '@/store/editorStore';
import { useLayout } from './useLayout';

export function useKeyboardShortcuts() {
  const { fitView } = useReactFlow();
  const { applyLayout } = useLayout();

  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const addChildNode = useEditorStore((s) => s.addChildNode);
  const addSiblingNode = useEditorStore((s) => s.addSiblingNode);
  const deleteSelectedNode = useEditorStore((s) => s.deleteSelectedNode);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const setSelectedNodeId = useEditorStore((s) => s.setSelectedNodeId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Undo: Ctrl+Z / Cmd+Z (without shift)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && e.shiftKey)
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Fit view: Ctrl+Shift+F
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        fitView({ padding: 0.25, duration: 400 });
        return;
      }

      // Auto-layout: Ctrl+Shift+L
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        applyLayout('LR');
        return;
      }

      // If user is editing text in an input or textarea, don't intercept standard typing keys
      if (isInput) return;

      // Escape: clear selection
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedNodeId(null);
        return;
      }

      if (!selectedNodeId) return;

      // Tab: Add Child Node
      if (e.key === 'Tab') {
        e.preventDefault();
        addChildNode(selectedNodeId);
        return;
      }

      // Enter: Add Sibling Node
      if (e.key === 'Enter') {
        e.preventDefault();
        addSiblingNode(selectedNodeId);
        return;
      }

      // Delete or Backspace: Delete Node
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedNode();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedNodeId,
    addChildNode,
    addSiblingNode,
    deleteSelectedNode,
    undo,
    redo,
    setSelectedNodeId,
    fitView,
    applyLayout,
  ]);
}
