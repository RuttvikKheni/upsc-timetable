import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { loadRazorpay } from "../../lib/loadRazorpay";
import { ArrowLeft, ArrowRight, Brain, CalendarMinus2, Clock3, Lightbulb, Moon, SunMedium } from "lucide-react";
import { cn } from "../../lib/utils";
import TimePicker from 'rc-time-picker';
import moment from 'moment';
import 'rc-time-picker/assets/index.css';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { dailyScheduleValidationSchema } from "../../schema/schema";

interface DailyScheduleProps {
  data: any;
  updateData: (data: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const weekDays = [
  { value: "Monday", day: "Mon", short: "M" },
  { value: "Tuesday", day: "Tue", short: "T" },
  { value: "Wednesday", day: "Wed", short: "W" },
  { value: "Thursday", day: "Thu", short: "T" },
  { value: "Friday", day: "Fri", short: "F" },
  { value: "Saturday", day: "Sat", short: "S" },
  { value: "Sunday", day: "Sun", short: "S" },
];




export function DailySchedule({
  data,
  updateData,
  nextStep,
  prevStep,
}: DailyScheduleProps) {

  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      dailyHours: data.dailyHours || "",
      preferredStartTime: data.preferredStartTime || "",
      sleepTime: data.sleepTime || "",
      weeklyOffDays: data.weeklyOffDays || [],
      subjectsPerDay:
        data.subjectsPerDay ||
        (data.aspirantType === "working professional" ||
          data.aspirantType === "part-time"
          ? "one"
          : ""),
      aspirantType: data.aspirantType
    },
    validationSchema: dailyScheduleValidationSchema,
    onSubmit: async (values) => {
      await handleRazorpay(values);
    },
  });

  const handleOffDayChange = (day: string) => {
    const updatedOffDays = formik.values.weeklyOffDays.includes(day)
      ? formik.values.weeklyOffDays.filter((d: string) => d !== day)
      : [...formik.values.weeklyOffDays, day];
    formik.setFieldValue('weeklyOffDays', updatedOffDays);
  };

  const handleRazorpay = async (values?: typeof formik.values) => {
    console.log(values);
    localStorage.removeItem("basicInfo");
    const formValues = values || formik.values;

    // Validate form before proceeding
    const isValid = await formik.validateForm();
    if (Object.keys(isValid).length > 0) {
      formik.setTouched({
        dailyHours: true,
        preferredStartTime: true,
        sleepTime: true,
        subjectsPerDay: true,
        weeklyOffDays: formValues.weeklyOffDays.length > 0
      });
      return;
    }

    try {
      setIsLoading(true);
      const isLoaded = await loadRazorpay();

      if (!isLoaded) {
        setIsLoading(false);
        console.error("Failed to load Razorpay SDK. Please try again.");
        return;
      }

      const orderRes = await fetch("/api/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, name: data.fullName }),
      });
      if (!orderRes.ok) {
        setIsLoading(false);
        console.error("Failed to create order");
        return;
      }

      const orderData = await orderRes.json();
      console.log("Razorpay order created:", orderData);
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        razorpayPaymentId: orderData.payment_id,
        name: "Proxy Gyan Personalized UPSC Timetable",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Ensure working professionals and part-time aspirants have subjectsPerDay set to "one"
            const finalFormData = {
              ...formValues,
              subjectsPerDay:
                data.aspirantType === "working professional" ||
                  data.aspirantType === "part-time"
                  ? "one"
                  : formValues.subjectsPerDay,
            };

            updateData(finalFormData); // merge last step inputs

            const res = await fetch("/api/generate-timetable", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...data, ...finalFormData }),
            });

            if (!res.ok) {
              setIsLoading(false);
              throw new Error("Failed to generate timetable");
            }

            const result = await res.json();

            // Call API for payment success
            const res2 = await fetch("/api/timetable/generate-db-timetable", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...data,
                ...finalFormData,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                status: "paid",
                razorpayPaymentStatus: "success",
                paymentSignature: response.razorpay_signature,
              }),
            })
            if (!res2.ok) {
              throw new Error("Failed to save timetable");
            }
            const data2 = await res2.json();
            localStorage.setItem("timetableId", data2.timetable);
            if (!result.timetable) {
              throw new Error("Timetable not returned");
            }

            updateData({
              ...finalFormData,
              generatedTimetable: result.timetable,
            });
            nextStep(); // move to Review step
          } catch (error) {
            setIsLoading(false);
            console.error("Error generating timetable:", error);
            console.error("Failed to generate timetable. Please try again.");
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: data.fullName,
          email: data.email,
        },
        theme: {
          color: "#582F88",
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
          }
        }
      };

      let paymentFailedCalled = false;
      const rzp = new (window as any).Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (response: any) {
        if (paymentFailedCalled) return;
        setIsLoading(false);
        paymentFailedCalled = true;
        console.error("Payment Failed:", response.error);
        fetch("/api/timetable/generate-db-timetable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            ...formValues,
            razorpayOrderId: response.error?.metadata?.order_id,
            razorpayPaymentId: response.error?.metadata?.payment_id,
            status: "failed",
            razorpayPaymentStatus: "failed",
            paymentError: response.error,
          }),
        }).catch((err) => {
          console.error(
            "Failed to send data to generate-db-timetable (failed):",
            err
          );
        });
        // You can access failure details like:
        // response.error.code
        // response.error.description
        // response.error.reason
        // response.error.metadata.order_id
        // response.error.metadata.payment_id
      });
    } catch (error) {
      setIsLoading(false);
      console.error("Error in payment:", error);
      console.error("Failed to initiate payment. Please try again.");
    }
  };

  const dailyHoursOptions = [
    ...(data.aspirantType === "full-time" ? [
      { id: "8", value: "8", label: "8 Hours" },
      { id: "10", value: "10", label: "10 Hours" },
    ] : [
      { id: "4", value: "4", label: "4 Hours" },
      { id: "6", value: "6", label: "6 Hours" },
    ]),
  ]

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="space-y-6 w-full mx-auto bg-white rounded-md p-6 my-6">
        <h1 className="text-base md:text-lg lg:text-xl font-semibold text-center">Daily Schedule</h1>
        <p className="text-[13px] sm:text-[15px] text-center !mt-1 sm:!mt-2">Let&apos;s create your personalized study Schedule</p>
        <div className="space-y-4">
          <div className="space-y-2">
                <Label className="text-[13px] sm:text-[15px] flex items-start sm:items-center gap-1.5">
                  <Clock3 className="w-4 h-4"/>
                  How many hours can you dedicate daily for studies?
                </Label>
            <div className="space-y-2 pl-5">
              <RadioGroup
                value={formik.values.dailyHours}
                onValueChange={(value) => formik.setFieldValue('dailyHours', value)}
                className="flex flex-wrap gap-3"
              >
                {dailyHoursOptions.map((option) => (
                  <RadioGroupItem
                    key={option.id}
                    value={option.value}
                    id={option.id}
                    className="sr-only"
                  />
                ))}
                {dailyHoursOptions.map((option) => {
                  const isSelected = formik.values.dailyHours === option.value
                  return (
                    <label
                      key={option.id}
                      htmlFor={option.id}
                      className={`flex items-center px-3 sm:px-4 py-1 sm:py-[7px] rounded-sm border cursor-pointer text-[13px] sm:text-sm font-medium transition-colors text-nowrap select-none ${isSelected
                        ? "bg-primary/10 text-primary border-primary"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                    >
                      {option.label}
                    </label>
                  )
                })}
              </RadioGroup>
              {formik.touched.dailyHours && formik.errors.dailyHours && (
                <p className="text-red-500 text-sm mt-1 ">{formik.errors.dailyHours as string}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label className="text-[13px] sm:text-[15px] flex items-start sm:items-center gap-1.5" htmlFor="preferredStartTime">
                  <SunMedium className="w-5 h-5"/>
                    What time of the day do you wish to start studying?
                  </Label>
              <div className="pl-5 relative">
                <TimePicker
                  showSecond={false}
                  format="h:mm a"
                  placeholder="Select Start Time"
                  className="select-none"
                  onChange={(e) => formik.setFieldValue('preferredStartTime', moment(e).format('HH:mm'))}
                />
                <Clock3 className="absolute right-3 top-2.5 !w-4 !h-4 text-black pointer-events-none" />
              </div>
              {formik.touched.preferredStartTime && formik.errors.preferredStartTime && (
                <p className="text-red-500 text-sm mt-1 ml-5">{formik.errors.preferredStartTime as string}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label className="text-[13px] sm:text-[15px] flex items-start sm:items-center gap-1.5" htmlFor="sleepTime">
                      <Moon className="w-4 h-4"/>
                    What time do you go to bed?
                    </Label>
              <div className="pl-5 relative">
                <TimePicker
                  showSecond={false}
                  format="h:mm a"
                  placeholder="Select End Time"
                  className="select-none"
                  onChange={(e) => formik.setFieldValue('sleepTime', moment(e).format('HH:mm'))}
                />
                <Clock3 className="absolute right-3 top-2.5 !w-4 !h-4 text-black pointer-events-none" />
              </div>
              {formik.touched.sleepTime && formik.errors.sleepTime && (
                <p className="text-red-500 text-sm mt-1 ml-5">{formik.errors.sleepTime as string}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
                <Label className="text-[13px] sm:text-[15px] flex items-start sm:items-center gap-1.5">
                    <CalendarMinus2 className="w-4 h-4"/>
                  Weekly off day preference?
                  </Label>
            <div className="flex flex-wrap gap-4 ml-5">
              {weekDays.map((day) => {

                const isChecked = formik.values.weeklyOffDays.includes(day.value);

                return (
                  <label
                    key={day.day}
                    className={cn(
                      "flex flex-col items-center justify-center w-16 sm:w-20 h-14 border rounded-md cursor-pointer text-xs font-medium transition-colors select-none",
                      {
                        "bg-primary text-white border-transparent": isChecked,
                        "bg-white text-gray-700 border-gray-300 hover:bg-gray-100": !isChecked,
                      }
                    )}
                  >
                    <input
                      type="checkbox"
                      id={`offday-${day.value}`}
                      className="hidden"
                      checked={formik.values.weeklyOffDays.includes(day.value)}
                      onChange={() => handleOffDayChange(day.value)}
                    />
                    <span>{day.day}</span>
                    <span className="text-base font-semibold">{day.short}</span>
                  </label>
                );
              }
              )}
            </div>
            {formik.touched.weeklyOffDays && formik.errors.weeklyOffDays && (
              <p className="text-red-500 text-sm mt-1 ml-5">{formik.errors.weeklyOffDays as string}</p>
            )}
          </div>
          {data.aspirantType === "full-time" && (
            <div className="space-y-2">
                  <Label className="text-[13px] sm:text-[15px] flex items-start sm:items-center gap-1.5">
                    <Brain className="w-4 h-4"/>
                    How many subjects do you want to learn per day?
                    </Label>
              <RadioGroup
                value={formik.values.subjectsPerDay}
                onValueChange={(value) => formik.setFieldValue('subjectsPerDay', value)}
                className="flex flex-col space-y-1 ml-5"
              >
                <div className="flex space-x-2 border rounded-sm p-2 sm:p-3 border-gray-300">
                  <RadioGroupItem value="one" id="one-subject" />
                  <Label htmlFor="one-subject" className="select-none cursor-pointer w-full">
                    <p className="pb-2 text-black text-[13px] sm:text-[15px] font-normal"> One subject per day (focused study)</p>
                    <p className="font-normal text-xs sm:text-[13px]"> Deel dive into one subject for better retention and understanding</p>
                  </Label>
                </div>
                <div className="flex space-x-2 border rounded-sm p-2 sm:p-3 border-gray-300">
                  <RadioGroupItem value="two" id="two-subjects" />
                  <Label htmlFor="two-subjects" className="select-none cursor-pointer w-full">
                    <p className="pb-2 text-black text-[13px] sm:text-[15px] font-normal"> Two subjects per day (parallel study)</p>
                    <p className="font-normal text-xs sm:text-[13px]"> Switch between subjects to maintain engagement and varity</p>
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-gray-600 !mt-6 flex flex-wrap gap-1.5 ml-5 border rounded-sm p-1.5 sm:p-2 pt-2.5 border-gray-200 bg-gray-100 select-none">
                <Lightbulb className="!w-4 !h-4 mt-0.5" />
                <div>
                  <p className="text-black text-[13px] sm:text-[15px] pb-0.5">Personalized Tip :</p>
                  <span className="text-xs sm:text-[13px]">
                    With more study hours available, you can effectively manage
                    two subjects per day for faster coverage.
                  </span>
                </div>
              </p>
              {formik.touched.subjectsPerDay && formik.errors.subjectsPerDay && (
                <p className="text-red-500 text-sm mt-1 ml-5">{formik.errors.subjectsPerDay as string}</p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center flex-wrap gap-2 mx-4">
        <Button type="button" variant="outline" className="gap-1 sm:gap-1.5" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <span className="text-xs sm:text-sm">Step 4 of 5</span>
        <Button type="submit" className={`gap-1 sm:gap-1.5 w-[230px] ${isLoading && 'opacity-50 cursor-not-allowed'}`} disabled={isLoading}>
          {
            isLoading ? (
              <div className="h-6 w-6 relative m-[2px] mx-auto">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              </div>
            ) : (
              <>
                Pay & Generate Timetable <ArrowRight className="w-4 h-4" />
              </>
            )
          }
        </Button>
      </div>
    </form>
  );
}
