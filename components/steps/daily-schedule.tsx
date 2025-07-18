import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { loadRazorpay } from "../../lib/loadRazorpay";
import React from "react";

interface DailyScheduleProps {
  data: any;
  updateData: (data: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
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

  return (
    <form className="space-y-6 max-w-full sm:max-w-lg mx-auto px-2 sm:px-0">
      <div className="space-y-4">
        <div className="space-y-2">
          <ul className="arrow-list">
            {" "}
            <li>
              <Label className="text-[15px]">
                How many hours can you dedicate daily for studies?
              </Label>
            </li>
          </ul>
          <RadioGroup
            value={formData.dailyHours}
            onValueChange={(value) =>
              setFormData({ ...formData, dailyHours: value })
            }
            className="flex flex-col space-y-1 ml-5"
          >
            {[
              ...(data.aspirantType === "full-time" ? ["8", "10"] : ["4", "6"]),
            ].map((hour) => (
              <div key={hour} className="flex items-center space-x-2">
                <RadioGroupItem value={hour} id={`hour-${hour}`} />
                <Label htmlFor={`hour-${hour}`}>{hour} hours</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <ul className="arrow-list">
            {" "}
            <li>
              {" "}
              <Label className="text-[15px]" htmlFor="preferredStartTime">
                What time of the day do you wish to start studying?
              </Label>
            </li>
          </ul>
          <Input
            type="time"
            className="ml-5"
            id="preferredStartTime"
            value={formData.preferredStartTime}
            onChange={(e) =>
              setFormData({ ...formData, preferredStartTime: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <ul className="arrow-list">
            {" "}
            <li>
              {" "}
              <Label className="text-[15px]" htmlFor="sleepTime">
                What time do you go to bed?
              </Label>
            </li>
          </ul>
          <Input
            type="time"
            id="sleepTime"
            className="ml-5"
            value={formData.sleepTime}
            onChange={(e) =>
              setFormData({ ...formData, sleepTime: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <ul className="arrow-list">
            {" "}
            <li>
              {" "}
              <Label className="text-[15px]">Weekly off day preference?</Label>
            </li>
          </ul>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-5">
            {weekDays.map((day) => (
              <label key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`offday-${day}`}
                  checked={formData.weeklyOffDays.includes(day)}
                  onCheckedChange={() => handleOffDayChange(day)}
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
        </div>
        {data.aspirantType === "full-time" && (
          <div className="space-y-2">
            <ul className="arrow-list">
              {" "}
              <li>
                {" "}
                <Label className="text-[15px]">
                  How many subjects do you want to learn per day?
                </Label>
              </li>
            </ul>
            <RadioGroup
              value={formData.subjectsPerDay}
              onValueChange={(value) =>
                setFormData({ ...formData, subjectsPerDay: value })
              }
              className="flex flex-col space-y-1 ml-5"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one" id="one-subject" />
                <Label htmlFor="one-subject">
                  One subject per day (focused study)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="two" id="two-subjects" />
                <Label htmlFor="two-subjects">
                  Two subjects per day (parallel study)
                </Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-gray-600 !mt-6 flex gap-2">
              💡{" "}
              <span>
                Tip: With more study hours available, you can effectively manage
                two subjects per day for faster coverage.
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button type="button" onClick={handleRazorpay}>
          Pay & Generate Timetable
        </Button>
      </div>
    </form>
  );
}
