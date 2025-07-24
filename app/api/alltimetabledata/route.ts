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

    // Get pagination, search, and filter parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const search = searchParams.get('search') || '';
    const razorpayPaymentId = searchParams.get('razorpayPaymentId') || '';
    const razorpayOrderId = searchParams.get('razorpayOrderId') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const downloadStatus = searchParams.get('downloadStatus') || '';
    const skip = (page - 1) * limit;

    // Build search and filter query
    let searchQuery: any = {};
    const conditions = [];
    
    // Add search conditions
    if (search) {
      conditions.push({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { contactNumber: { $regex: search, $options: 'i' } },
          { targetYear: { $regex: search, $options: 'i' } }
        ]
      });
    }
    
    // Add razorpay payment ID search
    if (razorpayPaymentId) {
      conditions.push({ razorpayPaymentId: { $regex: razorpayPaymentId, $options: 'i' } });
    }
    
    // Add razorpay order ID search
    if (razorpayOrderId) {
      conditions.push({ razorpayOrderId: { $regex: razorpayOrderId, $options: 'i' } });
    }
    
    // Add payment status filter
    if (paymentStatus) {
      conditions.push({ razorpayPaymentStatus: paymentStatus });
    }
    
    // Add download status filter
    if (downloadStatus) {
      conditions.push({ downloadStatus: downloadStatus });
    }
    
    // Combine conditions
    if (conditions.length > 0) {
      searchQuery = conditions.length === 1 ? conditions[0] : { $and: conditions };
    }

    // Get total count for pagination with search filter
    const totalCount = await TimeTable.countDocuments(searchQuery);
    
    // Get paginated data with search filter
    const timetable = await TimeTable.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by newest first

    // Return paginated response
    return NextResponse.json({
      data: timetable,
      total: totalCount,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit)
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
