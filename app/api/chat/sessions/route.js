import { connectToDatabase } from "@/utils/db";
import { ChatHistory } from "@/utils/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail");
    const searchQuery = searchParams.get("search") || "";

    const { userId } = auth();
    const effectiveIdentifier = userId || userEmail;

    if (!effectiveIdentifier) {
      return NextResponse.json({ error: "User identifier required" }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    // Query condition: match userId OR userEmail
    const query = {
      $or: [
        ...(userId ? [{ userId }] : []),
        ...(userEmail ? [{ userEmail }] : []),
      ],
    };

    if (searchQuery.trim()) {
      query.title = { $regex: searchQuery.trim(), $options: "i" };
    }

    const sessions = await db
      .collection(ChatHistory)
      .find(query)
      .sort({ updatedAt: -1 })
      .project({
        chatId: 1,
        title: 1,
        mode: 1,
        difficulty: 1,
        createdAt: 1,
        updatedAt: 1,
        messageCount: { $size: "$messages" },
      })
      .toArray();

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("GET Chat Sessions Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch chat sessions" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { userEmail, mode = "Technical Interview", difficulty = "Intermediate", title } = body;

    const { userId } = auth();
    const effectiveUserId = userId || null;

    if (!userEmail && !effectiveUserId) {
      return NextResponse.json({ error: "User login required" }, { status: 401 });
    }

    const chatId = `chat_${Date.now()}_${uuidv4().substring(0, 8)}`;
    const newSession = {
      chatId,
      userId: effectiveUserId,
      userEmail,
      title: title || "New Interview Session",
      mode,
      difficulty,
      messages: [
        {
          id: `msg_welcome_${Date.now()}`,
          role: "assistant",
          content: `Hello! I am your AI Interview Coach. You are currently in **${mode}** mode at **${difficulty}** level. How can I help you prepare today?`,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await connectToDatabase();
    await db.collection(ChatHistory).insertOne(newSession);

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (err) {
    console.error("Create Chat Session Error:", err);
    return NextResponse.json({ error: err.message || "Failed to create chat session" }, { status: 500 });
  }
}
