import React, { useState } from "react";

import * as yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { AlertTriangle, ArrowLeft, ArrowRight, Bookmark, BookText, Calendar, CalendarDays, Check, CheckCircle, CircleFadingPlus, Clock, MinusCircle, Play, Star, Target, X } from "lucide-react";

import { CurrentStatusSchema } from "../../schema/schema";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

const SUBJECTS = [
  "HISTORY",
  "GEOGRAPHY",
  "INDIAN SOCIETY AND SOCIAL JUSTICE",
  "POLITY AND GOVERNANCE",
  "INTERNATIONAL RELATIONS",
  "ECONOMY",
  "ENVIRONMENT AND ECOLOGY",
  "SCIENCE & TECHNOLOGY",
  "DISASTER MANAGEMENT",
  "INTERNAL SECURITY",
  "ETHICS, INTEGRITY & APTITUDE",
  "CSAT",
  "NONE",
];

interface CurrentStatusProps {
  data: any;
  updateData: (data: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}



function generateFutureYears(startYear: number, count: number = 5): string[] {
  return Array.from({ length: count }, (_, i) => String(startYear + 1 + i));
}

export function CurrentStatus({
  data,
  updateData,
  nextStep,
  prevStep,
}: CurrentStatusProps) {
  const [formData, setFormData] = useState({
    preparationStartDate: data.preparationStartDate || null,
    targetYear: data.targetYear || "",
    confidentSubjects: data.confidentSubjects || [],
    difficultSubjects: data.difficultSubjects || [],
    completedNCERTs: data.completedNCERTs || "",
    completedStandardBooks: data.completedStandardBooks || "",
    startedSubjects: data.startedSubjects || [],
    finishedSubjects: data.finishedSubjects || [],
    halfDoneSubjects: data.halfDoneSubjects || [],
    selectedOptional: data.selectedOptional || "",
    optionalSubject: data.optionalSubject || "",
    startedOptional: data.startedOptional || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectingYear, setSelectingYear] = useState(generateFutureYears(new Date().getFullYear()));

  const handleCheckboxChange = (field: string, value: string) => {
    const current = (formData as any)[field];
    const updated = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];

    const newFormData = { ...formData, [field]: updated };
    setFormData(newFormData);

    // Clear error when user makes selection  
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(errors);
    try {
      await CurrentStatusSchema.validate(formData, { abortEarly: false });
      setErrors({});

      // Update local storage only if the form data has changed
      const storedData = localStorage.getItem("basicInfo");
      if (storedData && JSON.parse(storedData) !== formData) {
        localStorage.setItem("basicInfo", JSON.stringify(Object.assign(formData, data)));
      }

      updateData(formData);
      nextStep();
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

  const standardBooksOptions = [
    { id: "yes", value: "yes", label: "Yes", icon: <Check className="w-[14px] h-[14px] mr-2" /> },
    { id: "no", value: "no", label: "No", icon: <X className="w-[14px] h-[14px] mr-2" /> },
    { id: "partially", value: "partially", label: "Partially", icon: <MinusCircle className="w-[14px] h-[14px] mr-2" /> },
  ]

  const selectedOptions = [
    { id: "Yes", value: "yes", label: "Yes", icon: <Check className="w-[14px] h-[14px] mr-2" /> },
    { id: "No", value: "no", label: "No", icon: <X className="w-[14px] h-[14px] mr-2" /> },
  ]

  const startedOptional = [
    { id: "yess", value: "yes", label: "Yes", icon: <Check className="w-[14px] h-[14px] mr-2" /> },
    { id: "noo", value: "no", label: "No", icon: <X className="w-[14px] h-[14px] mr-2" /> },
  ]

  const completedNCERTsOptions = [
    { id: "Yess", value: "yes", label: "Yes", icon: <Check className="w-[14px] h-[14px] mr-2" /> },
    { id: "Noo", value: "no", label: "No", icon: <X className="w-[14px] h-[14px] mr-2" /> },
    { id: "Partially", value: "partially", label: "Partially", icon: <MinusCircle className="w-[14px] h-[14px] mr-2" /> },
  ]


  const renderCheckboxGroup = (icon: any, label: string, field: keyof typeof formData) => (
    <div className="space-y-2">
      <Label className="text-[13px] sm:text-[15px] flex items-start sm:items-center gap-1.5">
        {icon}
        {label}
      </Label>
      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map((subject) => {
          const isChecked = formData[field].includes(subject);

          return (
            <label
              key={`${field}-${subject}`}
              htmlFor={`${field}-${subject}`}
              className={cn(
                "px-3 py-1 rounded-full text-[11px] sm:text-[13px] font-medium cursor-pointer transition-colors border select-none",
                {
                  "bg-primary text-white border-transparent": isChecked,
                  "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300": !isChecked,
                }
              )}
            >
              <input
                type="checkbox"
                id={`${field}-${subject}`}
                className="hidden"
                checked={isChecked}
                onChange={() => handleCheckboxChange(field, subject)}
              />
              {subject}
            </label>
          );
        })}
      </div>
      {errors[field] && (
        <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
      )}
    </div>
  );
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6 w-full mx-auto bg-white rounded-md p-6 my-6">
        <h1 className="text-base md:text-lg lg:text-xl font-semibold text-center">Current Status</h1>
        <p className="text-[13px] sm:text-[15px] text-center !mt-1 sm:!mt-2">Let&apos;s understand your current preparation level</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="preparationStartDate" className="text-[13px] sm:text-[15px] flex items-start sm:items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                When do you want to start your preparation?
              </Label>
              <div className="relative w-full datePicker">
                <DatePicker
                  selected={formData.preparationStartDate}
                  onChange={(date: Date | null) => {
                    const selectedDate = new Date(date ?? new Date());
                    const selectedYear = selectedDate.getFullYear();
                    setErrors({ ...errors, preparationStartDate: "" });
                    setFormData({ ...formData, preparationStartDate: date });

                    if (data.aspirantType === "part-time" || data.aspirantType === "working professional") {
                      const futureDate = new Date(selectedDate);
                      futureDate.setMonth(futureDate.getMonth() + 10);

                      setSelectingYear(generateFutureYears(futureDate.getMonth() > 4 ? selectedYear + 1 : selectedYear));
                    } else {
                      setSelectingYear(generateFutureYears(selectedYear));
                    }
                  }}
                  className="border border-input focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded px-2 py-1 text-sm !w-full h-9 select-none"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Choose a date"
                  minDate={new Date()}
                />
                <Calendar className="text-black !w-4 !h-4 absolute top-2.5 right-3 pointer-events-none" />
              </div>
              {errors.preparationStartDate && (
                <p className="text-red-500 text-xs mt-1">{errors.preparationStartDate}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label className="text-[13px] sm:text-[15px] flex items-start sm:items-center gap-1.5">
                <Target className="w-4 h-4" />
                Which year are you preparing for?
              </Label>
              <RadioGroup
                value={formData.targetYear}
                onValueChange={(value) => {
                  setFormData({ ...formData, targetYear: value })
                  if (errors.targetYear) {
                    setErrors({ ...errors, targetYear: "" });
                  }
                }}
                className="flex flex-wrap gap-3"
              >
                {selectingYear.map((year) => (
                  <RadioGroupItem
                    key={year}
                    value={year}
                    id={year}
                    className="sr-only"
                  />
                ))}
                {selectingYear.map((year) => {
                  const isSelected = formData.targetYear === year
                  return (
                    <label
                      key={year}
                      htmlFor={year}
                      className={`flex items-center px-2 sm:px-3 py-1 sm:py-[7px] rounded-sm border cursor-pointer text-[13px] sm:text-sm font-medium transition-colors text-nowrap select-none ${isSelected
                        ? "bg-primary/10 text-primary border-primary"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                    >
                      {year}
                    </label>
                  )
                })}
              </RadioGroup>
              {errors.targetYear && (
                <p className="text-red-500 text-xs mt-1">{errors.targetYear}</p>
              )}
            </div>
          </div>

          {renderCheckboxGroup(
            <Star className="w-4 h-4" />,
            "Which subjects do you feel confident about?",
            "confidentSubjects"
          )}
          {renderCheckboxGroup(
            <AlertTriangle className="w-4 h-4" />,
            "Which subjects do you find difficult?",
            "difficultSubjects"
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label className="text-[13px] sm:text-[15px] flex items-start sm:items-center gap-1.5">
                <BookText className="w-4 h-4" />
                Have you completed NCERTs?
              </Label>
              <div className="space-y-2">
                <RadioGroup
                  value={formData.completedNCERTs}
                  onValueChange={(value) => {
                    setFormData({ ...formData, completedNCERTs: value });
                    if (errors.completedNCERTs) {
                      setErrors({ ...errors, completedNCERTs: "" });
                    }
                  }}
                  className="flex flex-wrap gap-3"
                >
                  {completedNCERTsOptions.map((option) => (
                    <RadioGroupItem
                      key={option.id}
                      value={option.value}
                      id={option.id}
                      className="sr-only"
                    />
                  ))}
                  {completedNCERTsOptions.map((option) => {
                    const isSelected = formData.completedNCERTs === option.value
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
                {errors.completedNCERTs && (
                  <p className="text-red-500 text-xs mt-1">{errors.completedNCERTs}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label className="text-[13px] sm:text-[15px] flex items-start sm:items-center gap-1.5">
                <Bookmark className="w-4 h-4" />Have you completed standard UPSC books?
              </Label>
              <div className="space-y-2">
                <RadioGroup
                  value={formData.completedStandardBooks}
                  onValueChange={(value) => {
                    setFormData({ ...formData, completedStandardBooks: value });
                    if (errors.completedStandardBooks) {
                      setErrors({ ...errors, completedStandardBooks: "" });
                    }
                  }}
                  className="flex flex-wrap gap-3"
                >
                  {standardBooksOptions.map((option) => (
                    <RadioGroupItem
                      key={option.id}
                      value={option.value}
                      id={option.id}
                      className="sr-only"
                    />
                  ))}
                  {standardBooksOptions.map((option) => {
                    const isSelected = formData.completedStandardBooks === option.value
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
                {errors.completedStandardBooks && (
                  <p className="text-red-500 text-xs mt-1">{errors.completedStandardBooks}</p>
                )}
              </div>
            </div>
          </div>

          {renderCheckboxGroup(
            <Play className="w-4 h-4" />,
            "Which subjects have you started studying?",
            "startedSubjects"
          )}
          {renderCheckboxGroup(
            <CheckCircle className="w-4 h-4" />,
            "Which subjects have you finished?",
            "finishedSubjects"
          )}
          {renderCheckboxGroup(
            <Clock className="w-4 h-4" />,
            "Which subjects have you finished half way through?",
            "halfDoneSubjects"
          )}

          <div className="space-y-2">
            <Label className="text-[13px] sm:text-[15px] flex items-start sm:items-center gap-1.5">
              <CircleFadingPlus className="w-4 h-4" />
              Have you selected your Optional yet?
            </Label>
            <div className="space-y-2">
              <RadioGroup
                value={formData.selectedOptional}
                onValueChange={(value) => {
                  setFormData({ ...formData, selectedOptional: value });
                  if (errors.selectedOptional) {
                    setErrors({ ...errors, selectedOptional: "" });
                  }
                }}
                className="flex gap-3"
              >
                {selectedOptions.map((option) => (
                  <RadioGroupItem
                    key={option.id}
                    value={option.value}
                    id={option.id}
                    className="sr-only"
                  />
                ))}
                {selectedOptions.map((option) => {
                  const isSelected = formData.selectedOptional === option.value
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
              {errors.selectedOptional && (
                <p className="text-red-500 text-xs mt-1">{errors.selectedOptional}</p>
              )}
            </div>
          </div>

          {formData.selectedOptional === "yes" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <ul className="arrow-list">
                  <li>
                    <Label className="text-[13px] sm:text-[15px]" htmlFor="optionalSubject">
                      What is your Optional subject?
                    </Label>
                  </li>
                </ul>
                <Input
                  id="optionalSubject"
                  value={formData.optionalSubject}
                  onChange={(e) => {
                    setFormData({ ...formData, optionalSubject: e.target.value });
                    if (errors.optionalSubject) {
                      setErrors({ ...errors, optionalSubject: "" });
                    }
                  }}
                  className={errors.optionalSubject ? "border-red-500" : ""}
                />
                {errors.optionalSubject && (
                  <p className="text-red-500 text-xs mt-1">{errors.optionalSubject}</p>
                )}
              </div>

              <div className="space-y-2 pl-5 sm:pl-0 col-span-2 sm:col-span-1">
                <ul className="arrow-list">
                  <li>
                    <Label className="text-[13px] sm:text-[15px]">
                      Have you started preparing for Optional?
                    </Label>
                  </li>
                </ul>
                <div className="space-y-2">
                  <RadioGroup
                    value={formData.startedOptional}
                    onValueChange={(value) => {
                      setFormData({ ...formData, startedOptional: value });
                      if (errors.startedOptional) {
                        setErrors({ ...errors, startedOptional: "" });
                      }
                    }}
                    className="flex gap-3"
                  >
                    {startedOptional.map((option) => (
                      <RadioGroupItem
                        key={option.id}
                        value={option.value}
                        id={option.id}
                        className="sr-only"
                      />
                    ))}
                    {startedOptional.map((option) => {
                      const isSelected = formData.startedOptional === option.value
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
                </div>
                {errors.startedOptional && (
                  <p className="text-red-500 text-xs mt-1">{errors.startedOptional}</p>
                )}
              </div>
            </div>
          )}


        </div>
      </div>
      <div className="flex justify-between items-center gap-2 sm:mx-4">
        <Button type="button" variant="outline" className="gap-1 sm:gap-1.5" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <span className="text-xs sm:text-sm">Step 3 of 6</span>
        <Button type="submit" className="gap-1 sm:gap-1.5">
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
