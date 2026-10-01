import { generateAIResponse, generateChatTitle, evaluateInterviewAnswer } from "@/utils/GeminiAIModal";
import { connectToDatabase } from "@/utils/db";
import { ChatHistory } from "@/utils/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// MODE SYSTEM PROMPTS
const MODE_SYSTEM_PROMPTS = {
  "Technical Interview": `You are a Senior Principal Engineer acting as a technical interviewer. Focus on core engineering concepts, architecture, syntax accuracy, algorithm design, clean code, and edge cases. Provide deep, accurate, and constructive technical feedback.`,
  "HR Interview": `You are an HR Director interviewing candidates. Focus on behavioral questions, team collaboration, leadership, problem-solving, conflict resolution, and the STAR framework (Situation, Task, Action, Result).`,
  "Aptitude": `You are an expert Quantitative Aptitude & Mental Math Specialist. Help candidates solve logical puzzles, math problems, numerical reasoning, and data interpretation with 100% mathematical accuracy and step-by-step shortcuts.`,
  "Coding/DSA": `You are a Coding Specialist & Competitive Programmer. Focus on Data Structures and Algorithms (Arrays, Graphs, Dynamic Programming, Trees, Heap, etc.), step-by-step code implementation, time/space complexity analysis (Big-O), and edge case handling.`,
  "System Design": `You are a Principal Software Architect. Focus on designing large-scale distributed systems, load balancing, caching (Redis), database sharding, microservices, event-driven message queues (Kafka), CDN, and high availability tradeoffs.`,
  "Resume Review": `You are an Executive Resume Reviewer and Talent Specialist. Analyze resumes, suggest high-impact action-verb bullet points with quantifiable metrics, identify missing ATS keywords, and provide actionable improvement advice.`,
  "Career Guidance": `You are a Career Transition & Growth Strategist. Help candidates build step-by-step career roadmaps, conduct skill-gap analyses, recommend high-value certifications/projects, and prepare for target industry roles.`
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail");
    const chatId = searchParams.get("chatId");

    const { userId } = auth();
    const effectiveIdentifier = userId || userEmail;

    if (!effectiveIdentifier) {
      return NextResponse.json({ error: "userEmail or userId is required" }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    // If specific chatId requested
    if (chatId) {
      const sessionDoc = await db.collection(ChatHistory).findOne({ chatId });
      if (sessionDoc) {
        return NextResponse.json({ session: sessionDoc, messages: sessionDoc.messages || [] });
      }
    }

    // Otherwise find latest session for user
    const query = {
      $or: [
        ...(userId ? [{ userId }] : []),
        ...(userEmail ? [{ userEmail }] : []),
      ],
    };

    const latestDoc = await db.collection(ChatHistory).findOne(query, { sort: { updatedAt: -1 } });

    if (latestDoc) {
      return NextResponse.json({ session: latestDoc, messages: latestDoc.messages || [] });
    }

    return NextResponse.json({ messages: [], session: null });
  } catch (e) {
    console.error("GET Chat History Error:", e);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      messages, 
      userEmail, 
      chatId: inputChatId, 
      mode = "Technical Interview", 
      difficulty = "Intermediate",
      isSimulation = false,
      isEvaluationRequest = false,
      evaluationData = null,
    } = body;

    const { userId } = auth();
    const effectiveUserId = userId || null;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    // If candidate answer evaluation is explicitly requested in simulation mode
    if (isEvaluationRequest && evaluationData) {
      const evaluation = await evaluateInterviewAnswer({
        question: evaluationData.question,
        answer: evaluationData.answer,
        mode,
        difficulty,
      });

      return NextResponse.json({ evaluation });
    }

    const basePrompt = MODE_SYSTEM_PROMPTS[mode] || MODE_SYSTEM_PROMPTS["Technical Interview"];
    
    const systemInstruction = `${basePrompt}

CRITICAL RESPONSE RULES:
1. USER FORMAT & INSTRUCTION COMPLIANCE: Always strictly follow the format, structure, and constraints explicitly requested by the user in their prompt (e.g., table, bullet points only, short answer, code only, step-by-step, etc.).
2. DIRECT & RELEVANT ANSWERS: Answer the user's question directly without unnecessary preambles, verbose disclaimers, or unasked background details. Do not dump unnecessary information before answering.
3. ELABORATION ON DEMAND: Provide a concise, clear, and relevant response first. Elaborate in deep detail ONLY if the user explicitly asks to elaborate, explain further, or provide in-depth details.
4. ACCURACY: Double check all math calculations, code syntax, algorithms, and technical facts (e.g. 7 + 5 is 12).
5. FORMATTING: Use GitHub Flavored Markdown, code blocks with syntax language tags, tables, and bullet lists where appropriate.
${isSimulation ? "6. SIMULATION MODE IS ACTIVE: Ask 1 interview question at a time. After the candidate responds, evaluate briefly and ask the next follow-up question." : ""}`;

    // Call dual provider AI generator (Groq Primary -> Gemini Fallback)
    const aiResponseContent = await generateAIResponse({
      messages,
      systemPrompt: systemInstruction,
      temperature: 0.7,
    });

    const assistantMessageId = `msg_${Date.now()}_${uuidv4().substring(0, 6)}`;
    const assistantMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: aiResponseContent,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, assistantMessage];
    const db = await connectToDatabase();
    
    let targetChatId = inputChatId;
    let sessionTitle = null;

    // Check if user session exists or needs creation
    if (!targetChatId) {
      targetChatId = `chat_${Date.now()}_${uuidv4().substring(0, 8)}`;
      // Generate automatic short title based on first user prompt
      const firstUserMsg = messages.find(m => m.role === "user")?.content || "Interview Chat";
      sessionTitle = await generateChatTitle(firstUserMsg);

      const newSessionDoc = {
        chatId: targetChatId,
        userId: effectiveUserId,
        userEmail,
        title: sessionTitle,
        mode,
        difficulty,
        isSimulation,
        messages: updatedMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection(ChatHistory).insertOne(newSessionDoc);
    } else {
      // Find existing document to check if default title needs updating
      const existingDoc = await db.collection(ChatHistory).findOne({ chatId: targetChatId });
      
      let updateFields = {
        messages: updatedMessages,
        mode,
        difficulty,
        isSimulation,
        updatedAt: new Date(),
      };

      if (effectiveUserId) updateFields.userId = effectiveUserId;
      if (userEmail) updateFields.userEmail = userEmail;

      // Auto generate title if it was default
      if (existingDoc && (existingDoc.title === "New Interview Session" || !existingDoc.title)) {
        const firstUserMsg = updatedMessages.find(m => m.role === "user")?.content || "Interview Chat";
        sessionTitle = await generateChatTitle(firstUserMsg);
        updateFields.title = sessionTitle;
      }

      await db.collection(ChatHistory).updateOne(
        { chatId: targetChatId },
        { $set: updateFields },
        { upsert: true }
      );
    }

    return NextResponse.json({
      chatId: targetChatId,
      response: aiResponseContent,
      messages: updatedMessages,
      title: sessionTitle,
    });
  } catch (e) {
    console.error("Chat API Error:", e);
    return NextResponse.json({ error: e.message || "Server error generating response" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { chatId, title, messageId, feedback } = body;

    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    const db = await connectToDatabase();

    // 1. Title Rename
    if (title && title.trim()) {
      await db.collection(ChatHistory).updateOne(
        { chatId },
        { $set: { title: title.trim(), updatedAt: new Date() } }
      );
      return NextResponse.json({ success: true, title: title.trim() });
    }

    // 2. Message Feedback (Like / Dislike)
    if (messageId && feedback) {
      await db.collection(ChatHistory).updateOne(
        { chatId, "messages.id": messageId },
        { $set: { "messages.$.feedback": feedback } }
      );
      return NextResponse.json({ success: true, feedback });
    }

    return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
  } catch (e) {
    console.error("PUT Chat Error:", e);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");
    const userEmail = searchParams.get("userEmail");
    const clearMessages = searchParams.get("clearMessages") === "true";

    const { userId } = auth();

    const db = await connectToDatabase();

    if (chatId) {
      if (clearMessages) {
        // Clear all messages in active session except welcome
        await db.collection(ChatHistory).updateOne(
          { chatId },
          { 
            $set: { 
              messages: [
                {
                  id: `msg_welcome_${Date.now()}`,
                  role: "assistant",
                  content: "Conversation history cleared. How can I help you prepare for your next interview topic?",
                  timestamp: new Date().toISOString(),
                }
              ], 
              updatedAt: new Date() 
            } 
          }
        );
        return NextResponse.json({ success: true, cleared: true });
      }

      // Delete entire session
      await db.collection(ChatHistory).deleteOne({ chatId });
      return NextResponse.json({ success: true, deleted: chatId });
    }

    // Fallback: Delete all history for userEmail
    if (userEmail) {
      const query = {
        $or: [
          ...(userId ? [{ userId }] : []),
          { userEmail },
        ],
      };
      await db.collection(ChatHistory).deleteMany(query);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "chatId or userEmail is required" }, { status: 400 });
  } catch (e) {
    console.error("DELETE Chat Error:", e);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
