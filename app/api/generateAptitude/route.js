import { generateFeedback } from "@/utils/GeminiAIModal";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { topic, difficulty } = await req.json();

    const prompt = `Generate 10 multiple-choice aptitude test questions on the topic of "${topic}" at a "${difficulty}" difficulty level.
    Return strictly a JSON array of objects. Do not wrap it in any extra text or markdown.
    Each object must have exactly these fields:
    - "Question": the text of the question
    - "Options": an array of exactly 4 string options
    - "CorrectAnswer": the exact string from the options array that is the correct answer`;

    let rawText = await generateFeedback(prompt);
    // Clean up markdown markers if Gemini included them
    rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

    // Verify it is actual JSON
    JSON.parse(rawText);

    return NextResponse.json({ rawText });
  } catch (error) {
    console.error("Aptitude generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate aptitude test" },
      { status: 500 }
    );
  }
}
