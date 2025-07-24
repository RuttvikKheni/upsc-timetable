import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../utils/dbConfig";
import TimeTable from "../../../../model/TimeTable.model";
export async function PUT(req: NextRequest) {
    try {
        connectDB();
        const body = await req.json();
        const { timeTableId ,status} = body;
        const timetable = await TimeTable.findById({ _id: timeTableId });
        if (!timetable) {
            return NextResponse.json({ error: "Timetable not found" }, { status: 404 });
        }
        timetable.downloadStatus = status;
        await timetable.save();
        return NextResponse.json({ message: "Timetable updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}