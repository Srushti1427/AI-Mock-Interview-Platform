import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { MockInterview } from "@/utils/schema";

export async function GET(req, { params }) {
  try {
    const { mockId } = params;
    const db = await connectToDatabase();
    const result = await db.collection(MockInterview).findOne({ mockId });
    if (!result) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    console.error('Error fetching interview by id:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
