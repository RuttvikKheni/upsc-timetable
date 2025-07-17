import React from "react";
import { cn } from "../../lib/utils";
import { Check } from "lucide-react";

interface StepProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepProgress({
  steps,
  currentStep,
  className,
}: StepProgressProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {/* Background line */}
        <div
          className="absolute top-4 h-0.5 bg-muted"
          style={{ 
            transform: "translateY(-50%)",
            left: "32px",
            right: "32px"
          }}
        />
        
        {/* Progress line */}
        <div
          className="absolute top-4 h-0.5 bg-primary transition-all duration-500"
          style={{ 
            transform: "translateY(-50%)",
            left: "32px",
            width: currentStep === 0 ? "0px" : `calc(${(currentStep / (steps.length - 1)) * 100}% - ${currentStep > 2 ? "60px" : "32px"})`
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;

            return (
              <div key={index} className="flex flex-col items-center">
                {/* Step circle */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 mb-2 relative z-10 bg-white border-2",
                    {
                      "bg-primary text-primary-foreground border-primary": isCompleted,
                      "bg-primary text-primary-foreground border-primary ring-4 ring-primary/20":
                        isCurrent,
                      "bg-white text-muted-foreground border-muted": isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </div>

                {/* Step name */}
                <p
                  className={cn(
                    "text-xs font-medium transition-all duration-200 text-center max-w-20",
                    {
                      "text-primary": isCompleted || isCurrent,
                      "text-muted-foreground": isUpcoming,
                    }
                  )}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
