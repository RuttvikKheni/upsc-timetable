import { NextResponse } from "next/server";
import connectDB from "../../../../utils/dbConfig";
import bcrypt from "bcryptjs";
import User from "../../../../model/user.model";
import jwt from "jsonwebtoken";

connectDB();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Oops! We couldn't find an account with that email." },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const WithoutPassword = user.toObject();
    delete WithoutPassword.password;

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "30d",
    });

    const response = NextResponse.json({ user: WithoutPassword });

    response.cookies.set("token", token, {
      path: "/",
      domain: process.env.FRONTEND_URL,
    });

    return response;
  } catch (error) { 
    console.error("Error logging in:", error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
