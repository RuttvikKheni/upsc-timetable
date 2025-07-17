// Required libraries
import dayjs from "dayjs";
import breakdowns1To8 from "../data/sub_topics_breakdown-1-8.json";
import breakdowns9To12 from "../data/sub_topics_breakdown-9-12.json";
import breakdownsFull from "../data/sub_topics_breakdown.json";
import syllabus from "../data/full_syllabus.json";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { getHolidays, Holiday } from "public-holidays";
dayjs.extend(isSameOrBefore);
export enum AspirantType {
  FULL_TIME = "full-time",
  PART_TIME = "part-time",
  WORKING_PROFESSIONAL = "working professional",
}

const BIG_SUBJECTS = [
  "GEOGRAPHY",
  "ECONOMY",
  "POLITY AND GOVERNANCE",
  "HISTORY",
];

// Interfaces
export interface StudentProfile {
  aspirantType: AspirantType;
  preparationStartDate: string;
  weeklyOffDays: string[];
  startedSubjects: string[];
  confidentSubjects: string[];
  difficultSubjects: string[];
  halfDoneSubjects: string[];
  finishedSubjects: string[];
  dailyHours: string;
  preferredStartTime: string;
  sleepTime: string;
  optionalSubject: string;
  subjectsPerDay?: "one" | "two";
  targetYear: string;
}

interface SubTopicBreakdown {
  "MAIN SUBJECT": string;
  SUBJECT: string;
  "AVERAGE HOURS": number;
  "NUMBER OF SUBTOPICS": number;
  "FULL-TIME ASPIRANT (SUBTOPICS PER DAY) IF ONE SUBJECT IS SELECTED": number;
  "PART-TIME ASPIRANT (SUBTOPICS PER DAY) IF ONE SUBJECT IS SELECTED": number;
}

interface DailySchedule {
  DATE: string;
  "MAIN SUBJECT": string;
  SUBJECT: string | null;
  TOPIC?: string;
  SUBTOPICS?: string;
  RECOMMENDED_SOURCES?: string;
  NOTES?: string;
  HOURS?: number;
  isHoliday?: string | null;
}

interface SubjectProgress {
  mainSubject: string;
  currentSubject: string;
  currentSubjectIndex: number;
  subtopicsCompleted: number;
  totalSubtopicsInCurrentSubject: number;
  isSubjectCompleted: boolean;
  priority: number;
}
export async function getPublicHoliday(startDate: string): Promise<Holiday[]> {
  const date = new Date(startDate);

  const holidays: Holiday[] = await getHolidays({
    country: "IN",
    start: new Date(date.getFullYear(), 0, 1),
    end: new Date(date.getFullYear() + 6, 0, 1),
    lang: "en",
  });

  return holidays;
}
// Helper Functions
function isSunday(date: dayjs.Dayjs): boolean {
  return date.format("dddd") === "Sunday";
}

function isWeekdayOffDay(date: dayjs.Dayjs, weeklyOffDays: string[]): boolean {
  const dayName = date.format("dddd");
  // Only check for weekdays (Monday-Friday), exclude Saturday and Sunday
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  return weekdays.includes(dayName) && weeklyOffDays.includes(dayName);
}

function getSubtopicsPerDay(
  aspirantType: StudentProfile["aspirantType"],
  breakdown: SubTopicBreakdown,
  gsHoursPerSubject: number,
  numberOfSubjects: number = 1,
  isSundayForWorking: boolean = false,
  isHoliday: boolean | null = null
): number {
  if (isHoliday) aspirantType = AspirantType.FULL_TIME

  // For working professionals, handle weekdays vs Sundays differently
  if (aspirantType === "working professional") {
    // Use full-time breakdown as base for working professionals
    const baseSubtopics =
      breakdown[
        "FULL-TIME ASPIRANT (SUBTOPICS PER DAY) IF ONE SUBJECT IS SELECTED"
      ];

    if (isSundayForWorking) {
      // Sundays: Use same limit as full-time (e.g., 3 subtopics for Modern History)
      return baseSubtopics;
    } else {
      // Weekdays: Limited by available time (1 hour GS)
      // 3 × (1 ÷ 2) = 1.5 → 2 subtopics
      const originalTimePerSubject = 2;
      const adjustmentFactor = gsHoursPerSubject / originalTimePerSubject;
      const adjustedSubtopics = Math.ceil(baseSubtopics * adjustmentFactor);

      return Math.max(1, adjustedSubtopics);
    }
  }

  // Get base subtopics per day from breakdown for full-time and part-time
  let baseSubtopics: number;
  if (aspirantType === "full-time") {
    baseSubtopics =
      breakdown[
        "FULL-TIME ASPIRANT (SUBTOPICS PER DAY) IF ONE SUBJECT IS SELECTED"
      ];
  } else {
    baseSubtopics =
      breakdown[
        "PART-TIME ASPIRANT (SUBTOPICS PER DAY) IF ONE SUBJECT IS SELECTED"
      ];
  }

  // If only one subject is selected, use the breakdown value directly
  // since it already accounts for "IF ONE SUBJECT IS SELECTED"
  if (numberOfSubjects === 1) {
    return baseSubtopics;
  }

  // For multiple subjects, divide the base subtopics by number of subjects
  // Use Math.ceil to round up as expected (41/2 = 20.5 → 21)
  const adjustedSubtopics = Math.ceil(baseSubtopics / numberOfSubjects);

  // Ensure minimum of 1 subtopic per day
  return Math.max(1, adjustedSubtopics);
}

