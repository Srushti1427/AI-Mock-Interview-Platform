import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { AptitudeTest } from "@/utils/schema";
import { auth, currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

async function getAptitudeTestsForUser() {
  const { userId } = auth();
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  if (!userId && !userEmail) {
    return [];
  }

  const db = await connectToDatabase();
  const query = {
    $or: [
      ...(userId ? [{ userId }] : []),
      ...(userEmail ? [{ createdBy: userEmail }] : []),
    ],
  };

  return db.collection(AptitudeTest).find(query).sort({ _id: -1 }).toArray();
}

export async function GET() {
  try {
    const result = await getAptitudeTestsForUser();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching aptitude tests (GET):", err);
    return NextResponse.json({ error: "Error fetching aptitude tests" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const result = await getAptitudeTestsForUser();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching aptitude tests (POST):", err);
    return NextResponse.json({ error: "Error fetching aptitude tests" }, { status: 500 });
  }
}
