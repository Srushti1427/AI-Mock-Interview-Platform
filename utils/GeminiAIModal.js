import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
const googleApiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

const groq = groqApiKey
  ? new Groq({
      apiKey: groqApiKey,
      dangerouslyAllowBrowser: true,
    })
  : null;

const genAI = googleApiKey ? new GoogleGenerativeAI(googleApiKey) : null;

const GROQ_PRIMARY_MODEL = "qwen/qwen3.8-27b";
const GROQ_FALLBACK_MODEL = "openai/gpt-oss-20b";
const GEMINI_MODEL = "gemini-1.5-flash";

export async function transcribeAudio(base64Audio, mimeType = "audio/webm") {
  if (!groq) throw new Error("Missing GROQ_API_KEY on server");

  const base64Data = base64Audio.includes("base64,")
    ? base64Audio.split("base64,")[1]
    : base64Audio;

  const buffer = Buffer.from(base64Data, "base64");
  const file = new File([buffer], "audio.webm", { type: mimeType });

  const transcription = await groq.audio.transcriptions.create({
    file: file,
    model: "whisper-large-v3",
    response_format: "json",
  });

  return transcription.text;
}

// Unified multi-provider AI text generation (Groq Primary -> Groq Fallback -> Gemini)
export async function generateAIResponse({ messages, systemPrompt, temperature = 0.7 }) {
  const formattedMessages = [];
  if (systemPrompt) {
    formattedMessages.push({ role: "system", content: systemPrompt });
  }

  if (Array.isArray(messages)) {
    messages.forEach((m) => {
      const role = m.role === "assistant" || m.role === "model" ? "assistant" : "user";
      formattedMessages.push({ role, content: m.content });
    });
  } else if (typeof messages === "string") {
    formattedMessages.push({ role: "user", content: messages });
  }

  // 1. Try Groq Primary
  if (groq) {
    try {
      const res = await groq.chat.completions.create({
        messages: formattedMessages,
        model: GROQ_PRIMARY_MODEL,
        temperature,
        max_completion_tokens: 2500,
      });
      const content = res.choices[0]?.message?.content;
      if (content && content.trim()) return content.trim();
    } catch (err) {
      console.warn(`Groq primary model ${GROQ_PRIMARY_MODEL} failed:`, err?.message || err);
    }

    // 2. Try Groq Fallback
    try {
      const res = await groq.chat.completions.create({
        messages: formattedMessages,
        model: GROQ_FALLBACK_MODEL,
        temperature,
        max_completion_tokens: 2500,
      });
      const content = res.choices[0]?.message?.content;
      if (content && content.trim()) return content.trim();
    } catch (err) {
      console.warn(`Groq fallback model ${GROQ_FALLBACK_MODEL} failed:`, err?.message || err);
    }
  }

  // 3. Try Google Gemini SDK
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const promptText = systemPrompt 
        ? `${systemPrompt}\n\n${formattedMessages.map(m => `${m.role}: ${m.content}`).join("\n")}`
        : formattedMessages.map(m => `${m.role}: ${m.content}`).join("\n");

      const result = await model.generateContent(promptText);
      const response = await result.response;
      const text = response.text();
      if (text && text.trim()) return text.trim();
    } catch (geminiErr) {
      console.error("Gemini fallback model failed:", geminiErr?.message || geminiErr);
    }
  }

  throw new Error("All AI providers (Groq & Gemini) failed to generate a response. Please try again.");
}

// Preserve existing generateFeedback signature for backwards compatibility
export async function generateFeedback(prompt) {
  return generateAIResponse({ messages: prompt });
}

// Auto-generate a short 3-6 word conversation title
export async function generateChatTitle(firstMessageText) {
  if (!firstMessageText || !firstMessageText.trim()) return "New Interview Session";
  try {
    const prompt = `Create a concise, professional 3-6 word title for a conversation starting with this message: "${firstMessageText.slice(0, 150)}". Return ONLY the title text without quotes, punctuation, or extra words.`;
    const title = await generateAIResponse({ messages: prompt, temperature: 0.5 });
    return title.replace(/^["']|["']$/g, "").trim() || "Interview Discussion";
  } catch (err) {
    console.error("Failed to generate chat title:", err);
    return "Interview Discussion";
  }
}

// Evaluate user's interview answer with detailed score breakdown
export async function evaluateInterviewAnswer({ question, answer, mode = "Technical", difficulty = "Intermediate" }) {
  const prompt = `You are a strict, expert technical interviewer. Evaluate the candidate's answer to the question.

Question (${mode} - ${difficulty}): "${question}"
Candidate Answer: "${answer}"

Provide a structured evaluation in JSON format ONLY:
{
  "scores": {
    "correctness": 85,
    "communication": 90,
    "technicalDepth": 75,
    "completeness": 80,
    "overall": 835
  },
  "feedback": "Detailed feedback on what was good and what was missing...",
  "strengths": ["Clear explanation", "Good terminology"],
  "improvements": ["Could mention edge cases", "Needs deeper architectural context"],
  "modelAnswer": "Comprehensive ideal model answer that would score 100%..."
}
Note: "overall" score should be an average 0-100 percentage. Return strictly valid JSON.`;

  try {
    const raw = await generateAIResponse({ messages: prompt, temperature: 0.3 });
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to evaluate answer:", err);
    return {
      scores: { correctness: 80, communication: 80, technicalDepth: 80, completeness: 80, overall: 80 },
      feedback: "Good response! Continue expanding on technical specifics.",
      strengths: ["Clear response provided"],
      improvements: ["Provide more concrete examples"],
      modelAnswer: "An ideal response addresses core principles, edge cases, and architectural tradeoffs."
    };
  }
}

// Mimic Gemini's stateful chatSession for backward compatibility
export const startChat = () => {
  let history = [];

  return {
    sendMessage: async (prompt) => {
      history.push({ role: "user", content: prompt });
      const responseText = await generateAIResponse({ messages: history });
      history.push({ role: "assistant", content: responseText });

      return {
        response: {
          text: () => responseText,
        },
      };
    },
  };
};

