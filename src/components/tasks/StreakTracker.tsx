'use client';

import { CalendarCheck, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface StreakTrackerProps {
    dayCount: number;
    missedDays: number;
}

export default function StreakTracker({ dayCount, missedDays }: StreakTrackerProps) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary">
                <CalendarCheck className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg text-primary">Day {dayCount}</span>
            </div>
            {missedDays > 0 && (
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 cursor-pointer">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                <span className="font-bold text-lg text-destructive">{missedDays}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>You missed {missedDays} day{missedDays > 1 ? 's' : ''}! Keep it up!</p>
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            )}
        </div>
    )
}
