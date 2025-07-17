import hoursAndSources from "../data/hours_and_sources.json";
import fullSyllabus from "../data/full_syllabus.json";

// Types
interface HoursAndSources {
  "MAIN SUBJECT": string;
  SUBJECT: string;
  "MAXIMUM STUDY HOURS": number;
  "NUMBER OF SUBTOPICS": number;
  "FULL TIME ASPIRANT - SUBTOPICS PER DAY": number;
  "PART-TIME ASPIRANT - SUBTOPICS PER DAY": number;
  "WORKING PROFESSIONAL - SUBTOPICS PER DAY": number;
  "RECOMMENDED SOURCES"?: string;
}

// Use type assertion for imported JSON data
const typedHoursAndSources = hoursAndSources as unknown as HoursAndSources[];

interface SyllabusEntry {
  "MAIN SUBJECT": string;
  SUBJECT: string;
  TOPIC: string;
  SUBTOPICS: string;
}

interface StudentProfile {
  fullName: string;
  email: string;
  contactNumber: string;
  aspirantType:
    | "working professional"
    | "part-time aspirant"
    | "full-time aspirant";
  attemptedBefore: string;
  prelimsScore: string;
  clearedMains: string;
  mainsScore: string;
  academicQualification: string;
  academicPerformance: string;
  preparationStartDate: string;
  targetYear: string;
  confidentSubjects: string[];
  difficultSubjects: string[];
  completedNCERTs: string;
  completedStandardBooks: string;
  startedSubjects: string[];
  finishedSubjects: string[];
  halfDoneSubjects: string[];
  selectedOptional: string;
  optionalSubject: string;
  startedOptional: string;
  dailyHours: string;
  preferredStartTime: string;
  sleepTime: string;
  weeklyOffDays: string[];
}

interface TimetableEntry {
  DATE: string;
  "MAIN SUBJECT": string;
  SUBJECT: string;
  TOPIC: string;
  SUBTOPICS: string;
  HOURS?: number;
  "RECOMMENDED SOURCES": string;
}

interface SubjectState {
  subject: string;
  mainSubject: string;
  subtopics: SyllabusEntry[];
  maxHours: number;
  recommendedSources: string;
  completed: boolean;
  currentIndex: number;
  subtopicsPerDay: number;
  currentTopicSubtopics: SyllabusEntry[];
  priority?: number;
}

