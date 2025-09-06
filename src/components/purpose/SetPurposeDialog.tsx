'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Purpose } from '@/lib/types';
import { BookOpenCheck, Users, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


interface SetPurposeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPurposeSet: (purposeData: Purpose) => void;
  currentPurpose: Purpose | null;
}

export default function SetPurposeDialog({
  isOpen,
  onOpenChange,
  onPurposeSet,
  currentPurpose,
}: SetPurposeDialogProps) {
  const [purpose, setPurpose] = useState<'normal' | 'exams'>('normal');
  const [examName, setExamName] = useState('');
  const [duration, setDuration] = useState<string>('30');
  const { toast } = useToast();

  useEffect(() => {
    if (currentPurpose) {
      setPurpose(currentPurpose.type);
      setExamName(currentPurpose.examName || '');
      setDuration(String(currentPurpose.examDuration || '30'));
    }
  }, [currentPurpose]);

  const handleSubmit = () => {
    if (purpose === 'exams' && !examName.trim()) {
      toast({
        title: "Exam Name Required",
        description: "Please enter the name of the exam.",
        variant: "destructive",
      });
      return;
    }

    const purposeData: Purpose = {
      type: purpose,
      examName: purpose === 'exams' ? examName : undefined,
      examDuration: purpose === 'exams' ? (parseInt(duration) as Purpose['examDuration']) : undefined,
    };
    onPurposeSet(purposeData);
  };
  
  const handleOpenChange = (open: boolean) => {
    // Prevent closing if it's the first time and no purpose is set
    if (!open && !currentPurpose) {
        toast({
            title: "Please set a purpose",
            description: "To get the best experience, please tell us your goal.",
            variant: "destructive"
        })
        return;
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="text-primary" />
            What's Your Main Goal?
          </DialogTitle>
          <DialogDescription>
            This helps us tailor AI suggestions just for you. You can change this later.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <RadioGroup value={purpose} onValueChange={(value) => setPurpose(value as 'normal' | 'exams')}>
            <div className="flex items-center space-x-2 p-4 border rounded-md has-[:checked]:bg-accent/20 has-[:checked]:border-accent">
               <RadioGroupItem value="normal" id="normal" />
               <Label htmlFor="normal" className="flex items-center gap-2 font-normal text-base cursor-pointer">
                <Users /> General Productivity
               </Label>
            </div>
             <div className="flex items-center space-x-2 p-4 border rounded-md has-[:checked]:bg-accent/20 has-[:checked]:border-accent">
               <RadioGroupItem value="exams" id="exams" />
               <Label htmlFor="exams" className="flex items-center gap-2 font-normal text-base cursor-pointer">
                <BookOpenCheck /> Exam Preparation
               </Label>
            </div>
          </RadioGroup>

          {purpose === 'exams' && (
            <div className="space-y-4 p-4 border-l-4 border-accent bg-accent/10 rounded-r-md">
              <div className="space-y-2">
                <Label htmlFor="exam-name">Which exam are you preparing for?</Label>
                <Input
                  id="exam-name"
                  placeholder="e.g., PMP Certification, SATs"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Preparation Duration</Label>
                 <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="duration">
                        <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="60">60 Days</SelectItem>
                        <SelectItem value="90">90 Days</SelectItem>
                        <SelectItem value="120">120 Days</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
