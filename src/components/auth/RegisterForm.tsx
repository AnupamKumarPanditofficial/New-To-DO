'use client';

import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import WebcamCapture, { WebcamCaptureRef } from './WebcamCapture';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { Loader2, UserPlus } from 'lucide-react';

// A simple polyfill for uuid if it's not available
const getUUID = () => (typeof window !== 'undefined' && window.crypto ? crypto.randomUUID() : uuidv4());

interface RegisterFormProps {
  onRegistrationComplete: () => void;
}

export default function RegisterForm({ onRegistrationComplete }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const webcamRef = useRef<WebcamCaptureRef>(null);
  const { toast } = useToast();

  const handleRegister = () => {
    if (!name.trim()) {
      toast({
        title: 'Name is required',
        description: 'Please enter your name to register.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    webcamRef.current?.capture();
  };

  const handleCapture = (imageSrc: string) => {
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
      const newUser: User = {
        id: getUUID(),
        name,
        faceDataUri: imageSrc,
      };
      localStorage.setItem('facetask_user', JSON.stringify(newUser));
      localStorage.setItem('facetask_session', JSON.stringify({ userId: newUser.id }));
      toast({
        title: 'Registration Successful!',
        description: `Welcome, ${name}! Redirecting you now...`,
      });
      onRegistrationComplete();
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: 'Registration Failed',
        description: 'Could not save your information. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
          <UserPlus /> Welcome to Task-Toggler!
        </CardTitle>
        <CardDescription>Let's get you set up. Please enter your name and capture your face for future logins.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Your Name</Label>
          <Input
            id="name"
            placeholder="e.g., Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label>Your Face</Label>
          <WebcamCapture ref={webcamRef} onCapture={handleCapture} />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleRegister} className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
            </>
          ) : (
            'Register and Login'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
