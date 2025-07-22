"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepProgress } from "./ui/step-progress";
import { BasicInfo } from "./steps/basic-info";
import { PastPreparation } from "./steps/past-preparation";
import { CurrentStatus } from "./steps/current-status";
import { DailySchedule } from "./steps/daily-schedule";
import { Review } from "./steps/review";


export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const steps = [
    {
      title: "Basic Info",
      component: BasicInfo,
    },
    {
      title: "Past Prep",
      component: PastPreparation,
    },
    {
      title: "Current Status",
      component: CurrentStatus,
    },
    {
      title: "Schedule",
      component: DailySchedule,
    },
    { title: "Review", component: Review },
  ];

  const stepTitles = steps.map(step => step.title);

  const updateFormData = (newData: any) => {
    setFormData({ ...formData, ...newData });
  };

  const handleRegenerate = (newTimetableData: any) => {
    console.log("handleRegenerate called with:", newTimetableData);
    // Update the form data with the new timetable data
    // The API returns { timetable: [...] } but we need { generatedTimetable: [...] }
    const updatedFormData = {
      ...formData,
      generatedTimetable: newTimetableData.timetable || newTimetableData.generatedTimetable
    };
    console.log("Updated form data:", updatedFormData);
    setFormData(updatedFormData);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;
  return (
    <div className="mt-[70px] mb-[90px] w-full">
      <div className="max-w-full sm:max-w-4xl container mx-auto px-4 sm:px-6 pt-8">
        <StepProgress steps={stepTitles} currentStep={currentStep} />
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === steps.length - 1 ? (
              <Review
                data={{ ...formData, formData }}
                updateData={updateFormData}
                nextStep={nextStep}
                prevStep={prevStep}
                onRegenerate={handleRegenerate}
              />
            ) : (
              <CurrentStepComponent
                data={formData}
                updateData={updateFormData}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 