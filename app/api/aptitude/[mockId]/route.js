import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { AptitudeTest } from "@/utils/schema";
import { auth, currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const { userId } = auth();
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!userId && !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mockId } = params;
    if (!mockId) {
      return NextResponse.json({ error: "mockId is required" }, { status: 400 });
    }

    const db = await connectToDatabase();
    const result = await db.collection(AptitudeTest).findOne({ mockId });

    if (!result) {
      return NextResponse.json({ error: "Aptitude test not found" }, { status: 404 });
    }

    const isOwner =
      (userId && result.userId === userId) ||
      (userEmail && result.createdBy === userEmail);

    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching aptitude test by mockId:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
