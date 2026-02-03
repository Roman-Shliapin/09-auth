'use client';

import css from './filter.layout.module.css';
import { useParams } from 'next/navigation';

type Props = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
};

const NotesLayout = ({ children, sidebar }: Props) => {
  const params = useParams<{ slug?: string[] | string }>();
  const rawSlug = params?.slug;
  const activeTag = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  return (
    <section className={css.layout} data-active-tag={activeTag}>
      <aside className={css.sidebar}>{sidebar}</aside>
      <div className={css.content}>{children}</div>
    </section>
  );
};

export default NotesLayout;

