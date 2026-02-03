import type { Metadata } from 'next';

import NoteForm from '@/components/NoteForm/NoteForm';

import css from './page.module.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const createUrl = `${siteUrl}/notes/action/create`;

const createMetadata = {
  title: 'Create note | NoteHub',
  description: 'Create a new note in NoteHub.',
  url: createUrl,
  openGraph: {
    title: 'Create note | NoteHub',
    description: 'Create a new note in NoteHub.',
    url: createUrl,
    images: ['https://ac.goit.global/fullstack/react/notehub-og-meta.jpg'],
  },
};

export const metadata: Metadata = createMetadata as unknown as Metadata;

export default function CreateNotePage() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Create note</h1>
        <NoteForm />
      </div>
    </main>
  );
}


