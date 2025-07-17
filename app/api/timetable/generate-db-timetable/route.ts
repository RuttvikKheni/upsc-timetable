import { NextResponse } from "next/server";
import connectDB from "../../../../utils/dbConfig";
import TimeTable from "../../../../model/TimeTable.model";

export async function POST(request: Request) {
    try {
        await connectDB();
        const data = await request.json();
        console.log("data =====================",data);
        // Minimal validation
        if (!data.email || !data.fullName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Save to DB
        const saved = await TimeTable.create(data);
        return NextResponse.json({ success: true, timetable: saved });
    } catch (error) {
        console.error("Error saving timetable:", error);
        return NextResponse.json(
            { error: "Failed to save timetable" },
            { status: 500 }
        );
    }
}