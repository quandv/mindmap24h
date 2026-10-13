'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Board, Folder } from '@/types';
import {
  MoreVertical,
  Pencil,
  Trash2,
  GitBranch,
  Calendar,
  FolderInput,
  FolderMinus,
  ChevronRight,
} from 'lucide-react';

interface BoardCardProps {
  board: Board;
  folders: Folder[];
  onRename: (id: string, currentName: string) => void;
  onDelete: (id: string, name: string) => void;
  onMove: (id: string, folderId: string | null) => void;
}

export function BoardCard({ board, folders, onRename, onDelete, onMove }: BoardCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const formattedDate = new Date(board.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const closeAll = () => {
    setShowMenu(false);
    setShowMoveMenu(false);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
      <Link href={`/boards/${board.id}`} className="block p-5 flex-1 cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <GitBranch className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 text-base">
          {board.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Edited {formattedDate}</span>
        </div>
      </Link>

      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
            setShowMoveMenu(false);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-30" onClick={closeAll} />
            <div className="absolute right-0 top-8 z-40 w-48 bg-white rounded-xl border border-slate-100 shadow-xl py-1.5 text-xs">
              <button
                onClick={() => {
                  closeAll();
                  onRename(board.id, board.name);
                }}
                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>Rename</span>
              </button>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoveMenu(!showMoveMenu);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderInput className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="truncate">Move to folder</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                      showMoveMenu ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {showMoveMenu && (
                  <div className="mx-1.5 my-1 p-1 bg-slate-50/80 rounded-lg border border-slate-100 max-h-48 overflow-y-auto space-y-0.5 text-xs">
                    {board.folderId && (
                      <button
                        onClick={() => {
                          onMove(board.id, null);
                          closeAll();
                        }}
                        className="w-full px-2 py-1.5 text-left text-slate-600 hover:bg-white hover:text-slate-900 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <FolderMinus className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="italic truncate">Remove from folder</span>
                      </button>
                    )}

                    {folders.length === 0 && !board.folderId && (
                      <p className="px-2 py-1.5 text-slate-400 italic text-center">No folders yet</p>
                    )}

                    {folders.map((folder) =>
                      folder.id === board.folderId ? null : (
                        <button
                          key={folder.id}
                          onClick={() => {
                            onMove(board.id, folder.id);
                            closeAll();
                          }}
                          className="w-full px-2 py-1.5 text-left text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md flex items-center gap-2 transition-colors"
                        >
                          <FolderInput className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                          <span className="truncate">{folder.name}</span>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  closeAll();
                  onDelete(board.id, board.name);
                }}
                className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
