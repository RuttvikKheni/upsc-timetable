import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { ArrowRight, Briefcase, Clock, GalleryThumbnails, GraduationCap, Mail, Phone, User } from "lucide-react";

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

  const aspirantOptions = [
    { id: "full-time", value: "full-time", label: "Full-Time", icon: <GraduationCap className="w-4 h-4 mr-2" /> },
    { id: "part-time", value: "part-time", label: "Part-Time", icon: <Clock className="w-4 h-4 mr-2" /> },
    { id: "working", value: "working professional", label: "Working Professional", icon: <Briefcase className="w-4 h-4 mr-2" /> },
  ]

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 w-full mx-auto bg-white rounded-md p-4 sm:p-6 my-4 sm:my-6">
          <h1 className="text-base md:text-lg lg:text-xl font-semibold text-center">Basic Information</h1>
          <p className="text-[13px] sm:text-[15px] text-center !mt-1 sm:!mt-2">Let&apos;s start with your basic details</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label className="text-[13px] sm:text-[15px] flex items-center gap-1.5" htmlFor="fullName">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label className="text-[13px] sm:text-[15px] flex items-center gap-1.5" htmlFor="email">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="text-[13px] sm:text-[15px] flex items-center gap-1.5" htmlFor="contactNumber">
                <Phone className="w-4 h-4" />
                Contact Number
              </Label>
              <Input
                id="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="Enter your contact number"
                required
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-[13px] sm:text-[15px] flex items-center gap-1.5">
                <GalleryThumbnails className="w-4 h-4" />
                Aspirant Type
              </Label>
              <RadioGroup
                value={formData.aspirantType}
                onValueChange={(value) => setFormData({ ...formData, aspirantType: value })}
                className="flex flex-wrap gap-3"
              >
                {aspirantOptions.map((option) => (
                  <RadioGroupItem
                    key={option.id}
                    value={option.value}
                    id={option.id}
                    className="sr-only"
                  />
                ))}
                {aspirantOptions.map((option) => {
                  const isSelected = formData.aspirantType === option.value
                  return (
                    <label
                      key={option.id}
                      htmlFor={option.id}
                      className={`flex items-center px-2 sm:px-3 py-1 sm:py-[7px] rounded-sm border cursor-pointer text-[13px] sm:text-sm font-medium transition-colors text-nowrap select-none ${isSelected
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
        </div>
        <div className="flex justify-between items-center gap-2 mx-4">
          <div className="w-[80px]" />
          <span className="text-xs sm:text-sm">Step 1 of 5</span>
          <Button type="submit" className="gap-1 sm:gap-1.5">
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </>
  );
} 