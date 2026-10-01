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
      topic,
      category,
      difficulty,
      mode = "test",
      questionCount,
      timeLimit,
      negativeMarking = false,
      questions,
      jsonMockResp,
      isDaily = false,
    } = body;

    if (!mockId) {
      return NextResponse.json({ error: "mockId is required" }, { status: 400 });
    }

    const db = await connectToDatabase();

    const parsedQuestions = questions || (jsonMockResp ? JSON.parse(jsonMockResp) : []);

    const doc = {
      mockId,
      topic: topic || category || "General Aptitude",
      category: category || topic || "Quantitative Aptitude",
      difficulty: difficulty || "Medium",
      mode: mode || "test",
      questionCount: Number(questionCount) || parsedQuestions.length || 10,
      timeLimit: Number(timeLimit) || 15,
      negativeMarking: Boolean(negativeMarking),
      questions: parsedQuestions,
      jsonMockResp: jsonMockResp || JSON.stringify(parsedQuestions),
      createdBy: userEmail || body.createdBy || "",
      userId: userId || body.userId || "",
      createdAt: moment().format("YYYY-MM-DD"),
      isCompleted: false,
      isDaily: Boolean(isDaily),
    };

    const resp = await db.collection(AptitudeTest).insertOne(doc);

    if (resp.acknowledged) {
      // Log activity
      if (userEmail || userId) {
        await db.collection(UserActivity).insertOne({
          userId: userId || "",
          email: userEmail || "",
          action: "aptitude_created",
          activityType: "aptitude_created",
          referenceId: mockId,
          createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
          timestamp: new Date(),
          metadata: {
            mockId,
            topic: doc.topic,
            category: doc.category,
            difficulty: doc.difficulty,
            questionCount: doc.questionCount,
          },
        }).catch((err) => console.error("Failed to log activity:", err));
      }

      return NextResponse.json({ mockId });
    }

    return NextResponse.json({ error: "Database insert failed" }, { status: 500 });
  } catch (err) {
    console.error("Create aptitude error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
