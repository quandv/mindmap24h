'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBoardStore } from '@/store/boardStore';
import { BoardCard } from './BoardCard';
import { FolderCard } from './FolderCard';
import { CreateBoardDialog } from './CreateBoardDialog';
import {
  Plus,
  Search,
  FolderTree,
  Folder as FolderIcon,
  AlertTriangle,
  Loader2,
  Pencil,
} from 'lucide-react';

export function BoardList() {
  const router = useRouter();
  const {
    boards,
    folders,
    loading,
    error,
    fetchBoards,
    createBoard,
    renameBoard,
    moveBoard,
    deleteBoard,
    createFolder,
    renameFolder,
    deleteFolder,
  } = useBoardStore();

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Rename board modal
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Delete board modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // ── Folder modals ──────────────────────────────────────────────────
  // Create folder
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Rename folder
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [renameFolderValue, setRenameFolderValue] = useState('');

  // Delete folder confirm
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<{
    id: string;
    name: string;
    boardCount: number;
  } | null>(null);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  // ── Board handlers ─────────────────────────────────────────────────
  const handleCreate = async (name: string) => {
    const newBoard = await createBoard(name);
    if (newBoard?.id) {
      router.push(`/boards/${newBoard.id}`);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (renameId && renameValue.trim()) {
      await renameBoard(renameId, renameValue.trim());
      setRenameId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteBoard(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // ── Folder handlers ────────────────────────────────────────────────
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowCreateFolder(false);
    }
  };

  const handleRenameFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (renameFolderId && renameFolderValue.trim()) {
      await renameFolder(renameFolderId, renameFolderValue.trim());
      setRenameFolderId(null);
    }
  };

  const handleDeleteFolderConfirm = async () => {
    if (deleteFolderTarget) {
      await deleteFolder(deleteFolderTarget.id);
      setDeleteFolderTarget(null);
    }
  };

  // ── Search / filtering ─────────────────────────────────────────────
  const lowerSearch = search.toLowerCase();
  const filteredBoards = boards.filter(
    (b) => !b.folderId && b.name.toLowerCase().includes(lowerSearch)
  );
  const filteredFolders = folders.filter(
    (f) =>
      f.name.toLowerCase().includes(lowerSearch) ||
      boards.some((b) => b.folderId === f.id && b.name.toLowerCase().includes(lowerSearch))
  );
  const totalBoards = boards.length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">MindMap Editor</h1>
              <span className="text-xs text-slate-400">Local-only Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setNewFolderName(''); setShowCreateFolder(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-semibold rounded-xl transition-all"
            >
              <FolderIcon className="w-4 h-4" />
              <span>New Folder</span>
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Board</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Search & Stats Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search boards and folders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <span className="text-xs font-medium text-slate-500">
            {totalBoards} {totalBoards === 1 ? 'board' : 'boards'} &middot; {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
          </span>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-xs font-medium">Loading...</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-700 text-xs flex items-center justify-between mb-6">
            <span>Failed to connect to backend: {error}</span>
            <button onClick={() => fetchBoards()} className="underline font-semibold">Retry</button>
          </div>
        )}

        {/* Empty State */}
        {!loading && boards.length === 0 && folders.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto my-12 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <FolderTree className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No mind maps yet</h3>
            <p className="text-xs text-slate-500 mb-5 max-w-xs">
              Organize your thoughts, plan projects, or brainstorm ideas visually.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create your first board</span>
            </button>
          </div>
        )}

        {/* Folders Section */}
        {!loading && filteredFolders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Folders</h2>
            {filteredFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                allFolders={folders}
                boards={boards}
                onRenameFolder={(id, name) => { setRenameFolderId(id); setRenameFolderValue(name); }}
                onDeleteFolder={(id, name, boardCount) => setDeleteFolderTarget({ id, name, boardCount })}
                onRenameBoard={(id, name) => { setRenameId(id); setRenameValue(name); }}
                onDeleteBoard={(id, name) => setDeleteTarget({ id, name })}
                onMoveBoard={moveBoard}
              />
            ))}
          </div>
        )}

        {/* Ungrouped Boards Section */}
        {!loading && filteredBoards.length > 0 && (
          <div>
            {folders.length > 0 && (
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Boards</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  folders={folders}
                  onRename={(id, name) => { setRenameId(id); setRenameValue(name); }}
                  onDelete={(id, name) => setDeleteTarget({ id, name })}
                  onMove={moveBoard}
                />
              ))}
            </div>
          </div>
        )}

        {/* No search results */}
        {!loading && boards.length > 0 && filteredBoards.length === 0 && filteredFolders.length === 0 && (
          <div className="text-center py-16 text-xs text-slate-400">
            No boards or folders matching &quot;{search}&quot;
          </div>
        )}
      </main>

      {/* ── Dialogs ─────────────────────────────────────── */}

      {/* Create Board Dialog */}
      <CreateBoardDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 max-w-sm w-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                <FolderIcon className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900">New Folder</h3>
            </div>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                autoFocus
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateFolder(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Board Modal */}
      {renameId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 max-w-sm w-full">
            <h3 className="text-base font-bold text-slate-900 mb-3">Rename Board</h3>
            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenameId(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!renameValue.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {renameFolderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 max-w-sm w-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                <Pencil className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Rename Folder</h3>
            </div>
            <form onSubmit={handleRenameFolderSubmit} className="space-y-4">
              <input
                type="text"
                value={renameFolderValue}
                onChange={(e) => setRenameFolderValue(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenameFolderId(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!renameFolderValue.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Board Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Board</h3>
            </div>
            <p className="text-xs text-slate-600 mb-5">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-800">&quot;{deleteTarget.name}&quot;</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Folder Modal */}
      {deleteFolderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Folder</h3>
            </div>
            <p className="text-xs text-slate-600 mb-2">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-800">&quot;{deleteFolderTarget.name}&quot;</span>?
            </p>
            {deleteFolderTarget.boardCount > 0 && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 mb-4 text-xs text-rose-700">
                <strong>Warning:</strong> This will also permanently delete{' '}
                <strong>{deleteFolderTarget.boardCount} board{deleteFolderTarget.boardCount !== 1 ? 's' : ''}</strong>{' '}
                inside this folder. This action cannot be undone.
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteFolderTarget(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteFolderConfirm}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                Delete folder{deleteFolderTarget.boardCount > 0 ? ' & boards' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
