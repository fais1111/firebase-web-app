'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Search,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Logo from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  {
    href: '#',
    label: 'Our Services',
    dropdown: [
      { href: '/services/accident-management', label: 'Accident Management' },
      { href: '/services/suicide-prevention', label: 'Suicide Prevention' },
      { href: '/services/cyber-security', label: 'Cyber Security' },
      { href: '/services/disaster-management', label: 'Disaster Management' },
      { href: '/resources', label: 'Resource Hub' },
    ],
  },
  { href: '/about', label: 'About' },
  { href: '/help', label: 'Help' },
];

function UserNav() {
    const { user } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut(auth);
        router.push('/');
    };

    if (!user) return null;

    const userInitial = user.email ? user.email.charAt(0).toUpperCase() : '?';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.email || 'User'} />
                        <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex flex-col items-start" disabled>
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) =>
            link.dropdown ? (
              <DropdownMenu key={link.label}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1">
                    {link.label}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {link.dropdown.map((item) => (
                    <DropdownMenuItem key={item.label} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button key={link.label} variant="ghost" asChild>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search..."
                className="pr-8 h-9"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            { user ? <UserNav /> : (
                <>
                    <Button variant="ghost" asChild>
                        <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </>
            )}
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
                { user ? <UserNav /> : <Menu /> }
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b pb-4">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <Logo />
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X />
                  </Button>
                </div>
                <nav className="flex flex-col gap-4 py-8">
                  {navLinks.map((link) => (
                    <div key={link.label}>
                      {link.dropdown ? (
                        <>
                         <p className='font-semibold px-4'>{link.label}</p>
                         <div className='flex flex-col pl-8'>
                          {link.dropdown.map((item) => (
                              <Link
                                key={item.label}
                                href={item.href}
                                className="text-muted-foreground hover:text-foreground py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {item.label}
                              </Link>
                            ))}
                         </div>
                        </>

                      ) : (
                        <Link
                          href={link.href}
                          className="font-semibold text-lg px-4 py-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
                <div className="mt-auto border-t pt-4 space-y-4">
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pr-8"
                    />
                    <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  { !user && (
                    <div className='flex flex-col gap-2'>
                      <Button variant="outline" asChild className='w-full'>
                          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                      </Button>
                      <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                          <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
