import { generateAIResponse } from "@/utils/GeminiAIModal";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { resumeText, targetRole = "Software Engineer" } = body;

    if (!resumeText || !resumeText.trim()) {
      return NextResponse.json({ error: "Resume text content is required" }, { status: 400 });
    }

    const systemPrompt = `You are a Principal Technical Recruiter and Career Strategist. 
Analyze the candidate's resume content against the target role of "${targetRole}".

Provide a comprehensive, high-value analysis formatted cleanly in GitHub Flavored Markdown:

## 1. 📌 Resume Executive Summary
Brief evaluation of candidate background strengths and suitability for ${targetRole}.

## 2. ⚡ Extracted Skills & Core Competencies
- Technical Skills
- Tools & Frameworks
- Soft Skills & Leadership

## 3. 🎯 Skill-Gap Analysis for "${targetRole}"
- Critical Skills Present: [List]
- Missing Essential Skills & ATS Keywords: [List of keywords missing for passing ATS filters]

## 4. 🚀 Suggested Resume Bullet Point Enhancements
Provide 3-5 upgraded, high-impact bullet points using the [Action Verb + Task + Quantifiable Metric/Impact] formula.

## 5. 🗺️ Personalized 90-Day Career & Preparation Roadmap
Phase 1 (Days 1-30): Core Skills & Portfolio Projects
Phase 2 (Days 31-60): Interview Prep (DSA, System Design, STAR Method)
Phase 3 (Days 61-90): Networking, Target Applications & Mock Interviews
`;

    const analysisResult = await generateAIResponse({
      messages: `Resume Content:\n"""\n${resumeText.slice(0, 8000)}\n"""\n\nTarget Role: ${targetRole}`,
      systemPrompt,
      temperature: 0.5,
    });

    return NextResponse.json({ analysis: analysisResult });
  } catch (err) {
    console.error("Resume Analysis Error:", err);
    return NextResponse.json({ error: err.message || "Failed to analyze resume" }, { status: 500 });
  }
}
