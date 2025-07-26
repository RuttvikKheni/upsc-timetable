import React, { useEffect, useState } from "react";

import * as yup from "yup";

import { ArrowLeft, ArrowRight, BatteryCharging, Briefcase, Clock, Compass, GraduationCap, Scale, Search } from "lucide-react";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { basicInfoValidationSchema } from "../../schema/schema";

interface PersonalityProps {
    data: any;
    updateData: (data: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

export function Personality({ data, updateData, nextStep, prevStep }: PersonalityProps) {

    const [formData, setFormData] = useState({
        energy: "",
        information: "",
        decision: "",
        planning: "",
    });

    const energyOptions = [
        {
            label: "Social interaction",
            description: "I feel energized after spending time with others and in social settings.",
        },
        {
            label: "Quiet time alone",
            description: "I feel recharged after spending time alone with my thoughts or in small groups.",
        },
    ];

    const informations = [
        {
            label: "Concrete and practical",
            description: "I focus on details, facts, and practical applications. I trust what I can see and experience directly.",
        },
        {
            label: "Abstract and conceptual",
            description: "I focus on patterns, possibilities, and the big picture. I enjoy theoretical concepts and future implications.",
        },
    ];

    const decisions = [
        {
            label: "Logical and objective",
            description: "I prefer to make decisions based on logic, analysis, and objective considerations.",
        },
        {
            label: "Empathetic and value-based",
            description: "I prefer to make decisions based on personal values, empathy, and how they affect people.",
        },
    ];

    const plannings = [
        {
            label: "Structured and decisive",
            description: "I prefer to plan ahead, make decisions quickly, and follow schedules. I like things settled and organized.",
        },
        {
            label: "Flexible and adaptable",
            description: "I prefer to stay open to new information, adapt to changes, and keep options open. I'm comfortable with spontaneity.",
        },
    ];

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
        <form onSubmit={handleSubmit}>
            <div className="space-y-6 w-full mx-auto bg-white rounded-md p-6 my-6">
                <h1 className="text-base md:text-lg lg:text-xl font-semibold text-center">MBTI Personality Assessment</h1>
                <p className="text-[13px] sm:text-[15px] text-center !mt-1 sm:!mt-2">This personality assessment will help us understand your learning style better. Select the option that best describes you for each pair.</p>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label
                            className="text-[13px] sm:text-[15px] flex sm:items-center gap-1.5"
                            htmlFor="study_plan"
                        >
                            <BatteryCharging className="w-5 h-5" />
                            How do you prefer to recharge your energy?
                        </Label>

                        <RadioGroup
                            value={formData.energy}
                            onValueChange={(value) => {
                                setFormData({ ...formData, energy: value });
                            }}
                            className="grid grid-cols-1 sm:grid-cols-2"
                        >
                            {energyOptions.map((energy) => {
                                const isSelected = formData.energy === energy.label;
                                return (
                                    <div key={energy.label}>
                                        <RadioGroupItem
                                            value={energy.label}
                                            id={energy.label}
                                            className="sr-only"
                                        />
                                        <label
                                            htmlFor={energy.label}
                                            className={`flex items-center px-2 sm:px-3 py-2 rounded-sm border cursor-pointer text-sm sm:text-base font-medium transition-colors text-nowrap select-none ${isSelected
                                                ? "bg-primary/10 text-primary border-primary"
                                                : "bg-gray-100 text-black border-gray-300 hover:bg-gray-200"
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-semibold mb-0.5">{energy.label}</span>
                                                <span className="text-[13px] sm:text-sm text-gray-500 text-wrap tracking-wide">{energy.description}</span>
                                            </div>
                                        </label>
                                    </div>
                                );
                            })}
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label
                            className="text-[13px] sm:text-[15px] flex sm:items-center gap-1.5"
                            htmlFor="study_plan"
                        >
                            <Search className="w-4 h-4" />
                            How do you prefer to process information?
                        </Label>

                        <RadioGroup
                            value={formData.information}
                            onValueChange={(value) => {
                                setFormData({ ...formData, information: value });
                            }}
                            className="grid grid-cols-1 sm:grid-cols-2"
                        >
                            {informations.map((information) => {
                                const isSelected = formData.information === information.label;
                                return (
                                    <div key={information.label}>
                                        <RadioGroupItem
                                            value={information.label}
                                            id={information.label}
                                            className="sr-only"
                                        />
                                        <label
                                            htmlFor={information.label}
                                            className={`flex items-center px-2 sm:px-3 py-2 rounded-sm border cursor-pointer text-sm sm:text-base font-medium transition-colors text-nowrap select-none ${isSelected
                                                ? "bg-primary/10 text-primary border-primary"
                                                : "bg-gray-100 text-black border-gray-300 hover:bg-gray-200"
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-semibold mb-0.5">{information.label}</span>
                                                <span className="text-[13px] sm:text-sm text-gray-500 text-wrap tracking-wide">{information.description}</span>
                                            </div>
                                        </label>
                                    </div>
                                );
                            })}
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label
                            className="text-[13px] sm:text-[15px] flex sm:items-center gap-1.5"
                            htmlFor="study_plan"
                        >
                            <Scale className="w-4 h-4" />
                            How do you make decisions?
                        </Label>

                        <RadioGroup
                            value={formData.decision}
                            onValueChange={(value) => {
                                setFormData({ ...formData, decision: value });
                            }}
                            className="grid grid-cols-1 sm:grid-cols-2"
                        >
                            {decisions.map((decision) => {
                                const isSelected = formData.decision === decision.label;
                                return (
                                    <div key={decision.label}>
                                        <RadioGroupItem
                                            value={decision.label}
                                            id={decision.label}
                                            className="sr-only"
                                        />
                                        <label
                                            htmlFor={decision.label}
                                            className={`flex items-center px-2 sm:px-3 py-2 rounded-sm border cursor-pointer text-sm sm:text-base font-medium transition-colors text-nowrap select-none ${isSelected
                                                ? "bg-primary/10 text-primary border-primary"
                                                : "bg-gray-100 text-black border-gray-300 hover:bg-gray-200"
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-semibold mb-0.5">{decision.label}</span>
                                                <span className="text-[13px] sm:text-sm text-gray-500 text-wrap tracking-wide">{decision.description}</span>
                                            </div>
                                        </label>
                                    </div>
                                );
                            })}
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label
                            className="text-[13px] sm:text-[15px] flex sm:items-center gap-1.5"
                            htmlFor="study_plan"
                        >
                            <Compass className="w-4 h-4" />
                            How do you approach structure and planning?
                        </Label>

                        <RadioGroup
                            value={formData.planning}
                            onValueChange={(value) => {
                                setFormData({ ...formData, planning: value });
                            }}
                            className="grid grid-cols-1 sm:grid-cols-2"
                        >
                            {plannings.map((planning) => {
                                const isSelected = formData.planning === planning.label;
                                return (
                                    <div key={planning.label}>
                                        <RadioGroupItem
                                            value={planning.label}
                                            id={planning.label}
                                            className="sr-only"
                                        />
                                        <label
                                            htmlFor={planning.label}
                                            className={`flex items-center px-2 sm:px-3 py-2 rounded-sm border cursor-pointer text-sm sm:text-base font-medium transition-colors text-nowrap select-none ${isSelected
                                                ? "bg-primary/10 text-primary border-primary"
                                                : "bg-gray-100 text-black border-gray-300 hover:bg-gray-200"
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-semibold mb-0.5">{planning.label}</span>
                                                <span className="text-[13px] sm:text-sm text-gray-500 text-wrap tracking-wide">{planning.description}</span>
                                            </div>
                                        </label>
                                    </div>
                                );
                            })}
                        </RadioGroup>
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center gap-2 sm:mx-4">
                <Button type="button" variant="outline" className="gap-1 sm:gap-1.5" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <span className="text-xs sm:text-sm">Step 4 of 6</span>
                <Button type="submit" className="gap-1 sm:gap-1.5">
                    Continue <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </form>
    );
} 