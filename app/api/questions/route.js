import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { Question } from "@/utils/schema";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json([], { status: 200 });

    const db = await connectToDatabase();
    const result = await db
      .collection(Question)
      .find({ createdBy: email })
      .sort({ _id: -1 })
      .toArray();

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching questions:", err);
    return NextResponse.json({ error: "Error fetching questions" }, { status: 500 });
  }
}
