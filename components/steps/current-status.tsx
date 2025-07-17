import React, { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";

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
  const [selectingYear, setSelectingYear] = useState(generateFutureYears(new Date().getFullYear()));

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

  const renderCheckboxGroup = (label: string, field: keyof typeof formData) => (
    <div className="space-y-2">
      <ul className="arrow-list">
        <li>
          <Label className="text-[15px]">{label}</Label>
        </li>
      </ul>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 ml-5">
        {SUBJECTS.map((subject) => (
          <label
            key={`${field}-${subject}`}
            className="flex items-center space-x-2"
          >
            <Checkbox
              id={`${field}-${subject}`}
              checked={formData[field].includes(subject)}
              onCheckedChange={() => handleCheckboxChange(field, subject)}
            />
            <span className="text-nowrap text-sm">{subject}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-full sm:max-w-2xl mx-auto px-2 sm:px-0"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <ul className="arrow-list">
            <li>
              <Label htmlFor="preparationStartDate" className="text-[15px]">
                When do you want to start your preparation?
              </Label>
            </li>
          </ul>
          <Input
            type="date"
            id="preparationStartDate"
            className="ml-5"
            value={formData.preparationStartDate}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              const selectedYear = selectedDate.getFullYear();

              setFormData({ ...formData, preparationStartDate: e.target.value });

              if (data.aspirantType === "part-time" || data.aspirantType === "working professional") {
                const futureDate = new Date(selectedDate);
                futureDate.setMonth(futureDate.getMonth() + 10);

                setSelectingYear(generateFutureYears(futureDate.getMonth() > 4 ? selectedYear + 1 : selectedYear));
              } else {
                setSelectingYear(generateFutureYears(selectedYear));
              }
            }}
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>

        <div className="space-y-2">
          <ul className="arrow-list">
            <li>
              <Label className="text-[15px]">
                Which year are you preparing for?
              </Label>
            </li>
          </ul>
          <RadioGroup
            value={formData.targetYear}
            onValueChange={(value) =>
              setFormData({ ...formData, targetYear: value })
            }
            className="flex flex-col space-y-1 ml-5"
          >
            {selectingYear.map((year) => (
              <div className="flex items-center space-x-2" key={year}>
                <RadioGroupItem value={year} id={`year-${year}`} />
                <Label htmlFor={`year-${year}`}>{year}</Label>
              </div>
            ))}
          </RadioGroup>
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
              <Label className="text-[15px]">Have you completed NCERTs?</Label>
            </li>
          </ul>
          <RadioGroup
            value={formData.completedNCERTs}
            onValueChange={(value) =>
              setFormData({ ...formData, completedNCERTs: value })
            }
            className="flex flex-col space-y-1 ml-5"
          >
            {["Yes", "No", "Partially"].map((opt) => (
              <div className="flex items-center space-x-2" key={opt}>
                <RadioGroupItem value={opt} id={`ncert-${opt}`} />
                <Label htmlFor={`ncert-${opt}`}>{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <ul className="arrow-list">
            <li>
              <Label className="text-[15px]">
                Have you completed standard UPSC books?
              </Label>
            </li>
          </ul>
          <RadioGroup
            value={formData.completedStandardBooks}
            onValueChange={(value) =>
              setFormData({ ...formData, completedStandardBooks: value })
            }
            className="flex flex-col space-y-1 ml-5"
          >
            {["Yes", "No", "Partially"].map((opt) => (
              <div className="flex items-center space-x-2" key={opt}>
                <RadioGroupItem value={opt} id={`standard-${opt}`} />
                <Label htmlFor={`standard-${opt}`}>{opt}</Label>
              </div>
            ))}
          </RadioGroup>
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
              <Label className="text-[15px]">
                Have you selected your Optional yet?
              </Label>
            </li>
          </ul>
          <RadioGroup
            value={formData.selectedOptional}
            onValueChange={(value) =>
              setFormData({ ...formData, selectedOptional: value })
            }
            className="flex flex-col space-y-1 ml-5"
          >
            {["Yes", "No"].map((opt) => (
              <div className="flex items-center space-x-2" key={opt}>
                <RadioGroupItem value={opt} id={`optional-${opt}`} />
                <Label htmlFor={`optional-${opt}`}>{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {formData.selectedOptional === "Yes" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="optionalSubject">
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

            <div className="space-y-2">
              <Label className="text-[15px]">
                Have you started preparing for Optional?
              </Label>
              <RadioGroup
                value={formData.startedOptional}
                onValueChange={(value) =>
                  setFormData({ ...formData, startedOptional: value })
                }
                className="flex flex-col space-y-1"
              >
                {["Yes", "No"].map((opt) => (
                  <div className="flex items-center space-x-2" key={opt}>
                    <RadioGroupItem value={opt} id={`opt-prep-${opt}`} />
                    <Label htmlFor={`opt-prep-${opt}`}>{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
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
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
