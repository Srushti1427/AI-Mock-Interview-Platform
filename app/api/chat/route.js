import { generateFeedback } from "@/utils/GeminiAIModal";

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // Combine recent messages for context
    const conversationHistory = messages.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join("\n");
    
    const InputPrompt = `You are a helpful and knowledgeable AI Mock Interview assistant. Your primary goal is to help users prepare for their interviews. You can answer queries related to interview preparation, offer tips on answering specific interview questions, review resume points, and give general career advice.

Here is the conversation history:
${conversationHistory}

Based on the conversation above, provide a helpful, concise, and professional response to the User's latest input.`;

    const aiResp = await generateFeedback(InputPrompt);
    
    // Clean up potential markdown blocks if it's plain text response
    let cleaned = aiResp.trim();

    return new Response(JSON.stringify({ response: cleaned }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (e) {
    console.error("Chat API Error:", e);
    return new Response(JSON.stringify({ error: e.message || "Server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
