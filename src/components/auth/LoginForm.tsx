'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { facialRecognitionLogin } from '@/ai/flows/facial-recognition-login';
import WebcamCapture, { WebcamCaptureRef } from './WebcamCapture';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { Loader2, LogIn, User as UserIcon } from 'lucide-react';

interface LoginFormProps {
  user: User;
  onSwitchToRegister: () => void;
}

export default function LoginForm({ user, onSwitchToRegister }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const webcamRef = useRef<WebcamCaptureRef>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = () => {
    setIsLoading(true);
    webcamRef.current?.capture();
  };

  const handleCapture = async (imageSrc: string) => {
    if (!imageSrc) {
        toast({
            title: 'Capture Failed',
            description: 'Could not capture an image. Please check your camera and permissions.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }
    try {
      const result = await facialRecognitionLogin({ photoDataUri: imageSrc });
      
      // Stop the camera regardless of the result to turn the light off.
      webcamRef.current?.stopCamera();

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
        <Button variant="link" size="sm" onClick={onSwitchToRegister}>
            Not you? Register a new user.
        </Button>
      </CardFooter>
    </Card>
  );
}
