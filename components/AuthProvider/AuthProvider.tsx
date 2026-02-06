'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import Loading from '@/components/Loading/Loading';
import { checkSession, getMe, logout } from '@/lib/api/clientApi';
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
    checkSession()
      .then(async (success) => {
        if (!success) return;
        const me = await getMe();
        setUser(me);
      })
      .catch(() => {
      });
  }, [setUser]);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      if (!isPrivatePath(pathname)) return;

      setIsChecking(true);
      try {
        const success = await checkSession();
        if (!isMounted) return;

        if (success) {
          const me = await getMe();
          if (!isMounted) return;
          setUser(me);
          return;
        }

        clearIsAuthenticated();
        try {
          await logout();
        } catch {
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


