import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { AptitudeTest } from "@/utils/schema";

export async function POST(req) {
  try {
    const body = await req.json();
    const db = await connectToDatabase();
    const resp = await db.collection(AptitudeTest).insertOne(body);
    if (resp.acknowledged) {
      return NextResponse.json({ mockId: body.mockId });
    }
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  } catch (err) {
    console.error('Create aptitude error:', err);
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
