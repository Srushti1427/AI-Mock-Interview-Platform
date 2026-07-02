import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { isAdmin } from "@/utils/isAdmin";
import { auth } from "@clerk/nextjs/server";
import { MockInterview, AptitudeTest, UserActivity } from "@/utils/schema";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get admin email from query or check all users
    const url = new URL(req.url);
    const adminEmail = url.searchParams.get("email");
    if (!adminEmail || !isAdmin(adminEmail)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = await connectToDatabase();

    // Total unique users (from interviews + aptitude + activity)
    const interviewUsers = await db.collection(MockInterview).distinct("createdBy");
    const aptitudeUsers = await db.collection(AptitudeTest).distinct("createdBy");
    const activityUsers = await db.collection(UserActivity).distinct("email");
    const allUsers = new Set([...interviewUsers, ...aptitudeUsers, ...activityUsers]);

    // Total interviews
    const totalInterviews = await db.collection(MockInterview).countDocuments();

    // Total aptitude tests
    const totalAptitudeTests = await db.collection(AptitudeTest).countDocuments();

    // Today's logins
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const loginsToday = await db.collection(UserActivity).countDocuments({
      action: "login",
      timestamp: { $gte: today },
    });

    // This week's logins
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    const loginsThisWeek = await db.collection(UserActivity).countDocuments({
      action: "login",
      timestamp: { $gte: weekAgo },
    });

    // Activity counts per day (last 7 days)
    const dailyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const logins = await db.collection(UserActivity).countDocuments({
        action: "login",
        timestamp: { $gte: dayStart, $lte: dayEnd },
      });
      const interviews = await db.collection(UserActivity).countDocuments({
        action: "interview_created",
        timestamp: { $gte: dayStart, $lte: dayEnd },
      });
      const feedbacks = await db.collection(UserActivity).countDocuments({
        action: "feedback_submitted",
        timestamp: { $gte: dayStart, $lte: dayEnd },
      });

      dailyActivity.push({
        date: dayStart.toISOString().split("T")[0],
        logins,
        interviews,
        feedbacks,
      });
    }

    // Recent activity (last 10)
    const recentActivity = await db
      .collection(UserActivity)
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      totalUsers: allUsers.size,
      totalInterviews,
      totalAptitudeTests,
      loginsToday,
      loginsThisWeek,
      dailyActivity,
      recentActivity: recentActivity.map((a) => ({
        ...a,
        _id: a._id.toString(),
      })),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
