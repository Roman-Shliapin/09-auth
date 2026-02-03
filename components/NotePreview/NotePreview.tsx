'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchNoteById } from '@/lib/api';

import css from './NotePreview.module.css';

type Props = {
  id: string;
};

export default function NotePreview({ id }: Props) {
  const {
    data: note,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['note', id],
    queryFn: () => fetchNoteById(id),
    enabled: Boolean(id),
    refetchOnMount: false,
  });

  if (isLoading) return <p className={css.state}>Loading, please wait...</p>;
  if (error || !note) return <p className={css.state}>Something went wrong.</p>;

  return (
    <div className={css.container}>
      <div className={css.header}>
        <h2 className={css.title}>{note.title}</h2>
        <span className={css.tag}>{note.tag}</span>
      </div>
      <p className={css.content}>{note.content}</p>
      <p className={css.date}>{new Date(note.createdAt).toLocaleString()}</p>
    </div>
  );
}


