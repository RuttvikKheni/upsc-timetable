import { NextResponse, NextRequest } from "next/server";
import { getDatafromToken } from "../../../../utils/getDatafromToken";
import User from "../../../../model/user.model";
import TimeTable from "../../../../model/TimeTable.model";
import connectDB from "../../../../utils/dbConfig";

export async function GET(
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

    return NextResponse.json({
      success: true,
      data: timetableData
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching timetable data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
