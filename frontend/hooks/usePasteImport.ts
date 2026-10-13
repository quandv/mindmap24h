import { useEffect, useCallback, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useReactFlow } from '@xyflow/react';

/**
 * Hook that listens for paste events on the mindmap board.
 * When the pasted text looks like a multi-line indented outline (>= 2 lines),
 * it imports it as a mindmap and shows a brief confirmation toast.
 */
export function usePasteImport() {
  const importFromText = useEditorStore((s) => s.importFromText);
  const { fitView } = useReactFlow();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Skip if focus is inside an input/textarea/contenteditable (node rename, etc.)
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      ) {
        return;
      }

      const text = e.clipboardData?.getData('text/plain') ?? '';
      const trimmed = text.trim();

      // Need at least 2 non-empty lines to treat as an outline
      const lines = trimmed.split('\n').filter((l) => l.trim() !== '');
      if (lines.length < 2) return;

      // Prevent the default paste behaviour on the canvas
      e.preventDefault();

      const ok = importFromText(trimmed);
      if (ok) {
        // Give React Flow a tick to render nodes before fitting
        setTimeout(() => fitView({ padding: 0.25, duration: 500 }), 80);
        showToast('Mindmap generated: ' + lines.length + ' lines imported');
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [importFromText, fitView, showToast]);

  return { toast };
}
