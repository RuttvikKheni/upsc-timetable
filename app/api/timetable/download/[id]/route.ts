import { NextResponse, NextRequest } from "next/server";
import { getDatafromToken } from "../../../../../utils/getDatafromToken";
import User from "../../../../../model/user.model";
import TimeTable from "../../../../../model/TimeTable.model";
import connectDB from "../../../../../utils/dbConfig";
import { generateTimetable } from "../../../../../lib/gtt";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    connectDB();
    const userId = getDatafromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get timetable data by ID
    const timetableData = await TimeTable.findById(params.id);
    
    if (!timetableData) {
      return NextResponse.json({ error: "Timetable not found" }, { status: 404 });
    }

    // Map database data to StudentProfile interface
    const studentProfile = {
      aspirantType: timetableData.aspirantType,
      preparationStartDate: timetableData.preparationStartDate,
      weeklyOffDays: timetableData.weeklyOffDays || [],
      startedSubjects: timetableData.startedSubjects || [],
      confidentSubjects: timetableData.confidentSubjects || [],
      difficultSubjects: timetableData.difficultSubjects || [],
      halfDoneSubjects: timetableData.halfDoneSubjects || [],
      finishedSubjects: timetableData.finishedSubjects || [],
      dailyHours: timetableData.dailyHours,
      preferredStartTime: timetableData.preferredStartTime,
      sleepTime: timetableData.sleepTime,
      optionalSubject: timetableData.optionalSubject || '',
      subjectsPerDay: timetableData.subjectsPerDay || 'one',
      targetYear: timetableData.targetYear
    };

    console.log('Mapped student profile:', studentProfile);

    // Generate timetable using the same logic as the main form
    const generatedTimetable = await generateTimetable(studentProfile);

    // Update download status
    await TimeTable.findByIdAndUpdate(params.id, {
      downloadStatus: "downloaded"
    });

    return NextResponse.json({
      success: true,
      timetable: generatedTimetable,
      userData: {
        fullName: timetableData.fullName,
        email: timetableData.email,
        targetYear: timetableData.targetYear
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error generating timetable for download:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
