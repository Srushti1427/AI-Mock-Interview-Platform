import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { isAdmin } from "@/utils/isAdmin";
import { auth } from "@clerk/nextjs/server";
import { MockInterview } from "@/utils/schema";

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
    const emailFilter = url.searchParams.get("userEmail") || "";
    const positionFilter = url.searchParams.get("position") || "";

    const db = await connectToDatabase();

    const filter = {};
    if (emailFilter) filter.createdBy = { $regex: emailFilter, $options: "i" };
    if (positionFilter) filter.jobPosition = { $regex: positionFilter, $options: "i" };

    const total = await db.collection(MockInterview).countDocuments(filter);
    const interviews = await db
      .collection(MockInterview)
      .find(filter)
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Get user answer counts for each interview
    const interviewsWithCounts = await Promise.all(
      interviews.map(async (interview) => {
        const answerCount = await db
          .collection("userAnswer")
          .countDocuments({ mockIdRef: interview.mockId });

        // Calculate avg rating
        const answers = await db
          .collection("userAnswer")
          .find({ mockIdRef: interview.mockId })
          .toArray();

        let avgRating = 0;
        if (answers.length > 0) {
          const totalRating = answers.reduce((sum, a) => {
            const r = parseFloat(a.rating) || 0;
            return sum + r;
          }, 0);
          avgRating = (totalRating / answers.length).toFixed(1);
        }

        let questionCount = 0;
        try {
          const parsed = JSON.parse(interview.jsonMockResp || "[]");
          questionCount = Array.isArray(parsed) ? parsed.length : 0;
        } catch (e) {
          questionCount = 0;
        }

        return {
          ...interview,
          _id: interview._id.toString(),
          answerCount,
          avgRating,
          questionCount,
        };
      })
    );

    return NextResponse.json({
      interviews: interviewsWithCounts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Admin interviews error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
