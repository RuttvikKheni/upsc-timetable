"use client";

import React, { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import clsx from "clsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useDownload } from "../../lib/hooks/useDownload";
import { useToast } from "../ui/toast";
import { generateTimetable } from "../../lib/gtt";

export function Review({ data, onRegenerate }: any) {
  const [activeWeek, setActiveWeek] = useState(1);
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const weekRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const initialWeeksToShow = 7;
  const { showToast } = useToast();

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

  const scrollToWeek = (week: number) => {
    const target = weekRefs.current[week];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveWeek(week);
    }
  };

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

     const result:any = await downloadFile("/api/download-pdf", filename, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timetableData: data.generatedTimetable,
        }),
      });
      if(result){
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
       if(res.ok){
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
      const newTimetable = generateTimetable(data.formData);
      console.log("Regeneration result:", newTimetable);

      if (onRegenerate) {
        // Pass the result in the same format as the API would return
        onRegenerate({ timetable: newTimetable });
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="leading-[30px]">
              Your Personalized Timetable is Ready
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Development Only: Regenerate Button */}
              {process.env.NODE_ENV === "development" && (
                <Button
                  onClick={regenerateTimetable}
                  disabled={isRegenerating}
                  className="flex items-center gap-2"
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
                className="flex items-center gap-2"
                variant="outline"
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
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-[15px]">
                Total Days: {uniqueDates.length}
              </p>
              <div>
                <p className="text-muted-foreground text-[15px]">
                  Start Date: {uniqueDates[0]}
                </p>
                <p className="text-muted-foreground text-[15px]">
                  End Date: {uniqueDates[uniqueDates.length - 1]}
                </p>
              </div>
            </div>

            {/* Week Navigator */}
            <div className="flex flex-wrap gap-2 sticky top-0 bg-white z-10 py-2 justify-center sm:justify-start">
              {Object.keys(weeks)
                .slice(0, showAllWeeks ? undefined : initialWeeksToShow)
                .map((weekKey: any) => {
                  const week = parseInt(weekKey);
                  return (
                    <Button
                      key={week}
                      variant={activeWeek === week ? "default" : "outline"}
                      size="sm"
                      onClick={() => scrollToWeek(week)}
                      className="hover:bg-[#FFC300] hover:text-black"
                    >
                      Week {week}
                    </Button>
                  );
                })}

              {Object.keys(weeks).length > initialWeeksToShow && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllWeeks(!showAllWeeks)}
                  className="flex items-center gap-1"
                >
                  {showAllWeeks ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      <span>Less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      <span>More</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Timetable Display */}
            <div className="space-y-8">
              {Object.entries(weeks).map(
                ([weekKey, weekData]: [string, any]) => {
                  const week = parseInt(weekKey);
                  return (
                    <div
                      key={week}
                      ref={(el) => {
                        if (el) weekRefs.current[week] = el;
                      }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold">Week {week}</h3>
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        {weekData.map((day: any) => (
                          <Card
                            className="bg-[#57308908] relative"
                            key={day.dayCount}
                          >
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

                                {day.activities.map(
                                  (activity: any, index: number) => (
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
                                    </div>
                                  )
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
