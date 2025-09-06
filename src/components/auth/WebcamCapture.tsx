'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  className?: string;
}

export interface WebcamCaptureRef {
  capture: () => void;
}

const WebcamCapture = forwardRef<WebcamCaptureRef, WebcamCaptureProps>(
  ({ onCapture, className }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setIsCameraOn(true);
          setError(null);
        } catch (err) {
          console.error('Error accessing camera:', err);
          setError('Could not access the camera. Please check permissions.');
          setIsCameraOn(false);
        }
      } else {
        setError('Your browser does not support camera access.');
      }
    };

    const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
        setIsCameraOn(false);
      }
    };

    const handleToggleCamera = () => {
      if (isCameraOn) {
        stopCamera();
      } else {
        startCamera();
      }
    };
    
    useEffect(() => {
      // Automatically start camera on mount
      startCamera();
      return () => {
        stopCamera();
      };
    }, []);

    const capture = () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          const dataUri = canvas.toDataURL('image/jpeg');
          onCapture(dataUri);
        }
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
            className={cn('w-full h-full object-cover transition-opacity duration-300', isCameraOn ? 'opacity-100' : 'opacity-0')}
          />
          {!isCameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
              {error ? (
                <>
                  <AlertCircle className="w-10 h-10 mb-2 text-destructive" />
                  <p className="text-sm">{error}</p>
                </>
              ) : (
                <>
                  <CameraOff className="w-10 h-10 mb-2" />
                  <p>Camera is off</p>
                </>
              )}
            </div>
          )}
        </div>
        <Button onClick={handleToggleCamera} variant="outline" size="sm">
          {isCameraOn ? <CameraOff className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />}
          {isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
        </Button>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }
);

WebcamCapture.displayName = 'WebcamCapture';
export default WebcamCapture;
