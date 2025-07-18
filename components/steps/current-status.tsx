import React, { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { cn } from "../../lib/utils";
import { ArrowLeft, ArrowRight, Calendar, Check, MinusCircle, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
    preparationStartDate: data.preparationStartDate || "",
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

  const [validationError, setValidationError] = useState("");
  // const [selectingYear, setSelectingYear] = useState(generateFutureYears(new Date().getFullYear()));
  const [startDate, setStartDate] = useState<Date | null>(new Date());

  const handleCheckboxChange = (field: string, value: string) => {
    const current = (formData as any)[field];
    const updated = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];

    const newFormData = { ...formData, [field]: updated };
    setFormData(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation checks
    const errors = [];

    // Check if at least one subject is selected for confident subjects
    if (formData.confidentSubjects.length === 0) {
      errors.push(
        "Please select at least one subject you feel confident about (or select 'NONE' if applicable)"
      );
    }

    // Check if at least one subject is selected for difficult subjects
    if (formData.difficultSubjects.length === 0) {
      errors.push(
        "Please select at least one subject you find difficult (or select 'NONE' if applicable)"
      );
    }

    // Check if NCERTs completion status is selected
    if (!formData.completedNCERTs) {
      errors.push("Please indicate whether you have completed NCERTs");
    }

    // Check if standard books completion status is selected
    if (!formData.completedStandardBooks) {
      errors.push(
        "Please indicate whether you have completed standard UPSC books"
      );
    }

    // Check if at least one subject is selected for started subjects
    if (formData.startedSubjects.length === 0) {
      errors.push(
        "Please select at least one subject you have started studying (or select 'NONE' if applicable)"
      );
    }

    // Check if at least one subject is selected for finished subjects
    if (formData.finishedSubjects.length === 0) {
      errors.push(
        "Please select at least one subject you have finished (or select 'NONE' if applicable)"
      );
    }

    // Check if at least one subject is selected for half done subjects
    if (formData.halfDoneSubjects.length === 0) {
      errors.push(
        "Please select at least one subject you have finished half way through (or select 'NONE' if applicable)"
      );
    }

    // Check if optional selection is made
    if (!formData.selectedOptional) {
      errors.push(
        "Please indicate whether you have selected your Optional subject"
      );
    }

    // If optional is selected as "Yes", check if optional subject name is provided
    if (
      formData.selectedOptional === "Yes" &&
      !formData.optionalSubject.trim()
    ) {
      errors.push("Please provide your Optional subject name");
    }

    // If optional is selected as "Yes", check if started optional is answered
    if (formData.selectedOptional === "Yes" && !formData.startedOptional) {
      errors.push(
        "Please indicate whether you have started preparing for Optional"
      );
    }

    if (errors.length > 0) {
      setValidationError(errors.join(". "));
      return;
    }
    // Update local storage only if the form data has changed
    const storedData = localStorage.getItem("basicInfo");
    if (storedData && JSON.parse(storedData) !== formData) {
      localStorage.setItem("basicInfo", JSON.stringify(Object.assign(formData, data)));
    }

    updateData(formData);
    nextStep();
  };

  const selectingYearOptions = [
    { id: "2026", value: "2026", label: "2026" },
    { id: "2027", value: "2027", label: "2027" },
    { id: "2028", value: "2028", label: "2028" },
    { id: "2029", value: "2029", label: "2029" },
    { id: "2030", value: "2030", label: "2030" },
  ]

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


  const renderCheckboxGroup = (label: string, field: keyof typeof formData) => (
    <div className="space-y-2">
      <ul className="arrow-list">
        <li>
          <Label className="text-[13px] sm:text-[15px]">{label}</Label>
        </li>
      </ul>
      <div className="flex flex-wrap gap-2 pl-5">
        {SUBJECTS.map((subject) => {
          const isChecked = formData[field].includes(subject);

          return (
            <label
              key={`${field}-${subject}`}
              htmlFor={`${field}-${subject}`}
              className={cn(
                "px-3 py-1 rounded-full text-[11px] sm:text-[13px] font-medium cursor-pointer transition-colors border",
                {
                  "bg-primary text-white border-transparent": isChecked, // selected
                  "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300": !isChecked, // unselected
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
              <ul className="arrow-list">
                <li>
                  <Label htmlFor="preparationStartDate" className="text-[13px] sm:text-[15px]">
                    When do you want to start your preparation?
                  </Label>
                </li>
              </ul>
              <div className="relative w-full pl-5 datePicker">
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  className="border border-input focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded px-2 py-1 text-sm !w-full h-9"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Choose a date"
                />
                <Calendar className="text-black !w-4 !h-4 absolute top-2.5 right-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <ul className="arrow-list">
                <li>
                  <Label className="text-[13px] sm:text-[15px]">
                    Which year are you preparing for?
                  </Label>
                </li>
              </ul>
              <RadioGroup
                value={formData.targetYear}
                onValueChange={(value) =>
                  setFormData({ ...formData, targetYear: value })
                }
                className="flex flex-wrap gap-3 pl-5"
              >
                {selectingYearOptions.map((year) => (
                  <RadioGroupItem
                    key={year.id}
                    value={year.value}
                    id={year.id}
                    className="sr-only"
                  />
                ))}
                {selectingYearOptions.map((year) => {
                  const isSelected = formData.targetYear === year.value
                  return (
                    <label
                      key={year.id}
                      htmlFor={year.id}
                      className={`flex items-center px-2 sm:px-3 py-1 sm:py-[7px] rounded-sm border cursor-pointer text-[13px] sm:text-sm font-medium transition-colors text-nowrap ${isSelected
                        ? "bg-primary/10 text-primary border-primary"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                    >
                      {year.label}
                    </label>
                  )
                })}
              </RadioGroup>
            </div>
          </div>

          {renderCheckboxGroup(
            "Which subjects do you feel confident about?",
            "confidentSubjects"
          )}
          {renderCheckboxGroup(
            "Which subjects do you find difficult?",
            "difficultSubjects"
          )}

          <div className="space-y-2">
            <ul className="arrow-list">
              <li>
                <Label className="text-[13px] sm:text-[15px]">Have you completed NCERTs?</Label>
              </li>
            </ul>
            <div className="space-y-2 pl-5">
              <RadioGroup
                value={formData.completedNCERTs}
                onValueChange={(value) =>
                  setFormData({ ...formData, completedNCERTs: value })
                }
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

          <div className="space-y-2">
            <ul className="arrow-list">
              <li>
                <Label className="text-[13px] sm:text-[15px]">
                  Have you completed standard UPSC books?
                </Label>
              </li>
            </ul>
            <div className="space-y-2 pl-5">
              <RadioGroup
                value={formData.completedStandardBooks}
                onValueChange={(value) =>
                  setFormData({ ...formData, completedStandardBooks: value })
                }
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

          {renderCheckboxGroup(
            "Which subjects have you started studying?",
            "startedSubjects"
          )}
          {renderCheckboxGroup(
            "Which subjects have you finished?",
            "finishedSubjects"
          )}
          {renderCheckboxGroup(
            "Which subjects have you finished half way through?",
            "halfDoneSubjects"
          )}

          <div className="space-y-2">
            <ul className="arrow-list">
              <li>
                <Label className="text-[13px] sm:text-[15px]">
                  Have you selected your Optional yet?
                </Label>
              </li>
            </ul>

            <div className="space-y-2 pl-5">
              <RadioGroup
                value={formData.selectedOptional}
                onValueChange={(value) =>
                  setFormData({ ...formData, selectedOptional: value })
                }
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

          {formData.selectedOptional === "yes" && (
            <>
              <div className="space-y-2 pl-5">
                <Label className="text-[13px] sm:text-[15px]" htmlFor="optionalSubject">
                  What is your Optional subject?
                </Label>
                <Input
                  id="optionalSubject"
                  value={formData.optionalSubject}
                  onChange={(e) =>
                    setFormData({ ...formData, optionalSubject: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2 pl-5">
                <Label className="text-[13px] sm:text-[15px]">
                  Have you started preparing for Optional?
                </Label>
                <div className="space-y-2">
                  <RadioGroup
                    value={formData.startedOptional}
                    onValueChange={(value) =>
                      setFormData({ ...formData, startedOptional: value })
                    }
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
            </>
          )}
        </div>
        {validationError && (
          <div className="!text-sm leading-[20px] text-[#D92D20] !mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="font-medium mb-1">Please complete the following:</p>
            <ul className="list-disc list-inside space-y-1">
              {validationError.split(". ").map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center gap-2 mx-4">
        <Button type="button" variant="outline" className="gap-1 sm:gap-1.5" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <span className="text-xs sm:text-sm">Step 3 of 5</span>
        <Button type="submit" className="gap-1 sm:gap-1.5">
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
