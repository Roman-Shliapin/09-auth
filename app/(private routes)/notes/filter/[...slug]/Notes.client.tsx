'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

import { fetchNotes } from '@/lib/api/clientApi';
import NoteList from '@/components/NoteList/NoteList';
import Loading from '@/components/Loading/Loading';
import Pagination from '@/components/Pagination/Pagination';
import SearchBox from '@/components/SearchBox/SearchBox';

import css from '../../App.module.css';
import type { NoteTag } from '@/types/note';

interface NotesClientProps {
  initialPage: number;
  initialSearch: string;
  tag?: NoteTag;
}

export default function NotesClient({ initialPage, initialSearch, tag }: NotesClientProps) {
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch] = useDebounce(search, 500);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (page !== 1) {
      setPage(1);
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['notes', tag, debouncedSearch, page],
    queryFn: () =>
      fetchNotes({
        tag,
        search: debouncedSearch || undefined,
        page,
        perPage: 12,
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (error) {
      toast.error('Failed to load notes');
    }
  }, [error]);

  const notes = data?.notes ?? [];

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={handleSearchChange} />
        {data && data.totalPages > 1 && (
          <Pagination pageCount={data.totalPages} currentPage={page} onPageChange={setPage} />
        )}
        <Link className={css.button} href="/notes/action/create">
          Create note +
        </Link>
      </header>

      <div className={css.content}>
        {isLoading ? (
          <Loading />
        ) : notes.length === 0 ? (
          <p className={css.empty}>No notes found.</p>
        ) : (
          <NoteList notes={notes} />
        )}
      </div>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}


