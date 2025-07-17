import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";

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

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-full sm:max-w-lg mx-auto px-2 sm:px-0"
    >
      <div className="space-y-4">
        <div className="space-y-2">
        <ul className="arrow-list">
          <li>
            <Label className="text-[15px] !font-medium">Have you attempted UPSC before?</Label>
          </li>
          </ul>
          <RadioGroup
            value={formData.attemptedBefore}
            onValueChange={(value) =>
              setFormData({ ...formData, attemptedBefore: value })
            }
            className="flex flex-col space-y-1 ml-5"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="attempted-yes" />
              <Label htmlFor="attempted-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="attempted-no" />
              <Label htmlFor="attempted-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.attemptedBefore === "yes" && (
          <div className="space-y-2">
            <ul className="arrow-list">
            <li>
              <Label htmlFor="prelimsScore" className="text-[15px]">
                {"What was your last attempt's Prelims Score?"}
              </Label>
            </li>
            </ul>
            <Input
              id="prelimsScore"
              value={formData.prelimsScore}
              onChange={(e) =>
                setFormData({ ...formData, prelimsScore: e.target.value })
              }
              placeholder="Enter Prelims Score"
              className="ml-5"
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <ul className="arrow-list">
          <li>
            <Label className="text-[15px] !font-medium">Have you cleared Mains before?</Label>
          </li>
          </ul>
          <RadioGroup
            value={formData.clearedMains}
            onValueChange={(value) =>
              setFormData({ ...formData, clearedMains: value })
            }
            className="flex flex-col space-y-1 ml-5"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="mains-yes" />
              <Label htmlFor="mains-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="mains-no" />
              <Label htmlFor="mains-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.clearedMains === "yes" && (
          <div className="space-y-2">
            <ul className="arrow-list">
            <li>
              <Label htmlFor="mainsScore" className="text-[15px]">
                {"What was your last attempt's Mains Score?"}
              </Label>
            </li>
            </ul>
            <Input
              id="mainsScore"
              className="ml-5"
              value={formData.mainsScore}
              onChange={(e) =>
                setFormData({ ...formData, mainsScore: e.target.value })
              }
              placeholder="Enter Mains Score"
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <ul className="arrow-list">
          <li className="flex"> <Label className="text-[15px] !font-medium text-nowrap" htmlFor="academicQualification">
            Your highest academic qualification and the field of study
          </Label></li>
          </ul>
          <Textarea
          className="ml-5"
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

        <div className="space-y-2">
          <ul className="arrow-list">
          <li className="flex"> <Label className="text-[15px] !font-medium text-nowrap" htmlFor="academicPerformance">
            Your past academic performance in school & college (percentage or
            CGPA)
          </Label></li>
          </ul>
          <Textarea
            id="academicPerformance"
            className="ml-5"
            value={formData.academicPerformance}
            onChange={(e) =>
              setFormData({ ...formData, academicPerformance: e.target.value })
            }
            placeholder="e.g. 85% in school, 8.2 CGPA in college"
            required
          />
        </div>
      </div>

      <div className="flex justify-between ml-5">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
