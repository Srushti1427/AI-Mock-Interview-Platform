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

    const url = new URL(req.url);
    const adminEmail = url.searchParams.get("email");
    if (!adminEmail || !isAdmin(adminEmail)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const search = url.searchParams.get("search") || "";
    const db = await connectToDatabase();

    // Get all unique users from all collections
    const interviewUsers = await db.collection(MockInterview).distinct("createdBy");
    const aptitudeUsers = await db.collection(AptitudeTest).distinct("createdBy");
    const activityEmails = await db.collection(UserActivity).distinct("email");
    const allEmails = [...new Set([...interviewUsers, ...aptitudeUsers, ...activityEmails])];

    // Filter by search
    const filteredEmails = search
      ? allEmails.filter((e) => e && e.toLowerCase().includes(search.toLowerCase()))
      : allEmails;

    // Build user objects with counts
    const users = await Promise.all(
      filteredEmails.map(async (email) => {
        if (!email) return null;

        const interviewCount = await db.collection(MockInterview).countDocuments({ createdBy: email });
        const aptitudeCount = await db.collection(AptitudeTest).countDocuments({ createdBy: email });

        // Get latest activity for this user (for name, avatar, last active)
        const latestActivity = await db
          .collection(UserActivity)
          .findOne({ email }, { sort: { timestamp: -1 } });

        const loginCount = await db.collection(UserActivity).countDocuments({
          email,
          action: "login",
        });

        return {
          email,
          name: latestActivity?.name || "",
          avatarUrl: latestActivity?.avatarUrl || "",
          interviewCount,
          aptitudeCount,
          loginCount,
          lastActive: latestActivity?.createdAt || "N/A",
        };
      })
    );

    return NextResponse.json(users.filter(Boolean).sort((a, b) => {
      // Sort by last active (most recent first)
      if (a.lastActive === "N/A") return 1;
      if (b.lastActive === "N/A") return -1;
      return b.lastActive.localeCompare(a.lastActive);
    }));
  } catch (err) {
    console.error("Admin users error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
