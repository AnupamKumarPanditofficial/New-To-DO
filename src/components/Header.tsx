'use client';

import { useRouter } from 'next/navigation';
import { LogOut, LayoutList } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import type { User } from '@/lib/types';

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('facetask_session');
    router.push('/');
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center max-w-7xl mx-auto">
        <div className="mr-4 flex">
          <a className="mr-6 flex items-center space-x-2" href="/todo">
            <LayoutList className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline sm:inline-block">
              FaceTask
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="flex items-center gap-3">
              {user && (
                 <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.faceDataUri} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                 </div>
              )}
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
