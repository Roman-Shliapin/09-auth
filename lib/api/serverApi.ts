import axios, { type AxiosResponse } from 'axios';
import type { Note, NoteTag } from '@/types/note';
import type { User } from '@/types/user';
import { cookies, headers } from 'next/headers';

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

async function serverBaseURL() {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (!host) return `${process.env.NEXT_PUBLIC_API_URL}/api`;
  return `${proto}://${host}/api`;
}

async function serverApi() {
  const baseURL = await serverBaseURL();
  return axios.create({ baseURL, withCredentials: true });
}

export async function fetchNotes(params?: FetchNotesProps): Promise<FetchNotesResponse> {
  const cookie = await cookieHeader();
  const api = await serverApi();
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
  const api = await serverApi();
  const res = await api.get<Note>(`/notes/${id}`, {
    headers: cookie ? { Cookie: cookie } : undefined,
  });
  return res.data;
}

export async function getMe(): Promise<User> {
  const cookie = await cookieHeader();
  const api = await serverApi();
  const res = await api.get<User>('/users/me', {
    headers: cookie ? { Cookie: cookie } : undefined,
  });
  return res.data;
}

export async function checkSession(): Promise<AxiosResponse<{ success: boolean }>> {
  const cookie = await cookieHeader();
  const api = await serverApi();
  return await api.get<{ success: boolean }>('/auth/session', {
    headers: cookie ? { Cookie: cookie } : undefined,
  });
}


