'use client';

import { useUser } from '@/firebase';
import { type User } from 'firebase/auth';

const ADMIN_EMAIL = 'techworldinfo98@gmail.com';

type AuthResult = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
};

export function useAuth(): AuthResult {
  const { user, isUserLoading } = useUser();

  const isAdmin = user?.email === ADMIN_EMAIL;

  return { user, isLoading: isUserLoading, isAdmin };
}
