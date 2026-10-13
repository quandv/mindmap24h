import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Board, Folder } from '@/types';

type BoardStore = {
  boards: Board[];
  folders: Folder[];
  loading: boolean;
  error: string | null;
  fetchBoards: () => Promise<void>;
  fetchFolders: () => Promise<void>;
  createBoard: (name: string, folderId?: string | null) => Promise<Board>;
  renameBoard: (id: string, name: string) => Promise<void>;
  moveBoard: (id: string, folderId: string | null) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  createFolder: (name: string) => Promise<Folder>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
};

export const useBoardStore = create<BoardStore>((set, get) => ({
  boards: [],
  folders: [],
  loading: false,
  error: null,

  fetchBoards: async () => {
    set({ loading: true, error: null });
    try {
      const [boards, folders] = await Promise.all([
        api.boards.list(),
        api.folders.list(),
      ]);
      set({ boards, folders, loading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchFolders: async () => {
    const folders = await api.folders.list();
    set({ folders });
  },

  createBoard: async (name: string, folderId?: string | null) => {
    const board = await api.boards.create(name, folderId);
    set((s) => ({ boards: [board, ...s.boards] }));
    return board;
  },

  renameBoard: async (id: string, name: string) => {
    await api.boards.rename(id, name);
    set((s) => ({
      boards: s.boards.map((b) => (b.id === id ? { ...b, name } : b)),
    }));
  },

  moveBoard: async (id: string, folderId: string | null) => {
    await api.boards.move(id, folderId);
    set((s) => ({
      boards: s.boards.map((b) => (b.id === id ? { ...b, folderId } : b)),
    }));
  },

  deleteBoard: async (id: string) => {
    await api.boards.delete(id);
    set((s) => ({ boards: s.boards.filter((b) => b.id !== id) }));
  },

  createFolder: async (name: string) => {
    const folder = await api.folders.create(name);
    set((s) => ({ folders: [folder, ...s.folders] }));
    return folder;
  },

  renameFolder: async (id: string, name: string) => {
    await api.folders.rename(id, name);
    set((s) => ({
      folders: s.folders.map((f) => (f.id === id ? { ...f, name } : f)),
    }));
  },

  deleteFolder: async (id: string) => {
    await api.folders.delete(id);
    const deletedFolder = get().folders.find((f) => f.id === id);
    const boardIdsInFolder = new Set((deletedFolder?.boards ?? []).map((b) => b.id));
    set((s) => ({
      folders: s.folders.filter((f) => f.id !== id),
      boards: s.boards.filter((b) => !boardIdsInFolder.has(b.id)),
    }));
  },
}));
