import { generateAIResponse } from "@/utils/GeminiAIModal";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { userId } = auth();
    const user = await currentUser();
    if (!userId && !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, options, correctAnswer, currentExplanation, style = "analogy" } = await req.json();

    if (!question || !correctAnswer) {
      return NextResponse.json({ error: "Question and correct answer are required" }, { status: 400 });
    }

    let styleInstruction = "Use a clear, intuitive real-world analogy and break down the concepts into plain English.";
    if (style === "simple") {
      styleInstruction = "Explain as if teaching a beginner (ELI5). Avoid jargon and use simple step-by-step arithmetic.";
    } else if (style === "shortcut") {
      styleInstruction = "Focus on numerical tricks, pattern recognition, and mental math shortcuts to solve this rapidly.";
    }

    const prompt = `You are a friendly, expert tutor explaining an aptitude question to a student who found the standard explanation confusing.

QUESTION: "${question}"
OPTIONS: ${JSON.stringify(options || [])}
CORRECT ANSWER: "${correctAnswer}"
${currentExplanation ? `STANDARD EXPLANATION: "${currentExplanation}"` : ""}

INSTRUCTION: ${styleInstruction}

Provide a fresh, engaging, and easy-to-understand explanation. Keep it concise (under 200 words). Formatting with bullet points or bold text is encouraged. Return ONLY the explanation text.`;

    const explanation = await generateAIResponse({ messages: prompt, temperature: 0.6 });

    return NextResponse.json({ explanation: explanation.trim() });
  } catch (err) {
    console.error("Aptitude explain error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate alternative explanation" },
      { status: 500 }
    );
  }
}
