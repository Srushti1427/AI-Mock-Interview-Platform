import { generateFeedback } from "@/utils/GeminiAIModal";
import { connectToDatabase } from "@/utils/db";
import { UserAnswer, MockInterview } from "@/utils/schema";
import { logActivity } from "@/utils/logActivity";
import moment from "moment";

export async function POST(req) {
  try {
    const { question, correctAns, userAnswer, interviewData, userEmail } = await req.json();

    console.log("Feedback API called with:", {
      question: question?.substring(0, 50) + "...",
      userAnswer: userAnswer?.substring(0, 50) + "...",
      interviewId: interviewData?.mockId,
      userEmail,
    });

    if (!question || !userAnswer) {
      return new Response(JSON.stringify({ error: "Missing question or userAnswer" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = await connectToDatabase();

    // Determine if we need a next question
    let isLastQuestion = false;
    let jsonMockResp = [];
    const interviewRecord = await db
      .collection(MockInterview)
      .findOne({ mockId: interviewData?.mockId });

    if (interviewRecord) {
      jsonMockResp = JSON.parse(interviewRecord.jsonMockResp || "[]");
      if (jsonMockResp.length >= 5) {
        isLastQuestion = true;
      }
    }

    const expYears = Number(interviewRecord?.jobExperience) || 0;
    const difficultyGuide = expYears <= 1
      ? "BEGINNER level: Ask simple, foundational questions about basic concepts and entry-level scenarios."
      : expYears <= 3
      ? "INTERMEDIATE level: Ask moderately challenging questions involving practical application and real-world scenarios."
      : expYears <= 6
      ? "ADVANCED level: Ask challenging questions about system design, optimization, leadership, and complex problem-solving."
      : "EXPERT level: Ask highly complex questions about architecture decisions, strategic thinking, and deep domain expertise.";

    const combinedPrompt = `You are an expert interview coach. 
The user is applying for: ${interviewRecord?.jobPosition || "a job"}
Job Description: ${interviewRecord?.jobDesc || ""}
Years of Experience: ${interviewRecord?.jobExperience || ""}

DIFFICULTY: ${difficultyGuide}
The question difficulty MUST match the candidate's ${interviewRecord?.jobExperience || 0} years of experience.

The previous question you asked was: "${question}"
The user answered: "${userAnswer}"

TASK 1: Evaluate the answer. Give a rating (1-10) and feedback as an area of improvement in 3 to 5 lines.
${!isLastQuestion ? `TASK 2: Based on the user's answer, ask exactly ONE follow-up question at the appropriate difficulty level. If their answer was poor, ask a clarifying question or another question on the same topic. If their answer was good, move on to the next topic. Do not repeat previous questions.` : ""}

REQUIREMENTS:
- Return ONLY valid JSON. Do NOT include markdown formatting or backticks.
- Format EXACTLY like this:
{
  "rating": 8,
  "feedback": "Your concise feedback here...",
  ${!isLastQuestion ? `"nextQuestion": {
    "Question": "Your generated follow-up question?",
    "Answer": "Detailed ideal answer"
  }` : ""}
}`;

    const aiResp = await generateFeedback(combinedPrompt);
    console.log("Combined AI Response:", aiResp);

    let MockJsonResp = aiResp.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    // In case the AI returns an array or weird format, find the main JSON object
    const jsonMatch = MockJsonResp.match(/\{[\s\S]*\}(?![\s\S]*\{)/);
    if (jsonMatch) MockJsonResp = jsonMatch[0];

    let jsonFeedbackResp;
    try {
      jsonFeedbackResp = JSON.parse(MockJsonResp);
    } catch (e) {
      console.error("Invalid AI JSON response:", MockJsonResp);
      return new Response(JSON.stringify({ error: "Invalid AI response", rawResponse: MockJsonResp }), { status: 500 });
    }

    const dataToInsert = {
      mockIdRef: interviewData?.mockId,
      question,
      correctAns,
      userAns: userAnswer,
      feedback: jsonFeedbackResp?.feedback || "No feedback generated",
      rating: jsonFeedbackResp?.rating || 0,
      userEmail,
      createdAt: moment().format("YYYY-MM-DD"),
    };

    const resp = await db.collection(UserAnswer).insertOne(dataToInsert);

    await logActivity(db, {
      email: userEmail,
      action: "feedback_submitted",
      metadata: { mockId: interviewData?.mockId, rating: jsonFeedbackResp?.rating },
    });

    let nextQuestion = jsonFeedbackResp?.nextQuestion || null;

    if (nextQuestion && !isLastQuestion && interviewRecord) {
      jsonMockResp.push(nextQuestion);
      await db.collection(MockInterview).updateOne(
        { mockId: interviewData?.mockId },
        { $set: { jsonMockResp: JSON.stringify(jsonMockResp) } }
      );
    }

    return new Response(JSON.stringify({ success: true, inserted: resp.acknowledged, nextQuestion }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error in feedback API:", e);
    return new Response(JSON.stringify({ error: e.message || "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
