import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { logActivity } from "@/utils/logActivity";
import moment from "moment";

export async function POST(req) {
  try {
    const { email, name, avatarUrl } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const db = await connectToDatabase();

    // Deduplicate: only log one login per user per day
    const today = moment().format("YYYY-MM-DD");
    const existing = await db.collection("userActivity").findOne({
      email,
      action: "login",
      createdAt: { $regex: `^${today}` },
    });

    if (!existing) {
      await logActivity(db, {
        email,
        name,
        avatarUrl,
        action: "login",
        metadata: { date: today },
      });
    }

    return NextResponse.json({ success: true, logged: !existing });
  } catch (err) {
    console.error("Track login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
