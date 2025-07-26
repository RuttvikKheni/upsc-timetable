import React from "react";

import { Check } from "lucide-react";

import { cn } from "../../lib/utils";

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
                      "bg-primary text-primary-foreground border-primary md:ring md:ring-primary/20":
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
                      "after:bg-[#e2e8f0] after:w-0.5 after:absolute after:h-[calc(100%-10px)] after:rotate-90 after:top-1.5 min-[369px]:after:ml-1 min-[389px]:after:ml-1 min-[400px]:after:ml-[5px] min-[410px]:after:ml-1.5 min-[421px]:after:ml-2 min-[455px]:after:ml-2.5 min-[485px]:after:ml-3 min-[520px]:after:ml-4 min-[545px]:after:ml-5 sm:after:ml-6 min-[665px]:after:ml-7 min-[668px]:after:ml-8 md:after:ml-10 lg:after:ml-5":
                        index !== steps.length - 1,
                      "after:bg-primary after:w-0.5 after:top-1/2 after:-translate-y-1/2":
                        currentStep === -1,
                      "after:bg-primary after:border-none": isCompleted,
                      "after:bg-[#e2e8f0] after:border-none": isUpcoming,
                    }
                  )}
                >
                  <span className="hidden lg:inline">
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
