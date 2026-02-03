import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getMe } from '@/lib/api/serverApi';

import css from './page.module.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const profileUrl = `${siteUrl}/profile`;

export const metadata: Metadata = {
  title: 'Profile Page | NoteHub',
  description: 'Your NoteHub profile page.',
  openGraph: {
    title: 'Profile Page | NoteHub',
    description: 'Your NoteHub profile page.',
    url: profileUrl,
    images: ['https://ac.goit.global/fullstack/react/notehub-og-meta.jpg'],
  },
};

export default async function ProfilePage() {
  try {
    const user = await getMe();

    return (
      <main className={css.mainContent}>
        <div className={css.profileCard}>
          <div className={css.header}>
            <h1 className={css.formTitle}>Profile Page</h1>
            <Link href="/profile/edit" className={css.editProfileButton} prefetch={false}>
              Edit Profile
            </Link>
          </div>
          <div className={css.avatarWrapper}>
            <img
              src={user.avatar || 'Avatar'}
              alt="User Avatar"
              width={120}
              height={120}
              className={css.avatar}
            />
          </div>
          <div className={css.profileInfo}>
            <p>Username: {user.username ?? 'your_username'}</p>
            <p>Email: {user.email ?? 'your_email@example.com'}</p>
          </div>
        </div>
      </main>
    );
  } catch {
    redirect('/sign-in');
  }
}


