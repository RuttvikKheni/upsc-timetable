import * as yup from "yup";

export const CurrentStatusSchema = yup.object().shape({
    targetYear: yup
      .string()
      .required("Please select your target year"),
    preparationStartDate: yup
      .date()
      .nullable()
      .required("Please select when you want to start your preparation")
      .typeError("Please select a valid date"),
    confidentSubjects: yup
      .array()
      .min(1, "Please select at least one subject you feel confident about (or select 'NONE' if applicable)"),
    difficultSubjects: yup
      .array()
      .min(1, "Please select at least one subject you find difficult (or select 'NONE' if applicable)"),
    completedNCERTs: yup
      .string()
      .required("Please indicate whether you have completed NCERTs"),
    completedStandardBooks: yup
      .string()
      .required("Please indicate whether you have completed standard UPSC books"),
    startedSubjects: yup
      .array()
      .min(1, "Please select at least one subject you have started studying (or select 'NONE' if applicable)"),
    finishedSubjects: yup
      .array()
      .min(1, "Please select at least one subject you have finished (or seslect 'NONE' if applicable)"),
    halfDoneSubjects: yup
      .array()
      .min(1, "Please select at least one subject you have finished half way through (or select 'NONE' if applicable)"),
    selectedOptional: yup
      .string()
      .required("Please indicate whether you have selected your Optional subject"),
    optionalSubject: yup
      .string()
      .when("selectedOptional", {
        is: "yes",
        then: (schema) => schema.required("Please provide your Optional subject name"),
        otherwise: (schema) => schema.notRequired(),
      }),
    startedOptional: yup
      .string()
      .when("selectedOptional", {
        is: "yes",
        then: (schema) => schema.required("Please indicate whether you have started preparing for Optional"),
        otherwise: (schema) => schema.notRequired(),
      }),
  });

  export const basicInfoValidationSchema = yup.object().shape({
    fullName: yup
      .string()
      .required("Full name is required")
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must be less than 50 characters")
      .matches(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
    email: yup
      .string()
      .required("Email is required")
      .email("Please enter a valid email address"),
    contactNumber: yup
      .string()
      .required("Contact number is required")
      .matches(/^[0-9]{10}$/, "Contact number must be 10 digits"),
    aspirantType: yup
      .string()
      .required("Please select your aspirant type"),
  });

  export const dailyScheduleValidationSchema = yup.object({
    dailyHours: yup.string().required('Please select how many hours you can dedicate daily'),
    preferredStartTime: yup.string().required('Please select your preferred start time'),
    sleepTime: yup.string().required('Please select your sleep time'),
    weeklyOffDays: yup.array().of(yup.string()).min(1, 'Please select at least one weekly off day'),
    subjectsPerDay: yup.string().when('aspirantType', {
      is: 'full-time',
      then: (schema) => schema.required('Please select how many subjects you want to study per day'),
      otherwise: (schema) => schema
    })
  }); 

  export const pastPreparationValidationSchema = yup.object().shape({
    attemptedBefore: yup
      .string()
      .required("Please select if you have attempted UPSC before"),
    prelimsScore: yup
      .string()
      .when("attemptedBefore", {
        is: "yes",
        then: (schema) => schema.required("Prelims score is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
    clearedMains: yup
      .string()
      .required("Please select if you have cleared Mains before"),
    mainsScore: yup
      .string()
      .when("clearedMains", {
        is: "yes",
        then: (schema) => schema.required("Mains score is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
    academicQualification: yup
      .string()
      .required("Academic qualification is required"),
    academicPerformance: yup
      .string()
      .required("Academic performance is required"),
  });
  