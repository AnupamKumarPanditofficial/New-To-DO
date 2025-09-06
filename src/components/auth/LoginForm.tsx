'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { facialRecognitionLogin } from '@/ai/flows/facial-recognition-login';
import WebcamCapture, { WebcamCaptureRef } from './WebcamCapture';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { Loader2, LogIn, User as UserIcon } from 'lucide-react';

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const webcamRef = useRef<WebcamCaptureRef>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('facetask_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // This case should ideally not happen if AuthPage logic is correct
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast({
        title: 'Error',
        description: 'Could not load user data. Please try registering again.',
        variant: 'destructive',
      });
      localStorage.removeItem('facetask_user');
      router.push('/');
    }
  }, [router, toast]);
  

  const handleLogin = () => {
    setIsLoading(true);
    webcamRef.current?.capture();
  };

  const handleCapture = async (imageSrc: string) => {
    if (!user) {
      toast({
        title: 'Login Error',
        description: 'User data is not loaded. Cannot attempt login.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await facialRecognitionLogin({ photoDataUri: imageSrc });

      if (result.isLoginSuccessful) {
        localStorage.setItem('facetask_session', JSON.stringify({ userId: user.id }));
        toast({
          title: 'Login Successful!',
          description: `Welcome back, ${user.name}!`,
        });
        router.push('/todo');
      } else {
         toast({
          title: 'Login Failed',
          description: 'We could not recognize your face. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'Login Failed',
        description: 'An error occurred during facial recognition. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle>Loading User...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
         <UserIcon /> Welcome Back, {user.name}!
        </CardTitle>
        <CardDescription>Login instantly by showing your face to the camera.</CardDescription>
      </CardHeader>
      <CardContent>
        <WebcamCapture ref={webcamRef} onCapture={handleCapture} />
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...
            </>
          ) : (
            <><LogIn className="mr-2 h-4 w-4" /> Login with Face</>
          )}
        </Button>
        <Button variant="link" size="sm" onClick={() => {
            localStorage.clear();
            router.push('/');
        }}>
            Not you? Register a new user.
        </Button>
      </CardFooter>
    </Card>
  );
}
