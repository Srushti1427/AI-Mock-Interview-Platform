import { generateAIResponse } from "@/utils/GeminiAIModal";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

function sanitizeAndValidateQuestions(parsedQuestions, targetCategory, targetDifficulty) {
  if (!Array.isArray(parsedQuestions)) {
    throw new Error("Parsed AI output is not an array");
  }

  const cleaned = [];

  for (let i = 0; i < parsedQuestions.length; i++) {
    const q = parsedQuestions[i];
    if (!q || typeof q !== "object") continue;

    const questionText = (q.Question || q.question || "").toString().trim();
    if (!questionText) continue;

    let rawOptions = Array.isArray(q.Options || q.options)
      ? (q.Options || q.options)
      : [];

    let options = rawOptions
      .map((o) => (o !== null && o !== undefined ? o.toString().trim() : ""))
      .filter((o) => o.length > 0);

    // Remove duplicates from options while preserving order
    options = Array.from(new Set(options));

    let rawCorrect = (q.CorrectAnswer || q.correctAnswer || "").toString().trim();

    // Find match in options
    let matchedOption = options.find(
      (opt) => opt.toLowerCase() === rawCorrect.toLowerCase()
    );

    // Ensure options array has at least 4 items
    if (!matchedOption && rawCorrect) {
      options.unshift(rawCorrect);
      matchedOption = rawCorrect;
    }

    // Fill missing distractor options if fewer than 4 options
    while (options.length < 4) {
      options.push(`Option ${String.fromCharCode(65 + options.length)}`);
    }
    // Trim to 4 options
    options = options.slice(0, 4);

    if (!matchedOption) {
      matchedOption = options[0];
    }

    const category = (q.Category || q.category || targetCategory || "General Aptitude").toString().trim();
    const difficulty = (q.Difficulty || q.difficulty || targetDifficulty || "Medium").toString().trim();
    const explanation = (q.Explanation || q.explanation || "Step-by-step resolution: Analyze given parameters, apply relevant formulas, and calculate the exact numerical result.").toString().trim();
    const shortcutTip = (q.ShortcutTip || q.shortcutTip || "Shortcut: Look for key ratios or standard algebraic identities to simplify calculations rapidly.").toString().trim();
    const hint = (q.Hint || q.hint || "Hint: Pay close attention to unit conversions and core mathematical rules.").toString().trim();

    cleaned.push({
      id: cleaned.length + 1,
      Question: questionText,
      Options: options,
      CorrectAnswer: matchedOption,
      Explanation: explanation,
      ShortcutTip: shortcutTip,
      Difficulty: difficulty,
      Category: category,
      Hint: hint,
    });
  }

  return cleaned;
}

async function fetchQuestionBatch(topic, category, difficulty, count, userContext = "") {
  const prompt = `You are a world-class examination author specializing in competitive aptitude assessments.
Generate exactly ${count} distinct multiple-choice aptitude test questions.

CATEGORY: "${category || topic || "Quantitative Aptitude"}"
TOPIC/FOCUS: "${topic || category || "General Aptitude"}"
TARGET DIFFICULTY: "${difficulty || "Medium"}"
${userContext ? `CANDIDATE CONTEXT: ${userContext}` : ""}

CRITICAL REQUIREMENTS:
1. Every calculation, formula, and logic puzzle MUST BE 100% mathematically correct and accurate.
2. Provide 4 UNIQUE, realistic options per question.
3. The "CorrectAnswer" MUST match one of the 4 items in the "Options" array EXACTLY.
4. Include a step-by-step "Explanation", a quick time-saving "ShortcutTip", and a helpful "Hint" that doesn't directly reveal the answer.
5. Do NOT include duplicate or ambiguous questions.

Return strictly a valid JSON array of objects. Do NOT include markdown code formatting outside JSON, and do NOT include any introductory or concluding text.

JSON FORMAT:
[
  {
    "Question": "Clear question text?",
    "Options": ["Option A", "Option B", "Option C", "Option D"],
    "CorrectAnswer": "Option A",
    "Explanation": "Detailed step-by-step mathematical explanation...",
    "ShortcutTip": "Quick trick or formula to solve this in under 30 seconds...",
    "Hint": "Helpful hint focusing on the initial problem-solving approach...",
    "Difficulty": "Medium",
    "Category": "${category || topic || "Quantitative Aptitude"}"
  }
]`;

  const rawText = await generateAIResponse({ messages: prompt, temperature: 0.3 });
  const cleanedText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    const parsed = JSON.parse(cleanedText);
    return sanitizeAndValidateQuestions(parsed, category || topic, difficulty);
  } catch (err) {
    console.error("JSON parse failure in AI response:", err, "Raw text:", rawText);
    // Attempt fallback array extraction using regex
    const match = cleanedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return sanitizeAndValidateQuestions(parsed, category || topic, difficulty);
    }
    throw new Error("Invalid JSON structure received from AI provider");
  }
}

export async function POST(req) {
  try {
    const { userId } = auth();
    const user = await currentUser();
    
    // Auth validation
    if (!userId && !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, category, difficulty = "Medium", questionCount = 10, targetRole } = await req.json();

    const effectiveCategory = category || topic || "Quantitative Aptitude";
    const targetCount = Math.min(Math.max(Number(questionCount) || 10, 5), 50);

    let allQuestions = [];
    const userContext = targetRole ? `Targeting role: ${targetRole}` : "";

    // Generate in batches of 10 if questionCount > 10 to guarantee stability and prevent token cutoffs
    if (targetCount <= 10) {
      allQuestions = await fetchQuestionBatch(topic, effectiveCategory, difficulty, targetCount, userContext);
    } else {
      const batchSize = 10;
      const totalBatches = Math.ceil(targetCount / batchSize);
      
      for (let b = 0; b < totalBatches; b++) {
        const currentBatchCount = Math.min(batchSize, targetCount - allQuestions.length);
        if (currentBatchCount <= 0) break;
        
        try {
          const batchDiff = difficulty === "Adaptive" 
            ? (b === 0 ? "Easy" : b === 1 ? "Medium" : "Hard")
            : difficulty;

          const batchQuestions = await fetchQuestionBatch(
            topic, 
            effectiveCategory, 
            batchDiff, 
            currentBatchCount, 
            `${userContext} Batch ${b + 1} of ${totalBatches}`
          );
          allQuestions.push(...batchQuestions);
        } catch (batchErr) {
          console.warn(`Batch ${b + 1} generation error, continuing with accumulated questions:`, batchErr);
        }
      }
    }

    // Re-index all accumulated questions
    allQuestions = allQuestions.map((q, idx) => ({ ...q, id: idx + 1 }));

    if (allQuestions.length === 0) {
      throw new Error("Failed to generate valid aptitude questions");
    }

    return NextResponse.json({
      questions: allQuestions,
      rawText: JSON.stringify(allQuestions),
    });
  } catch (error) {
    console.error("Aptitude generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate aptitude test questions" },
      { status: 500 }
    );
  }
}
