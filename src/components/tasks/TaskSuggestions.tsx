'use client';

import { useState, useMemo } from 'react';
import { suggestTasks } from '@/ai/flows/suggest-tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit, Loader2, Sparkles, Plus, BookOpenCheck } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Purpose } from '@/lib/types';

interface TaskSuggestionsProps {
  onAddTask: (title: string, dueDate: Date) => void;
  purpose: Purpose | null;
}

const baseSuggestionCategories = [
  { label: 'Feeling Sad', prompt: 'feeling sad', icon: '😔' },
  { label: 'Feeling Tired', prompt: 'feeling tired', icon: '😴' },
  { label: 'Feeling Bored', prompt: 'feeling bored', icon: '😵' },
];

export default function TaskSuggestions({ onAddTask, purpose }: TaskSuggestionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const suggestionCategories = useMemo(() => {
    if (purpose?.type === 'exams' && purpose.examName) {
      return [
        ...baseSuggestionCategories,
        { 
          label: `Look at today's list for preparation of ${purpose.examName}`, 
          prompt: `daily tasks for preparing for the ${purpose.examName} exam`, 
          icon: <BookOpenCheck className="h-4 w-4" /> 
        },
      ];
    }
    return [
        ...baseSuggestionCategories,
        { label: 'Get Productive', prompt: 'a desire to be productive', icon: '🚀' },
    ];
  }, [purpose]);

  const handleGetSuggestions = async (prompt: string) => {
    setIsLoading(true);
    setIsDialogOpen(true);
    try {
      const response = await suggestTasks({ prompt });
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch suggestions. Please try again.',
        variant: 'destructive',
      });
      setIsDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = (suggestion: string) => {
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to noon today
    onAddTask(suggestion, today);
    toast({
      title: 'Task Added!',
      description: `"${suggestion}" has been added to your list.`,
    });
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <Sparkles className="text-primary" />
            Need some inspiration?
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {suggestionCategories.map(({ label, prompt, icon }) => (
            <Button
              key={prompt}
              variant="outline"
              onClick={() => handleGetSuggestions(prompt)}
              disabled={isLoading}
              className="flex items-center"
            >
              <span className="mr-2">{icon}</span>
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <BrainCircuit className="text-accent" />
              AI-Powered Suggestions
            </AlertDialogTitle>
            <AlertDialogDescription>
              Here are a few ideas to get you started. Add any you like to your task list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4">Thinking...</p>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50">
                  <p className="flex-grow">{suggestion}</p>
                  <Button size="sm" onClick={() => handleAddTask(suggestion)} variant="secondary" className="bg-accent hover:bg-accent/90">
                    <Plus className="mr-2 h-4 w-4"/> Add Task
                  </Button>
                </div>
              ))}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
