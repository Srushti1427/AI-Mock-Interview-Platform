import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { Question } from "@/utils/schema";

export async function POST(req) {
  try {
    const body = await req.json();
    const db = await connectToDatabase();
    const resp = await db.collection(Question).insertOne(body);
    if (resp.acknowledged) {
      return NextResponse.json({ mockId: body.mockId });
    }
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  } catch (err) {
    console.error('Create question error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
