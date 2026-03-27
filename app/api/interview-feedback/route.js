import { generateFeedback } from "@/utils/GeminiAIModal";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";

export async function POST(req) {
  try {
    const { mockId } = await req.json();

    if (!mockId) {
      return new Response(JSON.stringify({ error: "Missing mockId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get all user answers for this interview
    const userAnswers = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, mockId));

    if (!userAnswers || userAnswers.length === 0) {
      return new Response(
        JSON.stringify({ error: "No answers found for this interview" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build a comprehensive summary prompt
    const answersSummary = userAnswers
      .map(
        (answer, index) =>
          `Q${index + 1}: ${answer.question}\n` +
          `Your Answer: ${answer.userAns}\n` +
          `Rating: ${answer.rating}/10\n` +
          `Feedback: ${answer.feedback}\n`
      )
      .join("\n---\n");

    const summaryPrompt = `You are an expert interview coach. Analyze the following interview performance and provide actionable feedback.

${answersSummary}

Please provide in JSON format:
{
  "overallAnalysis": "2-3 paragraph summary of performance",
  "keyMistakes": ["mistake 1", "mistake 2", "mistake 3"],
  "improvements": ["specific improvement 1", "specific improvement 2", "specific improvement 3"],
  "actionItems": ["action 1", "action 2", "action 3"]
}`;

    const aiResp = await generateFeedback(summaryPrompt);

    let jsonResponse;
    try {
      // Clean up the response
      let cleanedResp = aiResp.replace(/```json/g, "").replace(/```/g, "").trim();
      jsonResponse = JSON.parse(cleanedResp);
    } catch (e) {
      console.error("Invalid AI JSON response:", aiResp);
      return new Response(JSON.stringify({ error: "Invalid AI response format" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, feedback: jsonResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error generating feedback summary:", e);
    return new Response(
      JSON.stringify({ error: e.message || "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
