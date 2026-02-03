import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';

import { fetchNoteById } from '@/lib/api';
import type { Note } from '@/types/note';

import NoteDetailsClient from './NoteDetails.client';

function buildNoteDescription(note: Note) {
  const normalized = note.content.replace(/\s+/g, ' ').trim();
  const snippet = normalized.length > 160 ? `${normalized.slice(0, 157)}...` : normalized;
  return snippet || `Note: ${note.title}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const url = `${siteUrl}/notes/${id}`;

  try {
    const note = await fetchNoteById(id);

    const title = `${note.title} | NoteHub`;
    const description = buildNoteDescription(note);

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
  } catch {
    const title = 'Note not found | NoteHub';
    const description = 'This note does not exist or is unavailable.';

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
}

export default async function NoteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['note', id],
    queryFn: () => fetchNoteById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  );
}
