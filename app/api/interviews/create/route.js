import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { logActivity } from "@/utils/logActivity";

export async function POST(req) {
  try {
    const body = await req.json();
    const db = await connectToDatabase();

    // Add createdBy field from email if not present
    if (body.email && !body.createdBy) {
      body.createdBy = body.email;
    }

    const resp = await db.collection(MockInterview).insertOne(body);
    if (resp.acknowledged) {
      // Log activity
      await logActivity(db, {
        email: body.createdBy,
        action: "interview_created",
        metadata: {
          mockId: body.mockId,
          jobPosition: body.jobPosition,
          jobExperience: body.jobExperience,
        },
      });

      return NextResponse.json({ mockId: body.mockId });
    }
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  } catch (err) {
    console.error('Create interview error:', err);
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
