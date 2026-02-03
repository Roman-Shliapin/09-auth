import axios from 'axios';
import type { Note, NoteTag } from '../types/note';

const API_BASE_URL = 'https://notehub-public.goit.study/api/notes';
const token = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN ?? process.env.VITE_NOTEHUB_TOKEN;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined,
});

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

export const fetchNotes = async (params?: FetchNotesProps): Promise<FetchNotesResponse> => {
  const res = await axiosInstance.get<FetchNotesResponse>('', {
    params: {
      page: params?.page ?? 1,
      perPage: params?.perPage ?? 12,
      search: params?.search,
      tag: params?.tag,
    },
  });
  return res.data;
};

export const createNote = async (data: CreateNoteProps): Promise<Note> => {
  const res = await axiosInstance.post<Note>('', data);
  return res.data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const res = await axiosInstance.delete<Note>(`/${id}`);
  return res.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const res = await axiosInstance.get<Note>(`/${id}`);
  return res.data;
};
