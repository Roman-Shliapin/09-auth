import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const notFoundUrl = `${siteUrl}/404`;

const notFoundMetadata = {
  title: '404 — Page not found | NoteHub',
  description: 'The page you are looking for does not exist.',
  url: notFoundUrl,
  openGraph: {
    title: '404 — Page not found | NoteHub',
    description: 'The page you are looking for does not exist.',
    url: notFoundUrl,
    images: ['https://ac.goit.global/fullstack/react/notehub-og-meta.jpg'],
  },
};

export const metadata: Metadata = notFoundMetadata as unknown as Metadata;

export default function NotFound() {
  return (
    <>
      <h1 className="notFoundTitle">404 - Page not found</h1>
      <p className="notFoundDescription">
        Sorry, the page you are looking for does not exist.
      </p>
    </>
  );
}