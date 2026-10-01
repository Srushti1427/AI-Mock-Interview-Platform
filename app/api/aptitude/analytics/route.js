import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { AptitudeTest, UserActivity } from "@/utils/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import moment from "moment";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { userId } = auth();
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!userId && !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectToDatabase();

    const query = {
      $or: [
        ...(userId ? [{ userId }] : []),
        ...(userEmail ? [{ createdBy: userEmail }] : []),
      ],
      isCompleted: true,
    };

    const tests = await db.collection(AptitudeTest).find(query).sort({ _id: -1 }).toArray();

    if (tests.length === 0) {
      return NextResponse.json({
        totalTests: 0,
        totalQuestionsSolved: 0,
        averageAccuracy: 0,
        strongestCategories: [],
        weakestCategories: [],
        frequentlyIncorrectTopics: [],
        categoryStats: {},
        accuracyTrend: [],
        dailyStreak: 0,
        hasHistory: false,
      });
    }

    let totalQuestionsSolved = 0;
    let totalScoreSum = 0;
    const categoryStats = {};
    const accuracyTrend = [];

    tests.forEach((test) => {
      const qCount = Number(test.totalQuestions) || Number(test.questionCount) || 10;
      const score = Number(test.score) || 0;
      const pct = test.percentage !== undefined ? Number(test.percentage) : Math.round((score / qCount) * 100);
      
      totalQuestionsSolved += qCount;
      totalScoreSum += pct;

      const catName = test.category || test.topic || "General Aptitude";
      if (!categoryStats[catName]) {
        categoryStats[catName] = {
          category: catName,
          testsAttempted: 0,
          totalQuestions: 0,
          totalScore: 0,
          totalCorrect: 0,
        };
      }

      categoryStats[catName].testsAttempted += 1;
      categoryStats[catName].totalQuestions += qCount;
      categoryStats[catName].totalCorrect += score;
      categoryStats[catName].totalScore += pct;

      accuracyTrend.push({
        id: test.mockId || test._id?.toString(),
        date: test.createdAt || moment(test.completedAt).format("YYYY-MM-DD"),
        topic: test.topic || catName,
        category: catName,
        percentage: pct,
        difficulty: test.difficulty || "Medium",
      });
    });

    const averageAccuracy = Math.round(totalScoreSum / tests.length);

    // Compute category accuracy averages
    const categoryList = Object.values(categoryStats).map((stat) => {
      const catAvg = Math.round(stat.totalScore / stat.testsAttempted);
      const exactAccuracy = stat.totalQuestions > 0 
        ? Math.round((stat.totalCorrect / stat.totalQuestions) * 100)
        : catAvg;
      return {
        ...stat,
        accuracy: exactAccuracy,
      };
    });

    // Sort by accuracy
    const sortedByAccuracy = [...categoryList].sort((a, b) => b.accuracy - a.accuracy);
    const strongestCategories = sortedByAccuracy.slice(0, 2);
    const weakestCategories = [...sortedByAccuracy].reverse().slice(0, 2);

    const frequentlyIncorrectTopics = weakestCategories
      .filter((c) => c.accuracy < 80)
      .map((c) => ({
        topic: c.category,
        errorRate: 100 - c.accuracy,
        attempted: c.totalQuestions,
      }));

    return NextResponse.json({
      totalTests: tests.length,
      totalQuestionsSolved,
      averageAccuracy,
      strongestCategories,
      weakestCategories,
      frequentlyIncorrectTopics,
      categoryStats: categoryList,
      accuracyTrend: accuracyTrend.slice(0, 15).reverse(),
      hasHistory: true,
    });
  } catch (err) {
    console.error("Aptitude analytics error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch aptitude analytics" },
      { status: 500 }
    );
  }
}
