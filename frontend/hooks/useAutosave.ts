import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { api } from '@/lib/api';

const DEBOUNCE_DELAY = 1500;

export function useAutosave() {
  const boardId = useEditorStore((s) => s.boardId);
  const isDirty = useEditorStore((s) => s.isDirty);
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);
  const getContent = useEditorStore((s) => s.getContent);
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus);
  const markSaved = useEditorStore((s) => s.markSaved);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!boardId || !isDirty) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setSaveStatus('saving');

    timeoutRef.current = setTimeout(async () => {
      try {
        const content = getContent();
        await api.boards.saveContent(boardId, content);
        markSaved();
      } catch (err) {
        console.error('Autosave failed:', err);
        setSaveStatus('error');
      }
    }, DEBOUNCE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nodes, edges, isDirty, boardId, getContent, setSaveStatus, markSaved]);
}
