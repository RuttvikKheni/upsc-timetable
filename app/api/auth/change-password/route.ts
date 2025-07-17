import { NextResponse } from "next/server";
import connectDB from "../../../../utils/dbConfig";
import bcrypt from "bcryptjs";
import User from "../../../../model/user.model";
connectDB();

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { oldPwd, newPwd, userId } = body;
    const user = await User.findOne({ _id: userId.replace(/"/g, "") });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const isPasswordValid = await bcrypt.compare(oldPwd, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    const hashedPassword = await bcrypt.hash(newPwd, 10);
    await User.findOneAndUpdate(
      { _id: userId.replace(/"/g, "") },
      { password: hashedPassword },
      { new: true }
    );
    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
