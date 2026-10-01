import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { AptitudeTest, UserActivity } from "@/utils/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import moment from "moment";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { userId } = auth();
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!userId && !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      mockId,
      score: rawScore,
      totalQuestions: rawTotal,
      answers = {},
      questions: clientQuestions = [],
      timeTaken = 0,
      negativeMarking = false,
    } = body;

    if (!mockId) {
      return NextResponse.json({ error: "mockId is required" }, { status: 400 });
    }

    const db = await connectToDatabase();

    // Fetch existing test doc
    const existingTest = await db.collection(AptitudeTest).findOne({ mockId });
    if (!existingTest) {
      return NextResponse.json({ error: "Aptitude test not found" }, { status: 404 });
    }

    // Server-side ownership check
    const isOwner =
      (userId && existingTest.userId === userId) ||
      (userEmail && existingTest.createdBy === userEmail);

    if (!isOwner) {
      return NextResponse.json({ error: "Access forbidden" }, { status: 403 });
    }

    // Duplicate submission guard
    if (existingTest.isCompleted) {
      return NextResponse.json({
        success: true,
        alreadySubmitted: true,
        percentage: existingTest.percentage || 0,
        score: existingTest.score || 0,
        netScore: existingTest.netScore || existingTest.score || 0,
      });
    }

    // Re-verify score server-side if questions are available
    const questionsToUse = clientQuestions.length > 0
      ? clientQuestions
      : existingTest.questions || JSON.parse(existingTest.jsonMockResp || "[]");

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    const categoryBreakdown = {};
    const difficultyBreakdown = {};

    questionsToUse.forEach((q, index) => {
      const userAns = (answers[index] || "").toString().trim().toLowerCase();
      const correctAns = (q.CorrectAnswer || "").toString().trim().toLowerCase();

      const cat = q.Category || existingTest.category || "General";
      const diff = q.Difficulty || existingTest.difficulty || "Medium";

      if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { total: 0, correct: 0 };
      if (!difficultyBreakdown[diff]) difficultyBreakdown[diff] = { total: 0, correct: 0 };

      categoryBreakdown[cat].total += 1;
      difficultyBreakdown[diff].total += 1;

      if (!userAns) {
        skippedCount += 1;
      } else if (userAns === correctAns) {
        correctCount += 1;
        categoryBreakdown[cat].correct += 1;
        difficultyBreakdown[diff].correct += 1;
      } else {
        incorrectCount += 1;
      }
    });

    const totalQuestions = questionsToUse.length || rawTotal || 10;
    const finalScore = correctCount;
    const negativeDeduction = negativeMarking ? incorrectCount * 0.25 : 0;
    const netScore = Math.max(0, Number((finalScore - negativeDeduction).toFixed(2)));
    const percentage = totalQuestions > 0 ? Math.round((finalScore / totalQuestions) * 100) : 0;

    // Update test record
    await db.collection(AptitudeTest).updateOne(
      { mockId },
      {
        $set: {
          score: finalScore,
          netScore,
          correctCount,
          incorrectCount,
          skippedCount,
          totalQuestions,
          percentage,
          userAnswers: answers,
          questions: questionsToUse,
          timeTaken,
          categoryBreakdown,
          difficultyBreakdown,
          isCompleted: true,
          completedAt: new Date(),
        },
      }
    );

    // Log user activity
    const effectiveEmail = userEmail || existingTest.createdBy || "";
    const effectiveUserId = userId || existingTest.userId || "";

    if (effectiveEmail || effectiveUserId) {
      await db.collection(UserActivity).insertOne({
        userId: effectiveUserId,
        email: effectiveEmail,
        action: "aptitude_completed",
        activityType: "aptitude_completed",
        referenceId: mockId,
        score: percentage,
        duration: Math.ceil(timeTaken / 60) || 10,
        metadata: {
          mockId,
          topic: existingTest.topic || "Aptitude",
          score: finalScore,
          netScore,
          totalQuestions,
          percentage,
        },
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        timestamp: new Date(),
      }).catch((err) => console.error("Activity logging error:", err));
    }

    return NextResponse.json({
      success: true,
      percentage,
      score: finalScore,
      netScore,
      correctCount,
      incorrectCount,
      skippedCount,
    });
  } catch (err) {
    console.error("Aptitude complete error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
