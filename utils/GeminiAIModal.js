import Groq from "groq-sdk";

// We check for NEXT_PUBLIC_ prefixed variables for components using 'use client'
const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!apiKey) {
  console.warn("GROQ_API_KEY is not set. Groq API calls will fail if attempted.");
}

const groq = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true, // Enables client-side calling if components are not 'use server'
});

export async function transcribeAudio(base64Audio, mimeType = "audio/webm") {
  if (!apiKey) throw new Error("Missing server GROQ_API_KEY");

  // Robustly handle 'data:audio/webm;base64,...' prefix if present
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

export async function generateFeedback(prompt) {
  if (!apiKey) throw new Error("Missing server GROQ_API_KEY");

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 1,
    max_completion_tokens: 8000,
    top_p: 1,
  });

  return chatCompletion.choices[0]?.message?.content || "";
}

// Mimic Gemini's stateful chatSession for backward compatibility
export const startChat = () => {
  let history = [];

  return {
    sendMessage: async (prompt) => {
      history.push({ role: "user", content: prompt });

      const chatCompletion = await groq.chat.completions.create({
        messages: history,
        model: "llama-3.3-70b-versatile",
        temperature: 0.9,
      });

      const responseText = chatCompletion.choices[0]?.message?.content || "";
      history.push({ role: "assistant", content: responseText });

      return {
        response: {
          text: () => responseText,
        },
      };
    },
  };
};
