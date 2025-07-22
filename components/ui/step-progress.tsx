import React from "react";
import { cn } from "../../lib/utils";
import { Check } from "lucide-react";

interface StepProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
  isVisible?: boolean;
}

export function StepProgress({
  steps,
  currentStep,
  className,
  isVisible = true,
}: StepProgressProps) {
  if (!isVisible) return null;
  return (
    <div className={cn("w-full bg-white px-6 py-4 rounded-md", className)}>
      <div className="relative">
        <div className="relative flex justify-between flex-wrap">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;
            return (
              <div key={index} className="flex gap-1.5 items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 relative z-10 bg-white border-2",
                    {
                      "bg-primary text-primary-foreground border-primary": isCompleted,
                      "bg-primary text-primary-foreground border-primary ring ring-primary/20":
                        isCurrent,
                      "bg-white text-muted-foreground border-muted": isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                <p
                  className={cn(
                    "text-xs font-medium transition-all duration-200 text-center",
                    {
                      "text-primary": isCompleted || isCurrent,
                      "text-muted-foreground": isUpcoming,
                      "after:bg-[#e2e8f0] after:w-0.5 after:absolute after:h-full after:rotate-90 after:top-0 after:ml-2 min-[356px]:after:ml-3 min-[400px]:after:ml-5 min-[500px]:after:ml-7 min-[600px]:after:ml-10 sm:after:ml-14 md:after:ml-6 lg:after:ml-10":
                        index !== steps.length - 1,
                      "after:bg-primary after:w-0.5 after:top-1/2 after:-translate-y-1/2":
                        currentStep === -1,
                      "after:bg-primary after:border-none": isCompleted,
                      "after:bg-[#e2e8f0] after:border-none": isUpcoming,
                    }
                  )}
                >
                  <span className="hidden md:inline">
                    {step}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
