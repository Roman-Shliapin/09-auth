import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';

import { fetchNotes } from '@/lib/api';
import type { NoteTag } from '@/types/note';

import NotesClient from './Notes.client';

interface FilteredNotesPageProps {
  params: Promise<{
    slug: string[];
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function parseSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: FilteredNotesPageProps): Promise<Metadata> {
  const resolvedParams = await params;

  const tagSegment = resolvedParams.slug?.[0] ?? 'all';
  const tagLabel = tagSegment === 'all' ? 'All' : tagSegment;

  const title = `NoteHub — ${tagLabel} notes`;
  const description = `Notes list filtered by: ${tagLabel}.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const url = `${siteUrl}/notes/filter/${resolvedParams.slug?.join('/') ?? 'all'}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: ['https://ac.goit.global/fullstack/react/notehub-og-meta.jpg'],
    },
  };
}

export default async function FilteredNotesPage({ params, searchParams }: FilteredNotesPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) ?? {};

  const rawPage = parseSearchParam(resolvedSearchParams.page);
  const page = Math.max(1, Number(rawPage ?? 1) || 1);

  const search = parseSearchParam(resolvedSearchParams.search) ?? '';

  const tagSegment = resolvedParams.slug?.[0];
  const tag: NoteTag | undefined = tagSegment === 'all' ? undefined : (tagSegment as NoteTag);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['notes', tag, search, page],
    queryFn: () =>
      fetchNotes({
        tag,
        search: search || undefined,
        page,
        perPage: 12,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient initialPage={page} initialSearch={search} tag={tag} />
    </HydrationBoundary>
  );
}


