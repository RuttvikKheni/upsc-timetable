// app/api/generate-timetable/route.ts

import { NextResponse } from "next/server";
import { generateTimetable } from "../../../lib/gtt";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // const timetable = await generateTimetable(data as StudentFormData);
    const timetable = await generateTimetable(data);
    return NextResponse.json({ timetable });
  } catch (error) {
    console.error("Error generating timetable:", error);
    return NextResponse.json(
      { error: "Failed to generate timetable" },
      { status: 500 }
    );
  }
}
