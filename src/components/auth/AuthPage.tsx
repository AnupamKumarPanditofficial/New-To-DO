'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import { Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';

export default function AuthPage() {
  const [authState, setAuthState] = useState<'loading' | 'register' | 'login'>('loading');
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // This effect runs only on the client
    const session = localStorage.getItem('facetask_session');
    if (session) {
      router.replace('/todo');
      return;
    }
    
    const storedUser = localStorage.getItem('facetask_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setAuthState('login');
    } else {
      setAuthState('register');
    }
  }, [router]);

  const handleSwitchToRegister = useCallback(() => {
    localStorage.clear();
    setUser(null);
    setAuthState('register');
  }, []);
  
  const handleRegistrationComplete = useCallback(() => {
    router.push('/todo');
  }, [router]);

  if (authState === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Checking your session...</p>
      </div>
    );
  }

  if (authState === 'register') {
    return <RegisterForm onRegistrationComplete={handleRegistrationComplete} />;
  }

  if (authState === 'login' && user) {
    return <LoginForm user={user} onSwitchToRegister={handleSwitchToRegister} />;
  }

  // Fallback to register if something is out of sync
  return <RegisterForm onRegistrationComplete={handleRegistrationComplete} />;
}
