import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { ArrowLeft, ArrowRight, Check, CheckCheck, MessageSquareX, X } from "lucide-react";


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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData(formData);
    nextStep();
    localStorage.setItem("basicInfo", JSON.stringify(Object.assign(formData, data)));
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
            <ul className="arrow-list">
              <li>
                <Label className="text-[13px] sm:text-[15px] !font-medium">Have you attempted UPSC before?</Label>
              </li>
            </ul>
            <div className="space-y-2 pl-5">
              <RadioGroup
                value={formData.attemptedBefore}
                onValueChange={(value) =>
                  setFormData({ ...formData, attemptedBefore: value })
                }
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
                      className={`flex items-center px-3 sm:px-4 py-1 sm:py-[7px] rounded-sm border cursor-pointer text-[13px] sm:text-sm font-medium transition-colors text-nowrap ${isSelected
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
                onChange={(e) =>
                  setFormData({ ...formData, prelimsScore: e.target.value })
                }
                placeholder="Enter Prelims Score"
                required
              />
              </div>
            </div>
          )}
          </div>

         <div className="!m-0 col-span-2 sm:col-span-1">
           <div className="space-y-2">
            <ul className="arrow-list">
              <li>
                <Label className="text-[13px] sm:text-[15px] !font-medium">Have you cleared Mains before?</Label>
              </li>
            </ul>
            <div className="space-y-2 pl-5">
              <RadioGroup
                value={formData.clearedMains}
                onValueChange={(value) =>
                  setFormData({ ...formData, clearedMains: value })
                }
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
                      className={`flex items-center px-3 sm:px-4 py-1 sm:py-[7px] rounded-sm border cursor-pointer text-[13px] sm:text-sm font-medium transition-colors text-nowrap ${isSelected
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
                onChange={(e) =>
                  setFormData({ ...formData, mainsScore: e.target.value })
                }
                placeholder="Enter Mains Score"
                required
              />
              </div>
            </div>
          )}
         </div>

          <div className="space-y-2 col-span-2">
            <ul className="arrow-list">
              <li className="flex"> <Label className="text-[13px] sm:text-[15px] !font-medium" htmlFor="academicQualification">
                Your highest academic qualification and the field of study
              </Label></li>
            </ul>
            <div className="pl-5">
              <Textarea

                id="academicQualification"
                value={formData.academicQualification}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    academicQualification: e.target.value,
                  })
                }
                placeholder="e.g. B.Tech in Computer Science"
                required
              />
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <ul className="arrow-list">
              <li className="flex"> <Label className="text-[13px] sm:text-[15px] !font-medium" htmlFor="academicPerformance">
                Your past academic performance in school & college (percentage or
                CGPA)
              </Label></li>
            </ul>
            <div className="pl-5">
              <Textarea
                id="academicPerformance"
                value={formData.academicPerformance}
                onChange={(e) =>
                  setFormData({ ...formData, academicPerformance: e.target.value })
                }
                placeholder="e.g. 85% in school, 8.2 CGPA in college"
                required
              />
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
