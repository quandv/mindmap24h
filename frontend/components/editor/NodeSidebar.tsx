'use client';

import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import {
  X,
  Plus,
  CornerDownRight,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export function NodeSidebar() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useEditorStore((s) => s.setSelectedNodeId);
  const nodes = useEditorStore((s) => s.nodes);
  const updateNodeLabel = useEditorStore((s) => s.updateNodeLabel);
  const addChildNode = useEditorStore((s) => s.addChildNode);
  const addSiblingNode = useEditorStore((s) => s.addSiblingNode);
  const toggleCollapse = useEditorStore((s) => s.toggleCollapse);
  const deleteSelectedNode = useEditorStore((s) => s.deleteSelectedNode);

  if (!selectedNodeId) return null;

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const isRoot = !!node.data.isRoot;
  const isCollapsed = !!node.data.collapsed;
  const hasChildren = (node.data.childCount ?? 0) > 0;

  return (
    <aside className="absolute right-4 top-20 bottom-4 w-72 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-lg p-4 flex flex-col z-20 pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isRoot ? 'bg-indigo-600' : 'bg-slate-400'
            }`}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {isRoot ? 'Root Node' : 'Node Properties'}
          </span>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Label Edit */}
      <div className="py-4 border-b border-slate-100 space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">Label</label>
        <textarea
          rows={3}
          value={node.data.label || ''}
          onChange={(e) => updateNodeLabel(node.id, e.target.value)}
          className="w-full text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
          placeholder="Enter text..."
        />
      </div>

      {/* Quick Actions */}
      <div className="py-4 border-b border-slate-100 space-y-2">
        <span className="text-xs font-semibold text-slate-600">Actions</span>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => addChildNode(node.id)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Child Node</span>
            </span>
            <kbd className="px-1.5 py-0.5 bg-white border border-indigo-200 rounded font-mono text-[10px]">
              Tab
            </kbd>
          </button>

          {!isRoot && (
            <button
              onClick={() => addSiblingNode(node.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5" />
                <span>Add Sibling Node</span>
              </span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">
                Enter
              </kbd>
            </button>
          )}

          {hasChildren && (
            <button
              onClick={() => toggleCollapse(node.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              {isCollapsed ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Expand Subtree ({node.data.childCount})</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  <span>Collapse Subtree</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={deleteSelectedNode}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Node</span>
            </span>
            <kbd className="px-1.5 py-0.5 bg-white border border-rose-200 rounded font-mono text-[10px]">
              Del
            </kbd>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Double-click canvas nodes to edit</span>
      </div>
    </aside>
  );
}