// Main function to generate timetable
function generateUPSCTimetable(
  studentProfile: StudentProfile
): TimetableEntry[] {
  const timetable: TimetableEntry[] = [];
  const startDate = new Date(studentProfile.preparationStartDate || new Date());
  const currentDate = new Date(startDate);

  // Parse exam target year and set default prelims date (May 1st)
  const targetYear =
    parseInt(studentProfile.targetYear) || new Date().getFullYear() + 1;
  const prelimsDate = new Date(targetYear, 4, 1); // May 1st of target year

  // Calculate daily hours distribution based on aspirant type
  const dailyHours = getDailyHoursDistribution(studentProfile.aspirantType);

  // Initialize subject states
  const subjectStates = initializeSubjectStates(
    typedHoursAndSources,
    fullSyllabus,
    studentProfile
  );

  if (subjectStates.length === 0) {
    return timetable;
  }

  // Track days and months
  let totalDays = 0;
  const maxDays = 240; // 8 months
  const debugMode = false; // Set to true to break early

  // Remove this line when actually using the function
  const debugLimit = debugMode ? 30 : maxDays;

  // Main loop to generate daily timetable
  while (totalDays < debugLimit && !allSubjectsCompleted(subjectStates)) {
    const dayOfWeek = getDayOfWeek(currentDate);
    const dateStr = formatDate(currentDate);

    // Special handling for Sundays (revision day)
    if (dayOfWeek === "Sunday") {
      // Add Sunday revision only if there's content to revise
      if (totalDays > 0) {
        addRevisionDay(timetable, currentDate);
      }
      currentDate.setDate(currentDate.getDate() + 1);
      totalDays++;
      continue;
    }

    // Check if this is a weekly off day other than Sunday
    if (
      studentProfile.weeklyOffDays &&
      studentProfile.weeklyOffDays.includes(dayOfWeek)
    ) {
      // Skip this day (it's a designated off day for this student)
      currentDate.setDate(currentDate.getDate() + 1);
      totalDays++;
      continue;
    }

    // Check if CSAT preparation should be added (5 months before exam)
    const daysUntilPrelims = Math.floor(
      (prelimsDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const shouldAddCSAT = daysUntilPrelims <= 150; // ~5 months

    // Generate daily study plan for study days
    let dailyPlan = generateDailyPlan(subjectStates, dailyHours, currentDate);

    // Add CSAT preparation if within 5 months of exam
    if (shouldAddCSAT && !["Saturday", "Sunday"].includes(dayOfWeek)) {
      // Add 1 hour of CSAT prep - always show hours for CSAT
      const csatEntry: TimetableEntry = {
        DATE: dateStr,
        "MAIN SUBJECT": "CSAT",
        SUBJECT: "CSAT PREPARATION",
        TOPIC: "CSAT Paper II",
        SUBTOPICS:
          "Reading Comprehension, Logical Reasoning, Quantitative Aptitude",
        HOURS: 1,
        "RECOMMENDED SOURCES":
          "NCERT Math Books, RS Aggarwal, Previous Year CSAT Papers",
      };

      dailyPlan.push(csatEntry);
    }

    if (dailyPlan.length > 0) {
      timetable.push(...dailyPlan);
    }

    currentDate.setDate(currentDate.getDate() + 1);
    totalDays++;

    // Break early for debugging
    if (debugMode && totalDays > 10) {
      break;
    }
  }

  addFinalRevisionAndTests(timetable, subjectStates, currentDate);

  return timetable;
}

// Helper function to get daily hours distribution
function getDailyHoursDistribution(aspirantType: string): {
  optional: number;
  currentAffairs: number;
  subjects: number;
  total: number;
} {
  switch (aspirantType.toLowerCase()) {
    case "working professional":
      return { optional: 1, currentAffairs: 1, subjects: 2, total: 4 };
    case "part-time aspirant":
      return { optional: 2, currentAffairs: 1, subjects: 3, total: 6 };
    case "full-time aspirant":
      return { optional: 3, currentAffairs: 1, subjects: 4, total: 8 };
    default:
      return { optional: 1, currentAffairs: 1, subjects: 2, total: 4 };
  }
}

// Initialize subject states with subtopics and calculations
function initializeSubjectStates(
  hoursAndSources: HoursAndSources[],
  fullSyllabus: SyllabusEntry[],
  studentProfile: StudentProfile
): SubjectState[] {
  const subjectStates: SubjectState[] = [];

  // Group syllabus by subject
  const syllabusGrouped = groupSyllabusBySubject(fullSyllabus);

  // Sort subjects in the specified order:
  // 1. difficult subjects
  // 2. started subjects
  // 3. halfway done subjects
  // 4. confident subjects
  // 5. finished subjects
  const sortedSubjects = hoursAndSources.sort((a, b) => {
    // Helper function to get priority for a subject
    const getPriority = (subject: HoursAndSources): number => {
      const subjectName = subject.SUBJECT;
      
      // Priority 1: Difficult subjects
      if (studentProfile.difficultSubjects.includes(subjectName)) {
        return 1;
      }
      
      // Priority 2: Started subjects
      if (studentProfile.startedSubjects.includes(subjectName)) {
        return 2;
      }
      
      // Priority 3: Halfway done subjects
      if (studentProfile.halfDoneSubjects.includes(subjectName)) {
        return 3;
      }
      
      // Priority 4: Confident subjects
      if (studentProfile.confidentSubjects.includes(subjectName)) {
        return 4;
      }
      
      // Priority 5: Finished subjects
      if (studentProfile.finishedSubjects.includes(subjectName)) {
        return 5;
      }
      
      // Default priority for subjects not in any list
      return 6;
    };
    
    const priorityA = getPriority(a);
    const priorityB = getPriority(b);
    
    // Sort by priority (lower number first)
    return priorityA - priorityB;
  });

  for (const subjectInfo of sortedSubjects) {
    const subtopics = syllabusGrouped[subjectInfo.SUBJECT] || [];
    const maxHours = parseInt(subjectInfo["MAXIMUM STUDY HOURS"].toString());
    const totalSubtopics = subtopics.length;

    if (totalSubtopics > 0) {
      // Get the number of subtopics per day based on aspirant type
      let subtopicsPerDay: number;
      
      switch (studentProfile.aspirantType.toLowerCase()) {
        case "full-time aspirant":
          subtopicsPerDay =
            subjectInfo["FULL TIME ASPIRANT - SUBTOPICS PER DAY"] || 2;
          break;
        case "part-time aspirant":
          subtopicsPerDay =
            subjectInfo["PART-TIME ASPIRANT - SUBTOPICS PER DAY"] || 1;
          break;
        case "working professional":
          subtopicsPerDay =
            subjectInfo["WORKING PROFESSIONAL - SUBTOPICS PER DAY"] || 1;
          break;
        default:
          subtopicsPerDay = 1;
      }

      // Calculate priority for this subject
      let priority = 6; // Default priority
      const subjectName = subjectInfo.SUBJECT;
      
      // Priority 1: Difficult subjects
      if (studentProfile.difficultSubjects.includes(subjectName)) {
        priority = 1;
      }
      // Priority 2: Started subjects
      else if (studentProfile.startedSubjects.includes(subjectName)) {
        priority = 2;
      }
      // Priority 3: Halfway done subjects
      else if (studentProfile.halfDoneSubjects.includes(subjectName)) {
        priority = 3;
      }
      // Priority 4: Confident subjects
      else if (studentProfile.confidentSubjects.includes(subjectName)) {
        priority = 4;
      }
      // Priority 5: Finished subjects
      else if (studentProfile.finishedSubjects.includes(subjectName)) {
        priority = 5;
      }

      // Group subtopics by topic for better coherence
      const subtopicsByTopic = groupSubtopicsByTopic(subtopics);
      const allTopicSubtopics: SyllabusEntry[][] =
        Object.values(subtopicsByTopic);

      subjectStates.push({
        subject: subjectInfo.SUBJECT,
        mainSubject: subjectInfo["MAIN SUBJECT"],
        subtopics: [...subtopics], // Clone array
        maxHours,
        recommendedSources: subjectInfo["RECOMMENDED SOURCES"] || "",
        completed: false,
        currentIndex: 0,
        subtopicsPerDay,
        currentTopicSubtopics:
          allTopicSubtopics.length > 0 ? [...allTopicSubtopics[0]] : [],
        priority: priority, // Add priority to subject state
      });
    }
  }

  return subjectStates;
}

// Group syllabus entries by subject
function groupSyllabusBySubject(
  fullSyllabus: SyllabusEntry[]
): Record<string, SyllabusEntry[]> {
  const grouped: Record<string, SyllabusEntry[]> = {};

  for (const entry of fullSyllabus) {
    if (!grouped[entry.SUBJECT]) {
      grouped[entry.SUBJECT] = [];
    }
    grouped[entry.SUBJECT].push(entry);
  }

  return grouped;
}

// Generate daily study plan
function generateDailyPlan(
  subjectStates: SubjectState[],
  dailyHours: {
    optional: number;
    currentAffairs: number;
    subjects: number;
    total: number;
  },
  currentDate: Date
): TimetableEntry[] {
  const dailyPlan: TimetableEntry[] = [];
  const dateStr = formatDate(currentDate);

  // 1. Add entry for Current Affairs (consistent daily routine)
  if (dailyHours.currentAffairs > 0) {
    dailyPlan.push({
      DATE: dateStr,
      "MAIN SUBJECT": "CURRENT AFFAIRS",
      SUBJECT: "CURRENT AFFAIRS",
      TOPIC: "Daily News Analysis",
      SUBTOPICS: "Newspaper Analysis, Monthly Magazines, Important Events",
      HOURS: dailyHours.currentAffairs,
      "RECOMMENDED SOURCES":
        "The Hindu, Indian Express, Yojana, Kurukshetra, PIB",
    });
  }

  // 2. Add entry for Optional Subject
  if (dailyHours.optional > 0) {
    dailyPlan.push({
      DATE: dateStr,
      "MAIN SUBJECT": "OPTIONAL",
      SUBJECT: "OPTIONAL SUBJECT",
      TOPIC: "Daily Optional Subject Study",
      SUBTOPICS: "As per the optional subject syllabus",
      HOURS: dailyHours.optional,
      "RECOMMENDED SOURCES": "Standard Books for Optional Subject",
    });
  }

  // 3. Allocate time for GS subjects
  const availableGSHours = dailyHours.subjects;

  // Find all active (not completed) subjects
  const allActiveSubjects = subjectStates.filter(
    (s) => !s.completed && s.currentIndex < s.subtopics.length
  );

  if (allActiveSubjects.length === 0) {
    return dailyPlan;
  }

  // Categorize active subjects by priority
  // Find the priority categories that have active subjects
  // Priority 1: difficult, 2: started, 3: halfway, 4: confident, 5: finished
  const activePriorities = new Set<number>();
  
  for (const subject of allActiveSubjects) {
    // Find priority of this subject based on its category
    let priority = 6; // Default priority
    const subjectName = subject.subject;
    
    if (subject.priority !== undefined) {
      // If priority is already calculated, use it
      priority = subject.priority;
    }
    
    activePriorities.add(priority);
  }
  
  // Sort active priorities in ascending order (lowest first)
  const sortedPriorities = Array.from(activePriorities).sort((a, b) => a - b);
  
  // Take subjects only from the highest priority category (lowest number)
  const highestPriority = sortedPriorities[0];
  
  // Filter active subjects to only include those from the highest priority category
  const activeSubjects = allActiveSubjects.filter(s => s.priority === highestPriority);

  // For working professionals: one subject at a time
  const maxSubjectsPerDay = dailyHours.total <= 4 ? 1 : 2;
  const subjectsToStudyToday = activeSubjects.slice(0, maxSubjectsPerDay);

  // Calculate hours per subject for today
  const hoursPerSubject = availableGSHours / subjectsToStudyToday.length;

  for (const subjectState of subjectsToStudyToday) {
    // Determine how many subtopics to cover today
    const remainingSubtopics =
      subjectState.subtopics.length - subjectState.currentIndex;
    const subtopicsToday = Math.min(
      subjectState.subtopicsPerDay,
      remainingSubtopics
    );
    
    if (subtopicsToday <= 0) {
      // Mark subject as completed if no more subtopics
      subjectState.completed = true;
      continue;
    }
    
    // Calculate hours per subtopic for this subject
    const hoursPerSubtopic = hoursPerSubject / subtopicsToday;
    
    // Get the next batch of subtopics
    const todaySubtopics = subjectState.subtopics.slice(
      subjectState.currentIndex,
      subjectState.currentIndex + subtopicsToday
    );
    
    // Group today's subtopics by topic
    const subtopicsByTopic = todaySubtopics.reduce((acc, subtopic) => {
      if (!acc[subtopic.TOPIC]) {
        acc[subtopic.TOPIC] = [];
      }
      acc[subtopic.TOPIC].push(subtopic);
      return acc;
    }, {} as Record<string, SyllabusEntry[]>);
    
    // Create entries for each topic
    for (const [topic, topicSubtopics] of Object.entries(subtopicsByTopic)) {
      // Join all subtopics for this topic
      const subtopicsText = topicSubtopics.map((s) => s.SUBTOPICS).join(", ");
      
      // Calculate hours for this topic
      const topicHours = topicSubtopics.length * hoursPerSubtopic;
      
      // Add to daily plan, but omit hours for main subjects
      const entry: TimetableEntry = {
        DATE: dateStr,
        "MAIN SUBJECT": subjectState.mainSubject,
        SUBJECT: subjectState.subject,
        TOPIC: topic,
        SUBTOPICS: subtopicsText,
        "RECOMMENDED SOURCES": subjectState.recommendedSources,
      };

      // Always add hours - this ensures subjects like "INDIAN SOCIETY AND SOCIAL JUSTICE" get hours
      entry.HOURS = Math.round(topicHours * 100) / 100;
      
      dailyPlan.push(entry);
    }
    
    // Update the current index
    subjectState.currentIndex += subtopicsToday;
    
    // Check if we've completed all subtopics
    if (subjectState.currentIndex >= subjectState.subtopics.length) {
      subjectState.completed = true;
    }
  }

  return dailyPlan;
}

// Group subtopics by their topic
function groupSubtopicsByTopic(
  subtopics: SyllabusEntry[]
): Record<string, SyllabusEntry[]> {
  const grouped: Record<string, SyllabusEntry[]> = {};

  for (const subtopic of subtopics) {
    if (!grouped[subtopic.TOPIC]) {
      grouped[subtopic.TOPIC] = [];
    }
    grouped[subtopic.TOPIC].push(subtopic);
  }

  return grouped;
}

// Add revision day entry
function addRevisionDay(timetable: TimetableEntry[], currentDate: Date): void {
  const dateStr = formatDate(currentDate);

  // Always show hours for revision entries
  const revisionEntry: TimetableEntry = {
    DATE: dateStr,
    "MAIN SUBJECT": "REVISION",
    SUBJECT: "WEEKLY REVISION",
    TOPIC: "COMPREHENSIVE REVIEW",
    SUBTOPICS: "Review all topics covered this week",
    HOURS: 4, // Always show hours for revision
    "RECOMMENDED SOURCES": "Notes, Previous Year Papers, Mock Tests",
  };

  timetable.push(revisionEntry);
}

// Add final revision and test days
function addFinalRevisionAndTests(
  timetable: TimetableEntry[],
  subjectStates: SubjectState[],
  currentDate: Date
): void {
  const completedSubjects = subjectStates.filter((s) => s.completed);

  for (const subject of completedSubjects) {
    // Add 1 week revision for each completed subject
    for (let i = 0; i < 7; i++) {
      const dayOfWeek = getDayOfWeek(currentDate);
      const dateStr = formatDate(currentDate);

      if (!["Saturday", "Sunday"].includes(dayOfWeek)) {
        const subjectRevisionEntry: TimetableEntry = {
          DATE: dateStr,
          "MAIN SUBJECT": subject.mainSubject,
          SUBJECT: subject.subject + " - REVISION",
          TOPIC: "SUBJECT REVISION",
          SUBTOPICS: "Complete subject review and consolidation",
          HOURS: 2,
          "RECOMMENDED SOURCES": subject.recommendedSources,
        };

        timetable.push(subjectRevisionEntry);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add sectional test day
    while (["Saturday", "Sunday"].includes(getDayOfWeek(currentDate))) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const testDateStr = formatDate(currentDate);
    const testEntry: TimetableEntry = {
      DATE: testDateStr,
      "MAIN SUBJECT": subject.mainSubject,
      SUBJECT: subject.subject + " - TEST",
      TOPIC: "SECTIONAL TEST",
      SUBTOPICS: "Practice questions from standard books",
      HOURS: 2,
      "RECOMMENDED SOURCES": "Standard Books, Previous Year Papers",
    };

    timetable.push(testEntry);
    currentDate.setDate(currentDate.getDate() + 1);

    // Add NCERT MCQ test day
    while (["Saturday", "Sunday"].includes(getDayOfWeek(currentDate))) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const mcqDateStr = formatDate(currentDate);
    const mcqEntry: TimetableEntry = {
      DATE: mcqDateStr,
      "MAIN SUBJECT": subject.mainSubject,
      SUBJECT: subject.subject + " - NCERT TEST",
      TOPIC: "NCERT MCQ TEST",
      SUBTOPICS: "NCERT based multiple choice questions",
      HOURS: 2,
      "RECOMMENDED SOURCES": "NCERT Books, NCERT Based Test Series",
    };

    timetable.push(mcqEntry);
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

// Helper functions
function allSubjectsCompleted(subjectStates: SubjectState[]): boolean {
  return subjectStates.every((s) => s.completed);
}

function getDayOfWeek(date: Date): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Example usage:
export {
  generateUPSCTimetable,
  type TimetableEntry,
  type StudentProfile,
  type HoursAndSources,
  type SyllabusEntry,
};

// Usage example with the provided data:
/*
  const hoursAndSources: HoursAndSources[] = [
    {
      "MAIN SUBJECT": "HISTORY",
      "SUBJECT": "ANCIENT HISTORY",
      "MAXIMUM STUDY HOURS": 25,
      "NUMBER OF SUBTOPICS": 68,
      "FULL TIME ASPIRANT - SUBTOPICS PER DAY": 5,
      "PART-TIME ASPIRANT - SUBTOPICS PER DAY": 4,
      "WORKING PROFESSIONAL - SUBTOPICS PER DAY": 3,
      "RECOMMENDED SOURCES": "RS SHARMA/ANY STD BOOK, NCERTS/TAMIL NADU BOARD BOOK, PREVIOUS YEAR PAPERS"
    },
    {
      "MAIN SUBJECT": "HISTORY",
      "SUBJECT": "ART & CULTURE",
      "MAXIMUM STUDY HOURS": 25,
      "NUMBER OF SUBTOPICS": 75,
      "FULL TIME ASPIRANT - SUBTOPICS PER DAY": 8,
      "PART-TIME ASPIRANT - SUBTOPICS PER DAY": 6,
      "WORKING PROFESSIONAL - SUBTOPICS PER DAY": 4,
      "RECOMMENDED SOURCES": "NITIN SINGHANIA/ANY STD BOOK, CCRT MATERIALS, NCERT- CLASS 11, PREVIOUS YEAR PAPERS"
    }
  ];
  
  const fullSyllabus: SyllabusEntry[] = [
    // ... your syllabus data
  ];
  
  const studentProfile: StudentProfile = {
    // ... your student profile data
  };
  
  const timetable = generateUPSCTimetable(studentProfile);
  console.log(timetable);
  */
