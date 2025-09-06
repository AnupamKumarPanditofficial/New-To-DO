'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  className?: string;
}

export interface WebcamCaptureRef {
  capture: () => void;
}

type CameraState = 'loading' | 'on' | 'off' | 'denied' | 'error';

const WebcamCapture = forwardRef<WebcamCaptureRef, WebcamCaptureProps>(
  ({ onCapture, className }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraState, setCameraState] = useState<CameraState>('loading');
    const { toast } = useToast();

    const startCamera = async () => {
      setCameraState('loading');
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setCameraState('on');
        } catch (err: any) {
          console.error('Error accessing camera:', err);
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setCameraState('denied');
          } else {
            setCameraState('error');
          }
        }
      } else {
        setCameraState('error');
      }
    };

    const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
        setCameraState('off');
      }
    };

    const handleToggleCamera = () => {
      if (cameraState === 'on') {
        stopCamera();
      } else {
        startCamera();
      }
    };
    
    useEffect(() => {
      startCamera();
      return () => {
        stopCamera();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const capture = () => {
      if (cameraState !== 'on' || !videoRef.current || !canvasRef.current) {
         toast({
            title: 'Camera Not Ready',
            description: 'Please turn on your camera and grant permissions before capturing.',
            variant: 'destructive',
          });
        onCapture(''); 
        return;
      }
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        onCapture(dataUri);
      } else {
        onCapture('');
      }
    };

    useImperativeHandle(ref, () => ({
      capture,
    }));

    return (
      <div className={cn('w-full flex flex-col items-center gap-4', className)}>
        <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border border-border shadow-inner">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn('w-full h-full object-cover transition-opacity duration-300', cameraState === 'on' ? 'opacity-100' : 'opacity-0')}
          />
          {cameraState !== 'on' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
              {cameraState === 'denied' ? (
                <Alert variant="destructive" className="text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Camera Access Denied</AlertTitle>
                  <AlertDescription>
                    Please enable camera permissions in your browser settings to use this feature.
                  </AlertDescription>
                </Alert>
              ) : cameraState === 'error' ? (
                 <Alert variant="destructive" className="text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Camera Error</AlertTitle>
                  <AlertDescription>
                    Could not access the camera. It might be in use by another application or not supported by your browser.
                  </AlertDescription>
                </Alert>
              ) : cameraState === 'loading' ? (
                 <p>Starting camera...</p>
              ) : (
                <>
                  <CameraOff className="w-10 h-10 mb-2" />
                  <p>Camera is off</p>
                </>
              )}
            </div>
          )}
        </div>
        <Button onClick={handleToggleCamera} variant="outline" size="sm" disabled={cameraState === 'denied' || cameraState === 'loading'}>
          {cameraState === 'on' ? <CameraOff className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />}
          {cameraState === 'on' ? 'Turn Camera Off' : 'Turn Camera On'}
        </Button>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }
);

WebcamCapture.displayName = 'WebcamCapture';
export default WebcamCapture;
