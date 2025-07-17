import { NextResponse, NextRequest } from "next/server";
import { getDatafromToken } from "../../../utils/getDatafromToken";
import User from "../../../model/user.model";
import TimeTable from "../../../model/TimeTable.model";
import connectDB from "../../../utils/dbConfig";
export async function GET(request: NextRequest) {
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
    const timetable = await TimeTable.find();
    return NextResponse.json(timetable, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
