'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Skeleton } from '@/components/ui/skeleton';

const ADMIN_EMAIL = 'techworldinfo98@gmail.com';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAdmin(user?.email === ADMIN_EMAIL);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
        <div className="w-full container mx-auto p-4">
            <div className='flex justify-between'>
                <Skeleton className="h-12 w-32" />
                <div className='flex gap-4'>
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-12 rounded-full" />
                </div>
            </div>
        </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
