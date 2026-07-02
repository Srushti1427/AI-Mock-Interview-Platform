// // import { generateFeedback } from "@/utils/GeminiAIModal";
import { generateFeedback } from "../../../utils/GeminiAIModal";

export async function POST(req) {
  try {
    const body = await req.json();
    const { mode } = body;

    if (mode === "generateInterview") {
      const { jobPosition, jobDesc, jobExperience } = body;

      const difficultyGuide = Number(jobExperience) <= 1
        ? "BEGINNER level: Ask simple, foundational questions about basic concepts, definitions, and entry-level scenarios."
        : Number(jobExperience) <= 3
        ? "INTERMEDIATE level: Ask moderately challenging questions involving practical application, problem-solving, and real-world scenarios."
        : Number(jobExperience) <= 6
        ? "ADVANCED level: Ask challenging questions about system design, optimization, leadership, and complex problem-solving."
        : "EXPERT level: Ask highly complex questions about architecture decisions, strategic thinking, mentoring, scaling systems, and deep domain expertise.";

      const InputPrompt = `You are an expert interview coach. Generate EXACTLY 1 interview question with a complete ideal answer to start the interview.

Job Position: ${jobPosition}
Job Description: ${jobDesc}
Years of Experience: ${jobExperience}

DIFFICULTY: ${difficultyGuide}
The question difficulty MUST match the candidate's ${jobExperience} years of experience. Do NOT ask senior-level questions to a fresher, and do NOT ask basic questions to an experienced candidate.

REQUIREMENTS:
- Generate EXACTLY 1 question
- Response MUST be ONLY a valid JSON array containing exactly 1 object
- No extra text

[
  {
    "Question": "Question here?",
    "Answer": "Answer here"
  }
]`;

      // ✅ FIX 1: API ERROR HANDLING ADDED HERE
      let aiResp;
      try {
        aiResp = await generateFeedback(InputPrompt);
      } catch (apiError) {
        console.error("Gemini API Error:", apiError);

        return new Response(
          JSON.stringify({
            error: "API quota exceeded or request failed. Try again later.",
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }

      console.log("Raw AI Response:", aiResp);

      let cleaned = aiResp
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .replace(/^```/g, "")
        .replace(/[\r\n]/g, "\n")
        .trim();

      const jsonMatch = cleaned.match(/\[[\s\S]*\](?![\s\S]*\[)/);

      if (!jsonMatch) {
        return new Response(
          JSON.stringify({
            error: "No valid JSON found",
            rawText: aiResp,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      let cleanJson = jsonMatch[0];

      // ✅ FIX 2: SAFE JSON PARSE
      let parsed;
      try {
        parsed = JSON.parse(cleanJson);
      } catch (err) {
        return new Response(
          JSON.stringify({
            error: "Invalid JSON format from AI",
            cleanJson,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ data: parsed }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (mode === "generateQuestions") {
      const { jobPosition, jobDesc, jobExperience, typeQuestion, company } = body;

      const InputPrompt = `
Job Positions: ${jobPosition},
Job Description: ${jobDesc},
Years of Experience: ${jobExperience},
Type: ${typeQuestion},
Company Questions: ${company}
Generate 5 questions with answers in JSON format.
`;

      // ✅ FIX 3: API ERROR HANDLING HERE ALSO
      let aiResp;
      try {
        aiResp = await generateFeedback(InputPrompt);
      } catch (apiError) {
        console.error("Gemini API Error:", apiError);

        return new Response(
          JSON.stringify({
            error: "API quota exceeded or request failed. Try again later.",
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }

      const rawText = aiResp.replace(/```json|```/g, "").trim();

      return new Response(JSON.stringify({ rawText }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid mode" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );

  } catch (e) {
    // ✅ FIX 4: GLOBAL ERROR HANDLER (kept)
    console.error("Server Error:", e);

    return new Response(
      JSON.stringify({
        error: e.message || "Server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}