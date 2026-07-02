import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { isAdmin } from "@/utils/isAdmin";
import { auth } from "@clerk/nextjs/server";
import { UserActivity } from "@/utils/schema";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const adminEmail = url.searchParams.get("email");
    if (!adminEmail || !isAdmin(adminEmail)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const action = url.searchParams.get("action") || "";
    const emailFilter = url.searchParams.get("userEmail") || "";

    const db = await connectToDatabase();

    const filter = {};
    if (action) filter.action = action;
    if (emailFilter) filter.email = { $regex: emailFilter, $options: "i" };

    const total = await db.collection(UserActivity).countDocuments(filter);
    const activities = await db
      .collection(UserActivity)
      .find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      activities: activities.map((a) => ({ ...a, _id: a._id.toString() })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Admin activity error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
