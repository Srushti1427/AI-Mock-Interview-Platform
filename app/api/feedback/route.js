import { generateFeedback } from "@/utils/GeminiAIModal";
import { db } from "@/utils/db";
import { UserAnswer, MockInterview } from "@/utils/schema";
import moment from "moment";
import { eq } from "drizzle-orm";

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

    const feedbackPrompt =
      "Question:" +
      question +
      ", User Answer:" +
      userAnswer +
      " , Depends on question and user answer for given interview question" +
      " please give us rating for answer and feedback as area of improvement if any " +
      "in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";

    const aiResp = await generateFeedback(feedbackPrompt);
    console.log("AI Feedback Response:", aiResp);

    let MockJsonResp = aiResp.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let jsonFeedbackResp;
    try {
      jsonFeedbackResp = JSON.parse(MockJsonResp);
      console.log("Parsed feedback:", jsonFeedbackResp);
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

    console.log("Inserting user answer into database:", {
      ...dataToInsert,
      question: dataToInsert.question?.substring(0, 50) + "...",
      userAns: dataToInsert.userAns?.substring(0, 50) + "...",
    });

    const resp = await db.insert(UserAnswer).values(dataToInsert);

    console.log("Database insert result:", resp);

    // Dynamic next question generation
    let nextQuestion = null;
    const interviewRecord = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, interviewData?.mockId));

    if (interviewRecord && interviewRecord.length > 0) {
      const mockRecord = interviewRecord[0];
      const jsonMockResp = JSON.parse(mockRecord.jsonMockResp || "[]");
      
      if (jsonMockResp.length < 5) {
        console.log(`Currently have ${jsonMockResp.length} questions. Generating next...`);
        const nextPrompt = `You are an expert interview coach conducting an interview. 
The user is applying for: ${mockRecord.jobPosition}
Job Description: ${mockRecord.jobDesc}
Years of Experience: ${mockRecord.jobExperience}

The previous question you asked was: "${question}"
The user answered: "${userAnswer}"

Based on the user's answer, ask exactly ONE follow-up question. If their answer was poor, ask a clarifying question or another question on the same topic. If their answer was good, move on to the next topic from the job description. Do not repeat previous questions.

REQUIREMENTS:
- Generate EXACTLY 1 question (not fewer, not more)
- The question must have a detailed ideal answer
- Response MUST be ONLY a valid JSON array containing exactly 1 object
- Do NOT include any text before or after the JSON
- Do NOT use markdown, code blocks, or backticks
- Do NOT include explanations

RESPONSE FORMAT - Respond with ONLY this JSON (nothing else):
[
  {
    "Question": "Your generated question here?",
    "Answer": "Detailed ideal answer here"
  }
]`;
        
        const nextAiResp = await generateFeedback(nextPrompt);
        let cleanedNext = nextAiResp.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const jsonMatch = cleanedNext.match(/\[[\s\S]*\](?![\s\S]*\[)/);
        if (jsonMatch) {
            try {
                const nextParsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(nextParsed) && nextParsed.length > 0) {
                    nextQuestion = nextParsed[0];
                    jsonMockResp.push(nextQuestion);
                    
                    await db.update(MockInterview)
                      .set({ jsonMockResp: JSON.stringify(jsonMockResp) })
                      .where(eq(MockInterview.mockId, interviewData?.mockId));
                      
                    console.log("Successfully generated and saved next question.");
                }
            } catch (e) {
                console.error("Failed to parse next question:", e);
            }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, inserted: !!resp, nextQuestion }), {
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
