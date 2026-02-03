import type { Note, NoteTag } from '@/types/note';
import type { User } from '@/types/user';
import { cookies } from 'next/headers';
import { api } from './api';

export interface FetchNotesProps {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: NoteTag;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

async function cookieHeader() {
  const store = await cookies();
  return store.toString();
}

export async function fetchNotes(params?: FetchNotesProps): Promise<FetchNotesResponse> {
  const cookie = await cookieHeader();
  const res = await api.get<FetchNotesResponse>('/notes', {
    params: {
      page: params?.page ?? 1,
      perPage: params?.perPage ?? 12,
      search: params?.search,
      tag: params?.tag,
    },
    headers: cookie ? { Cookie: cookie } : undefined,
  });
  return res.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const cookie = await cookieHeader();
  const res = await api.get<Note>(`/notes/${id}`, {
    headers: cookie ? { Cookie: cookie } : undefined,
  });
  return res.data;
}

export async function getMe(): Promise<User> {
  const cookie = await cookieHeader();
  const res = await api.get<User>('/users/me', {
    headers: cookie ? { Cookie: cookie } : undefined,
  });
  return res.data;
}

export async function checkSession(): Promise<User | null> {
  const cookie = await cookieHeader();
  const res = await api.get<User | ''>('/auth/session', {
    headers: cookie ? { Cookie: cookie } : undefined,
    validateStatus: (status) => (status >= 200 && status < 300) || status === 200,
  });

  if (!res.data) return null;
  if (typeof res.data === 'string') return null;
  return res.data;
}


