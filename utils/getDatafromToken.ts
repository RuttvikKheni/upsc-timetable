import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getDatafromToken = (req: NextRequest) => {
  const token = req.cookies.get("token")?.value || "";
  if (!token) {
    return null;
  }
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as any;
  return decodedToken.id;
};