// @freeze

import { StudentFormData } from "../lib/studentForm";
import fullSyllabus from "../data/full_syllabus.json";
import hoursAndSources from "../data/hours_and_sources.json";

interface TimetableEntry {
  DATE: string;
  "MAIN SUBJECT": string;
  SUBJECT: string;
  TOPIC: string;
  SUBTOPICS: string;
  HOURS: number;
  "RECOMMENDED SOURCES": string;
}

interface Subject {
  SUBJECT: string;
  "MAIN SUBJECT": string;
  TOPIC: string;
  SUBTOPICS: string[];
}

export function generateTimetable(student: StudentFormData): TimetableEntry[] {
  const timetable: TimetableEntry[] = [];
  const startDate = new Date(student.preparationStartDate);
  const prelimsDate = new Date(`${student.targetYear}-05-01`);
  const csatStartDate = new Date(prelimsDate);
  csatStartDate.setMonth(csatStartDate.getMonth() - 5);

  const totalDays = Math.min(
    Math.ceil((prelimsDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    240
  );

  let currentDate = new Date(startDate);
  const subjectQueue = getInitialSubjectQueue(student);
  const subjectHourTrack: Record<string, number> = {};
  const coveredSubjects = new Set<string>();

  for (let day = 0; day < totalDays;) {
    const dateStr = formatDate(currentDate);
    const dayOfWeek = currentDate.toLocaleDateString("en-US", { weekday: "long" });

    // Calculate hours based on aspirant type
    const totalHours = Number(student.dailyHours) || getHoursByProfile(student.aspirantType);
    const optionalHours = getOptionalHours(student.aspirantType);
    const currentAffairsHours = getCurrentAffairsHours(student.aspirantType);
    const csatHours = currentDate >= csatStartDate ? getCsatHours(student.aspirantType) : 0;
    const gsHours = totalHours - optionalHours - currentAffairsHours - csatHours;

    // Handle weekly off days and Sundays
    if (student.weeklyOffDays.includes(dayOfWeek) || dayOfWeek === "Sunday") {
      timetable.push({
        DATE: dateStr,
        "MAIN SUBJECT": "REVISION",
        SUBJECT: "REVISION",
        TOPIC: "Weekly Recap",
        SUBTOPICS: "Self-evaluation and weak areas",
        HOURS: totalHours,
        "RECOMMENDED SOURCES": "Your class notes, mocks, error logs"
      });
      currentDate.setDate(currentDate.getDate() + 1);
      day++;
      continue;
    }

    // Add daily activities
    const dailyActivities: TimetableEntry[] = [];

    // Optional Subject
    dailyActivities.push({
      DATE: dateStr,
      "MAIN SUBJECT": "OPTIONAL",
      SUBJECT: student.optionalSubject || "Optional Subject",
      TOPIC: "Optional Preparation",
      SUBTOPICS: "Topic as per your strategy",
      HOURS: optionalHours,
      "RECOMMENDED SOURCES": "Standard Optional Sources"
    });

    // Current Affairs
    dailyActivities.push({
      DATE: dateStr,
      "MAIN SUBJECT": "CURRENT AFFAIRS",
      SUBJECT: "CURRENT AFFAIRS",
      TOPIC: "Daily News and Editorials",
      SUBTOPICS: "Relevant issues from newspapers, PIB, Rajya Sabha TV",
      HOURS: currentAffairsHours,
      "RECOMMENDED SOURCES": "The Hindu / Indian Express, PIB"
    });

    // CSAT (if applicable)
    if (csatHours > 0) {
      dailyActivities.push({
        DATE: dateStr,
        "MAIN SUBJECT": "CSAT",
        SUBJECT: "CSAT",
        TOPIC: "Quant, Reasoning, Comprehension",
        SUBTOPICS: "Practice + Analysis",
        HOURS: csatHours,
        "RECOMMENDED SOURCES": "Previous Year CSAT Papers, CSAT Manual"
      });
    }

    // Handle GS subjects
    const subjectData = subjectQueue[0];
    if (!subjectData || subjectData.SUBTOPICS.length === 0) {
      if (subjectData) {
        coveredSubjects.add(subjectData.SUBJECT);
      }
      subjectQueue.shift();
      
      // If all subjects are covered, break
      if (coveredSubjects.size === hoursAndSources.length) {
        break;
      }
      
      // If queue is empty, refill with remaining subjects
      if (subjectQueue.length === 0) {
        const remainingSubjects = getInitialSubjectQueue(student).filter(
          subject => !coveredSubjects.has(subject.SUBJECT)
        );
        subjectQueue.push(...remainingSubjects);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
      day++;
      continue;
    }

    const sourceMeta = hoursAndSources.find(s => s.SUBJECT === subjectData.SUBJECT);
    if (!sourceMeta) {
      subjectQueue.shift();
      currentDate.setDate(currentDate.getDate() + 1);
      day++;
      continue;
    }

    const maxHours = Number(sourceMeta["MAXIMUM STUDY HOURS"]) || 100;
    const subtopicCount = subjectData.SUBTOPICS.length;
    const minutesPerSubtopic = Math.ceil((maxHours * 60) / subtopicCount);
    const availableMinutes = gsHours * 60;

    const numSubtopicsToday = Math.min(
      Math.floor(availableMinutes / minutesPerSubtopic),
      subjectData.SUBTOPICS.length,
      Math.floor((maxHours - (subjectHourTrack[subjectData.SUBJECT] || 0)) * 60 / minutesPerSubtopic)
    );

    const todaySubtopics = subjectData.SUBTOPICS.splice(0, numSubtopicsToday);
    const actualMinutesUsed = todaySubtopics.length * minutesPerSubtopic;
    const actualHoursUsed = +(actualMinutesUsed / 60).toFixed(2);

    subjectHourTrack[subjectData.SUBJECT] = (subjectHourTrack[subjectData.SUBJECT] || 0) + actualHoursUsed;

    dailyActivities.push({
      DATE: dateStr,
      "MAIN SUBJECT": subjectData["MAIN SUBJECT"],
      SUBJECT: subjectData.SUBJECT,
      TOPIC: subjectData.TOPIC,
      SUBTOPICS: todaySubtopics.join(", "),
      HOURS: actualHoursUsed,
      "RECOMMENDED SOURCES": sourceMeta["RECOMMENDED SOURCES"]
    });

    // Add all activities to timetable
    timetable.push(...dailyActivities);

    // Check if subject is complete
    if (subjectData.SUBTOPICS.length === 0 || subjectHourTrack[subjectData.SUBJECT] >= maxHours) {
      coveredSubjects.add(subjectData.SUBJECT);
      subjectQueue.shift();

      // Add sectional test day
      currentDate.setDate(currentDate.getDate() + 1);
      const sectionalDateStr = formatDate(currentDate);
      timetable.push({
        DATE: sectionalDateStr,
        "MAIN SUBJECT": subjectData["MAIN SUBJECT"],
        SUBJECT: subjectData.SUBJECT,
        TOPIC: "Sectional Test",
        SUBTOPICS: "From standard sources",
        HOURS: totalHours,
        "RECOMMENDED SOURCES": sourceMeta["RECOMMENDED SOURCES"]
      });
      day++;

      // Add NCERT MCQ test day
      currentDate.setDate(currentDate.getDate() + 1);
      const ncertDateStr = formatDate(currentDate);
      timetable.push({
        DATE: ncertDateStr,
        "MAIN SUBJECT": subjectData["MAIN SUBJECT"],
        SUBJECT: subjectData.SUBJECT,
        TOPIC: "NCERT MCQ Test",
        SUBTOPICS: "MCQs from basic books",
        HOURS: totalHours,
        "RECOMMENDED SOURCES": "NCERT MCQ booklets, online tests"
      });
      day++;

      // Add remaining revision days
      for (let i = 0; i < 5; i++) {
        currentDate.setDate(currentDate.getDate() + 1);
        const bufferDateStr = formatDate(currentDate);
        const bufferDayOfWeek = currentDate.toLocaleDateString("en-US", { weekday: "long" });
        
        if (student.weeklyOffDays.includes(bufferDayOfWeek) || bufferDayOfWeek === "Sunday") {
          timetable.push({
            DATE: bufferDateStr,
            "MAIN SUBJECT": "REVISION",
            SUBJECT: "REVISION",
            TOPIC: "Weekly Recap",
            SUBTOPICS: "Self-evaluation and weak areas",
            HOURS: totalHours,
            "RECOMMENDED SOURCES": "Your class notes, mocks, error logs"
          });
        } else {
          timetable.push({
            DATE: bufferDateStr,
            "MAIN SUBJECT": subjectData["MAIN SUBJECT"],
            SUBJECT: subjectData.SUBJECT,
            TOPIC: "Subject Wrap-up",
            SUBTOPICS: "Quick revision of key areas",
            HOURS: totalHours,
            "RECOMMENDED SOURCES": sourceMeta["RECOMMENDED SOURCES"]
          });
        }
        day++;
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
    day++;
  }

  return timetable;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB").split("/").join("-");
}

function getHoursByProfile(type: string): number {
  if (type === "Working Professional") return 4;
  if (type === "Part-Time Aspirant") return 6;
  return 8;
}

function getOptionalHours(type: string): number {
  if (type === "Working Professional") return 1;
  if (type === "Part-Time Aspirant") return 2;
  return 3;
}

function getCurrentAffairsHours(type: string): number {
  return 1;
}

function getCsatHours(type: string): number {
  if (type === "Working Professional") return 1;
  if (type === "Part-Time Aspirant") return 1;
  return 2;
}

function getInitialSubjectQueue(student: StudentFormData): Subject[] {
  const seen = new Set<string>();
  const priority = [
    ...student.difficultSubjects,
    ...student.confidentSubjects,
    ...student.finishedSubjects,
  ];

  // Get all subjects from hours_and_sources.json
  const allSubjects = hoursAndSources.map(s => s.SUBJECT);
  
  // Create a map of subjects to their subtopics from full_syllabus.json
  const subjectSubtopicsMap = new Map<string, string[]>();
  fullSyllabus.forEach(entry => {
    const subtopics = Array.isArray(entry.SUBTOPICS)
      ? entry.SUBTOPICS
      : typeof entry.SUBTOPICS === "string"
        ? entry.SUBTOPICS.split(",").map(t => t.trim())
        : [];
    subjectSubtopicsMap.set(entry.SUBJECT, subtopics);
  });

  const result: Subject[] = [];
  
  // Add priority subjects first
  for (const subjectName of priority) {
    if (seen.has(subjectName)) continue;
    seen.add(subjectName);
    
    result.push({
      SUBJECT: subjectName,
      "MAIN SUBJECT": subjectName,
      TOPIC: "Complete Coverage",
      SUBTOPICS: subjectSubtopicsMap.get(subjectName) || ["Full subject coverage"]
    });
  }

  // Then add remaining subjects
  for (const subjectName of allSubjects) {
    if (seen.has(subjectName)) continue;
    seen.add(subjectName);
    
    result.push({
      SUBJECT: subjectName,
      "MAIN SUBJECT": subjectName,
      TOPIC: "Complete Coverage",
      SUBTOPICS: subjectSubtopicsMap.get(subjectName) || ["Full subject coverage"]
    });
  }

  return result;
}

