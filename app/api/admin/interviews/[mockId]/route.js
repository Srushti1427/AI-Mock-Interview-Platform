import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { isAdmin } from "@/utils/isAdmin";
import { auth } from "@clerk/nextjs/server";
import { MockInterview, UserAnswer } from "@/utils/schema";

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
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

    const { mockId } = params;
    const db = await connectToDatabase();

    // Get the interview
    const interview = await db.collection(MockInterview).findOne({ mockId });
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Parse questions
    let questions = [];
    try {
      questions = JSON.parse(interview.jsonMockResp || "[]");
    } catch (e) {
      questions = [];
    }

    // Get all user answers for this interview
    const userAnswers = await db
      .collection(UserAnswer)
      .find({ mockIdRef: mockId })
      .sort({ _id: 1 })
      .toArray();

    // Build transcript: pair questions with answers
    const transcript = questions.map((q, idx) => {
      const matchingAnswer = userAnswers.find(
        (a) => a.question === q.Question || a.question === q.question
      );
      return {
        index: idx + 1,
        question: q.Question || q.question,
        expectedAnswer: q.Answer || q.answer || "",
        userAnswer: matchingAnswer?.userAns || "",
        feedback: matchingAnswer?.feedback || "",
        rating: matchingAnswer?.rating || "",
      };
    });

    // Overall stats
    const answeredCount = userAnswers.length;
    let avgRating = 0;
    if (answeredCount > 0) {
      const totalRating = userAnswers.reduce((sum, a) => sum + (parseFloat(a.rating) || 0), 0);
      avgRating = (totalRating / answeredCount).toFixed(1);
    }

    return NextResponse.json({
      interview: {
        ...interview,
        _id: interview._id.toString(),
      },
      transcript,
      stats: {
        totalQuestions: questions.length,
        answeredCount,
        avgRating,
        userEmail: interview.createdBy,
      },
    });
  } catch (err) {
    console.error("Admin interview detail error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
