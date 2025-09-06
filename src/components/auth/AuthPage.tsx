'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [authState, setAuthState] = useState<'loading' | 'register' | 'login'>('loading');
  const router = useRouter();

  useEffect(() => {
    // This effect runs only on the client
    const user = localStorage.getItem('facetask_user');
    const session = localStorage.getItem('facetask_session');
    
    if (session) {
      router.replace('/todo');
    } else if (user) {
      setAuthState('login');
    } else {
      setAuthState('register');
    }
  }, [router]);

  if (authState === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Checking your session...</p>
      </div>
    );
  }

  return authState === 'register' ? <RegisterForm /> : <LoginForm />;
}
