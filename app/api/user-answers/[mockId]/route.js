import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";

export async function GET(req, { params }) {
  try {
    const { mockId } = params;
    const db = await connectToDatabase();
    const result = await db.collection(UserAnswer).find({ mockIdRef: mockId }).toArray();
    return NextResponse.json(result);
  } catch (err) {
    console.error('Error fetching user answers:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
