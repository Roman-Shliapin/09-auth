'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import Loading from '@/components/Loading/Loading';
import { checkSession, logout } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

type Props = {
  children: React.ReactNode;
};

function isPrivatePath(pathname: string) {
  return pathname.startsWith('/profile') || pathname.startsWith('/notes');
}

function isAuthPath(pathname: string) {
  return pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
}

export default function AuthProvider({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const setUser = useAuthStore((s) => s.setUser);
  const clearIsAuthenticated = useAuthStore((s) => s.clearIsAuthenticated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Non-blocking bootstrap: helps render correct header state on public pages too.
    // We don't show a loader here to avoid flashing the whole UI.
    checkSession()
      .then((user) => {
        if (user) setUser(user);
      })
      .catch(() => {
        // ignore
      });
  }, [setUser]);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      if (!isPrivatePath(pathname)) return;

      setIsChecking(true);
      try {
        const user = await checkSession();
        if (!isMounted) return;

        if (user) {
          setUser(user);
          return;
        }

        // Not authorized on a private route → logout + redirect to login
        clearIsAuthenticated();
        try {
          await logout();
        } catch {
          // ignore
        }
        router.replace('/sign-in');
      } finally {
        if (isMounted) setIsChecking(false);
      }
    }

    run();
    return () => {
      isMounted = false;
    };
  }, [pathname, clearIsAuthenticated, router, setUser]);

  useEffect(() => {
    if (isAuthPath(pathname) && isAuthenticated) {
      router.replace('/profile');
    }
  }, [isAuthenticated, pathname, router]);

  if (isChecking) return <Loading />;
  return children;
}


