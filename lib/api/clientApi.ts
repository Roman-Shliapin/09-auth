import type { Note, NoteTag } from '@/types/note';
import type { User } from '@/types/user';
import { api } from './api';

export interface FetchNotesProps {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: NoteTag;
}

export interface CreateNoteProps {
  title: string;
  content: string;
  tag: NoteTag;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

type AuthPayload = {
  email: string;
  password: string;
};

export async function fetchNotes(params?: FetchNotesProps): Promise<FetchNotesResponse> {
  const res = await api.get<FetchNotesResponse>('/notes', {
    params: {
      page: params?.page ?? 1,
      perPage: params?.perPage ?? 12,
      search: params?.search,
      tag: params?.tag,
    },
  });
  return res.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const res = await api.get<Note>(`/notes/${id}`);
  return res.data;
}

export async function createNote(data: CreateNoteProps): Promise<Note> {
  const res = await api.post<Note>('/notes', data);
  return res.data;
}

export async function deleteNote(id: string): Promise<Note> {
  const res = await api.delete<Note>(`/notes/${id}`);
  return res.data;
}

export async function register(payload: AuthPayload): Promise<User> {
  const res = await api.post<User>('/auth/register', payload);
  return res.data;
}

export async function login(payload: AuthPayload): Promise<User> {
  const res = await api.post<User>('/auth/login', payload);
  return res.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

type CheckSessionResponse = {
  success: boolean;
};

export async function checkSession(): Promise<boolean> {
  const res = await api.get<CheckSessionResponse>('/auth/session');
  return Boolean(res.data?.success);
}

export async function getMe(): Promise<User> {
  const res = await api.get<User>('/users/me');
  return res.data;
}

export async function updateMe(payload: Partial<Pick<User, 'email' | 'username'>>): Promise<User> {
  const res = await api.patch<User>('/users/me', payload);
  return res.data;
}


