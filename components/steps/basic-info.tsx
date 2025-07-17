import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface BasicInfoProps {
  data: any;
  updateData: (data: any) => void;
  nextStep: () => void;
}

export function BasicInfo({ data, updateData, nextStep }: BasicInfoProps) {
  const [formData, setFormData] = useState({
    fullName: data.fullName || "",
    email: data.email || "",
    contactNumber: data.contactNumber || "",
    aspirantType: data.aspirantType || "",
    subjectsPerDay: data.subjectsPerDay || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData(formData);
    localStorage.setItem("basicInfo", JSON.stringify(formData));
    nextStep();
  };
useEffect(() => {
  const storedData = localStorage.getItem("basicInfo");
  if (storedData) {
    setFormData(JSON.parse(storedData));
  }
}, []);
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-full sm:max-w-lg mx-auto px-2 sm:px-0">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[15px]" htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[15px]" htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[15px]" htmlFor="contactNumber">Contact Number</Label>
          <Input
            id="contactNumber"
            type="tel"
            value={formData.contactNumber}
            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
            placeholder="Enter your contact number"
            required
          />
        </div>

        <div className="space-y-2">
         <Label className="text-[15px]">Aspirant Type</Label>
          <RadioGroup
            value={formData.aspirantType}
            onValueChange={(value) => setFormData({ ...formData, aspirantType: value })}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="full-time" id="full-time" />
              <Label htmlFor="full-time">Full-Time Aspirant</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="part-time" id="part-time" />
              <Label htmlFor="part-time">Part-Time Aspirant</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="working professional" id="working" />
              <Label htmlFor="working">Working Professional</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );
} 