function getGSHours(
  aspirantType: AspirantType,
  isSundayForWorking: boolean = false,
  isHoliday: boolean | null = null
): number {
  if (isHoliday) return 5; // Fixed 5 hours for holidays
  switch (aspirantType) {
    case AspirantType.FULL_TIME:
      return 5; // Fixed 5 hours for GS subjects
    case AspirantType.PART_TIME:
      return 4; // Fixed 4 hours for GS subjects
    case AspirantType.WORKING_PROFESSIONAL:
      return isSundayForWorking ? 6 : 1; // 1 hour weekdays, 6 hours Sundays
    default:
      return 3;
  }
}

function getOptionalHours(aspirantType: AspirantType, isHoliday: boolean | null = null): number {
  if (isHoliday) return 3; // Fixed 3 hours for holidays
  switch (aspirantType) {
    case AspirantType.FULL_TIME:
      return 3;
    case AspirantType.PART_TIME:
      return 2;
    case AspirantType.WORKING_PROFESSIONAL:
      return 1;
    default:
      return 1;
  }
}

function getCurrentAffairsHours(): number {
  return 1; // Fixed 1 hour for all aspirant types
}

function getMainsAnswerWritingHours(): number {
  return 0.5; // Fixed 30 minutes (0.5 hours) for all aspirant types
}

function calculateEndTime(startTime: string, hours: number): string {
  const [h, m] = startTime.split(":").map(Number);
  return dayjs()
    .hour(h)
    .minute(m)
    .add(hours * 60, "minute")
    .format("HH:mm");
}

function getRecommendedSources(mainSubject: string, subject: string): string {
  // Handle revision case
  if (subject === "REVISION" || subject.includes("REVISION")) {
    const sourceMap: Record<string, string> = {
      HISTORY: "NCERT Class 6-12, Bipan Chandra, Spectrum, Previous notes",
      GEOGRAPHY: "NCERT Class 11-12, G.C. Leong, Majid Husain, Previous notes",
      "POLITY AND GOVERNANCE": "NCERT Class 11-12, Laxmikanth, Previous notes",
      ECONOMY: "NCERT Class 11-12, Economic Survey, Previous notes",
      "SCIENCE & TECHNOLOGY":
        "NCERT Class 6-12, Science & Technology magazines, Previous notes",
      "ENVIRONMENT AND ECOLOGY":
        "NCERT Class 11-12, Shankar IAS Environment, Previous notes",
      "ETHICS, INTEGRITY & APTITUDE": "NCERT, Ethics books, Previous notes",
      "INDIAN SOCIETY AND SOCIAL JUSTICE":
        "NCERT Class 11-12, Social Issues books, Previous notes",
      "INTERNATIONAL RELATIONS": "NCERT, Current Affairs, Previous notes",
      "DISASTER MANAGEMENT": "NCERT, Disaster Management books, Previous notes",
      "INTERNAL SECURITY": "NCERT, Security related books, Previous notes",
    };

    return (
      sourceMap[mainSubject] ||
      "Previous study materials, notes, and standard books"
    );
  }

  // You can expand this based on your requirements
  const sourceMap: Record<string, Record<string, string>> = {
    HISTORY: {
      "ANCIENT HISTORY": "NCERT Class 6-12, Bipan Chandra, R.S. Sharma",
      "MODERN HISTORY": "NCERT Class 8-12, Bipan Chandra, Spectrum",
      "MEDIEVAL HISTORY": "NCERT Class 7-11, Satish Chandra",
      "ART & CULTURE": "NCERT Fine Arts, Nitin Singhania",
      "WORLD HISTORY": "NCERT Class 9-11, Norman Lowe",
      "POST INDEPENDENCE INDIAN HISTORY": "NCERT Class 12, Bipan Chandra",
    },
    GEOGRAPHY: {
      "PHYSICAL GEOGRAPHY": "NCERT Class 11, G.C. Leong",
      "HUMAN GEOGRAPHY": "NCERT Class 12, Majid Husain",
      "ECONOMIC GEOGRAPHY": "NCERT Class 12, Economic Survey",
      "PHYSICAL GEOGRAPHY OF INDIA": "NCERT Class 11, Khullar",
    },
  };

  return (
    sourceMap[mainSubject]?.[subject] || "Standard NCERT and Reference Books"
  );
}

const getBreakdowns = (startDate: string, targetYear: string) => {
  const startYearObj = new Date(startDate).getFullYear() + 1;
  const targetYearObj = new Date(`${targetYear}-05-01`).getFullYear();
  if (startYearObj !== targetYearObj) return breakdownsFull;

  const startMonthObj = new Date(startDate).getMonth() + 1;
  if (startMonthObj <= 8) return breakdowns1To8;
  if (startMonthObj <= 12) return breakdowns9To12;

  return breakdownsFull;
};

const updateBreakdownsProfile = (profile: StudentProfile): StudentProfile => {
  const startYearObj = new Date(profile.preparationStartDate).getFullYear() + 1;
  const targetYearObj = new Date(`${profile.targetYear}-05-01`).getFullYear();
  if (startYearObj !== targetYearObj) return profile;

  const startMonthObj = new Date(profile.preparationStartDate).getMonth() + 1;
  if (startMonthObj <= 12) {
    profile.confidentSubjects = [];
    return profile;
  }

  return profile;
};

