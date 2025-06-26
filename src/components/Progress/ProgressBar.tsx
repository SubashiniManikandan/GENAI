import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressStep {
  step: string;
  completed: boolean;
  inProgress?: boolean;
  icon?: typeof CheckCircle;
}

interface ProgressBarProps {
  steps: ProgressStep[];
  className?: string;
}

export default function ProgressBar({ steps, className }: ProgressBarProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((stepData, index) => {
        const Icon = stepData.completed ? CheckCircle : 
                   stepData.inProgress ? Clock : 
                   stepData.icon || AlertCircle;
        
        const isLast = index === steps.length - 1;
        
        return (
          <div key={index} className="relative">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                stepData.completed ? "bg-success text-success-foreground" :
                stepData.inProgress ? "bg-warning text-warning-foreground" :
                "bg-slate-300 text-slate-500"
              )}>
                <Icon className="h-6 w-6" />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <p className={cn(
                  "font-semibold transition-colors",
                  stepData.completed ? "text-success" :
                  stepData.inProgress ? "text-warning" :
                  "text-slate-800"
                )}>
                  {stepData.step}
                </p>
                <p className="text-sm text-slate-600">
                  {stepData.completed ? "Completed" :
                   stepData.inProgress ? "In Progress" :
                   "Pending"}
                </p>
              </div>
            </div>
            
            {/* Connector Line */}
            {!isLast && (
              <div className={cn(
                "absolute left-6 top-12 w-0.5 h-8 transition-colors",
                stepData.completed ? "bg-success" : "bg-slate-300"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
