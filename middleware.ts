import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  async function isValidToken(token: string | undefined) {
    try {
      if (!token) return false;
      await jwtVerify(token, secret);
      return true;
    } catch (error) {
      return false;
    }
  }

  const isValid = await isValidToken(token);


  if (path === "/login" && isValid) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (path === "/login" && !isValid) {
    return NextResponse.next();
  }

  if (path === "/dashboard" && !isValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}
