import type { Board, BoardContent, BoardWithContent, Folder } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3031/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  boards: {
    list: () => request<Board[]>('/boards'),
    get: (id: string) => request<BoardWithContent>(`/boards/${id}`),
    create: (name: string, folderId?: string | null) =>
      request<BoardWithContent>('/boards', {
        method: 'POST',
        body: JSON.stringify({ name, folderId: folderId ?? null }),
      }),
    rename: (id: string, name: string) =>
      request<Board>(`/boards/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }),
    move: (id: string, folderId: string | null) =>
      request<Board>(`/boards/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ folderId }),
      }),
    saveContent: (id: string, content: BoardContent) =>
      request<Board>(`/boards/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
      }),
    delete: (id: string) =>
      request<void>(`/boards/${id}`, { method: 'DELETE' }),
  },
  folders: {
    list: () => request<Folder[]>('/folders'),
    create: (name: string) =>
      request<Folder>('/folders', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    rename: (id: string, name: string) =>
      request<Folder>(`/folders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }),
    delete: (id: string) =>
      request<void>(`/folders/${id}`, { method: 'DELETE' }),
  },
};