// Main Logic
export async function generateTimetable(profile: StudentProfile): Promise<DailySchedule[]> {
  const timetable: DailySchedule[] = [];
  const PublicHolidays = await getPublicHoliday(profile.preparationStartDate);

  const breakdowns = getBreakdowns(
    profile.preparationStartDate,
    profile.targetYear
  );

  profile = updateBreakdownsProfile(profile);

  // Create subject pool based on priority (as per cursor rules)
  // Priority order: difficultSubjects, startedSubjects, halfDoneSubjects, confidentSubjects, finishedSubjects
  // NOTE: finishedSubjects should NOT be studied - they are already completed
  const priorityOrder = [
    { subjects: profile.difficultSubjects, priority: 1 },
    { subjects: profile.startedSubjects, priority: 2 },
    { subjects: profile.halfDoneSubjects, priority: 3 },
    { subjects: profile.confidentSubjects, priority: 4 },
    // finishedSubjects are NOT added to the study pool - they are already completed
  ];

  const subjectPool: Array<{ subject: string; priority: number }> = [];

  // Add subjects in priority order (excluding finishedSubjects)
  priorityOrder.forEach(({ subjects, priority }) => {
    subjects.forEach((subject) => {
      subjectPool.push({ subject, priority });
    });
  });

  // Add remaining subjects that aren't in user's selection
  const usedSubjects = new Set([
    ...profile.difficultSubjects,
    ...profile.startedSubjects,
    ...profile.halfDoneSubjects,
    ...profile.confidentSubjects,
    ...profile.finishedSubjects, // Keep this to exclude finished subjects from being added as "remaining"
  ]);

  breakdowns.forEach((b) => {
    // Skip CSAT - it will be handled separately with special logic
    if (!usedSubjects.has(b["MAIN SUBJECT"]) && b["MAIN SUBJECT"] !== "CSAT") {
      subjectPool.push({ subject: b["MAIN SUBJECT"], priority: 6 });
    }
  });

  // If no subjects to study, return empty timetable
  if (subjectPool.length === 0) {
    return timetable;
  }

  // Initialize progress tracking for each main subject (excluding finishedSubjects)
  const subjectProgressMap: Record<string, SubjectProgress> = {};
  const completedSubjects = new Set<string>(); // Track subjects that have been completed

  // Mark finishedSubjects as already completed
  profile.finishedSubjects.forEach((subject) => {
    completedSubjects.add(subject);
  });

  subjectPool.forEach(({ subject: mainSubject, priority }) => {
    const subjectsInMain = breakdowns
      .filter((b) => b["MAIN SUBJECT"] === mainSubject)
      .map((b) => b.SUBJECT);
    if (subjectsInMain.length > 0) {
      const firstSubject = subjectsInMain[0];
      const totalSubtopicsInFirst = syllabus.filter(
        (s) => s["MAIN SUBJECT"] === mainSubject && s.SUBJECT === firstSubject
      ).length;

      subjectProgressMap[mainSubject] = {
        mainSubject,
        currentSubject: firstSubject,
        currentSubjectIndex: 0,
        subtopicsCompleted: 0,
        totalSubtopicsInCurrentSubject: totalSubtopicsInFirst,
        isSubjectCompleted: false,
        priority,
      };
    }
  });

  let currentDate = dayjs(profile.preparationStartDate);

  // Calculate important dates
  const targetYear = parseInt(profile.targetYear);
  const prelimsDate = dayjs(`${targetYear}-05-01`);
  const csatStartDate = prelimsDate.subtract(4, "month");
  let csatAdded = false;

  // Calculate MAINS Answer Writing period (after first 3 months, for 3 months)
  const mainsStartDate = dayjs(profile.preparationStartDate).add(3, "month");
  const mainsEndDate = mainsStartDate.add(3, "month");

  // Continue until all subjects are completed AND we've reached the prelims date, with a safety limit
  let day = 0;
  const maxDays = 730; // Increased safety limit to handle longer preparation periods
  let revisionWeekSubject: string | null = null; // Track if we're in a revision week
  let revisionDaysLeft = 0; // Days left in current revision week
  let completedSubjectNeedingRevision: string | null = null; // Track subject that needs revision next day

  // Track daily subtopic counts per subject to respect limits
  const dailySubtopicCounts: Record<string, Record<string, number>> = {};

  while (day < maxDays) {
    const isTodayPublicHoliday = PublicHolidays.find(hd => dayjs(hd.date).isSame(currentDate, "day"));
    const isHoliday = isTodayPublicHoliday ? `(Public Holiday) ${isTodayPublicHoliday?.name}` : null;

    // Check if all subjects are completed
    const allSubjectsCompleted = subjectPool.every(({ subject }) => {
      const progress = subjectProgressMap[subject];
      return !progress || progress.isSubjectCompleted;
    });

    // Check if CSAT is completed
    const csatProgress = subjectProgressMap["CSAT"];
    const csatCompleted = csatProgress
      ? csatProgress.isSubjectCompleted
      : false;

    // Continue until:
    // 1. All subjects (including CSAT) are completed, OR
    // 2. We've reached the prelims date (no point continuing after exam)
    if (
      (allSubjectsCompleted && csatCompleted && revisionWeekSubject === null) ||
      currentDate.isAfter(prelimsDate)
    ) {
      break;
    }

    // Track which subjects have been processed today to prevent duplicates
    const processedSubjectsToday = new Set<string>();

    // Handle revision week
    if (revisionWeekSubject && revisionDaysLeft > 0) {
      const dateStr = currentDate.format("DD-MM-YYYY");
      const dayOfWeek = currentDate.format("dddd");

      // For working professionals, skip Sundays during revision week
      // For part-time and full-time, study all 7 days including Sundays
      // Also check for weekday off days during revision week
      const shouldStudyToday =
        profile.aspirantType === AspirantType.WORKING_PROFESSIONAL
          ? dayOfWeek !== "Sunday" &&
            !isWeekdayOffDay(currentDate, profile.weeklyOffDays)
          : !isWeekdayOffDay(currentDate, profile.weeklyOffDays);

      if (shouldStudyToday) {
        // Special handling for working professionals - different hours on weekdays vs Sundays
        let revisionDailyHours: number;
        if (profile.aspirantType === AspirantType.WORKING_PROFESSIONAL) {
          revisionDailyHours = isSunday(currentDate) ? 8 : 3;
        } else {
          revisionDailyHours = getGSHours(profile.aspirantType, false, Boolean(isTodayPublicHoliday));
        }

        // Determine the type of activity based on remaining days
        if (revisionDaysLeft === 2) {
          // First day: Subject Revision
          timetable.push({
            DATE: dateStr,
            "MAIN SUBJECT": revisionWeekSubject,
            SUBJECT: `${revisionWeekSubject} - REVISION`,
            TOPIC: "Subject Revision",
            SUBTOPICS: "Complete subject review and consolidation",
            NOTES: `Revision day for ${revisionWeekSubject}`,
            HOURS: revisionDailyHours,
            isHoliday,
          });
        } else if (revisionDaysLeft === 1) {
          // Second day: NCERT MCQ test
          timetable.push({
            DATE: dateStr,
            "MAIN SUBJECT": revisionWeekSubject,
            SUBJECT: `${revisionWeekSubject} - NCERT MCQ TEST`,
            TOPIC: "NCERT MCQ Practice",
            SUBTOPICS: "Multiple choice questions from NCERT textbooks",
            NOTES: `NCERT MCQ test day for ${revisionWeekSubject}`,
            HOURS: revisionDailyHours,
            isHoliday,
          });
        }

        revisionDaysLeft--;
        if (revisionDaysLeft === 0) {
          revisionWeekSubject = null;
        }
      } else {
        // If today is an off day during revision week, add a note but don't decrement revision days
        timetable.push({
          DATE: dateStr,
          "MAIN SUBJECT": "OFF DAY",
          SUBJECT: "Weekly Off",
          TOPIC: "Rest Day",
          HOURS: 0,
          SUBTOPICS: "No study scheduled - Weekly off day",
          NOTES: `Off day during ${revisionWeekSubject} revision`,
          isHoliday,
        });
      }

      currentDate = currentDate.add(1, "day");
      day++;
      continue;
    }

    // Handle weekday off days (Monday-Friday only, excluding Saturday and Sunday)
    if (isWeekdayOffDay(currentDate, profile.weeklyOffDays)) {
      timetable.push({
        DATE: currentDate.format("DD-MM-YYYY"),
        "MAIN SUBJECT": "OFF DAY",
        SUBJECT: "Weekly Off",
        TOPIC: "Rest Day",
        HOURS: 0,
        SUBTOPICS: "No study scheduled - Weekly off day",
        NOTES: `Weekly off day - ${currentDate.format("dddd")}`,
        isHoliday,
      });
      currentDate = currentDate.add(1, "day");
      day++;
      continue;
    }

    // Add CSAT when we reach the CSAT start date, regardless of subject completion status
    if (
      !csatAdded &&
      (currentDate.isAfter(csatStartDate) || currentDate.isSame(csatStartDate))
    ) {
      // Add CSAT to subject pool with high priority
      subjectPool.push({ subject: "CSAT", priority: 0 }); // Highest priority

      // Initialize CSAT progress
      const csatBreakdown = breakdowns.find(
        (b) => b["MAIN SUBJECT"] === "CSAT"
      );
      if (csatBreakdown) {
        const totalCsatSubtopics = syllabus.filter(
          (s) => s["MAIN SUBJECT"] === "CSAT"
        ).length;

        subjectProgressMap["CSAT"] = {
          mainSubject: "CSAT",
          currentSubject: "CSAT",
          currentSubjectIndex: 0,
          subtopicsCompleted: 0,
          totalSubtopicsInCurrentSubject: totalCsatSubtopics,
          isSubjectCompleted: false,
          priority: 0, // Highest priority
        };
      }
      csatAdded = true;
    }

    // Handle Sundays
    if (isSunday(currentDate)) {
      if (day === 0) {
        // Allow study on first Sunday
      } else if (profile.aspirantType !== AspirantType.WORKING_PROFESSIONAL) {
        timetable.push({
          DATE: currentDate.format("DD-MM-YYYY"),
          "MAIN SUBJECT": "REVISION",
          SUBJECT: "WEEKLY REVIEW",
          TOPIC: "Weekly Revision",
          SUBTOPICS: "Review previous week's material",
          NOTES: "Weekly revision day",
          isHoliday,
        });
        currentDate = currentDate.add(1, "day");
        day++;
        continue;
      }
      // For working professionals, Sundays are regular study days with 8 hours GS time
      // So we don't skip Sunday, just continue with normal flow
    }

    // Time allocation setup based on aspirant type
    const aspirantType = profile.aspirantType;

    // Get fixed hours for each component based on new calculation system
    const optionalHours = getOptionalHours(aspirantType, Boolean(isTodayPublicHoliday));
    const currentAffairsHours = getCurrentAffairsHours();
    const gsHours = getGSHours(aspirantType, isSunday(currentDate), Boolean(isTodayPublicHoliday));

    // Check if we should include MAINS Answer Writing (after first 5 months, for 4 months)
    const shouldIncludeMainsAnswerWriting =
      (currentDate.isAfter(mainsStartDate) ||
        currentDate.isSame(mainsStartDate)) &&
      currentDate.isBefore(mainsEndDate);

    const mainsAnswerWritingHours = shouldIncludeMainsAnswerWriting
      ? getMainsAnswerWritingHours()
      : 0;

    // Calculate total required hours for validation
    const totalRequiredHours =
      optionalHours + currentAffairsHours + gsHours + mainsAnswerWritingHours;

    // For working professionals, validate against available time
    if (aspirantType === AspirantType.WORKING_PROFESSIONAL) {
      const availableHours = isSunday(currentDate) ? 8 : 3; // Total available hours: 3hrs weekdays, 8hrs Sundays
      if (totalRequiredHours > availableHours) {
        // This shouldn't happen with our fixed allocation, but just in case
        console.warn(
          `Required hours (${totalRequiredHours}) exceed available hours (${availableHours}) for working professional`
        );
      }
    }

    // Find the current priority subjects to study (allow parallel study for part-time and full-time)
    const currentMainSubjects: string[] = [];

    // Determine how many subjects can be studied in parallel
    let maxSubjectsPerDay: number;
    if (
      aspirantType === AspirantType.WORKING_PROFESSIONAL ||
      aspirantType === AspirantType.PART_TIME
    ) {
      maxSubjectsPerDay = 1;
    } else if (
      aspirantType === AspirantType.FULL_TIME &&
      profile.subjectsPerDay
    ) {
      // Use user's preference for full-time aspirants only
      maxSubjectsPerDay = profile.subjectsPerDay === "one" ? 1 : 2;
    } else {
      // Default behavior for full-time aspirants without preference
      maxSubjectsPerDay = 2;
    }

    // Get all active subjects grouped by priority
    const activeSubjectsByPriority: Record<number, { big: string[]; small: string[] }> = {};

    subjectPool.forEach(({ subject, priority }) => {
      const progress = subjectProgressMap[subject];
      if (progress && !progress.isSubjectCompleted) {
        if (!activeSubjectsByPriority[priority]) {
          activeSubjectsByPriority[priority] = { big: [], small: [] };
        }

        if (BIG_SUBJECTS.includes(subject)) {
          activeSubjectsByPriority[priority].big.push(subject);
        } else {
          activeSubjectsByPriority[priority].small.push(subject);
        }
      }
    });

    // Find the highest priority (lowest number) that has active subjects
    const activePriorities = Object.keys(activeSubjectsByPriority)
      .map((p) => parseInt(p))
      .sort((a, b) => a - b);

    let bigSelected = false;
    let smallSelected = false;

    // Select subjects for today based on priority and parallel study capacity
    for (const priority of activePriorities) {
      const { big, small } = activeSubjectsByPriority[priority];

      // Pick one big subject if needed
      if (!bigSelected && big.length > 0 && currentMainSubjects.length < maxSubjectsPerDay) {
        currentMainSubjects.push(big[0]);
        bigSelected = true;
      }

      // Pick one small subject if needed
      if (!smallSelected && small.length > 0 && currentMainSubjects.length < maxSubjectsPerDay) {
        currentMainSubjects.push(small[0]);
        smallSelected = true;
      }

      // Fill remaining slots with available subjects (either big or small)
      const combined = [...big.slice(bigSelected ? 1 : 0), ...small.slice(smallSelected ? 1 : 0)];

      for (const subject of combined) {
        if (currentMainSubjects.length < maxSubjectsPerDay) {
          currentMainSubjects.push(subject);
        } else {
          break;
        }
      }

      // If we have enough subjects for today, stop looking at lower priorities
      if (currentMainSubjects.length >= maxSubjectsPerDay) {
        break;
      }
    }

    let startTime = profile.preferredStartTime;

    // ✅ OPTIONAL SUBJECT BLOCK

    const decemberEnd = `${dayjs(profile.preparationStartDate).year()}-12-31`;
    const startDate = dayjs(profile.preparationStartDate).add(1, "year").year();
    const targetDate = profile.targetYear;
    if (startDate.toString() === targetDate) {
      if (profile.aspirantType === "part-time") {
        const monthDiff = currentDate.diff(
          profile.preparationStartDate,
          "month",
          true
        );

        if (monthDiff < 5 && currentDate.isSameOrBefore(decemberEnd)) {
          timetable.push({
            DATE: currentDate.format("DD-MM-YYYY"),
            "MAIN SUBJECT": "OPTIONAL",
            SUBJECT: profile.optionalSubject || "Optional Subject",
            HOURS: optionalHours,
            RECOMMENDED_SOURCES: "Standard Books for Optional Subject",
            isHoliday,
          });

          startTime = calculateEndTime(startTime, optionalHours);
        }
      } else if (profile.aspirantType === "full-time") {
        const monthDiff = currentDate.diff(
          profile.preparationStartDate,
          "month",
          true
        );

        if (monthDiff < 3 && currentDate.isSameOrBefore(decemberEnd)) {
          timetable.push({
            DATE: currentDate.format("DD-MM-YYYY"),
            "MAIN SUBJECT": "OPTIONAL",
            SUBJECT: profile.optionalSubject || "Optional Subject",
            HOURS: optionalHours,
            RECOMMENDED_SOURCES: "Standard Books for Optional Subject",
            isHoliday,
          });

          startTime = calculateEndTime(startTime, optionalHours);
        }
      }
    } else {
      if (profile.aspirantType === "part-time" || profile.aspirantType === AspirantType.WORKING_PROFESSIONAL) {
        const monthDiff = currentDate.diff(
          dayjs(profile.preparationStartDate),
          "month",
          true
        );

        if (monthDiff < 6) {
          timetable.push({
            DATE: currentDate.format("DD-MM-YYYY"),
            "MAIN SUBJECT": "OPTIONAL",
            SUBJECT: profile.optionalSubject || "Optional Subject",
            HOURS: optionalHours,
            RECOMMENDED_SOURCES: "Standard Books for Optional Subject",
            isHoliday,
          });

          startTime = calculateEndTime(startTime, optionalHours);
        }
      } else if (profile.aspirantType === "full-time") {
        const monthDiff = currentDate.diff(
          dayjs(profile.preparationStartDate),
          "month",
          true
        );

        if (monthDiff < 4) {
          timetable.push({
            DATE: currentDate.format("DD-MM-YYYY"),
            "MAIN SUBJECT": "OPTIONAL",
            SUBJECT: profile.optionalSubject || "Optional Subject",
            HOURS: optionalHours,
            RECOMMENDED_SOURCES: "Standard Books for Optional Subject",
            isHoliday,
          });

          startTime = calculateEndTime(startTime, optionalHours);
        }
      }
    }

    // ✅ CURRENT AFFAIRS BLOCK
    timetable.push({
      DATE: currentDate.format("DD-MM-YYYY"),
      "MAIN SUBJECT": "CURRENT AFFAIRS",
      SUBJECT: "Daily News & Editorials",
      HOURS: currentAffairsHours,
      RECOMMENDED_SOURCES:
        "The Hindu, Indian Express, Yojana, Kurukshetra, PIB",
      isHoliday,
    });
    startTime = calculateEndTime(startTime, currentAffairsHours);

    // ✅ MAINS ANSWER WRITING BLOCK (only after first 5 months, for 4 months)
    const month = currentDate.month();
    const isMainsMonth = month === 9 || month === 10 || month === 11;

    if (isMainsMonth) {
      timetable.push({
        DATE: currentDate.format("DD-MM-YYYY"),
        "MAIN SUBJECT": "MAINS",
        SUBJECT: "Answer Writing Practice",
        TOPIC: "Daily Answer Writing",
        SUBTOPICS: "Practice writing structured answers for mains questions",
        HOURS: mainsAnswerWritingHours,
        NOTES: "30 minutes daily answer writing practice",
        isHoliday,
      });
      startTime = calculateEndTime(startTime, mainsAnswerWritingHours);
    }

    // ✅ GS SUBJECT BLOCKS (Allow parallel study of multiple subjects)
    if (currentMainSubjects.length > 0) {
      const gsHoursPerSubject = gsHours / currentMainSubjects.length;

      for (const mainSubject of currentMainSubjects) {
        const progress = subjectProgressMap[mainSubject];
        if (!progress || progress.isSubjectCompleted) continue;

        // Skip if this subject has already been processed today
        const subjectKey = `${progress.mainSubject}-${progress.currentSubject}`;
        if (processedSubjectsToday.has(subjectKey)) {
          continue;
        }

        // Track remaining time for this main subject
        let remainingTimeForMainSubject = gsHoursPerSubject;
        let currentSubjectInMain = progress.currentSubject;
        let currentSubjectIndex = progress.currentSubjectIndex;
        let subtopicsCompletedInCurrent = progress.subtopicsCompleted;
        let isFirstSubjectOfDay = true; // Track if this is the first subject being processed for this main subject today
        let hasScheduledSubtopicsToday = false; // Track if we've actually scheduled any subtopics today

        // Continue processing subjects within this main subject until time runs out
        while (
          remainingTimeForMainSubject > 0 &&
          !progress.isSubjectCompleted
        ) {
          // Get current subject breakdown
          const currentBreakdown = breakdowns.find(
            (b) =>
              b["MAIN SUBJECT"] === progress.mainSubject &&
              b.SUBJECT === currentSubjectInMain
          );

          if (!currentBreakdown) break;

          // Get subtopics for current subject
          const currentSubjectSubtopics = syllabus.filter(
            (s) =>
              s["MAIN SUBJECT"] === progress.mainSubject &&
              s.SUBJECT === currentSubjectInMain
          );

          const remainingSubtopics = currentSubjectSubtopics.slice(
            subtopicsCompletedInCurrent
          );

          if (remainingSubtopics.length === 0) {
            // Current subject is completed, move to next subject in the same main subject
            const allSubjectsInMain = breakdowns
              .filter((b) => b["MAIN SUBJECT"] === progress.mainSubject)
              .map((b) => b.SUBJECT);

            const nextSubjectIndex = currentSubjectIndex + 1;

            if (nextSubjectIndex < allSubjectsInMain.length) {
              // Move to next subject within the same main subject
              currentSubjectInMain = allSubjectsInMain[nextSubjectIndex];
              currentSubjectIndex = nextSubjectIndex;
              subtopicsCompletedInCurrent = 0;
              // Don't set isFirstSubjectOfDay = false here - only set it after actually scheduling subtopics

              // Continue the loop to process the new subject with remaining time
              continue;
            } else {
              // All subjects in this main subject are completed
              progress.isSubjectCompleted = true;

              // Check if this subject was just completed (not already in completed set)
              if (!completedSubjects.has(progress.mainSubject)) {
                completedSubjects.add(progress.mainSubject);

                // If CSAT is available and we're on or after December 1st, boost its priority
                if (
                  csatAdded &&
                  (currentDate.isAfter(csatStartDate) ||
                    currentDate.isSame(csatStartDate))
                ) {
                  const csatProgress = subjectProgressMap["CSAT"];
                  if (csatProgress && !csatProgress.isSubjectCompleted) {
                    // Boost CSAT priority to 0 so it replaces the completed subject
                    csatProgress.priority = 0;
                    // Update CSAT in subject pool as well
                    const csatInPool = subjectPool.find(
                      (s) => s.subject === "CSAT"
                    );
                    if (csatInPool) {
                      csatInPool.priority = 0;
                    }
                  }
                }

                // Schedule revision to start on the NEXT day
                // We'll set these at the end of the current day's processing
                if (!revisionWeekSubject) {
                  // Only schedule if no other revision is already scheduled
                  // Store the subject that needs revision so we can set it at the end of the day
                  completedSubjectNeedingRevision = progress.mainSubject;
                }
              }
              break;
            }
          } else {
            // Continue with current subject
            let dailyLimit: number;

            if (isFirstSubjectOfDay) {
              // First subject of this main subject today: Use the calculated daily limit
              dailyLimit = getSubtopicsPerDay(
                aspirantType,
                currentBreakdown,
                gsHoursPerSubject,
                currentMainSubjects.length,
                isSunday(currentDate),
                Boolean(isTodayPublicHoliday)
              );
            } else {
              // Subsequent subjects (mid-day transitions): Calculate based on remaining time
              const minutesPerSubtopic =
                (currentBreakdown["AVERAGE HOURS"] * 60) /
                currentBreakdown["NUMBER OF SUBTOPICS"];
              const hoursPerSubtopic = minutesPerSubtopic / 60;

              // Calculate how many subtopics can fit in remaining time
              dailyLimit = Math.floor(
                remainingTimeForMainSubject / hoursPerSubtopic
              );

              // Ensure minimum of 1 subtopic if there's any time left
              if (remainingTimeForMainSubject > 0 && dailyLimit === 0) {
                dailyLimit = 1;
              }
            }

            // Check how many subtopics have already been scheduled for this subject today
            const dateKey = currentDate.format("DD-MM-YYYY");
            const subjectKey = `${progress.mainSubject}-${currentSubjectInMain}`;

            if (!dailySubtopicCounts[dateKey]) {
              dailySubtopicCounts[dateKey] = {};
            }

            const alreadyScheduledToday =
              dailySubtopicCounts[dateKey][subjectKey] || 0;

            // Calculate remaining daily limit
            const remainingDailyLimit = Math.max(
              0,
              dailyLimit - alreadyScheduledToday
            );

            // Calculate how many subtopics we can fit in remaining time
            const minutesPerSubtopic =
              (currentBreakdown["AVERAGE HOURS"] * 60) /
              currentBreakdown["NUMBER OF SUBTOPICS"];
            const hoursPerSubtopic = minutesPerSubtopic / 60;

            // Don't restrict by time - use the daily limit as intended
            // The daily limit already accounts for available time per subject

            const subtopicsToSchedule = Math.min(
              remainingDailyLimit,
              remainingSubtopics.length
            );

            if (subtopicsToSchedule > 0) {
              const selectedSubtopics = remainingSubtopics.slice(
                0,
                subtopicsToSchedule
              );

              // Group subtopics by TOPIC
              const subtopicsByTopic: Record<string, typeof selectedSubtopics> =
                {};
              selectedSubtopics.forEach((subtopic) => {
                const topic = subtopic.TOPIC;
                if (!subtopicsByTopic[topic]) {
                  subtopicsByTopic[topic] = [];
                }
                subtopicsByTopic[topic].push(subtopic);
              });

              // Create separate entries for each TOPIC (not each subtopic)
              Object.entries(subtopicsByTopic).forEach(
                ([topic, subtopicsInTopic]) => {
                  const subtopicsText = subtopicsInTopic
                    .map((s) => s.SUBTOPICS)
                    .join(" | ");

                  const totalHoursForTopic = parseFloat((subtopicsInTopic.length * hoursPerSubtopic).toFixed(2));

                  timetable.push({
                    DATE: currentDate.format("DD-MM-YYYY"),
                    "MAIN SUBJECT": subtopicsInTopic[0]["MAIN SUBJECT"],
                    SUBJECT:
                      subtopicsInTopic[0]["MAIN SUBJECT"] !==
                      subtopicsInTopic[0].SUBJECT
                        ? subtopicsInTopic[0].SUBJECT
                        : null,
                    TOPIC: topic,
                    // HOURS: totalHoursForTopic,
                    SUBTOPICS: subtopicsText,
                    RECOMMENDED_SOURCES: getRecommendedSources(
                      subtopicsInTopic[0]["MAIN SUBJECT"],
                      subtopicsInTopic[0].SUBJECT
                    ),
                    isHoliday,
                  });
                }
              );

              // Update daily subtopic count
              dailySubtopicCounts[dateKey][subjectKey] =
                alreadyScheduledToday + selectedSubtopics.length;

              // Update progress for the current subject
              subtopicsCompletedInCurrent += selectedSubtopics.length;

              // Mark that we've scheduled subtopics today for this main subject
              if (isFirstSubjectOfDay) {
                hasScheduledSubtopicsToday = true;
                isFirstSubjectOfDay = false; // No longer the first subject after scheduling
              }

              // Calculate time used
              const timeUsed = selectedSubtopics.length * hoursPerSubtopic;
              remainingTimeForMainSubject -= timeUsed;
              startTime = calculateEndTime(startTime, timeUsed);
            } else {
              // No more subtopics can be scheduled (either due to daily limit or no remaining subtopics)
              break;
            }
          }
        }

        // Update the main progress object with final values
        progress.currentSubject = currentSubjectInMain;
        progress.currentSubjectIndex = currentSubjectIndex;
        progress.subtopicsCompleted = subtopicsCompletedInCurrent;

        // Update total subtopics for current subject if it changed
        if (currentSubjectInMain !== progress.currentSubject) {
          const totalSubtopicsInCurrent = syllabus.filter(
            (s) =>
              s["MAIN SUBJECT"] === progress.mainSubject &&
              s.SUBJECT === currentSubjectInMain
          ).length;
          progress.totalSubtopicsInCurrentSubject = totalSubtopicsInCurrent;
        }

        // Mark this main subject as processed for today
        processedSubjectsToday.add(
          `${progress.mainSubject}-${currentSubjectInMain}`
        );
      }
    }

    // Check if a revision week was just triggered and handle it immediately
    if (revisionWeekSubject && revisionDaysLeft > 0) {
      // Determine if we should study today (skip Sundays for working professionals)
      const isWeekend = currentDate.day() === 0; // Sunday
      const shouldStudyToday =
        profile.aspirantType === "working professional" ? !isWeekend : true;

      if (shouldStudyToday) {
        // Determine daily hours for revision
        let revisionDailyHours;
        if (profile.aspirantType === "working professional") {
          revisionDailyHours = isWeekend ? 8 : 3;
        } else {
          revisionDailyHours = gsHours;
        }

        // Determine the type of activity based on remaining days
        if (revisionDaysLeft > 2) {
          // Regular revision days
          timetable.push({
            DATE: currentDate.format("DD-MM-YYYY"),
            "MAIN SUBJECT": "REVISION",
            SUBJECT: revisionWeekSubject,
            TOPIC: `${revisionWeekSubject} Revision`,
            SUBTOPICS: `Review all ${revisionWeekSubject} topics`,
            RECOMMENDED_SOURCES: getRecommendedSources(revisionWeekSubject, ""),
            NOTES: `Revision Week - Day ${
              (profile.aspirantType === AspirantType.WORKING_PROFESSIONAL
                ? 6
                : 7) +
              2 -
              revisionDaysLeft +
              1
            }`,
            isHoliday,
          });
        } else if (revisionDaysLeft === 2) {
          // Sectional test day
          timetable.push({
            DATE: currentDate.format("DD-MM-YYYY"),
            "MAIN SUBJECT": "TEST",
            SUBJECT: revisionWeekSubject,
            TOPIC: `${revisionWeekSubject} Sectional Test`,
            SUBTOPICS: `Practice questions from standard books`,
            NOTES: `Sectional Test Practice - ${revisionWeekSubject}`,
            isHoliday,
          });
        } else if (revisionDaysLeft === 1) {
          // NCERT MCQ test day
          timetable.push({
            DATE: currentDate.format("DD-MM-YYYY"),
            "MAIN SUBJECT": "TEST",
            SUBJECT: revisionWeekSubject,
            TOPIC: `${revisionWeekSubject} NCERT MCQ Test`,
            SUBTOPICS: `NCERT based multiple choice questions`,
            NOTES: `NCERT MCQ Test Practice - ${revisionWeekSubject}`,
            isHoliday,
          });
        }

        revisionDaysLeft--;
        if (revisionDaysLeft === 0) {
          revisionWeekSubject = null;
        }
      }
    } else if (currentMainSubjects.length === 0) {
      // All subjects completed, add general revision
      timetable.push({
        DATE: currentDate.format("DD-MM-YYYY"),
        "MAIN SUBJECT": "REVISION",
        SUBJECT: "GENERAL REVISION",
        TOPIC: "Complete Syllabus Review",
        SUBTOPICS: "Review all completed topics",
        RECOMMENDED_SOURCES: "All previous study materials",
        NOTES: "All subjects completed - General revision",
        isHoliday,
      });
    }

    // At the end of the day's processing, schedule revision for any completed subject
    if (completedSubjectNeedingRevision) {
      revisionWeekSubject = completedSubjectNeedingRevision;
      revisionDaysLeft = 2; // 1 day for revision + 1 day for NCERT MCQ
      completedSubjectNeedingRevision = null; // Reset for next time
    }

    currentDate = currentDate.add(1, "day");
    day++;
  }

  return timetable;
}
