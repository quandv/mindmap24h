'use client';

import React, { useState } from 'react';
import type { Folder, Board } from '@/types';
import {
  MoreVertical,
  Pencil,
  Trash2,
  Folder as FolderIcon,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { BoardCard } from './BoardCard';

interface FolderCardProps {
  folder: Folder;
  allFolders: Folder[];
  boards: Board[];
  onRenameFolder: (id: string, currentName: string) => void;
  onDeleteFolder: (id: string, name: string, boardCount: number) => void;
  onRenameBoard: (id: string, currentName: string) => void;
  onDeleteBoard: (id: string, name: string) => void;
  onMoveBoard: (id: string, folderId: string | null) => void;
}

export function FolderCard({
  folder,
  allFolders,
  boards,
  onRenameFolder,
  onDeleteFolder,
  onRenameBoard,
  onDeleteBoard,
  onMoveBoard,
}: FolderCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const folderBoards = boards.filter((b) => b.folderId === folder.id);

  return (
    <div className="mb-6">
      {/* Folder Header */}
      <div className="flex items-center gap-2 mb-3 group/folder">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-500 flex-shrink-0 transition-colors group-hover/folder:bg-amber-100">
            <FolderIcon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-700 text-sm truncate">{folder.name}</span>
          <span className="text-xs text-slate-400 flex-shrink-0">
            {folderBoards.length} {folderBoards.length === 1 ? 'board' : 'boards'}
          </span>
          <div className="text-slate-400 ml-auto flex-shrink-0">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </button>

        {/* Folder context menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors opacity-0 group-hover/folder:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-40 w-40 bg-white rounded-xl border border-slate-100 shadow-lg py-1.5 text-xs">
                <button
                  onClick={() => { setShowMenu(false); onRenameFolder(folder.id, folder.name); }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  <span>Rename</span>
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => { setShowMenu(false); onDeleteFolder(folder.id, folder.name, folderBoards.length); }}
                  className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete folder</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Boards inside folder */}
      {expanded && (
        <div className="pl-4 border-l-2 border-amber-100 ml-3">
          {folderBoards.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-3 pl-1">No boards in this folder yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-1">
              {folderBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  folders={allFolders}
                  onRename={onRenameBoard}
                  onDelete={onDeleteBoard}
                  onMove={onMoveBoard}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
