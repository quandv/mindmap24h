'use client';

import React, { useState } from 'react';
import { X, FileUp, Sparkles, FileText } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ImportDialog({ isOpen, onClose, onSuccess }: ImportDialogProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const importFromText = useEditorStore((s) => s.importFromText);

  if (!isOpen) return null;

  const handleImport = () => {
    setError(null);
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Please paste text or upload a file first.');
      return;
    }

    const ok = importFromText(trimmed);
    if (ok) {
      setText('');
      onClose();
      onSuccess?.();
    } else {
      setError('Failed to parse mindmap. Please check structure (root on line 1, - for nodes, tabs for indent).');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content === 'string') {
        setText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 max-w-lg w-full space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Import Whimsical / Markdown</h3>
              <p className="text-xs text-slate-500">Paste copied Whimsical text or upload a .md file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Outline Content</label>
            <label className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer">
              <FileText className="w-3.5 h-3.5" />
              <span>Upload .md file</span>
              <input type="file" accept=".md,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Golang\n- Phân biệt các khái niệm...\n\t- Concurrent\n\t\t- Quản lý...\n- Goroutines"}
            className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
          />
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[11px] text-slate-500 space-y-1">
          <div className="font-semibold text-slate-700">Whimsical Rules Applied:</div>
          <div>1. Line 1 is the root node label</div>
          <div>2. Lines starting with hyphen (-) contain node content</div>
          <div>3. Lines without hyphen (-) are appended as multiline text to preceding node</div>
          <div>4. Child nodes are indented 1 tab per level from parent</div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!text.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Mindmap</span>
          </button>
        </div>
      </div>
    </div>
  );
}
