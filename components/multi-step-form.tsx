"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepProgress } from "./ui/step-progress";
import { BasicInfo } from "./steps/basic-info";
import { PastPreparation } from "./steps/past-preparation";
import { CurrentStatus } from "./steps/current-status";
import { DailySchedule } from "./steps/daily-schedule";
import { Personality } from "./steps/personality";
import { Review } from "./steps/review";

const TIMETABLE_STORAGE_KEY = 'upsc_timetable_data';

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

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
      title: "Personality",
      component: Personality,
    },
    {
      title: "Schedule",
      component: DailySchedule,
    },
    { title: "Review", component: Review },
  ];

  const stepTitles = steps.map(step => step.title);

  // Check localStorage for existing timetable data on component mount
  useEffect(() => {
    const checkStoredTimetable = () => {
      try {
        const storedData = localStorage.getItem(TIMETABLE_STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.generatedTimetable && parsedData.generatedTimetable.length > 0) {
            setFormData(parsedData);
            setCurrentStep(4); // Skip to review step (index 4)
          }
        }
      } catch (error) {
        console.error('Error loading stored timetable data:', error);
        // Clear corrupted data
        localStorage.removeItem(TIMETABLE_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredTimetable();
  }, []);

  const updateFormData = (newData: any) => {
    const updatedData = { ...formData, ...newData };
    setFormData(updatedData);

    // Save to localStorage if timetable data is present
    if (updatedData.generatedTimetable && updatedData.generatedTimetable.length > 0) {
      try {
        localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(updatedData));
      } catch (error) {
        console.error('Error saving timetable data to localStorage:', error);
      }
    }
  };

  const handleRegenerate = (newTimetableData: any) => {
    // Update the form data with the new timetable data
    // The API returns { timetable: [...] } but we need { generatedTimetable: [...] }
    const updatedFormData = {
      ...formData,
      generatedTimetable: newTimetableData.timetable || newTimetableData.generatedTimetable
    };
    setFormData(updatedFormData);

    // Save regenerated data to localStorage
    try {
      localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(updatedFormData));
    } catch (error) {
      console.error('Error saving regenerated timetable data to localStorage:', error);
    }
  };

  const clearStoredData = () => {
    try {
      localStorage.removeItem(TIMETABLE_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing stored data:', error);
    }
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

  // Show loading state while checking localStorage
  if (isLoading) {
    return (
      <div className="mt-[70px] mb-[110px] sm:mb-[90px] w-full">
        <div className="max-w-full sm:max-w-4xl container mx-auto px-4 sm:px-6 pt-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[70px] mb-[110px] sm:mb-[90px] w-full">
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
                onClearData={clearStoredData}
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