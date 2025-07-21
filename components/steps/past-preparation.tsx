import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { ArrowLeft, ArrowRight, Award, BarChart3, Check, CheckCheck, FileCheck, GraduationCap, MessageSquareX, X } from "lucide-react";
import { pastPreparationValidationSchema } from "../../schema/schema";


interface PastPreparationProps {
  data: any;
  updateData: (data: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}


export function PastPreparation({
  data,
  updateData,
  nextStep,
  prevStep,
}: PastPreparationProps) {
  const [formData, setFormData] = useState({
    attemptedBefore: data.attemptedBefore || "",
    prelimsScore: data.prelimsScore || "",
    clearedMains: data.clearedMains || "",
    mainsScore: data.mainsScore || "",
    academicQualification: data.academicQualification || "",
    academicPerformance: data.academicPerformance || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await pastPreparationValidationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      updateData(formData);
      nextStep();
      localStorage.setItem("basicInfo", JSON.stringify(Object.assign(formData, data)));
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const newErrors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            newErrors[err.path] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };
  useEffect(() => {
    const storedData = localStorage.getItem("basicInfo");
    if (storedData) {
      setFormData(JSON.parse(storedData));
    }
  }, []);

  const attemptedOptions = [
    { id: "attempted-yes", value: "yes", label: "Yes", icon: <Check className="w-[14px] h-[14px] mr-2" /> },
    { id: "attempted-no", value: "no", label: "No", icon: <X className="w-[14px] h-[14px] mr-2" /> },
  ]

  const clearedOptions = [
    { id: "mains-yes", value: "yes", label: "Yes", icon: <Check className="w-[14px] h-[14px] mr-2" /> },
    { id: "mains-no", value: "no", label: "No", icon: <X className="w-[14px] h-[14px] mr-2" /> },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6 w-full mx-auto bg-white rounded-md p-4 sm:p-6 my-4 sm:my-6">
        <h1 className="text-base md:text-lg lg:text-xl font-semibold text-center">Past Preparation</h1>
        <p className="text-[13px] sm:text-[15px] text-center !mt-1 sm:!mt-2">Tell us about your previous UPSC preparation experience</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="space-y-2">
              <Label className="text-[13px] sm:text-[15px] !font-medium flex items-center gap-1.5">
                <FileCheck className="w-4 h-4" />
                Have you attempted UPSC before?
              </Label>
              <div className="space-y-2">
                <RadioGroup
                  value={formData.attemptedBefore}
                  onValueChange={(value) => {
                    setFormData({ ...formData, attemptedBefore: value });
                    if (errors.attemptedBefore) {
                      setErrors({ ...errors, attemptedBefore: "" });
                    }
                  }}
                  className="flex gap-3"
                >
                  {attemptedOptions.map((option) => (
                    <RadioGroupItem
                      key={option.id}
                      value={option.value}
                      id={option.id}
                      className="sr-only"
                    />
                  ))}
                  {attemptedOptions.map((option) => {
                    const isSelected = formData.attemptedBefore === option.value
                    return (
                      <label
                        key={option.id}
                        htmlFor={option.id}
                        className={`flex items-center px-3 sm:px-4 py-1 sm:py-[7px] rounded-sm border cursor-pointer text-[13px] sm:text-sm font-medium transition-colors text-nowrap select-none ${isSelected
                          ? "bg-primary/10 text-primary border-primary"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                          }`}
                      >
                        {option.icon}
                        {option.label}
                      </label>
                    )
                  })}
                </RadioGroup>
                {errors.attemptedBefore && (
                  <p className="text-red-500 text-xs mt-1">{errors.attemptedBefore}</p>
                )}
              </div>
            </div>
            {formData.attemptedBefore === "yes" && (
              <div className="space-y-2 mt-2">
                <ul className="arrow-list">
                  <li>
                    <Label htmlFor="prelimsScore" className="text-[13px] sm:text-[15px]">
                      {"What was your last attempt's Prelims Score?"}
                    </Label>
                  </li>
                </ul>
                <div className="pl-5">
                  <Input
                    id="prelimsScore"
                    value={formData.prelimsScore}
                    onChange={(e) => {
                      setFormData({ ...formData, prelimsScore: e.target.value });
                      if (errors.prelimsScore) {
                        setErrors({ ...errors, prelimsScore: "" });
                      }
                    }}
                    placeholder="Enter Prelims Score"
                    className={errors.prelimsScore ? "border-red-500" : ""}
                  />
                  {errors.prelimsScore && (
                    <p className="text-red-500 text-xs mt-1">{errors.prelimsScore}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="!m-0 col-span-2 sm:col-span-1">
            <div className="space-y-2">
              <Label className="text-[13px] sm:text-[15px] !font-medium flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                Have you cleared Mains before?
              </Label>
              <div className="space-y-2">
                <RadioGroup
                  value={formData.clearedMains}
                  onValueChange={(value) => {
                    setFormData({ ...formData, clearedMains: value });
                    if (errors.clearedMains) {
                      setErrors({ ...errors, clearedMains: "" });
                    }
                  }}
                  className="flex gap-3"
                >
                  {clearedOptions.map((option) => (
                    <RadioGroupItem
                      key={option.id}
                      value={option.value}
                      id={option.id}
                      className="sr-only"
                    />
                  ))}
                  {clearedOptions.map((option) => {
                    const isSelected = formData.clearedMains === option.value
                    return (
                      <label
                        key={option.id}
                        htmlFor={option.id}
                        className={`flex items-center px-3 sm:px-4 py-1 sm:py-[7px] rounded-sm border cursor-pointer text-[13px] sm:text-sm font-medium transition-colors text-nowrap select-none ${isSelected
                          ? "bg-primary/10 text-primary border-primary"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                          }`}
                      >
                        {option.icon}
                        {option.label}
                      </label>
                    )
                  })}
                </RadioGroup>
                {errors.clearedMains && (
                  <p className="text-red-500 text-xs mt-1">{errors.clearedMains}</p>
                )}
              </div>
            </div>

            {formData.clearedMains === "yes" && (
              <div className="space-y-2 mt-2">
                <ul className="arrow-list">
                  <li>
                    <Label htmlFor="mainsScore" className="text-[13px] sm:text-[15px]">
                      {"What was your last attempt's Mains Score?"}
                    </Label>
                  </li>
                </ul>
                <div className="pl-5">
                  <Input
                    id="mainsScore"
                    value={formData.mainsScore}
                    onChange={(e) => {
                      setFormData({ ...formData, mainsScore: e.target.value });
                      if (errors.mainsScore) {
                        setErrors({ ...errors, mainsScore: "" });
                      }
                    }}
                    placeholder="Enter Mains Score"
                    className={errors.mainsScore ? "border-red-500" : ""}
                  />
                  {errors.mainsScore && (
                    <p className="text-red-500 text-xs mt-1">{errors.mainsScore}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 col-span-2">
            <Label className="text-[13px] sm:text-[15px] !font-medium flex items-center gap-1.5" htmlFor="academicQualification">
              <GraduationCap className="w-4 h-4" />
              Your highest academic qualification and the field of study
            </Label>
            <div>
              <Textarea
                id="academicQualification"
                value={formData.academicQualification}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    academicQualification: e.target.value,
                  });
                  if (errors.academicQualification) {
                    setErrors({ ...errors, academicQualification: "" });
                  }
                }}
                placeholder="e.g. B.Tech in Computer Science"
                className={errors.academicQualification ? "border-red-500" : ""}
              />
              {errors.academicQualification && (
                <p className="text-red-500 text-xs mt-1">{errors.academicQualification}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <Label className="text-[13px] sm:text-[15px] !font-medium flex items-center gap-1.5" htmlFor="academicPerformance">
              <BarChart3 className="w-4 h-4" />
              Your past academic performance in school & college (percentage or
              CGPA)
            </Label>
            <div>
              <Textarea
                id="academicPerformance"
                value={formData.academicPerformance}
                onChange={(e) => {
                  setFormData({ ...formData, academicPerformance: e.target.value });
                  if (errors.academicPerformance) {
                    setErrors({ ...errors, academicPerformance: "" });
                  }
                }}
                placeholder="e.g. 85% in school, 8.2 CGPA in college"
                className={errors.academicPerformance ? "border-red-500" : ""}
              />
              {errors.academicPerformance && (
                <p className="text-red-500 text-xs mt-1">{errors.academicPerformance}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center gap-2 mx-4">
        <Button type="button" variant="outline" className="gap-1 sm:gap-1.5" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <span className="text-xs sm:text-sm">Step 2 of 5</span>
        <Button type="submit" className="gap-1 sm:gap-1.5">
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
