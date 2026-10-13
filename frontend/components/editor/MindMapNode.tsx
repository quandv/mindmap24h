'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useEditorStore } from '@/store/editorStore';
import type { MindMapNode } from '@/types';
import { Plus, Minus } from 'lucide-react';
import { renderLabel } from '@/lib/renderLabel';

export function MindMapNodeComponent({
  id,
  data,
  selected,
}: NodeProps<MindMapNode>) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const updateNodeLabel = useEditorStore((s) => s.updateNodeLabel);
  const addChildNode = useEditorStore((s) => s.addChildNode);
  const toggleCollapse = useEditorStore((s) => s.toggleCollapse);
  const setSelectedNodeId = useEditorStore((s) => s.setSelectedNodeId);

  useEffect(() => {
    setText(data.label || '');
  }, [data.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (text.trim() && text !== data.label) {
      updateNodeLabel(id, text.trim());
    } else {
      setText(data.label || '');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setText(data.label || '');
      setIsEditing(false);
    }
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    addChildNode(id);
  };

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCollapse(id);
  };

  const isRoot = !!data.isRoot;
  const isCollapsed = !!data.collapsed;
  const hasChildren = (data.childCount ?? 0) > 0;
  const branchColor = data.branchColor;

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      onDoubleClick={handleDoubleClick}
      className={`group relative flex items-center min-w-[140px] max-w-[360px] w-auto px-3.5 py-2 rounded-xl transition-all select-none cursor-pointer ${
        isRoot
          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-md ring-2 ' +
            (selected ? 'ring-indigo-300 ring-offset-2' : 'ring-transparent')
          : 'bg-white text-slate-800 border font-medium shadow-sm hover:shadow-md ' +
            (selected
              ? 'border-indigo-500 ring-2 ring-indigo-400 ring-offset-1 shadow-md'
              : 'border-slate-200 hover:border-slate-300')
      }`}
      style={
        !isRoot && branchColor
          ? { borderLeftColor: branchColor, borderLeftWidth: '3.5px' }
          : undefined
      }
    >
      {/* Target handle on Left */}
      {!isRoot && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ backgroundColor: branchColor || '#94a3b8' }}
          className="!w-2.5 !h-2.5 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full bg-transparent outline-none border-b text-sm px-0.5 py-0 ${
              isRoot ? 'text-white border-white' : 'text-slate-900 border-indigo-500'
            }`}
          />
        ) : (
          <div className="text-xl leading-snug whitespace-pre-wrap break-words">
            {renderLabel(data.label || 'Untitled')}
          </div>
        )}
      </div>

      {/* Quick Add Child Button (+) on hover or selected */}
      <button
        onClick={handleAddChild}
        title="Add Child (Tab)"
        className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-slate-300 text-slate-600 shadow flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all z-10 ${
          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {/* Collapse/Expand Toggle Indicator if it has children */}
      {hasChildren && (
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex items-center z-10">
          {isCollapsed ? (
            <button
              onClick={handleToggleCollapse}
              title={`Expand ${data.childCount} hidden nodes`}
              className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-indigo-100 border border-indigo-300 text-indigo-700 shadow hover:bg-indigo-200 transition-colors flex items-center gap-0.5"
              style={branchColor ? { backgroundColor: `${branchColor}20`, borderColor: branchColor, color: branchColor } : undefined}
            >
              <span>+{data.childCount}</span>
            </button>
          ) : (
            <button
              onClick={handleToggleCollapse}
              title="Collapse children"
              className="w-4 h-4 rounded-full bg-slate-100 border border-slate-300 text-slate-500 shadow hover:bg-slate-200 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      )}

      {/* Source handle on Right */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ backgroundColor: branchColor || '#94a3b8' }}
        className="!w-2.5 !h-2.5 !border-white !border-2 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
}
