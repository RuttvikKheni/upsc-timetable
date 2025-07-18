import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { loadRazorpay } from "../../lib/loadRazorpay";
import { ArrowLeft, ArrowRight, Clock3, Lightbulb } from "lucide-react";
import { cn } from "../../lib/utils";
import TimePicker from 'rc-time-picker';
import moment from 'moment';
import 'rc-time-picker/assets/index.css';

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

  const [formData, setFormData] = useState({
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
  });

  const handleOffDayChange = (day: string) => {
    const updated = formData.weeklyOffDays.includes(day)
      ? formData.weeklyOffDays.filter((d: string) => d !== day)
      : [...formData.weeklyOffDays, day];
    setFormData({ ...formData, weeklyOffDays: updated });
  };

  const handleRazorpay = async () => {
    // Validation
    localStorage.removeItem("basicInfo");
    if (
      !formData.dailyHours ||
      !formData.preferredStartTime ||
      !formData.sleepTime
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (data.aspirantType === "full-time" && !formData.subjectsPerDay) {
      alert("Please select how many subjects you want to study per day.");
      return;
    }

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert("Failed to load Razorpay SDK. Please try again.");
        return;
      }

      const orderRes = await fetch("/api/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, name: data.fullName }),
      });
      if (!orderRes.ok) {
        // throw new Error("Failed to create order");
        return alert("Failed to create order");
      }

      const orderData = await orderRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "Proxy Gyan Personalized UPSC Timetable",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Ensure working professionals and part-time aspirants have subjectsPerDay set to "one"
            const finalFormData = {
              ...formData,
              subjectsPerDay:
                data.aspirantType === "working professional" ||
                  data.aspirantType === "part-time"
                  ? "one"
                  : formData.subjectsPerDay,
            };

            updateData(finalFormData); // merge last step inputs

            const res = await fetch("/api/generate-timetable", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...data, ...finalFormData }),
            });

            if (!res.ok) {
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
            console.error("Error generating timetable:", error);
            alert("Failed to generate timetable. Please try again.");
          }
        },
        prefill: {
          name: data.fullName,
          email: data.email,
        },
        theme: {
          color: "#4F46E5",
        },
      };

      let paymentFailedCalled = false;
      const rzp = new (window as any).Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (response: any) {
        if (paymentFailedCalled) return;
        paymentFailedCalled = true;
        console.error("Payment Failed:", response.error);
        fetch("/api/timetable/generate-db-timetable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            ...formData,
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
      console.error("Error in payment:", error);
      alert("Failed to initiate payment. Please try again.");
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
    <form>
      <div className="space-y-6 w-full mx-auto bg-white rounded-md p-6 my-6">
        <h1 className="text-base md:text-lg lg:text-xl font-semibold text-center">Daily Schedule</h1>
        <p className="text-[13px] sm:text-[15px] text-center !mt-1 sm:!mt-2">Let&apos;s create your personalized study Schedule</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <ul className="arrow-list">
              {" "}
              <li>
                <Label className="text-[13px] sm:text-[15px]">
                  How many hours can you dedicate daily for studies?
                </Label>
              </li>
            </ul>
            <div className="space-y-2 pl-5">
              <RadioGroup
                value={formData.dailyHours}
                onValueChange={(value) =>
                  setFormData({ ...formData, dailyHours: value })
                }
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
                  const isSelected = formData.dailyHours === option.value
                  return (
                    <label
                      key={option.id}
                      htmlFor={option.id}
                      className={`flex items-center px-3 sm:px-4 py-1 sm:py-[7px] rounded-sm border cursor-pointer text-[13px] sm:text-sm font-medium transition-colors text-nowrap ${isSelected
                        ? "bg-primary/10 text-primary border-primary"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                    >
                      {option.label}
                    </label>
                  )
                })}
              </RadioGroup>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <ul className="arrow-list">
                {" "}
                <li>
                  {" "}
                  <Label className="text-[13px] sm:text-[15px]" htmlFor="preferredStartTime">
                    What time of the day do you wish to start studying?
                  </Label>
                </li>
              </ul>
              <div className="pl-5 relative">
                <TimePicker
                  showSecond={false}
                  format="h:mm a"
                  placeholder="Select Start Time"
                  onChange={(e) => setFormData({ ...formData, preferredStartTime: moment(e).format('HH:mm') })}
                />
                <Clock3 className="absolute right-3 top-2.5 !w-4 !h-4 text-black pointer-events-none" />
              </div>

            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <ul className="arrow-list">
                {" "}
                <li>
                  {" "}
                  <Label className="text-[13px] sm:text-[15px]" htmlFor="sleepTime">What time do you go to bed?</Label>
                </li>
              </ul>
              <div className="pl-5 relative">
                <TimePicker
                  showSecond={false}
                  format="h:mm a"
                  placeholder="Select End Time"
                  onChange={(e) => setFormData({ ...formData, sleepTime: moment(e).format('HH:mm') })}
                />
                <Clock3 className="absolute right-3 top-2.5 !w-4 !h-4 text-black pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <ul className="arrow-list">
              {" "}
              <li>
                {" "}
                <Label className="text-[13px] sm:text-[15px]">Weekly off day preference?</Label>
              </li>
            </ul>
            <div className="flex flex-wrap gap-4 ml-5">
              {weekDays.map((day) => {

                const isChecked = formData.weeklyOffDays.includes(day.day);

                return (
                  <label
                    key={day.day}
                    className={cn(
                      "flex flex-col items-center justify-center w-16 sm:w-20 h-14 border rounded-md cursor-pointer text-xs font-medium transition-colors",
                      {
                        "bg-primary text-white border-transparent": isChecked,
                        "bg-white text-gray-700 border-gray-300 hover:bg-gray-100": !isChecked,
                      }
                    )}
                  >
                    <input
                      type="checkbox"
                      id={`offday-${day.day}`}
                      className="hidden"
                      checked={formData.weeklyOffDays.includes(day.day)}
                      onChange={() => handleOffDayChange(day.day)}
                    />
                    <span>{day.day}</span>
                    <span className="text-base font-semibold">{day.short}</span>
                  </label>
                );
              }
              )}
            </div>
          </div>
          {data.aspirantType === "full-time" && (
            <div className="space-y-2">
              <ul className="arrow-list">
                {" "}
                <li>
                  {" "}
                  <Label className="text-[13px] sm:text-[15px]">How many subjects do you want to learn per day?</Label>
                </li>
              </ul>
              <RadioGroup
                value={formData.subjectsPerDay}
                onValueChange={(value) =>
                  setFormData({ ...formData, subjectsPerDay: value })
                }
                className="flex flex-col space-y-1 ml-5"
              >
                <div className="flex space-x-2 border rounded-sm p-2 sm:p-3 border-gray-300">
                  <RadioGroupItem value="one" id="one-subject" />
                  <Label htmlFor="one-subject">
                    <p className="pb-2 text-black text-[13px] sm:text-[15px] font-normal"> One subject per day (focused study)</p>
                    <p className="font-normal text-xs sm:text-[13px]"> Deel dive into one subject for better retention and understanding</p>
                  </Label>
                </div>
                <div className="flex space-x-2 border rounded-sm p-2 sm:p-3 border-gray-300">
                  <RadioGroupItem value="two" id="two-subjects" />
                  <Label htmlFor="two-subjects">
                    <p className="pb-2 text-black text-[13px] sm:text-[15px] font-normal"> Two subjects per day (parallel study)</p>
                    <p className="font-normal text-xs sm:text-[13px]"> Switch between subjects to maintain engagement and varity</p>
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-gray-600 !mt-6 flex flex-wrap gap-1.5 ml-5 border rounded-sm p-1.5 sm:p-2 pt-2.5 border-gray-200 bg-gray-100">
                <Lightbulb className="!w-4 !h-4 mt-0.5" />
                <div>
                  <p className="text-black text-[13px] sm:text-[15px] pb-0.5">Personalized Tip :</p>
                  <span className="text-xs sm:text-[13px]">
                    With more study hours available, you can effectively manage
                    two subjects per day for faster coverage.
                  </span>
                </div>
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center gap-2 mx-4">
        <Button type="button" variant="outline" className="gap-1 sm:gap-1.5" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <span className="text-xs sm:text-sm">Step 4 of 5</span>
        <Button type="button" className="gap-1 sm:gap-1.5" onClick={handleRazorpay}>
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
