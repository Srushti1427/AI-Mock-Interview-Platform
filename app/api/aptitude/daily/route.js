import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { AptitudeTest, UserActivity } from "@/utils/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { generateAIResponse } from "@/utils/GeminiAIModal";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";

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
    const todayStr = moment().format("YYYY-MM-DD");

    const existingDaily = await db.collection(AptitudeTest).findOne({
      $or: [
        ...(userId ? [{ userId }] : []),
        ...(userEmail ? [{ createdBy: userEmail }] : []),
      ],
      isDaily: true,
      dailyDate: todayStr,
    });

    if (existingDaily) {
      return NextResponse.json(existingDaily);
    }

    // Generate fresh 5-question Daily Aptitude Challenge for today
    const prompt = `Generate exactly 5 distinct multiple-choice quantitative & logical aptitude questions for a Daily Aptitude Challenge (Date: ${todayStr}).
Ensure questions are clear, 100% accurate, have 4 unique options, a valid CorrectAnswer matching one option, a step-by-step Explanation, a ShortcutTip, and a Hint.

Return strictly a valid JSON array of objects:
[
  {
    "Question": "Question text?",
    "Options": ["Option A", "Option B", "Option C", "Option D"],
    "CorrectAnswer": "Option A",
    "Explanation": "Detailed explanation...",
    "ShortcutTip": "Quick shortcut...",
    "Hint": "Helpful hint...",
    "Difficulty": "Medium",
    "Category": "Mixed Aptitude"
  }
]`;

    let rawText = await generateAIResponse({ messages: prompt, temperature: 0.3 });
    rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

    let questions = [];
    try {
      questions = JSON.parse(rawText);
    } catch (e) {
      console.error("Daily questions parse error:", e);
      questions = [
        {
          id: 1,
          Question: "If 15 men can complete a work in 12 days, how many days will 10 men take to complete the same work?",
          Options: ["18 days", "15 days", "20 days", "16 days"],
          CorrectAnswer: "18 days",
          Explanation: "Total man-days = 15 × 12 = 180. Days needed for 10 men = 180 / 10 = 18 days.",
          ShortcutTip: "M1 × D1 = M2 × D2 => 15 × 12 = 10 × D2 => D2 = 18.",
          Hint: "Use inverse proportion logic.",
          Difficulty: "Medium",
          Category: "Time & Work"
        }
      ];
    }

    const mockId = `daily-${todayStr}-${uuidv4().substring(0, 8)}`;
    const newDailyDoc = {
      mockId,
      topic: "Daily Aptitude Challenge",
      category: "Mixed Aptitude",
      difficulty: "Medium",
      mode: "test",
      questionCount: questions.length,
      timeLimit: 10,
      negativeMarking: false,
      questions,
      jsonMockResp: JSON.stringify(questions),
      createdBy: userEmail || "",
      userId: userId || "",
      createdAt: todayStr,
      isDaily: true,
      dailyDate: todayStr,
      isCompleted: false,
    };

    await db.collection(AptitudeTest).insertOne(newDailyDoc);
    return NextResponse.json(newDailyDoc);
  } catch (err) {
    console.error("Daily aptitude error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch daily challenge" },
      { status: 500 }
    );
  }
}
