import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { ArrowRight, Briefcase, Clock, GalleryThumbnails, GraduationCap, Mail, Phone, User } from "lucide-react";
import { basicInfoValidationSchema } from "../../schema/schema";

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await basicInfoValidationSchema.validate(formData, { abortEarly: false });

      setErrors({});

      updateData(formData);
      localStorage.setItem("basicInfo", JSON.stringify(formData));
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
              <Label className="text-[13px] sm:text-[15px] flex items-start sm:items-center gap-1.5" htmlFor="fullName">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  if (errors.fullName) {
                    setErrors({ ...errors, fullName: "" });
                  }
                }}
                placeholder="Enter your full name"
                className={errors.fullName ? "border-red-500" : ""}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label className="text-[13px] sm:text-[15px] flex items-start sm:items-center gap-1.5" htmlFor="email">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) {
                    setErrors({ ...errors, email: "" });
                  }
                }}
                placeholder="Enter your email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="text-[13px] sm:text-[15px] flex items-start sm:items-center gap-1.5" htmlFor="contactNumber">
                <Phone className="w-4 h-4" />
                Contact Number
              </Label>
              <Input
                id="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, contactNumber: value });
                  if (errors.contactNumber) {
                    setErrors({ ...errors, contactNumber: "" });
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    [46, 8, 9, 27, 13, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true)
                  ) {
                    return;
                  }
                  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                  }
                }}
                placeholder="Enter your contact number"
                className={errors.contactNumber ? "border-red-500" : ""}
              />
              {errors.contactNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
              )}
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-[13px] sm:text-[15px] flex items-start sm:items-center gap-1.5">
                <GalleryThumbnails className="w-4 h-4" />
                Aspirant Type
              </Label>
              <RadioGroup
                value={formData.aspirantType}
                onValueChange={(value) => {
                  setFormData({ ...formData, aspirantType: value });
                  if (errors.aspirantType) {
                    setErrors({ ...errors, aspirantType: "" });
                  }
                }}
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
              {errors.aspirantType && (
                <p className="text-red-500 text-xs mt-1">{errors.aspirantType}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center gap-2 sm:mx-4">
          <div className="w-[80px]" />
          <span className="text-xs sm:text-sm">Step 1 of 6  </span>
          <Button type="submit" className="gap-1 sm:gap-1.5">
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </>
  );
} 