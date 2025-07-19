"use client";

import React, { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import clsx from "clsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./../ui/accordian";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "./../ui/select";
import moment from 'moment';

import {
  CalendarCheck,
  Download,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useDownload } from "../../lib/hooks/useDownload";
import { useToast } from "../ui/toast";
import { generateTimetable } from "../../lib/gtt";

export function Review({ data, onRegenerate }: any) {
  const [activeWeek, setActiveWeek] = useState("week-1");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { showToast } = useToast();

  const weekRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleWeekSelect = (value: string) => {
    setActiveWeek(value);

    // Scroll to the selected week smoothly
    const section = weekRefs.current[value];
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const { downloadFile, isDownloading } = useDownload({
    onSuccess: () => {
      showToast("PDF downloaded successfully!", "success");
    },
    onError: (error) => {
      console.error("Download failed:", error);
      showToast("Failed to download PDF. Please try again.", "error");
    },
  });

  if (!data.generatedTimetable?.length) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-muted-foreground">
          No timetable found. Please try again.
        </p>
      </div>
    );
  }

  const entriesByDate = data.generatedTimetable.reduce(
    (acc: any, entry: any) => {
      if (!acc[entry.DATE]) {
        acc[entry.DATE] = [];
      }
      acc[entry.DATE].push(entry);
      return acc;
    },
    {}
  );

  const getTime = (date: number | string | Date) => new Date(date).getTime();

  const uniqueDates = Object.keys(entriesByDate)?.sort(
    (a: any, b: any) => getTime(a) - getTime(b)
  );

  const days = uniqueDates.map((date: any, index: number) => ({
    date,
    dayCount: index + 1,
    activities: entriesByDate[date],
  }));

  const weeks = days.reduce((acc: any, day: any) => {
    const week = Math.floor((day.dayCount - 1) / 7) + 1;
    if (!acc[week]) acc[week] = [];
    acc[week].push(day);
    return acc;
  }, {});

  const getColor = (subject: string) => {
    if (subject === "OPTIONAL") return "text-indigo-600";
    if (subject === "CURRENT AFFAIRS") return "text-green-600";
    if (subject === "CSAT") return "text-orange-600";
    if (subject === "REVISION") return "text-purple-600";
    return "text-blue-600"; // GS subjects
  };

  const downloadPDF = async () => {
    if (!data.generatedTimetable?.length) {
      showToast("No timetable data available to download", "error");
      return;
    }

    // Show progress toast
    showToast("Starting PDF generation...", "info", 2000);

    try {
      const filename = `upsc-timetable-${new Date().toISOString().split("T")[0]
        }.pdf`;

      const result: any = await downloadFile("/api/download-pdf", filename, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timetableData: data.generatedTimetable,
        }),
      });
      if (result) {
        const res = await fetch("/api/timetable/downloadhandle", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            timeTableId: localStorage.getItem("timetableId"),
          }),
        });
        if (!res.ok) {
          throw new Error("Failed to download timetable");
        }
        if (res.ok) {
          localStorage.removeItem("timetableId");
        }

      }
    } catch (error) {
      // Error handling is done in the hook
      console.error("Download failed:", error);
      showToast("Failed to download PDF. Please try again.", "error");
    }
  };

  const regenerateTimetable = async () => {
    if (!data.formData) {
      showToast("No form data available to regenerate", "error");
      return;
    }

    setIsRegenerating(true);
    showToast("Regenerating timetable...", "info", 2000);

    try {
      // Use frontend generateTimetable function instead of API call
      console.log("data.formData", data.formData);

      const res = await fetch("/api/generate-timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data.formData }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate timetable");
      }

      const result = await res.json();

      if (onRegenerate) {
        // Pass the result in the same format as the API would return
        onRegenerate({ timetable: result.timetable });
      }

      showToast("Timetable regenerated successfully!", "success");
    } catch (error) {
      console.error("Regeneration failed:", error);
      showToast("Failed to regenerate timetable. Please try again.", "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="">
      <div className="space-y-6 !border-0 w-full mx-auto bg-white rounded-md !p-4 sm:!p-6 my-4 sm:my-6">
        <CardHeader className="!p-0">
          <div>
            <CardTitle className="!text-lg sm:!text-xl lg:!text-[24px] leading-[30px] text-center mb-2">
              Your Personalized Timetable is Ready
            </CardTitle>
            <p className="text-[13px] sm:text-[15px] text-center">Review your schedule below and start planning your day with ease.</p>
            <div className="flex flex-wrap items-center gap-2 justify-center my-4">
              <p className="text-muted-foreground text-[13px] bg-gray-100 text-gray-700 py-1 px-3 rounded-full flex items-center gap-1.5">
                <CalendarCheck className="!w-4 !h-4" /> Total Days: {uniqueDates.length}
              </p>
              <p className="text-muted-foreground text-[13px] bg-gray-100 text-gray-700 py-1 px-3 rounded-full">
                Start Date: {uniqueDates[0]}
              </p>
              <p className="text-muted-foreground text-[13px] bg-gray-100 text-gray-700 py-1 px-3 rounded-full">
                End Date: {uniqueDates[uniqueDates.length - 1]}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div>
                <Select
                  defaultValue="week-1"
                  value={activeWeek}
                  onValueChange={handleWeekSelect}
                >
                  <SelectTrigger className="ml-auto !h-8 sm:!h-9 gap-1 w-fit max-w-[150px] select-none">
                    <SelectValue placeholder="Jump to Week" className="text-nowrap" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] w-full">
                    {Object.entries(weeks).map(([weekKey]: [string, any]) => {

                      return (
                        <SelectItem
                          key={weekKey}
                          value={`week-${weekKey}`}
                        >
                          Week {weekKey}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              {process.env.NODE_ENV === "development" && false && (
                <Button
                  onClick={regenerateTimetable}
                  disabled={isRegenerating}
                  className="flex items-center gap-2 !h-8 sm:!h-9"
                  variant="secondary"
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Regenerating...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Regenerate</span>
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={downloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 !h-8 sm:!h-9"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </div>
      <div className="space-y-6 !border-0 w-full mx-auto bg-white rounded-md !p-4 !pt-0 sm:!pt-2 sm:!p-6 my-4 sm:my-6">
        <Accordion
          type="single"
          className="w-full"
          collapsible
          value={activeWeek}
          onValueChange={setActiveWeek}
        >
          {Object.entries(weeks).map(([weekKey, weekData]: [string, any]) => (
            <AccordionItem
              key={weekKey}
              value={`week-${weekKey}`}
              ref={(el) => {
                weekRefs.current[`week-${weekKey}`] = el;
              }}
            >
              <AccordionTrigger className="hover:no-underline select-none">
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-white rounded-md w-10 h-10 flex items-center justify-center text-lg font-semibold">
                    {weekKey}
                  </div>
                  <div>
                    <p className="text-sm md:text-base lg:text-lg font-semibold text-left">
                      Week {weekKey}
                    </p>
                    <span className="text-xs sm:text-sm text-body">
                      {moment(weekData[0]?.date, "DD-MM-YYYY").format("MMMM D")}
                      {" "}to{" "}
                      {moment(weekData[weekData.length - 1]?.date, "DD-MM-YYYY").format("MMMM D")}
                      {" "},{" "}
                      {moment(weekData[weekData.length - 1]?.date, "DD-MM-YYYY").endOf('month').format("YYYY")}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="mb-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {weekData.map((day: any) => (
                    <Card key={day.dayCount} className="bg-[#57308908] relative">
                      <CardContent>
                        <div className="space-y-2">
                          <div className="absolute text-nowrap top-0 left-0">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-[15px]">
                                Day {day.dayCount} - {day.date}
                              </CardTitle>
                            </CardHeader>
                          </div>
                          <div className="pt-10 text-red-500">
                            <b>{day.activities.length && day.activities[0]?.isHoliday}</b>
                          </div>
                          {day.activities.map((activity: any, index: number) => (
                            <div
                              key={index}
                              className={`pt-2 first:pt-0 ${index === 0
                                ? "first:!border-t-0"
                                : "!border-t"
                                }`}
                            >
                              <div
                                className={`flex !items-start mb-2 gap-2 relative ${activity.SUBJECT ? "" : "justify-end"
                                  } ${(activity.SUBJECT &&
                                    !activity["MAIN SUBJECT"]) ||
                                    activity.SUBTOPICS ===
                                    "Complete subject review and consolidation"
                                    ? "justify-end"
                                    : "justify-between"
                                  }`}
                              >
                                {activity.SUBJECT &&
                                  activity.SUBTOPICS !==
                                  "Complete subject review and consolidation" && (
                                    <h4
                                      className={`font-medium text-[15px]`}
                                    >
                                      {activity.SUBJECT}
                                    </h4>
                                  )}
                                <span
                                  className={clsx(
                                    `text-sm font-medium text-end ${activity.SUBJECT
                                      ? "w-[100px]"
                                      : ""
                                    }`,
                                    getColor(activity["MAIN SUBJECT"])
                                  )}
                                >
                                  {activity["MAIN SUBJECT"]}
                                </span>
                              </div>
                              <div className="space-y-2 text-sm">
                                {activity.TOPIC && (
                                  <div>
                                    <Label className="text-muted-foreground">
                                      Topic
                                    </Label>
                                    <p>{activity.TOPIC}</p>
                                  </div>
                                )}
                                {activity.SUBTOPICS && (
                                  <div>
                                    <Label className="text-muted-foreground">
                                      Subtopics
                                    </Label>
                                    <ol className="list-inside mt-1 space-y-1 list-decimal">
                                      {activity.SUBTOPICS.split(
                                        " | "
                                      ).map(
                                        (
                                          subtopic: string,
                                          index: number
                                        ) => (
                                          <div
                                            key={index}
                                            className="flex items-start"
                                          >
                                            <li className="text-sm"></li>
                                            <span className="text-xs mt-1">
                                              {subtopic.trim()}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </ol>
                                  </div>
                                )}
                                {activity?.HOURS && (
                                  <div>
                                    <Label className="text-muted-foreground">
                                      {activity.HOURS > 1
                                        ? "Hours"
                                        : "Hour"}
                                    </Label>
                                    <p>
                                      {activity.HOURS}{" "}
                                      {activity.HOURS > 1
                                        ? "hours"
                                        : "hour"}
                                    </p>
                                  </div>
                                )}
                                {activity.RECOMMENDED_SOURCES && (
                                  <div>
                                    <Label className="text-muted-foreground">
                                      Recommended Sources
                                    </Label>
                                    <p className="text-sm">
                                      {activity.RECOMMENDED_SOURCES}
                                    </p>
                                  </div>
                                )}
                              </div>
                              {/* Same SUBJECT, TOPIC, HOURS logic */}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );

}
