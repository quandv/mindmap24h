'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useReactFlow } from '@xyflow/react';
import { useEditorStore } from '@/store/editorStore';
import { useLayout } from '@/hooks/useLayout';
import { ImportDialog } from './ImportDialog';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  FolderTree,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Plus,
  CornerDownRight,
  Trash2,
  Check,
  Loader2,
  HelpCircle,
  Pencil,
  FileUp,
} from 'lucide-react';

export function Toolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { applyLayout } = useLayout();

  const boardName = useEditorStore((s) => s.boardName);
  const setBoardName = useEditorStore((s) => s.setBoardName);
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const isDirty = useEditorStore((s) => s.isDirty);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const nodes = useEditorStore((s) => s.nodes);
  const addChildNode = useEditorStore((s) => s.addChildNode);
  const addSiblingNode = useEditorStore((s) => s.addSiblingNode);
  const deleteSelectedNode = useEditorStore((s) => s.deleteSelectedNode);
  const addRootNode = useEditorStore((s) => s.addRootNode);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(boardName);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const isRootSelected = !!selectedNode?.data.isRoot;

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput !== boardName) {
      setBoardName(titleInput.trim());
    } else {
      setTitleInput(boardName);
    }
  };

  return (
    <>
      <header className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Back + Board Title + Autosave */}
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-sm pointer-events-auto">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Back to all boards"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="h-4 w-px bg-slate-200" />

          {/* Board Title */}
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              autoFocus
              className="text-sm font-semibold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-indigo-400 outline-none"
            />
          ) : (
            <button
              onClick={() => {
                setTitleInput(boardName);
                setIsEditingTitle(true);
              }}
              className="group flex items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors"
              title="Click to rename board"
            >
              <span>{boardName || 'Untitled Board'}</span>
              <Pencil className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          {/* Autosave Status */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-2">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-amber-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Saving...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-600">
                <Check className="w-3 h-3" />
                <span>Saved</span>
              </span>
            )}
            {saveStatus === 'idle' && isDirty && (
              <span className="text-slate-400">Unsaved changes</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-rose-500">Error saving</span>
            )}
          </div>
        </div>

        {/* Center: Action Controls */}
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-slate-200/80 shadow-sm pointer-events-auto">
          {/* Undo */}
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Redo */}
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* Add Child */}
          <button
            onClick={() => selectedNodeId && addChildNode(selectedNodeId)}
            disabled={!selectedNodeId}
            title="Add Child Node (Tab)"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 disabled:hover:bg-indigo-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Child</span>
          </button>

          {/* Add Sibling */}
          <button
            onClick={() => selectedNodeId && addSiblingNode(selectedNodeId)}
            disabled={!selectedNodeId || isRootSelected}
            title="Add Sibling Node (Enter)"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <CornerDownRight className="w-3.5 h-3.5" />
            <span>Sibling</span>
          </button>

          {nodes.length === 0 && (
            <button
              onClick={() => addRootNode()}
              title="Add Root Node"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Root</span>
            </button>
          )}

          {/* Delete */}
          <button
            onClick={deleteSelectedNode}
            disabled={!selectedNodeId}
            title="Delete Node (Delete/Backspace)"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* Import Whimsical / Outline */}
          <button
            onClick={() => setShowImportModal(true)}
            title="Import Whimsical / Markdown outline"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>

          {/* Auto-Layout */}
          <button
            onClick={() => applyLayout('LR')}
            title="Auto Layout (Ctrl+Shift+L)"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <FolderTree className="w-3.5 h-3.5 text-slate-500" />
            <span>Layout</span>
          </button>
        </div>

        {/* Right: Zoom & Shortcuts */}
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-slate-200/80 shadow-sm pointer-events-auto">
          <button
            onClick={() => zoomIn()}
            title="Zoom In"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => zoomOut()}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => fitView({ padding: 0.25, duration: 400 })}
            title="Fit View (Ctrl+Shift+F)"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <button
            onClick={() => setShowShortcutsModal(true)}
            title="Keyboard Shortcuts"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Import Modal */}
      <ImportDialog
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => setTimeout(() => fitView({ padding: 0.25, duration: 500 }), 100)}
      />

      {/* Shortcuts Modal */}
      {showShortcutsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Keyboard Shortcuts
            </h3>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>Add child node</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-medium text-slate-700">Tab</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>Add sibling node</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-medium text-slate-700">Enter</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>Delete node</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-medium text-slate-700">Del / Backspace</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>Rename node</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-medium text-slate-700">Double Click</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>Undo</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-medium text-slate-700">Ctrl + Z</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>Redo</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-medium text-slate-700">Ctrl + Y</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>Fit view</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-medium text-slate-700">Ctrl + Shift + F</kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Auto layout</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-medium text-slate-700">Ctrl + Shift + L</kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Paste outline as mindmap</span>
                <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-medium text-slate-700">Ctrl + V</kbd>
              </div>
            </div>
            <button
              onClick={() => setShowShortcutsModal(false)}
              className="mt-5 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
